<template>
    <ReportShell
        title="Approvals Queue"
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
            <div>
                <label class="form-label small mb-1" for="aq-type">Type</label>
                <select id="aq-type" class="form-select form-select-sm" style="max-width: 260px" :value="type"
                    @change="e => setQuery({ type: e.target.value || undefined })">
                    <option value="">Everything waiting</option>
                    <option v-for="s in data?.summary ?? []" :key="s.type" :value="s.type">{{ s.type }} ({{ s.count }})</option>
                </select>
            </div>
        </template>
        <template #summary>
            <div v-if="data && data.rows.length === 0" class="alert alert-success">Nothing is waiting for approval.</div>
            <template v-else>
                <ReportTable
                    :columns="summaryColumns"
                    :rows="data?.summary ?? []"
                    row-key="type"
                    :totals="{ count: data?.totals?.items }"
                    :searchable="false" />
                <h5 class="mt-3">Waiting items</h5>
            </template>
        </template>
        <ReportTable
            v-if="data && data.rows.length"
            :columns="columns"
            :rows="rows"
            :row-link="row => row.link" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, setQuery, reload, route } = useReport(() => "approvals", { period: false, watchKey: r => r.path })

    const type = computed(() => route.query.type ?? "")
    const rows = computed(() => (data.value?.rows ?? []).filter(r => !type.value || r.type === type.value))
    const money = v => v === null || v === undefined ? "" : amount(v)
    const days = v => v === null || v === undefined ? "" : `${count(v)} day${v === 1 ? "" : "s"}`

    const summaryColumns = [
        { key: "type", heading: "Type" },
        { key: "count", heading: "Waiting", align: "end", format: v => count(v) },
        { key: "amount", heading: "Amount", align: "end", format: v => Number(v) ? amount(v) : "" },
        { key: "oldest_days", heading: "Oldest", align: "end", format: days },
    ]

    const columns = [
        { key: "type", heading: "Type" },
        { key: "member", heading: "Member" },
        { key: "detail", heading: "Details" },
        { key: "amount", heading: "Amount", align: "end", format: money },
        { key: "submitted", heading: "Submitted", format: v => v ? longDate(v) : "" },
        { key: "waiting_days", heading: "Waiting", align: "end", format: days },
    ]

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("approvals", null), [
            ...columns.map(c => ({ key: c.key, heading: c.heading })),
            { key: "reference", heading: "Reference" },
        ], rows.value, { info: [d.title, `As at: ${d.as_at}`, `Filter: ${type.value || "everything waiting"}`] })
    }
</script>
