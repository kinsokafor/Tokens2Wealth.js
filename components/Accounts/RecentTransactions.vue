<template>
    <Panel title="Recent transactions" :subtitle="subtitle" flush :loading="loading" :error="error">
        <template #actions>
            <router-link :to="`/accounts/statement/${account}`">Full statement</router-link>
        </template>
        <DataTable :columns="columns" :rows="rows" :searchable="false" dense
            empty="No transactions on this account yet." class="t2w-recent-table">
            <template #cell-narration="{ row }">
                {{ row.narration }}
                <StatusBadge v-if="row.status !== 'successful'" :status="row.status" class="ms-1" />
            </template>
        </DataTable>
    </Panel>
</template>

<script setup>
    // The latest entries of one account, whenever they happened (from the statement endpoint), newest first,
    // with money in / out over the last 90 days.
    import { computed, ref, watch } from 'vue'
    import { Request } from '@/helpers'
    import Panel from '../ui/Panel.vue'
    import DataTable from '../ui/DataTable.vue'
    import StatusBadge from '../ui/StatusBadge.vue'
    import { amount, longDate, ymd, errorMessage } from '../../helpers/reports'

    const props = defineProps({
        account: { type: String, required: true },
        limit: { type: Number, default: 10 }
    })

    const DAYS = 90
    const data = ref(null)
    const loading = ref(false)
    const error = ref("")
    const req = new Request()

    const load = async () => {
        if (!props.account) return
        loading.value = true
        error.value = ""
        try {
            const r = await req.get(`${req.root}/t2w/api/accounts/statement/${encodeURIComponent(props.account)}`,
                { from: "2017-01-01", to: ymd(new Date()) })
            data.value = r?.data ?? null
        } catch (e) {
            error.value = String(errorMessage(e))
        } finally {
            loading.value = false
        }
    }
    watch(() => props.account, load, { immediate: true })

    const unit = computed(() => data.value?.account?.unit ?? "NGN")
    const money = v => amount(v, unit.value)
    const rows = computed(() => [...(data.value?.rows ?? [])].reverse().slice(0, props.limit))

    // money in / out over the last DAYS days (successful entries only)
    const recent = computed(() => {
        const since = new Date()
        since.setDate(since.getDate() - DAYS)
        const floor = ymd(since)
        return (data.value?.rows ?? []).filter(r => r.status === "successful" && String(r.date).slice(0, 10) >= floor)
            .reduce((t, r) => ({ credits: t.credits + r.credit, debits: t.debits + r.debit }), { credits: 0, debits: 0 })
    })

    const subtitle = computed(() => {
        if (!data.value) return ""
        const all = data.value.rows ?? []
        const last = all.length ? ` · last activity ${longDate(all[all.length - 1].date)}` : ""
        return `Last ${DAYS} days: in ${money(recent.value.credits)}, out ${money(recent.value.debits)}${last}`
    })

    // statement order (newest first), so no sorting
    const columns = computed(() => [
        { key: "date", heading: "Date", sortable: false, format: v => longDate(v) },
        { key: "narration", heading: "Description", sortable: false },
        { key: "debit", heading: "Debit", align: "end", sortable: false, format: v => v ? money(v) : "" },
        { key: "credit", heading: "Credit", align: "end", sortable: false, format: v => v ? money(v) : "" },
        { key: "balance", heading: "Balance", align: "end", sortable: false, format: v => money(v) },
    ])
</script>

<style lang="scss" scoped>
    // the table sits flush inside the panel: no second border
    .t2w-recent-table :deep(.t2w-dt__scroll) { border: 0; border-radius: 0; }
</style>
