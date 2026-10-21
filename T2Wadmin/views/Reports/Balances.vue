<template>
    <ReportShell title="Balances" subtitle="Previous report — use Trial Balance and Income Summary once they are signed off"
        :can-export="ready" @export="exportCsv">
        <balances-chart ref="bal" />
        <GLChart ref="gl" />
        <OtherReports ref="oi" />
    </ReportShell>
</template>

<script setup>
    // The previous "Balances" report: product balances, the general ledger and other income.
    // Kept reachable from the dashboard until the server-side reports replace it.
    import { computed, ref } from 'vue'
    import ReportShell from '../../../components/Reports/ReportShell.vue'
    import BalancesChart from '../Charts/BalancesChart.vue'
    import GLChart from '../Charts/GLChart.vue'
    import OtherReports from '../Charts/OtherReports.vue'
    import { downloadCsv, csvName, periodLabel } from '../../../helpers/reports'

    const bal = ref(null), gl = ref(null), oi = ref(null)
    const ready = computed(() => !!(gl.value && oi.value))

    // every figure on the page, one row each
    const exportCsv = () => {
        const rows = []
        if (bal.value) {
            bal.value.products.forEach(p => rows.push({ section: "Balances", item: p.label, amount: p.value }))
            rows.push({ section: "Balances", item: "Member savings", amount: bal.value.totalSavings })
            rows.push({ section: "Balances", item: "Loans outstanding", amount: bal.value.loansOutstanding })
        }
        const g = gl.value
        ;[["Inflows", g.inflow], ["Deposits", g.deposit], ["Outflows", g.outflow], ["Payouts", g.payout], ["General ledger balance", g.balance]]
            .forEach(([item, amount]) => rows.push({ section: `General ledger (${periodLabel(g.period)})`, item, amount }))
        oi.value.items.forEach(i => rows.push({ section: `Other income (${periodLabel(oi.value.period)})`, item: i.label, amount: i.value }))
        rows.push({ section: `Other income (${periodLabel(oi.value.period)})`, item: "Total income", amount: oi.value.total })
        downloadCsv(csvName("balances", null), [
            { key: "section", heading: "Section" },
            { key: "item", heading: "Item" },
            { key: "amount", heading: "Amount (NGN)" },
        ], rows, { info: ["Balances (previous report)", bal.value?.asAt ? `Balances as at ${bal.value.asAt}` : "Balances as at today"] })
    }
</script>

<style lang="scss">
    // shared by the three sections of this page
    .t2w-legacy-section { margin-bottom: var(--t2w-space-5); break-inside: avoid; }
    .t2w-legacy-asat { font-weight: 400; font-size: var(--t2w-fs-label); color: var(--t2w-muted); margin-left: 6px; }
    .t2w-legacy-controls {
        display: flex; flex-wrap: wrap; align-items: center; gap: var(--t2w-space-2);
        .form-control { width: auto; padding: 3px 8px; border-radius: var(--t2w-radius-sm); }
    }
    .t2w-legacy-filter {
        margin-bottom: var(--t2w-space-3);
        .form-control, .form-select { padding-top: 4px; padding-bottom: 4px; border-radius: var(--t2w-radius-sm); }
    }
    .t2w-legacy-note { font-size: var(--t2w-fs-small); color: var(--t2w-muted); }
</style>
