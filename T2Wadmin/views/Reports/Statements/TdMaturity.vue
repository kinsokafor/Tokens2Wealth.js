<template>
    <ReportShell
        title="Term Deposit Maturity Schedule"
        :subtitle="data ? `As at ${longDate(data.as_at)}` : ''"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <div>
                <label class="form-label small mb-1" for="tdm-bucket">Maturity</label>
                <select id="tdm-bucket" class="form-select form-select-sm" style="max-width: 260px" :value="bucket"
                    @change="e => setQuery({ bucket: e.target.value || undefined })">
                    <option value="">All running deposits</option>
                    <option v-for="b in buckets" :key="b" :value="b">{{ b }}</option>
                </select>
            </div>
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
            <ReportTable
                :columns="summaryColumns"
                :rows="data?.summary ?? []"
                row-key="bucket"
                :totals="{ deposits: data?.totals?.deposits, principal: data?.totals?.principal, payable: data?.totals?.payable }"
                :searchable="false" />
            <h5 class="mt-3">Deposits</h5>
        </template>
        <ReportTable
            v-if="data"
            :columns="columns"
            :rows="rows"
            :totals="rowTotals"
            :row-link="row => `/accounts/view/term_deposit/${row.ac_number}`" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, setQuery, route } = useReport(() => "td-maturity", { period: false, watchKey: r => r.path })

    const buckets = ["Matured, not paid out", "Within 30 days", "31-60 days", "61-90 days", "Later"]
    const bucket = computed(() => route.query.bucket ?? "")
    const rows = computed(() => (data.value?.rows ?? []).filter(r => !bucket.value || r.bucket === bucket.value))
    const money = v => amount(v)

    const rowTotals = computed(() => rows.value.reduce((t, r) => {
        t.principal += r.principal; t.interest_at_maturity += r.interest_at_maturity; t.payable += r.payable
        return t
    }, { principal: 0, interest_at_maturity: 0, payable: 0 }))

    const summaryColumns = [
        { key: "bucket", heading: "Maturity" },
        { key: "deposits", heading: "Deposits", align: "end", format: v => count(v) },
        { key: "principal", heading: "Principal", align: "end", format: money },
        { key: "payable", heading: "Payable at maturity", align: "end", format: money },
    ]

    const columns = [
        { key: "member", heading: "Member" },
        { key: "membership_id", heading: "Membership ID" },
        { key: "ac_number", heading: "Account" },
        { key: "principal", heading: "Principal", align: "end", format: money },
        { key: "rate", heading: "Rate % p.a.", align: "end" },
        { key: "tenure", heading: "Tenure (months)", align: "end" },
        { key: "start", heading: "Start", format: v => v ? longDate(v) : "" },
        { key: "maturity", heading: "Maturity", format: v => v ? longDate(v) : "" },
        { key: "days_to_maturity", heading: "Days", align: "end",
          format: v => v === null || v === undefined ? "" : (v < 0 ? `${count(-v)} overdue` : count(v)) },
        { key: "interest_at_maturity", heading: "Interest at maturity", align: "end", format: money },
        { key: "payable", heading: "Payable", align: "end", format: money },
        { key: "bucket", heading: "Status" },
    ]

    const cards = computed(() => {
        const s = Object.fromEntries((data.value?.summary ?? []).map(x => [x.bucket, x]))
        const t = data.value?.totals ?? {}
        const next30 = s["Within 30 days"]
        const overdue = s["Matured, not paid out"]
        return [
            { label: "Running deposits", value: count(t.deposits), hint: money(t.principal) },
            { label: "Matured, not paid out", value: count(overdue?.deposits ?? 0), hint: money(overdue?.payable ?? 0) },
            { label: "Due within 30 days", value: count(next30?.deposits ?? 0), hint: money(next30?.payable ?? 0) },
            { label: "Payable at maturity", value: money(t.payable) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("td-maturity", null), [
            ...columns.map(c => ({ key: c.key, heading: c.heading })),
            { key: "interest_earned", heading: "Interest earned so far" },
        ], rows.value, {
            info: [d.title, `As at: ${d.as_at}`, `Filter: ${bucket.value || "all running deposits"}`],
            totals: rowTotals.value
        })
    }
</script>
