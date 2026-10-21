<template>
    <div class="t2w-balances" role="region" aria-labelledby="t2w-balances-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-balances-title">Balances today</h2>
            <router-link to="/reports/statements/trial-balance" class="t2w-section-link">Trial balance →</router-link>
        </div>
        <div class="row g-2 g-md-3 mb-3">
            <div class="col-6">
                <StatCard label="Member savings" :value="error ? null : totalSavings" :loading="loading"
                    hint="E-wallets, thrift, term deposits, special savings and shares" />
            </div>
            <div class="col-6">
                <StatCard label="Loans outstanding" :value="error ? null : loansOutstanding" :loading="loading"
                    to="/accounts/loans" />
            </div>
        </div>
        <ChartCard title="Savings by product" type="bar" horizontal show-totals label-heading="Product"
            :labels="products.map(p => p.label)"
            :datasets="[{ label: 'Balance', data: products.map(p => p.value) }]"
            :height="210" :loading="loading" :error="error">
            <template #footer v-if="shareUnit">
                <span class="t2w-balances__note">Shares valued at {{ money(shareUnit) }} per unit ({{ count(shareUnits) }} units).</span>
            </template>
        </ChartCard>
    </div>
</template>

<script setup>
    // Product balances from the trial balance report (one request) instead of one request per product.
    // Loans are kept apart from savings: they are money owed to the cooperative, not members' money.
    import { computed, onMounted, ref } from 'vue'
    import { Request, Options } from '@/helpers'
    import StatCard from '../ui/StatCard.vue'
    import ChartCard from '../ui/ChartCard.vue'
    import { money, count, toNumber } from '../../helpers/format'
    import { presetRange, errorMessage } from '../../helpers/reports'

    const rows = ref([])
    const shareUnit = ref(0)
    const loading = ref(true)
    const error = ref("")

    const closing = code => toNumber(rows.value.find(r => r.code === code)?.closing) ?? 0
    const shareUnits = computed(() => closing("313"))

    const products = computed(() => [
        { label: "E-wallets", value: closing("301") },
        { label: "Regular thrift", value: closing("312") },
        { label: "Term deposits", value: closing("311") },
        { label: "Special savings", value: closing("314") },
        { label: "Shares", value: shareUnits.value * shareUnit.value },
    ])

    const totalSavings = computed(() => products.value.reduce((a, p) => a + p.value, 0))
    // the loan ledger runs as a debit balance, so its closing figure is negative
    const loansOutstanding = computed(() => -closing("321"))

    onMounted(async () => {
        const req = new Request()
        const { from, to } = presetRange("all-time")
        try {
            const [tb, unit] = await Promise.all([
                req.get(`${req.root}/t2w/api/reports/trial-balance`, { from, to }),
                new Options().get("share_unit").catch(() => null)
            ])
            if (!tb || typeof tb.data !== "object" || tb.data === null) throw new Error("The server returned an unexpected response.")
            rows.value = tb.data.rows ?? []
            shareUnit.value = toNumber(unit?.data) ?? 0
        } catch (e) {
            error.value = String(errorMessage(e))
        } finally {
            loading.value = false
        }
    })
</script>

<style lang="scss" scoped>
    .t2w-balances { margin-bottom: var(--t2w-space-5); }
    .t2w-balances__note { color: var(--t2w-muted); font-size: var(--t2w-fs-small); }
</style>
