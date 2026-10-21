<template>
    <ReportShell :title="isBuy ? 'Pending Shares: Buy' : 'Pending Shares: Sell'"
        :subtitle="isBuy ? 'Members asking to buy shares' : 'Members asking to sell shares'"
        :loading="loading" :error="error" :can-export="data.length > 0" @export="exportCsv">
        <DataTable :columns="columns" :rows="data" empty="Nothing waiting for approval."
            :default-sort="{ key: 'time_altered', dir: 'asc' }" search-placeholder="Search…">
            <template #cell-user_id="{ row }"><member-name :id="row.user_id"></member-name></template>
            <template #actions="{ row }">
                <restricted access="1,2">
                    <template #message><span></span></template>
                    <span class="t2w-share-actions">
                        <button type="button" class="t2w-act is-approve" :disabled="busy === row.id" @click="approve(row.id)">Approve</button>
                        <button type="button" class="t2w-act is-decline" :disabled="busy === row.id" @click="decline(row.id)">Decline</button>
                    </span>
                </restricted>
            </template>
        </DataTable>
    </ReportShell>
</template>

<script setup>
    // Share purchases / sales waiting for approval (store type buy_share / sell_share, approval = 0).
    // Approve and decline call the same endpoints as before, after the same confirmation.
    import { computed, ref, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import { Store, Request } from '@/helpers'
    import { useAlertStore } from '@/store/alert'
    import MemberName from '../../components/MemberName.vue'
    import ReportShell from '../../components/Reports/ReportShell.vue'
    import DataTable from '../../components/ui/DataTable.vue'
    import { downloadCsv, csvName } from '../../helpers/reports'

    const route = useRoute()
    const alertStore = useAlertStore()
    const req = new Request()

    const data = ref([])
    const loading = ref(true)
    const error = ref("")
    const busy = ref(null)

    const isBuy = computed(() => route.params.ledger === 'buy_share')

    // reload when switching between buy and sell (the page is reused, so mounting only once showed stale rows)
    watch(() => route.params.ledger, async (ledger) => {
        if (!ledger) return
        loading.value = true
        error.value = ""
        try {
            const r = await new Store().get({ approval: 0 }, ledger)
            data.value = (r?.data ?? []).map(i => {
                const row = { ...i, ...JSON.parse(i.meta ?? "{}") }
                delete row.meta
                return row
            })
        } catch (e) {
            data.value = []
            error.value = "The pending requests could not be loaded."
        } finally {
            loading.value = false
        }
    }, { immediate: true })

    const columns = [
        { key: "time_altered", heading: "Requested", type: "datetime" },
        { key: "user_id", heading: "Member", sortable: false },
        { key: "units", heading: "Units", type: "count" },
        { key: "amount", heading: "Amount", type: "money" },
    ]

    // the request helper throws a plain Error carrying the server's message (not an axios error)
    const messageOf = e => e?.response?.data || e?.message || "Something went wrong"

    const act = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this?`)) return
        busy.value = id
        try {
            const r = await req.post(req.root + `/t2w/api/shares/${action}`, { id })
            const index = data.value.findIndex(i => i.id == (r?.data?.id ?? id))
            if (index !== -1) data.value.splice(index, 1)
            alertStore.add("Done")
        } catch (e) {
            alertStore.add(messageOf(e), "danger")
        } finally {
            busy.value = null
        }
    }
    const approve = id => act(id, "approve")
    const decline = id => act(id, "decline")

    const exportCsv = () => downloadCsv(csvName(isBuy.value ? "pending-share-buys" : "pending-share-sales", null), [
        { key: "id", heading: "ID" },
        { key: "time_altered", heading: "Requested" },
        { key: "user_id", heading: "Member ID" },
        { key: "units", heading: "Units" },
        { key: "amount", heading: "Amount" },
    ], data.value)
</script>

<style lang="scss" scoped>
    .t2w-share-actions { display: inline-flex; gap: var(--t2w-space-2); }

    .t2w-act {
        padding: 3px 12px;
        border-radius: var(--t2w-radius-sm);
        border: 1px solid currentColor;
        background: transparent;
        font-size: var(--t2w-fs-label);
        font-weight: 600;
        cursor: pointer;
        &.is-approve { color: var(--t2w-success-ink); &:hover:not(:disabled) { background: var(--t2w-success-soft); } }
        &.is-decline { color: var(--t2w-danger-ink); &:hover:not(:disabled) { background: var(--t2w-danger-soft); } }
        &:disabled { opacity: 0.5; cursor: wait; }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }
</style>
