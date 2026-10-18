<template>
    <ReportShell
        title="Back Duties Ageing"
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
        <template #filters>
            <div class="d-flex flex-wrap align-items-end report-filters">
                <div>
                    <label class="form-label small mb-1" for="bd-cat">Category</label>
                    <select id="bd-cat" class="form-select form-select-sm" :value="category"
                        @change="e => setQuery({ category: e.target.value || undefined })">
                        <option value="">All categories</option>
                        <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
                    </select>
                </div>
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" id="bd-settle" :checked="settleOnly"
                        @change="e => setQuery({ settle: e.target.checked ? '1' : undefined })" />
                    <label class="form-check-label small" for="bd-settle">Only members whose wallet can settle an item now</label>
                </div>
            </div>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
            <h5>By category and age</h5>
            <ReportTable
                :columns="matrixColumns"
                :rows="data?.by_category ?? []"
                row-key="key"
                :totals="matrixTotals"
                :searchable="false" />
            <h5 class="mt-3">By member</h5>
        </template>
        <ReportTable
            v-if="data"
            :columns="columns"
            :rows="rows"
            :totals="rowTotals"
            :row-link="row => `/accounts/view/contribution/${row.ac_number}`" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, setQuery, reload, route } = useReport(() => "pending-debits", { period: false, watchKey: r => r.path })

    const categories = [
        { key: "rt", label: "Regular thrift" },
        { key: "loan", label: "Loan" },
        { key: "special", label: "Special savings" },
        { key: "bulk_debit", label: "Bulk debit" },
        { key: "other", label: "Other" },
    ]
    const category = computed(() => route.query.category ?? "")
    const settleOnly = computed(() => route.query.settle === '1')
    const money = v => amount(v)
    const nonZero = v => Number(v) ? money(v) : ""

    const rows = computed(() => (data.value?.rows ?? []).filter(r =>
        (!category.value || Number(r[category.value]) > 0) && (!settleOnly.value || r.can_settle_now)))

    const rowTotals = computed(() => rows.value.reduce((t, r) => {
        ["items", "owed", "wallet_balance", "rt", "loan", "special", "bulk_debit", "other"].forEach(k => t[k] += Number(r[k] ?? 0))
        return t
    }, { items: 0, owed: 0, wallet_balance: 0, rt: 0, loan: 0, special: 0, bulk_debit: 0, other: 0 }))

    const matrixColumns = computed(() => [
        { key: "category", heading: "Category" },
        { key: "items", heading: "Items", align: "end", format: v => count(v) },
        ...(data.value?.buckets ?? []).map(b => ({ key: b, heading: b, align: "end", format: nonZero })),
        { key: "owed", heading: "Total owed", align: "end", format: money },
    ])

    const matrixTotals = computed(() => {
        const t = { items: 0, owed: 0 }
        for (const c of data.value?.by_category ?? []) {
            t.items += c.items; t.owed += c.owed
            for (const b of data.value.buckets) t[b] = (t[b] ?? 0) + c[b]
        }
        return t
    })

    const columns = [
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "ac_number", heading: "E-Wallet" },
        { key: "items", heading: "Items", align: "end", format: v => count(v) },
        { key: "rt", heading: "Thrift", align: "end", format: nonZero },
        { key: "loan", heading: "Loan", align: "end", format: nonZero },
        { key: "special", heading: "Special", align: "end", format: nonZero },
        { key: "bulk_debit", heading: "Bulk debit", align: "end", format: nonZero },
        { key: "owed", heading: "Total owed", align: "end", format: money },
        { key: "wallet_balance", heading: "Wallet balance", align: "end", format: money },
        { key: "oldest", heading: "Oldest", format: v => v ? longDate(v) : "" },
        { key: "bucket", heading: "Age" },
    ]

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        const overYear = (data.value?.by_category ?? []).reduce((a, c) => a + (c["Over 1 year"] ?? 0), 0)
        return [
            { label: "Total owed", value: money(t.owed), hint: `${count(t.items)} items` },
            { label: "Members", value: count(t.members) },
            { label: "Older than a year", value: money(overYear) },
            { label: "Can settle now", value: count((data.value?.rows ?? []).filter(r => r.can_settle_now).length),
              hint: "wallet covers at least one item" },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("back-duties", null), [
            ...columns.map(c => ({ key: c.key, heading: c.heading })),
            { key: "days", heading: "Days (oldest)" },
            { key: "can_settle_now", heading: "Can settle now", value: r => r.can_settle_now ? "yes" : "no" },
        ], rows.value, {
            info: [d.title, `As at: ${d.as_at}`, `Filter: ${category.value || "all categories"}${settleOnly.value ? ", can settle now" : ""}`],
            totals: rowTotals.value
        })
    }
</script>

<style lang="scss" scoped>
    .report-filters { gap: 16px; }
</style>
