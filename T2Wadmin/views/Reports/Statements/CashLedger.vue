<template>
    <ReportShell
        :title="data?.title ?? title"
        :subtitle="periodLabel(data?.period)"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <PeriodFilter :from="from" :to="to" @change="setPeriod" />
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
            <h5 class="mt-2">By classification</h5>
            <ReportTable
                :columns="classColumns"
                :rows="data?.by_classification ?? []"
                row-key="classification"
                :totals="{ count: classCount, credits: data?.totals?.credits, debits: data?.totals?.debits }"
                :searchable="false" />
            <h5 class="mt-3">Entries</h5>
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
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import PeriodFilter from '../../../../components/Reports/PeriodFilter.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, periodLabel, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, from, to, setPeriod, route } = useReport(
        r => ['inflow-outflow', 'deposits-payouts'].includes(r.params.type) ? `ledger/${r.params.type}` : null
    )

    const isDeposits = computed(() => route.params.type === 'deposits-payouts')
    const title = computed(() => isDeposits.value ? "Deposits & Payouts Ledger" : "Inflow & Outflow Ledger")
    const labels = computed(() => data.value?.labels ?? (isDeposits.value
        ? { credit: "Deposit", debit: "Payout" } : { credit: "Inflow", debit: "Outflow" }))
    const nonZero = v => Number(v) ? amount(v) : ""

    const columns = computed(() => [
        { key: "date", heading: "Date" },
        { key: "type", heading: "Type" },
        ...(isDeposits.value ? [{ key: "member", heading: "Member" }, { key: "account", heading: "E-Wallet" }] : []),
        { key: "narration", heading: "Narration" },
        { key: "classification", heading: "Classification" },
        { key: "posted_by", heading: "Posted by" },
        { key: "debit", heading: labels.value.debit, align: "end", format: nonZero },
        { key: "credit", heading: labels.value.credit, align: "end", format: nonZero },
        { key: "balance", heading: "Balance", align: "end", format: v => amount(v) },
    ])

    const classColumns = computed(() => [
        { key: "classification", heading: "Classification" },
        { key: "count", heading: "Entries", align: "end", format: v => count(v) },
        { key: "credits", heading: labels.value.credit + "s", align: "end", format: v => amount(v) },
        { key: "debits", heading: labels.value.debit + "s", align: "end", format: v => amount(v) },
    ])

    const classCount = computed(() => (data.value?.by_classification ?? []).reduce((a, c) => a + c.count, 0))

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "Brought forward", value: amount(t.opening) },
            { label: `${labels.value.credit}s`, value: amount(t.credits) },
            { label: `${labels.value.debit}s`, value: amount(t.debits) },
            { label: "Closing balance", value: amount(t.closing) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        const rows = [{ date: d.period.from, narration: "Balance brought forward", balance: d.totals.opening }, ...d.rows]
        downloadCsv(csvName(d.report, d.period), columns.value.map(c => ({ key: c.key, heading: c.heading })), rows, {
            info: [d.title, `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`],
            totals: { credit: d.totals.credits, debit: d.totals.debits, balance: d.totals.closing }
        })
    }
</script>
