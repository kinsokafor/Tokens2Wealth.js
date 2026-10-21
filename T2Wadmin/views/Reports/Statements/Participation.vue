<template>
    <ReportShell
        title="Monthly Participating Members"
        :subtitle="data?.label ?? ''"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #actions>
            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading || !data" @click="exportTrend">
                Export trend
            </button>
        </template>
        <template #filters>
            <div class="d-flex flex-wrap align-items-end filters">
                <div>
                    <label class="form-label small mb-1" for="pt-month">Month</label>
                    <input id="pt-month" type="month" class="form-control form-control-sm" :max="thisMonth"
                        :value="month" @change="e => e.target.value && setQuery({ month: e.target.value })" />
                </div>
                <div>
                    <label class="form-label small mb-1" for="pt-months">Trend</label>
                    <select id="pt-months" class="form-select form-select-sm" :value="months"
                        @change="e => setQuery({ months: e.target.value })">
                        <option v-for="n in [6, 12, 24, 36]" :key="n" :value="String(n)">Last {{ n }} months</option>
                    </select>
                </div>
                <div class="btn-group btn-group-sm" role="group" aria-label="Month">
                    <button type="button" class="btn btn-outline-secondary" @click="shift(-1)">‹ Previous</button>
                    <button type="button" class="btn btn-outline-secondary" :disabled="month >= thisMonth" @click="shift(1)">Next ›</button>
                </div>
            </div>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
        </template>

        <template v-if="data">
            <h6 class="mt-2">Trend <span class="small text-muted fw-normal">(click a month to open it)</span></h6>
            <ReportTable
                :columns="TREND_COLUMNS"
                :rows="data.trend"
                row-key="month"
                :row-link="r => ({ query: { ...route.query, month: r.month } })"
                :searchable="false"
                empty="No months to show." />

            <ul class="nav nav-tabs mt-4 mb-2 no-print">
                <li class="nav-item">
                    <a href="#" class="nav-link" :class="{ active: view === 'members' }" @click.prevent="setQuery({ view: undefined })">
                        Participating ({{ count(data.rows.length) }})
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" :class="{ active: view === 'left' }" @click.prevent="setQuery({ view: 'left' })">
                        Stopped this month ({{ count(data.left.length) }})
                    </a>
                </li>
            </ul>
            <div class="d-flex flex-wrap align-items-center filters mb-2 no-print">
                <button v-for="p in PRODUCTS" :key="p.key" type="button" class="btn btn-sm"
                    :class="product === p.key ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="setQuery({ product: p.key || undefined })">
                    {{ p.label }} <span class="badge bg-light text-dark ms-1">{{ count(productCount(p.key)) }}</span>
                </button>
                <div class="form-check ms-2" v-if="view === 'members'">
                    <input class="form-check-input" type="checkbox" id="pt-active" :checked="activeOnly"
                        @change="e => setQuery({ active: e.target.checked ? '1' : undefined })" />
                    <label class="form-check-label small" for="pt-active">Only members with a transaction this month</label>
                </div>
            </div>
            <ReportTable
                :columns="memberColumns"
                :rows="shown"
                :totals="view === 'members' ? shownTotals : null"
                row-key="user_id"
                :row-link="r => `/profile/${r.user_id}`"
                :empty="view === 'left' ? 'Nobody stopped participating this month.' : 'No participating members match.'" />
        </template>
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, downloadCsv } from '../../../../helpers/reports'

    const pad = n => String(n).padStart(2, "0")
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`

    // month and trend length reload the report; tab, product and "active" only filter in the browser
    const { data, loading, error, setQuery, route } = useReport(() => "participation", {
        period: false,
        params: r => ({ month: r.query.month || thisMonth, months: r.query.months || "12" }),
        watchKey: r => `${r.query.month || ""}|${r.query.months || ""}`
    })

    const month = computed(() => route.query.month || thisMonth)
    const months = computed(() => route.query.months || "12")
    const view = computed(() => route.query.view === 'left' ? 'left' : 'members')
    const product = computed(() => route.query.product || "")
    const activeOnly = computed(() => route.query.active === '1')

    const shift = (by) => {
        const [y, m] = month.value.split("-").map(Number)
        const d = new Date(y, m - 1 + by, 1)
        const next = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
        if (next <= thisMonth) setQuery({ month: next })
    }

    const PRODUCTS = [
        { key: "", label: "All" },
        { key: "loan", label: "Loan" },
        { key: "thrift", label: "Thrift" },
        { key: "term_deposit", label: "Term deposit" },
        { key: "shares", label: "Shares" },
        { key: "special", label: "Special savings" },
    ]

    const money = v => v === null || v === undefined ? "" : amount(v)
    const units = v => v === null || v === undefined ? "" : count(v)
    const n = v => count(v)

    const TREND_COLUMNS = [
        { key: "label", heading: "Month" },
        { key: "members", heading: "Participating", align: "end", format: n },
        { key: "joined", heading: "Started", align: "end", format: n },
        { key: "left", heading: "Stopped", align: "end", format: n },
        { key: "loan", heading: "On loan", align: "end", format: n },
        { key: "thrift", heading: "Thrift", align: "end", format: n },
        { key: "term_deposit", heading: "Term deposit", align: "end", format: n },
        { key: "shares", heading: "Shares", align: "end", format: n },
        { key: "special", heading: "Special savings", align: "end", format: n },
    ]

    const MEMBER_COLUMNS = [
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "products", heading: "Portfolio" },
        { key: "loan", heading: "Loan owed", align: "end", format: money },
        { key: "thrift", heading: "Thrift", align: "end", format: money },
        { key: "term_deposit", heading: "Term deposit", align: "end", format: money },
        { key: "shares", heading: "Shares (units)", align: "end", format: units },
        { key: "special", heading: "Special savings", align: "end", format: money },
        { key: "transactions", heading: "Transactions in month", align: "end", format: v => v ? n(v) : "" },
        { key: "state", heading: "Status" },
    ]
    // members who stopped: their accounts are empty at month end, so the amounts would all be blank
    const memberColumns = computed(() => view.value === 'left'
        ? MEMBER_COLUMNS.filter(c => !["loan", "thrift", "term_deposit", "shares", "special"].includes(c.key))
        : MEMBER_COLUMNS)

    const base = computed(() => view.value === 'left' ? (data.value?.left ?? []) : (data.value?.rows ?? []))
    const matches = (r, key) => !key || r.product_keys.includes(key)
    const productCount = key => base.value.filter(r => matches(r, key) && (view.value === 'left' || !activeOnly.value || r.transactions > 0)).length
    const shown = computed(() => base.value.filter(r => matches(r, product.value)
        && (view.value === 'left' || !activeOnly.value || r.transactions > 0)))

    const shownTotals = computed(() => {
        const t = { loan: 0, thrift: 0, term_deposit: 0, shares: 0, special: 0, transactions: 0 }
        for (const r of shown.value) for (const k in t) t[k] += Number(r[k] ?? 0)
        return t
    })

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        const active = (data.value?.rows ?? []).filter(r => r.transactions > 0).length
        return [
            { label: "Participating members", value: n(t.members),
              hint: `${n(t.loan_members)} on loan · ${n(t.thrift_members)} thrift · ${n(t.term_deposit_members)} term deposit · ${n(t.shares_members)} shares` },
            { label: "Started this month", value: n(t.new) },
            { label: "Stopped this month", value: n(t.left) },
            { label: "Transacted this month", value: n(active), hint: `${n(t.transactions)} portfolio transactions` },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        const label = view.value === 'left' ? "Stopped participating" : "Participating"
        const filter = PRODUCTS.find(p => p.key === product.value)?.label ?? "All"
        downloadCsv(`t2w_participation_${d.month}${view.value === 'left' ? '_stopped' : ''}.csv`,
            memberColumns.value.map(c => ({ key: c.key, heading: c.heading })), shown.value, {
                info: [d.title, `Month: ${d.label}`, `${label}; product: ${filter}${activeOnly.value && view.value !== 'left' ? '; transacted this month only' : ''}`,
                    `Generated: ${d.generated_at}`, ...(d.notes ?? [])],
                totals: view.value === 'members' ? shownTotals.value : null
            })
    }

    const exportTrend = () => {
        const d = data.value
        downloadCsv(`t2w_participation_trend_${d.trend.at(-1)?.month}_${d.month}.csv`,
            TREND_COLUMNS.map(c => ({ key: c.key, heading: c.heading })), d.trend, {
                info: [`${d.title} — trend`, `Up to: ${d.label}`, `Generated: ${d.generated_at}`, ...(d.notes ?? [])]
            })
    }
</script>

<style lang="scss" scoped>
    .filters { gap: 8px; }
</style>
