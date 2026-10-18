<template>
    <div class="row">
        <div class="col-md-12 d-flex flex-wrap justify-content-between align-items-end hub-head">
            <div>
                <h3 class="page-title mb-1">All Accounts</h3>
                <div class="small text-muted" v-if="data">
                    {{ data.is_trial ? `Balances as at ${longDate(data.as_at)}` : "Current balances" }}
                </div>
            </div>
            <div>
                <label class="form-label small mb-1" for="hub-date">Balances as at</label>
                <div class="input-group input-group-sm">
                    <input id="hub-date" type="date" class="form-control" :value="date"
                        @change="router.replace({ query: { ...route.query, date: $event.target.value || undefined } })" />
                    <button v-if="date" class="btn btn-outline-secondary" type="button"
                        @click="router.replace({ query: { ...route.query, date: undefined } })">Today</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="row">
        <div class="col-md-4 mb-3" v-for="c in data?.cards ?? []" :key="c.slug">
            <router-link :to="{ path: `/accounts/${c.slug}`, query: date ? { date } : {} }" class="hub-card" :style="{ '--accent': COLORS[c.slug] }">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="hub-title">{{ c.title }}</div>
                                <div class="hub-count">{{ count(c.count) }}</div>
                                <div class="small text-muted">{{ c.count_label }}</div>
                            </div>
                            <FontAwesomeIcon class="hub-icon" :icon="ICONS[c.slug]" />
                        </div>
                        <div class="hub-balance mt-2">{{ amount(c.balance, c.unit) }}</div>
                        <div class="small text-muted mt-1">
                            <span v-for="(n, s) in c.statuses" :key="s" class="me-2 text-capitalize">{{ s }} {{ n }}</span>
                        </div>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
    <div v-if="loading && !data" class="text-muted">Loading…</div>
</template>

<script setup>
    import { computed, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { Request } from '@/helpers'
    import { amount, count, longDate, errorMessage } from '@/Modules/Tokens2Wealth/helpers/reports'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faWallet, faPiggyBank, faUserTie, faBusinessTime, faShareNodes, faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons'

    library.add(faWallet, faPiggyBank, faUserTie, faBusinessTime, faShareNodes, faMoneyCheckDollar)

    // one request (/t2w/api/accounts/summary) for all six cards and their balances; it used to make
    // six counter requests plus five for the balances chart
    const route = useRoute()
    const router = useRouter()
    const req = new Request()

    const data = ref(null)
    const loading = ref(false)
    const error = ref("")
    const date = computed(() => route.query.date ?? "")

    const COLORS = { wallets: 'var(--green)', 'thrift-savings': 'var(--blue)', loans: 'var(--red)',
        'term-deposits': 'var(--purple)', shares: 'var(--color2)', 'special-savings': 'var(--orange)' }
    const ICONS = { wallets: 'fa-solid fa-wallet', 'thrift-savings': 'fa-solid fa-piggy-bank', loans: 'fa-solid fa-user-tie',
        'term-deposits': 'fa-solid fa-business-time', shares: 'fa-solid fa-share-nodes', 'special-savings': 'fa-solid fa-money-check-dollar' }

    const load = async () => {
        loading.value = true
        error.value = ""
        try {
            const r = await req.get(req.root + "/t2w/api/accounts/summary", date.value ? { date: date.value } : {})
            if (r) data.value = r.data
        } catch (e) {
            error.value = String(errorMessage(e))
        } finally {
            loading.value = false
        }
    }
    watch(date, load, { immediate: true })
</script>

<style lang="scss" scoped>
    .hub-head { gap: 8px; margin-bottom: 12px; }
    .hub-card {
        color: inherit;
        text-decoration: none;
        .card { border-left: 4px solid var(--accent); transition: box-shadow .15s; }
        &:hover .card { box-shadow: 0 2px 10px -4px var(--accent); }
    }
    .hub-title { font-weight: 600; color: var(--accent); }
    .hub-count { font-size: 1.8rem; font-weight: 700; line-height: 1.1; }
    .hub-icon { font-size: 1.6rem; color: var(--accent); opacity: .8; }
    .hub-balance { font-weight: 600; }
</style>
