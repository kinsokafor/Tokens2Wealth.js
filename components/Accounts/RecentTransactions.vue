<template>
    <div class="card mb-3">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">Recent transactions</h5>
                <router-link class="btn btn-outline-secondary btn-sm" :to="`/accounts/statement/${account}`">Full statement</router-link>
            </div>
            <div v-if="error" class="text-danger small">{{ error }}</div>
            <div v-else-if="loading" class="text-muted small">Loading…</div>
            <template v-else>
                <div class="row small text-muted mb-2" v-if="data">
                    <div class="col-6 col-md-3">Last {{ DAYS }} days in: <strong>{{ money(recent.credits) }}</strong></div>
                    <div class="col-6 col-md-3">Out: <strong>{{ money(recent.debits) }}</strong></div>
                    <div class="col-12 col-md-6 text-md-end" v-if="data.rows.length">Last activity: {{ longDate(data.rows[data.rows.length - 1].date) }}</div>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr><th>Date</th><th>Description</th><th class="text-end">Debit</th><th class="text-end">Credit</th><th class="text-end">Balance</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in rows" :key="r.id" :class="{ 'text-muted': r.status !== 'successful' }">
                                <td class="text-nowrap">{{ longDate(r.date) }}</td>
                                <td>{{ r.narration }}<span v-if="r.status !== 'successful'" class="badge bg-light text-dark ms-1">{{ r.status }}</span></td>
                                <td class="text-end text-nowrap">{{ r.debit ? money(r.debit) : "" }}</td>
                                <td class="text-end text-nowrap">{{ r.credit ? money(r.credit) : "" }}</td>
                                <td class="text-end text-nowrap">{{ money(r.balance) }}</td>
                            </tr>
                            <tr v-if="!rows.length"><td colspan="5"><em>No transactions on this account yet.</em></td></tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { Request } from '@/helpers'
    import { amount, longDate, ymd, errorMessage } from '../../helpers/reports'

    // the latest entries of one account, whenever they happened (from the statement endpoint), newest first
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
</script>
