<template>
    <ReportShell title="Learning Materials" subtitle="Published for members" :loading="loading" :can-export="false">
        <template #actions v-if="canPublish">
            <router-link to="/publish-learning-material" class="btn btn-outline-secondary btn-sm">Publish new</router-link>
        </template>
        <DataTable :columns="columns" :rows="rows" :page-size="50" :default-sort="{ key: 'time_altered', dir: 'desc' }"
            empty="No learning materials published yet." search-placeholder="Search title or description…">
            <template #cell-description="{ row }"><div class="t2w-lm-html" v-html="row.description"></div></template>
            <template #actions="{ row }">
                <a :href="getLink(row.file)" download class="t2w-lm-download">Download</a>
            </template>
        </DataTable>
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/auth'
    import { useLMStore } from '@module/Tokens2Wealth/store/LearningMaterials'
    import ReportShell from '../../../components/Reports/ReportShell.vue'
    import DataTable from '../../../components/ui/DataTable.vue'
    import { useSettledLoading } from '../../../helpers/useSettledLoading'

    const store = useLMStore()
    const rows = computed(() => store.get({}))

    // The member app shows this same page: "Publish new" is for staff, and only where the app has the
    // publish page (the member app doesn't; its catch-all route would show "not found").
    const auth = useAuthStore()
    const router = useRouter()
    const canPublish = computed(() => auth.hasAccess("1,2,3,4")
        && router.resolve("/publish-learning-material").matched.some(r => !r.path.includes(":pathMatch")))
    const loading = useSettledLoading(() => rows.value)

    // DOMParser builds an inert document: nothing in the HTML runs while reading its text
    // (cached: search runs this for every row on every keystroke)
    const parsed = new Map()
    const text = html => {
        const key = String(html ?? "")
        if (!parsed.has(key)) parsed.set(key, (new DOMParser().parseFromString(key, "text/html").body.textContent ?? "").trim())
        return parsed.get(key)
    }

    const columns = [
        { key: "time_altered", heading: "Published", type: "date" },
        { key: "title", heading: "Title" },
        { key: "description", heading: "Description", sortable: false, format: v => text(v) },
    ]

    const getLink = (link) => {
        link = String(link ?? "")
        return link.charAt(0) == "/" ? link : (link.search("http") == -1 ? "/" + link : link)
    }
</script>

<style lang="scss" scoped>
    .t2w-lm-html :deep(p) { margin: 0; }
    .t2w-lm-download { color: var(--t2w-primary); font-weight: 500; font-size: var(--t2w-fs-label); text-decoration: none; }
    .t2w-lm-download:hover { text-decoration: underline; }
</style>
