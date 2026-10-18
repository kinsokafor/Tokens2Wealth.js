<template>
    <ReportShell
        title="Guarantor Exposure"
        :subtitle="data ? `As at ${longDate(data.as_at)}` : ''"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #actions>
            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="reload">Refresh</button>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
            <h5>Guarantors</h5>
        </template>
        <template v-if="data">
            <ReportTable
                :columns="columns"
                :rows="data.rows"
                :totals="{ loans: data.totals.loans, exposure: data.totals.exposure }" />
            <h5 class="mt-3">Guaranteed loans</h5>
            <ReportTable
                :columns="loanColumns"
                :rows="data.loans"
                :totals="loanTotals"
                :row-link="row => `/accounts/view/loan/${row.ac_number}`" />
        </template>
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, reload } = useReport(() => "guarantor-exposure", { period: false })
    const money = v => amount(v)

    const columns = [
        { key: "guarantor", heading: "Guarantor" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "loans", heading: "Loans", align: "end", format: v => count(v) },
        { key: "borrowers", heading: "Borrowers" },
        { key: "guaranteed_outstanding", heading: "Guaranteed outstanding", align: "end", format: money },
        { key: "exposure", heading: "Exposure (share of shortfall)", align: "end", format: money },
        { key: "thrift_balance", heading: "Own thrift", align: "end", format: money },
        { key: "cover", heading: "Cover", align: "end", format: money },
        { key: "position", heading: "Position" },
        { key: "not_accepted", heading: "Not accepted", align: "end", format: v => v ? count(v) : "" },
    ]

    const loanColumns = [
        { key: "ac_number", heading: "Loan account" },
        { key: "borrower", heading: "Borrower" },
        { key: "status", heading: "Status" },
        { key: "outstanding", heading: "Outstanding", align: "end", format: money },
        { key: "borrower_thrift", heading: "Borrower's thrift", align: "end", format: money },
        { key: "shortfall", heading: "Shortfall", align: "end", format: money },
        { key: "guarantors", heading: "Guarantors (membership IDs)" },
    ]

    const loanTotals = computed(() => (data.value?.loans ?? []).reduce((t, l) => {
        t.outstanding += l.outstanding; t.borrower_thrift += l.borrower_thrift; t.shortfall += l.shortfall
        return t
    }, { outstanding: 0, borrower_thrift: 0, shortfall: 0 }))

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "Guarantors", value: count(t.guarantors), hint: `${count(t.loans)} loans` },
            { label: "Total exposure", value: money(t.exposure) },
            { label: "Guarantors short", value: count(t.short), hint: "own thrift below their exposure" },
            { label: "Uncovered", value: money(t.shortfall_uncovered) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("guarantor-exposure", null), columns.map(c => ({ key: c.key, heading: c.heading })), d.rows, {
            info: [d.title, `As at: ${d.as_at}`],
            totals: { loans: d.totals.loans, exposure: d.totals.exposure }
        })
    }
</script>
