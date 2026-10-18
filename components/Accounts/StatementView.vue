<template>
    <ReportShell
        title="Statement of Account"
        :subtitle="subtitle"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :can-export="!!data"
        @export="exportCsv">
        <template #actions>
            <slot name="actions"></slot>
        </template>
        <template #filters>
            <PeriodFilter :from="from" :to="to" @change="setPeriod" />
        </template>
        <template #summary>
            <template v-if="data">
                <p class="mb-2">
                    <strong>{{ data.account.member }}</strong> · {{ data.account.ac_number }} ·
                    {{ data.account.product }} · <span class="text-capitalize">{{ data.account.status }}</span>
                </p>
                <SummaryCards :items="cards" />
            </template>
        </template>
        <ReportTable
            v-if="data"
            :columns="columns"
            :rows="data.rows"
            :before="{ label: 'Balance brought forward', values: { balance: data.totals.opening } }"
            :totals="{ credit: data.totals.credits, debit: data.totals.debits, balance: data.totals.closing }"
            totals-label="Totals / closing balance">
            <template #actions="{ row }" v-if="data.can_reverse || data.can_delete">
                <span v-if="row.reversed" class="badge bg-secondary me-1">Reversed</span>
                <span v-else-if="row.is_reversal" class="badge bg-light text-dark me-1">Reversal</span>
                <button v-else-if="data.can_reverse && row.status === 'successful'" type="button"
                    class="btn btn-link btn-sm p-0 me-2" :disabled="busy" @click="reverse(row)">Reverse</button>
                <button v-if="data.can_delete" type="button" class="btn btn-link btn-sm p-0 text-danger"
                    :disabled="busy" @click="remove(row)">Delete</button>
            </template>
        </ReportTable>
    </ReportShell>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import ReportShell from '../Reports/ReportShell.vue'
    import ReportTable from '../Reports/ReportTable.vue'
    import PeriodFilter from '../Reports/PeriodFilter.vue'
    import SummaryCards from '../Reports/SummaryCards.vue'
    import { useReport } from '../../helpers/useReport'
    import { amount, periodLabel, downloadCsv, csvName, errorMessage } from '../../helpers/reports'
    import { Request } from '@/helpers'
    import { useAlertStore } from '@/store/alert'

    // Period statement from /t2w/api/accounts/statement/{account}: staff see any account and get the
    // Reverse / Delete actions their capacity allows; members only ever get their own accounts.
    const props = defineProps({
        accountNumber: { type: String, default: "" }
    })

    const alertStore = useAlertStore()
    const busy = ref(false)

    const { data, loading, error, from, to, setPeriod, reload } = useReport(
        () => props.accountNumber ? `statement/${encodeURIComponent(props.accountNumber)}` : null,
        { base: "accounts", defaultPreset: "all-time" }
    )

    const unit = computed(() => data.value?.account?.unit ?? "NGN")
    const money = v => amount(v, unit.value)
    const nonZero = v => Number(v) ? money(v) : ""
    const subtitle = computed(() => data.value ? `${data.value.account.ac_number} · ${periodLabel(data.value.period)}` : "")

    const columns = [
        { key: "date", heading: "Date" },
        { key: "narration", heading: "Description" },
        { key: "posted_by", heading: "Posted by" },
        { key: "status", heading: "Status" },
        { key: "debit", heading: "Debit", align: "end", format: nonZero },
        { key: "credit", heading: "Credit", align: "end", format: nonZero },
        { key: "balance", heading: "Balance", align: "end", format: money },
    ]

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "Brought forward", value: money(t.opening) },
            { label: "Credits", value: money(t.credits) },
            { label: "Debits", value: money(t.debits) },
            { label: "Closing balance", value: money(t.closing) },
        ]
    })

    const req = new Request()

    const reverse = async (row) => {
        if (!confirm(`Reverse this ${row.credit ? "credit" : "debit"} of ${money(row.credit || row.debit)}?\n\n"${row.narration}"\n\nAn opposite entry will be posted to the account.`)) return
        busy.value = true
        try {
            await req.post(req.root + "/t2w/api/reverse-statement", { id: row.id })
            alertStore.add("Reversed")
            await reload()
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        } finally {
            busy.value = false
        }
    }

    // permanent removal (software engineer only): the amount must be typed again to confirm
    const remove = async (row) => {
        const value = row.credit || row.debit
        const typed = prompt(
            `PERMANENTLY DELETE transaction #${row.id}?\n\n${row.date} · "${row.narration}" · ${money(value)}\n\n` +
            `This cannot be undone and leaves no trace in the ledger. To correct a mistake, use Reverse instead.\n\n` +
            `Type the amount (${value}) to confirm:`)
        if (typed === null) return
        busy.value = true
        try {
            await req.post(req.root + `/t2w/api/accounts/transaction/${row.id}/delete`, { amount: typed.replace(/[,\s₦]/g, "") })
            alertStore.add("Deleted")
            await reload()
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        } finally {
            busy.value = false
        }
    }

    const exportCsv = () => {
        const d = data.value
        const rows = [{ date: d.period.from, narration: "Balance brought forward", balance: d.totals.opening }, ...d.rows]
        downloadCsv(csvName(`statement-${d.account.ac_number}`, d.period), [
            { key: "date", heading: "Date" },
            { key: "narration", heading: "Description" },
            { key: "posted_by", heading: "Posted by" },
            { key: "status", heading: "Status" },
            { key: "debit", heading: "Debit" },
            { key: "credit", heading: "Credit" },
            { key: "balance", heading: `Balance (${d.account.unit})` },
        ], rows, {
            info: [`Statement of account: ${d.account.ac_number} (${d.account.product})`, `Member: ${d.account.member}`,
                `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`],
            totals: { debit: d.totals.debits, credit: d.totals.credits, balance: d.totals.closing }
        })
    }
</script>
