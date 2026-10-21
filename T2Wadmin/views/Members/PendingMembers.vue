<template>
    <ReportShell title="Pending Members" subtitle="Registration fee paid, waiting for approval" :loading="loading"
        :can-export="rows.length > 0" @export="exportCsv">
        <DataTable :columns="columns" :rows="rows" :page-size="50" :row-link="row => `/pending/profile/${row.id}`"
            empty="No paid registrations are waiting for approval." search-placeholder="Search name, ID, email…">
            <template #actions="{ row }">
                <router-link :to="`/pending/profile/${row.id}`" class="t2w-pm-open">Review</router-link>
            </template>
        </DataTable>
    </ReportShell>
</template>

<script setup>
    // Same members as before (role pending, payment_status paid), as a table instead of cards.
    import { computed } from 'vue'
    import { useUsersStore } from '@/Modules/Main/store/users'
    import { getFullname } from '@/helpers'
    import ReportShell from '../../../components/Reports/ReportShell.vue'
    import DataTable from '../../../components/ui/DataTable.vue'
    import { useSettledLoading } from '../../../helpers/useSettledLoading'
    import { downloadCsv, csvName } from '../../../helpers/reports'

    const store = useUsersStore()
    const rows = computed(() => store.get({ role: 'pending', payment_status: 'paid' }))
    const loading = useSettledLoading(() => rows.value)

    const columns = [
        { key: "surname", heading: "Name", format: (v, row) => getFullname(row) },
        { key: "username", heading: "Membership ID" },
        { key: "email", heading: "Email" },
        { key: "phone", heading: "Phone" },
        { key: "payment_status", heading: "Fee", type: "status" },
    ]

    const exportCsv = () => downloadCsv(csvName("pending-members", null), [
        { key: "surname", heading: "Name", value: r => getFullname(r) },
        { key: "username", heading: "Membership ID" },
        { key: "email", heading: "Email" },
        { key: "phone", heading: "Phone" },
        { key: "payment_status", heading: "Fee" },
    ], rows.value)
</script>

<style lang="scss" scoped>
    .t2w-pm-open { color: var(--t2w-primary); font-weight: 500; font-size: var(--t2w-fs-label); text-decoration: none; }
    .t2w-pm-open:hover { text-decoration: underline; }
</style>
