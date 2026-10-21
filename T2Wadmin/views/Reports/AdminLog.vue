<template>
    <ReportShell title="Admin Log" subtitle="What staff did, newest first" :loading="loading"
        :can-export="rows.length > 0" @export="exportCsv">
        <DataTable :columns="columns" :rows="rows" :page-size="50" :default-sort="{ key: 'time_altered', dir: 'desc' }"
            empty="Nothing logged yet." search-placeholder="Search actions…">
            <template #cell-last_altered_by="{ row }"><admin-name :id="row.last_altered_by"></admin-name></template>
            <!-- the log stores the action as HTML -->
            <template #cell-narration="{ row }"><div class="t2w-log-html" v-html="row.narration"></div></template>
        </DataTable>
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAdminLogStore } from '../../../store/adminLog'
    import AdminName from '@module/Tokens2Wealth/components/AdminName.vue'
    import ReportShell from '../../../components/Reports/ReportShell.vue'
    import DataTable from '../../../components/ui/DataTable.vue'
    import { useSettledLoading } from '../../../helpers/useSettledLoading'
    import { downloadCsv, csvName } from '../../../helpers/reports'

    const store = useAdminLogStore()
    const rows = computed(() => store.get({}))
    const loading = useSettledLoading(() => rows.value)

    // plain text of the HTML narration, for search and export
    // DOMParser builds an inert document: nothing in the HTML runs while reading its text
    // (cached: search runs this for every row on every keystroke)
    const parsed = new Map()
    const text = html => {
        const key = String(html ?? "")
        if (!parsed.has(key)) parsed.set(key, (new DOMParser().parseFromString(key, "text/html").body.textContent ?? "").trim())
        return parsed.get(key)
    }

    const columns = [
        { key: "time_altered", heading: "When", type: "datetime" },
        { key: "last_altered_by", heading: "Staff", sortable: false },
        { key: "narration", heading: "Action", sortable: false, format: v => text(v) },
    ]

    const exportCsv = () => downloadCsv(csvName("admin-log", null), [
        { key: "time_altered", heading: "When" },
        { key: "last_altered_by", heading: "Staff user ID" },
        { key: "narration", heading: "Action", value: r => text(r.narration) },
    ], rows.value)
</script>

<style lang="scss" scoped>
    .t2w-log-html :deep(p) { margin: 0; }
</style>
