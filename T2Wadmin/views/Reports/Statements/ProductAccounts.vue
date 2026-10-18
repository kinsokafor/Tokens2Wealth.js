<template>
    <ReportShell
        :title="data?.title ?? 'Product accounts'"
        :subtitle="periodLabel(data?.period)"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :can-export="!!data"
        @export="exportCsv">
        <template #actions>
            <router-link class="btn btn-outline-secondary btn-sm" :to="{ path: '/reports/statements/trial-balance', query: { from, to } }">
                Back to trial balance
            </router-link>
        </template>
        <template #filters>
            <PeriodFilter :from="from" :to="to" @change="setPeriod">
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" id="pa-all" :checked="showAll"
                        @change="e => setQuery({ all: e.target.checked ? '1' : undefined })" />
                    <label class="form-check-label small" for="pa-all">Include accounts with no balance or activity</label>
                </div>
            </PeriodFilter>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
        </template>
        <ReportTable
            :columns="columns"
            :rows="data?.rows ?? []"
            :totals="data?.totals"
            :row-link="row => ({ path: `/reports/statements/account/${row.ac_number}`, query: { from, to } })" />
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

    const { data, loading, error, from, to, setPeriod, setQuery, route } = useReport(
        r => r.params.code ? `trial-balance/${encodeURIComponent(r.params.code)}` : null,
        { params: r => (r.query.all === '1' ? { all: '1' } : {}) }
    )

    const showAll = computed(() => route.query.all === '1')
    const unit = computed(() => data.value?.product?.unit ?? "NGN")
    const money = v => amount(v, unit.value)

    const columns = [
        { key: "ac_number", heading: "Account" },
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "status", heading: "Status" },
        { key: "opening", heading: "Opening", align: "end", format: money },
        { key: "credits", heading: "Credits", align: "end", format: money },
        { key: "debits", heading: "Debits", align: "end", format: money },
        { key: "closing", heading: "Closing", align: "end", format: money },
    ]

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "Accounts", value: count(t.accounts) },
            { label: "Opening", value: money(t.opening) },
            { label: "Credits − debits", value: money((t.credits ?? 0) - (t.debits ?? 0)) },
            { label: "Closing", value: money(t.closing) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName(`product-${d.product.code}`, d.period), [
            { key: "ac_number", heading: "Account" },
            { key: "member", heading: "Member" },
            { key: "membership_id", heading: "Membership ID" },
            { key: "status", heading: "Status" },
            { key: "opening", heading: `Opening (${d.product.unit})` },
            { key: "credits", heading: "Credits" },
            { key: "debits", heading: "Debits" },
            { key: "closing", heading: "Closing" },
        ], d.rows, {
            info: [d.title, `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`],
            totals: d.totals
        })
    }
</script>
