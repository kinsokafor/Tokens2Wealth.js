<template>
    <ReportShell
        title="Account Statement"
        :subtitle="subtitle"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <div class="d-flex flex-wrap align-items-end statement-filters">
                <form class="d-flex align-items-end" @submit.prevent="openAccount">
                    <div>
                        <label class="form-label small mb-1" for="as-account">Account number</label>
                        <input id="as-account" class="form-control form-control-sm" v-model.trim="accountInput"
                            inputmode="numeric" placeholder="e.g. 3011118008" />
                    </div>
                    <button class="btn btn-primary btn-sm ms-2" type="submit" :disabled="!accountInput">View</button>
                </form>
                <PeriodFilter :from="from" :to="to" @change="setPeriod" />
            </div>
        </template>
        <template #summary>
            <div v-if="!route.params.ac" class="text-muted py-3">Enter an account number to see its statement.</div>
            <template v-else-if="data">
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
            totals-label="Totals / closing balance" />
    </ReportShell>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import PeriodFilter from '../../../../components/Reports/PeriodFilter.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, periodLabel, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, from, to, setPeriod, route, router } = useReport(
        r => r.params.ac ? `account-statement/${encodeURIComponent(r.params.ac)}` : null
    )

    const accountInput = ref(route.params.ac ?? "")
    watch(() => route.params.ac, v => { accountInput.value = v ?? "" })

    const openAccount = () => {
        if (!accountInput.value) return
        router.push({ path: `/reports/statements/account/${accountInput.value}`, query: { from: from.value, to: to.value } })
    }

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
            info: [`Account statement: ${d.account.ac_number} (${d.account.product})`, `Member: ${d.account.member}`,
                `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`],
            totals: { debit: d.totals.debits, credit: d.totals.credits, balance: d.totals.closing }
        })
    }
</script>

<style lang="scss" scoped>
    .statement-filters { gap: 16px; }
</style>
