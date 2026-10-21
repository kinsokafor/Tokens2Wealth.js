<template>
    <div class="t2w-member-balances" role="region" aria-labelledby="t2w-member-balances-title">
        <h2 class="t2w-visually-hidden" id="t2w-member-balances-title">My balances</h2>
        <div class="row g-2 g-md-3">
            <div class="col-12 col-lg-5">
                <StatCard tone="brand" size="lg" class="t2w-member-hero" label="Total savings"
                    :value="loading ? null : totalSavings" :loading="loading"
                    hint="E-wallet, thrift, term deposit, special savings and shares">
                    <div class="t2w-member-hero__actions">
                        <router-link to="/payout" class="t2w-hero-btn">Request payout</router-link>
                        <router-link to="/contribution/statement" class="t2w-hero-btn is-ghost">E-wallet statement</router-link>
                    </div>
                </StatCard>
            </div>
            <div class="col-12 col-lg-7">
                <div class="row g-2 g-md-3">
                    <div class="col-6 col-md-4" v-for="p in products" :key="p.key">
                        <StatCard v-if="loading || p.active" :label="p.label" :value="p.value" :to="p.to"
                            :hint="p.hint" :loading="loading" />
                        <router-link v-else :to="p.start.to" class="t2w-start-card">
                            <span class="t2w-start-card__label">{{ p.label }}</span>
                            <span class="t2w-start-card__pitch">{{ p.start.pitch }}</span>
                            <span class="t2w-start-card__cta">{{ p.start.cta }} →</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    // Member balances: a total-savings card and one card per product.
    // /t2w/api/balance/m/<type> answers 400 when the member has no account of that type: that product
    // shows a "get started" card with the same link the old dashboard button had.
    // Shares come back in units and are valued at share_unit (as on the Shares page); a loan balance
    // is negative while money is owed, so it is shown as an amount outstanding.
    import { computed, onMounted, ref } from 'vue'
    import { Request, Options } from '@/helpers'
    import StatCard from '../../../components/ui/StatCard.vue'
    import { toNumber, count, money } from '../../../helpers/format'

    const TYPES = ["contribution", "regular_thrift", "loan", "term_deposit", "special", "share"]

    const balances = ref({})   // ac_type -> number, or null when the member has no such account
    const shareUnit = ref(0)
    const loading = ref(true)

    onMounted(async () => {
        const req = new Request()
        const results = await Promise.all([
            ...TYPES.map(t => req.post(`${req.root}/t2w/api/balance/m/${t}`)
                .then(r => toNumber(r?.data) ?? 0)
                .catch(() => null)),
            new Options().get("share_unit").then(r => toNumber(r?.data) ?? 0).catch(() => 0)
        ])
        balances.value = Object.fromEntries(TYPES.map((t, i) => [t, results[i]]))
        shareUnit.value = results[TYPES.length]
        loading.value = false
    })

    const has = t => balances.value[t] !== null && balances.value[t] !== undefined
    const shareValue = computed(() => (balances.value.share ?? 0) * shareUnit.value)

    const products = computed(() => [
        {
            key: "contribution", label: "E-wallet", active: has("contribution"),
            value: balances.value.contribution, to: "/savings/e-wallet",
            start: { to: "/savings/e-wallet", pitch: "Your e-wallet is not active yet.", cta: "See details" }
        },
        {
            key: "regular_thrift", label: "Thrift savings", active: has("regular_thrift"),
            value: balances.value.regular_thrift, to: "/savings/thrift",
            start: { to: "/savings/thrift/new", pitch: "Save a fixed amount every month.", cta: "Get started" }
        },
        {
            key: "loan", label: "Loan outstanding", active: has("loan"),
            value: has("loan") ? Math.max(0, -balances.value.loan) : null, to: "/loan",
            start: { to: "/loan/new", pitch: "Borrow against your savings.", cta: "Apply for a loan" }
        },
        {
            key: "term_deposit", label: "Term deposit", active: has("term_deposit"),
            value: balances.value.term_deposit, to: "/savings/term-deposit",
            start: { to: "/savings/term-deposit/new", pitch: "Lock savings away for a better rate.", cta: "Get started" }
        },
        {
            key: "special", label: "Special savings", active: has("special"),
            value: balances.value.special, to: "/savings/special",
            start: { to: "/savings/special/new", pitch: "Save towards a goal of your own.", cta: "Get started" }
        },
        {
            key: "share", label: "Shares", active: has("share"),
            value: shareValue.value, to: "/investments/shares",
            hint: has("share") ? `${count(balances.value.share)} units at ${money(shareUnit.value)}` : "",
            start: { to: "/investments/shares/buy", pitch: "Own part of the cooperative.", cta: "Buy shares" }
        },
    ])

    const totalSavings = computed(() =>
        ["contribution", "regular_thrift", "term_deposit", "special"].reduce((a, t) => a + (balances.value[t] ?? 0), 0)
        + shareValue.value)
</script>

<style lang="scss" scoped>
    .t2w-member-balances { margin-bottom: var(--t2w-space-5); }

    .t2w-member-hero { min-height: 100%; }

    .t2w-member-hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--t2w-space-2);
        margin-top: var(--t2w-space-3);
        flex-basis: 100%;
    }

    .t2w-hero-btn {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: var(--t2w-radius-pill);
        background: var(--t2w-accent);
        color: var(--t2w-primary-strong);
        font-size: var(--t2w-fs-label);
        font-weight: 600;
        text-decoration: none;
        &:hover { filter: brightness(0.95); }
        &:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        &.is-ghost {
            background: transparent;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.6);
            &:hover { background: rgba(255, 255, 255, 0.12); }
        }
    }

    // a product the member hasn't started: dashed outline, short pitch, call to action
    .t2w-start-card {
        display: flex;
        flex-direction: column;
        gap: var(--t2w-space-1);
        height: 100%;
        padding: var(--t2w-space-3) var(--t2w-space-4);
        border: 1px dashed var(--t2w-border-strong);
        border-radius: var(--t2w-radius);
        color: var(--t2w-text);
        text-decoration: none;
        transition: border-color 0.15s ease, background 0.15s ease;
        &:hover { border-color: var(--t2w-primary); background: var(--t2w-hover); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }

    .t2w-start-card__label { font-size: var(--t2w-fs-label); color: var(--t2w-muted); }
    .t2w-start-card__pitch { font-size: var(--t2w-fs-small); color: var(--t2w-muted); flex: 1 1 auto; }
    .t2w-start-card__cta { font-size: var(--t2w-fs-label); font-weight: 600; color: var(--t2w-primary); }
</style>
