<template>
    <ReportShell
        title="Loan Arrears Ageing"
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
            <div class="d-flex flex-wrap align-items-end arrears-filters">
                <div>
                    <label class="form-label small mb-1" for="la-bucket">Age</label>
                    <select id="la-bucket" class="form-select form-select-sm" :value="bucket"
                        @change="e => setQuery({ bucket: e.target.value || undefined })">
                        <option value="">All loans owing</option>
                        <option value="arrears">In arrears (any age)</option>
                        <option v-for="b in buckets" :key="b" :value="b">{{ b }}</option>
                    </select>
                </div>
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" id="la-defaulted" :checked="defaultedOnly"
                        @change="e => setQuery({ defaulted: e.target.checked ? '1' : undefined })" />
                    <label class="form-check-label small" for="la-defaulted">Defaulted only</label>
                </div>
            </div>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
            <ReportTable
                :columns="summaryColumns"
                :rows="data?.summary ?? []"
                row-key="bucket"
                :totals="{ loans: data?.totals?.loans, outstanding: data?.totals?.outstanding, overdue: data?.totals?.overdue }"
                :searchable="false" />
            <h5 class="mt-3">Loans</h5>
        </template>
        <ReportTable
            v-if="data"
            :columns="columns"
            :rows="rows"
            :totals="rowTotals"
            :row-link="row => `/accounts/view/loan/${row.ac_number}`" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    // filters only narrow the list in the browser, so they don't trigger a new request
    const { data, loading, error, setQuery, reload, route } = useReport(() => "loan-arrears", { period: false, watchKey: r => r.path })

    const buckets = ["Current", "0-30 days", "31-60 days", "61-90 days", "Over 90 days"]
    const bucket = computed(() => route.query.bucket ?? "")
    const defaultedOnly = computed(() => route.query.defaulted === '1')

    const rows = computed(() => (data.value?.rows ?? []).filter(r => {
        if (defaultedOnly.value && r.status !== 'defaulted') return false
        if (bucket.value === 'arrears') return r.bucket !== 'Current'
        if (bucket.value) return r.bucket === bucket.value
        return true
    }))

    const rowTotals = computed(() => rows.value.reduce((t, r) => {
        t.principal += r.principal; t.outstanding += r.outstanding; t.overdue += r.overdue; t.unpaid_items += r.unpaid_items; t.excess_back_duty += r.excess_back_duty
        return t
    }, { principal: 0, outstanding: 0, overdue: 0, unpaid_items: 0, excess_back_duty: 0 }))

    const money = v => amount(v)

    const summaryColumns = [
        { key: "bucket", heading: "Age" },
        { key: "loans", heading: "Loans", align: "end", format: v => count(v) },
        { key: "outstanding", heading: "Outstanding", align: "end", format: money },
        { key: "overdue", heading: "Overdue", align: "end", format: money },
    ]

    const columns = [
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "ac_number", heading: "Loan account" },
        { key: "status", heading: "Status" },
        { key: "principal", heading: "Principal", align: "end", format: money },
        { key: "outstanding", heading: "Outstanding", align: "end", format: money },
        { key: "overdue", heading: "Overdue", align: "end", format: money },
        { key: "excess_back_duty", heading: "Excess back duty", align: "end", format: v => Number(v) ? money(v) : "" },
        { key: "unpaid_items", heading: "Unpaid items", align: "end", format: v => count(v) },
        { key: "oldest_due", heading: "Oldest due", format: v => v ? longDate(v) : "" },
        { key: "days_overdue", heading: "Days", align: "end", format: v => v ? count(v) : "" },
        { key: "bucket", heading: "Age" },
        { key: "guarantors", heading: "Guarantors" },
    ]

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        const inArrears = (data.value?.summary ?? []).filter(s => s.bucket !== 'Current').reduce((a, s) => a + s.loans, 0)
        return [
            { label: "Loans owing", value: count(t.loans) },
            { label: "Outstanding", value: amount(t.outstanding) },
            { label: "Overdue", value: amount(t.overdue), hint: `${count(inArrears)} loans in arrears` },
            { label: "Defaulted", value: count(t.defaulted), hint: t.loans_with_excess ? `${count(t.loans_with_excess)} with excess back duties` : "" },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("loan-arrears", null), [
            { key: "member", heading: "Member" },
            { key: "membership_id", heading: "Membership ID" },
            { key: "ac_number", heading: "Loan account" },
            { key: "status", heading: "Status" },
            { key: "principal", heading: "Principal" },
            { key: "repayment_sum", heading: "Repayment sum" },
            { key: "tenure", heading: "Tenure (months)" },
            { key: "rate", heading: "Rate (%)" },
            { key: "outstanding", heading: "Outstanding" },
            { key: "overdue", heading: "Overdue" },
            { key: "excess_back_duty", heading: "Excess back duty" },
            { key: "unpaid_items", heading: "Unpaid items" },
            { key: "missed_settlements", heading: "Missed settlements" },
            { key: "oldest_due", heading: "Oldest due" },
            { key: "days_overdue", heading: "Days overdue" },
            { key: "bucket", heading: "Age" },
            { key: "guarantors", heading: "Guarantors" },
        ], rows.value, {
            info: [d.title, `As at: ${d.as_at}`,
                `Filter: ${bucket.value === 'arrears' ? "in arrears (any age)" : (bucket.value || "all loans owing")}${defaultedOnly.value ? ", defaulted only" : ""}`],
            totals: rowTotals.value
        })
    }
</script>

<style lang="scss" scoped>
    .arrears-filters { gap: 16px; }
</style>
