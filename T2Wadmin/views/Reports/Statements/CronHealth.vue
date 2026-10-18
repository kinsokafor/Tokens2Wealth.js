<template>
    <ReportShell
        title="Scheduled Jobs"
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
            <div v-if="data" class="alert" :class="data.totals.attention ? 'alert-warning' : 'alert-success'">
                {{ data.totals.attention
                    ? `${data.totals.attention} of ${data.totals.jobs} scheduled jobs need attention.`
                    : `All ${data.totals.jobs} scheduled jobs are running normally.` }}
            </div>
        </template>
        <ReportTable v-if="data" :columns="columns" :rows="data.rows" :searchable="false" />
    </ReportShell>
</template>

<script setup>
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { count, longDate, downloadCsv, csvName } from '../../../../helpers/reports'

    const { data, loading, error, reload } = useReport(() => "cron-health", { period: false })

    const columns = [
        { key: "health", heading: "Health" },
        { key: "job", heading: "Job" },
        { key: "schedule", heading: "Schedule" },
        { key: "status", heading: "Status" },
        { key: "last_run", heading: "Last run" },
        { key: "last_result", heading: "Last result" },
        { key: "next_run", heading: "Next run" },
        { key: "runs_7d", heading: "Runs (7 days)", align: "end", format: v => count(v) },
        { key: "failed_7d", heading: "Failed (7 days)", align: "end", format: v => v ? count(v) : "" },
        { key: "last_feedback", heading: "Last message" },
    ]

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("cron-health", null), [
            ...columns.map(c => ({ key: c.key, heading: c.heading })),
            { key: "callback", heading: "Callback" },
        ], d.rows, { info: [d.title, `As at: ${d.as_at}`] })
    }
</script>
