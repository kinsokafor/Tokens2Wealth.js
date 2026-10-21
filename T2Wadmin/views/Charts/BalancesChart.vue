<template>
    <restricted access="1,2">
        <template #message><span></span></template>
        <div class="t2w-legacy-section" role="region" aria-labelledby="t2w-bal-title">
            <div class="t2w-section-head">
                <h2 class="t2w-section-title" id="t2w-bal-title">Balances <span class="t2w-legacy-asat">{{ asAt ? `as at ${shortDate(asAt)}` : 'today' }}</span></h2>
                <div class="t2w-legacy-controls no-print">
                    <label class="t2w-visually-hidden" for="t2w-bal-date">Balances as at</label>
                    <input id="t2w-bal-date" type="date" class="form-control form-control-sm" v-model="dateInput" :max="today" />
                    <button type="button" class="t2w-btn" :disabled="!dateInput || loading" @click="load(dateInput)">Show as at date</button>
                    <button type="button" class="t2w-btn" v-if="asAt" :disabled="loading" @click="dateInput = ''; load(null)">Today</button>
                </div>
            </div>

            <div class="row g-2 g-md-3 mb-3">
                <div class="col-6 col-md-4"><StatCard label="Member savings" :value="totalSavings" :loading="loading"
                    hint="E-wallets, thrift, term deposits, special savings and shares" /></div>
                <div class="col-6 col-md-4"><StatCard label="Loans outstanding" :value="loansOutstanding" :loading="loading" /></div>
                <div class="col-12 col-md-4" v-if="seesGsa">
                    <StatCard label="General System Account" :value="gsaBalance" :loading="loading"
                        :to="gsa ? `/accounts/statement/${gsa}` : null" :hint="gsa ? 'View statement →' : ''" />
                </div>
            </div>

            <ChartCard title="Savings by product" type="bar" horizontal show-totals label-heading="Product"
                :labels="products.map(p => p.label)" :datasets="[{ label: 'Balance', data: products.map(p => p.value) }]"
                :height="220" :loading="loading" :error="error">
                <template #footer>
                    <span class="t2w-legacy-note">Shares valued at {{ money(shareUnit) }} per unit ({{ count(units) }} units). Loans are shown apart: they are owed to the cooperative, not members' savings.</span>
                </template>
            </ChartCard>
        </div>
    </restricted>
</template>

<script setup>
    // Product balances from the per-product balance endpoints (as before), optionally as at a date.
    // Changes from the old panel: loans are no longer added into the savings total, every product has its
    // own colour (E-wallet and Shares shared one), and the requests run together instead of one by one.
    import { computed, onMounted, ref } from 'vue'
    import { Request, Options } from '@/helpers'
    import { useAuthStore } from '@/store/auth'
    import StatCard from '../../../components/ui/StatCard.vue'
    import ChartCard from '../../../components/ui/ChartCard.vue'
    import { money, count, shortDate, toNumber } from '../../../helpers/format'
    import { ymd } from '../../../helpers/reports'

    const req = new Request()
    // the General System Account was shown to capacity 1 only (as before)
    const seesGsa = computed(() => useAuthStore().hasAccess("1"))
    const CODES = { ewallet: "301%", td: "311%", thrift: "312%", units: "313%", special: "314%", loan: "321%", gsa: "201%" }

    const values = ref({})
    const shareUnit = ref(0)
    const gsa = ref("")
    const asAt = ref(null)
    const dateInput = ref("")
    const loading = ref(true)
    const error = ref("")
    const today = ymd(new Date())

    const load = async (date) => {
        loading.value = true
        error.value = ""
        try {
            const body = date ? { date: `${date} 23:59:59` } : {}
            const entries = await Promise.all(Object.entries(CODES).map(([k, code]) =>
                req.post(req.root + encodeURI(`/t2w/api/balance/${code}`), body).then(r => [k, toNumber(r?.data) ?? 0])))
            values.value = Object.fromEntries(entries)
            asAt.value = date
        } catch (e) {
            error.value = "The balances could not be loaded."
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        load(null)
        new Options().get("share_unit").then(r => { shareUnit.value = toNumber(r?.data) ?? 0 }).catch(() => {})
        req.post(req.root + "/t2w/api/get-general-system-account").then(r => { gsa.value = r?.data ?? "" }).catch(() => {})
    })

    const v = k => values.value[k] ?? 0
    const units = computed(() => v("units"))
    const products = computed(() => [
        { label: "E-wallets", value: v("ewallet") },
        { label: "Regular thrift", value: v("thrift") },
        { label: "Term deposits", value: v("td") },
        { label: "Special savings", value: v("special") },
        { label: "Shares", value: units.value * shareUnit.value },
    ])
    const totalSavings = computed(() => products.value.reduce((a, p) => a + p.value, 0))
    // the loan ledger runs as a debit balance
    const loansOutstanding = computed(() => -v("loan"))
    const gsaBalance = computed(() => v("gsa"))

    defineExpose({ products, totalSavings, loansOutstanding, asAt })
</script>
