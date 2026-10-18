<template>
    <ReportShell
        :title="data?.title ?? 'Member Portfolio'"
        :subtitle="data ? `As at ${longDate(data.as_at)}` : ''"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <ul class="nav nav-tabs mb-2">
                <li class="nav-item" v-for="p in PRODUCTS" :key="p.value">
                    <router-link class="nav-link" :class="{ active: product === p.value }"
                        :to="{ path: `/reports/portfolio/${p.value}`, query: route.query.all ? { all: route.query.all } : {} }">
                        {{ p.label }}
                    </router-link>
                </li>
            </ul>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="pf-all" :checked="showAll"
                    @change="e => setQuery({ all: e.target.checked ? '1' : undefined })" />
                <label class="form-check-label small" for="pf-all">{{ allLabel }}</label>
            </div>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
        </template>
        <ReportTable
            v-if="data"
            :columns="columns"
            :rows="data.rows"
            :totals="data.totals"
            :row-link="rowLink" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const PRODUCTS = [
        { value: "loan", label: "Loans" },
        { value: "term_deposit", label: "Term Deposits" },
        { value: "regular_thrift", label: "Thrift" },
        { value: "share", label: "Shares" },
        { value: "special", label: "Special Savings" },
    ]

    const { data, loading, error, setQuery, route } = useReport(
        r => PRODUCTS.some(p => p.value === r.params.product) ? `portfolio/${r.params.product}` : null,
        { period: false, params: r => (r.query.all === '1' ? { all: '1' } : {}) }
    )

    const product = computed(() => route.params.product)
    const showAll = computed(() => route.query.all === '1')
    const allLabel = computed(() => ({
        loan: "Include cleared, declined and pending loans",
        term_deposit: "Include liquidated and empty deposits",
        regular_thrift: "Include inactive thrift accounts with no balance",
        share: "Include accounts with no units",
        special: "Include matured and closed goals",
    })[product.value] ?? "Include all")

    const money = v => amount(v)
    const plain = v => (v === "" || v === null || v === undefined) ? "" : v
    const day = v => v ? longDate(v) : ""
    const base = [
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "ac_number", heading: "Account" },
        { key: "status", heading: "Status" },
    ]

    const COLUMNS = {
        loan: [
            ...base,
            { key: "approved_on", heading: "Approved", format: day },
            { key: "principal", heading: "Principal", align: "end", format: money },
            { key: "rate", heading: "Rate %", align: "end", format: plain },
            { key: "tenure", heading: "Tenure (months)", align: "end", format: v => v || "" },
            { key: "repayment_sum", heading: "Repayment sum", align: "end", format: money },
            { key: "outstanding", heading: "Outstanding", align: "end", format: money },
            { key: "back_duties", heading: "Unpaid back duties", align: "end", format: v => count(v) },
        ],
        term_deposit: [
            ...base,
            { key: "principal", heading: "Principal", align: "end", format: money },
            { key: "rate", heading: "Rate % p.a.", align: "end", format: plain },
            { key: "tenure", heading: "Tenure (months)", align: "end", format: v => v || "" },
            { key: "start", heading: "Start", format: day },
            { key: "maturity", heading: "Maturity", format: day },
            { key: "days_to_maturity", heading: "Days to maturity", align: "end", format: plain },
            { key: "interest_to_date", heading: "Interest to date", align: "end", format: money },
        ],
        regular_thrift: [
            ...base,
            { key: "monthly_amount", heading: "Monthly amount", align: "end", format: money },
            { key: "balance", heading: "Balance", align: "end", format: money },
            { key: "last_contribution", heading: "Last contribution", format: day },
            { key: "back_duties", heading: "Unpaid back duties", align: "end", format: v => count(v) },
        ],
        share: [
            ...base,
            { key: "units", heading: "Units", align: "end", format: v => count(v) },
            { key: "value", heading: "Value", align: "end", format: money },
        ],
        special: [
            { key: "member", heading: "Member" },
            { key: "membership_id", heading: "Membership ID" },
            { key: "goal", heading: "Goal" },
            { key: "frequency", heading: "Frequency" },
            { key: "target_amount", heading: "Target", align: "end", format: money },
            { key: "contribution_amount", heading: "Instalment", align: "end", format: money },
            { key: "total_contributed", heading: "Contributed", align: "end", format: money },
            { key: "progress", heading: "Progress", align: "end", format: v => `${v}%` },
            { key: "periods", heading: "Periods" },
            { key: "periods_behind", heading: "Behind", align: "end", format: v => v ? count(v) : "" },
            { key: "queued", heading: "Queued", align: "end", format: v => Number(v) ? money(v) : "" },
            { key: "next_due", heading: "Next due", format: day },
            { key: "maturity", heading: "Maturity", format: day },
            { key: "status", heading: "Status" },
        ],
    }

    const columns = computed(() => COLUMNS[product.value] ?? base)

    // same destinations the old "Members on …" pages linked to
    const rowLink = (row) => product.value === 'special'
        ? `/special-savings/goal/${row.id}`
        : `/accounts/view/${product.value}/${row.ac_number}`

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        const n = { label: product.value === 'special' ? "Goals" : "Accounts", value: count(t.accounts) }
        switch (product.value) {
            case 'loan': return [n, { label: "Principal", value: money(t.principal) },
                { label: "Outstanding", value: money(t.outstanding) }, { label: "Unpaid back duties", value: count(t.back_duties) }]
            case 'term_deposit': return [n, { label: "Principal", value: money(t.principal) },
                { label: "Interest to date", value: money(t.interest_to_date) }]
            case 'regular_thrift': return [n, { label: "Balance", value: money(t.balance) },
                { label: "Monthly (active)", value: money(t.monthly_amount) }, { label: "Unpaid back duties", value: count(t.back_duties) }]
            case 'share': return [n, { label: "Units", value: count(t.units) }, { label: "Value", value: money(t.value),
                hint: data.value?.share_unit ? `at ${money(data.value.share_unit)} per unit` : "" }]
            case 'special': return [n, { label: "Target", value: money(t.target_amount) },
                { label: "Contributed", value: money(t.total_contributed) }, { label: "Queued", value: money(t.queued) }]
            default: return [n]
        }
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName(d.report, null), columns.value.map(c => ({ key: c.key, heading: c.heading })), d.rows, {
            info: [d.title, `As at: ${d.as_at}`, showAll.value ? "All accounts" : "Current accounts only"],
            totals: d.totals
        })
    }
</script>
