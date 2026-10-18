<template>
    <ReportShell
        title="Trial Balance by Product"
        :subtitle="periodLabel(data?.period)"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <PeriodFilter :from="from" :to="to" @change="setPeriod" />
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
        </template>
        <ReportTable
            :columns="columns"
            :rows="data?.rows ?? []"
            :totals="data?.totals"
            totals-label="Total (NGN, excluding shares)"
            row-key="code"
            :row-link="row => row.code ? ({ path: `/reports/statements/trial-balance/${row.code}`, query: { from, to } }) : null"
            :searchable="false" />
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

    const { data, loading, error, from, to, setPeriod } = useReport(() => "trial-balance")

    const money = (v, row) => amount(v, row?.unit ?? "NGN")

    const columns = [
        { key: "product", heading: "Product", format: (v, row) => row.code ? `${v} (${row.code})` : v },
        { key: "accounts", heading: "Accounts", align: "end", format: v => count(v) },
        { key: "opening", heading: "Opening", align: "end", format: money },
        { key: "credits", heading: "Credits", align: "end", format: money },
        { key: "debits", heading: "Debits", align: "end", format: money },
        { key: "closing", heading: "Closing", align: "end", format: money },
    ]

    const cards = computed(() => {
        const rows = data.value?.rows ?? []
        const find = code => rows.find(r => r.code === code)
        const closing = code => amount(find(code)?.closing ?? 0)
        return [
            { label: "E-Wallets", value: closing("301") },
            { label: "Regular Thrift", value: closing("312") },
            { label: "Term Deposits", value: closing("311") },
            { label: "Loans outstanding", value: amount(-1 * (find("321")?.closing ?? 0)) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("trial-balance", d.period), [
            { key: "code", heading: "Code" },
            { key: "product", heading: "Product" },
            { key: "unit", heading: "Unit" },
            { key: "accounts", heading: "Accounts" },
            { key: "opening", heading: "Opening" },
            { key: "credits", heading: "Credits" },
            { key: "debits", heading: "Debits" },
            { key: "closing", heading: "Closing" },
        ], d.rows, {
            info: [d.title, `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`, "Totals: NGN products only (shares are in units)"],
            totals: d.totals
        })
    }
</script>
