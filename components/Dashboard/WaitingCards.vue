<template>
    <div class="t2w-waiting" role="region" aria-labelledby="t2w-waiting-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-waiting-title">Waiting for approval</h2>
            <router-link to="/reports/approvals" class="t2w-section-link">
                Approvals queue<template v-if="!loading"> ({{ count(totalWaiting) }})</template> →
            </router-link>
        </div>
        <div class="row g-2 g-md-3">
            <div class="col-6 col-md-3" v-for="c in cards" :key="c.title">
                <StatCard :label="c.title" :value="c.count" format="count" :to="c.to"
                    :attention="c.count > 0" :tone="c.count > 0 ? 'warning' : 'default'" :loading="loading" />
            </div>
        </div>

        <!-- below the cards, not above: the bar's height is only known once the figures arrive (it wraps on
             narrow screens), and appearing above the cards would push them down under the pointer -->
        <div class="t2w-attention" v-if="!loading && alerts.length" role="status">
            <FontAwesomeIcon :icon="faTriangleExclamation" class="t2w-attention__icon" aria-hidden="true" />
            <strong>Needs attention:</strong>
            <router-link v-for="a in alerts" :key="a.label" :to="a.to">{{ a.label }}</router-link>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
    import StatCard from '../ui/StatCard.vue'
    import { money, count } from '../../helpers/format'

    // waiting / attention come from /t2w/api/reports/dashboard; the cards, counts and links
    // are the ones the dashboard had before
    const props = defineProps({
        waiting: { type: Object, default: () => ({}) },
        attention: { type: Object, default: () => ({}) },
        loading: { type: Boolean, default: false }
    })

    const n = k => Number(props.waiting?.[k] ?? 0)

    const cards = computed(() => [
        { title: "Unconfirmed deposits", count: n("deposits"), to: "/ewallet-credits?status=unconfirmed" },
        { title: "Unconfirmed payouts", count: n("payouts"), to: "/ewallet-debits?status=unconfirmed" },
        { title: "Unconfirmed inflow/outflow", count: n("inflow_outflow"), to: "/inflow-outflow?status=unconfirmed" },
        { title: "Pending term deposits", count: n("td_pending"), to: "/accounts/term-deposits?status=pending" },
        { title: "Pending loan requests", count: n("loans"), to: "/accounts/loans?status=in process" },
        { title: "Pending members", count: n("members_paid"), to: "/members/pending" },
        { title: "Pending shares: buy", count: n("shares_buy"), to: "/shares/pending/buy_share" },
        { title: "Pending shares: sell", count: n("shares_sell"), to: "/shares/pending/sell_share" },
    ])

    // everything in the approvals queue (wider than the cards: all loans in process, all pending members)
    const totalWaiting = computed(() =>
        ["td_pending", "deposits", "payouts", "inflow_outflow", "loans_in_process", "members_pending", "shares_buy", "shares_sell"]
            .reduce((a, k) => a + n(k), 0))

    const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`

    const alerts = computed(() => {
        const a = props.attention ?? {}
        const out = []
        if (a.td_matured_unpaid > 0) out.push({
            label: `${plural(a.td_matured_unpaid, "term deposit")} matured but not paid out`,
            to: { path: "/reports/td-maturity", query: { bucket: "Matured, not paid out" } }
        })
        if (a.jobs_attention > 0) out.push({
            label: `${plural(a.jobs_attention, "scheduled job")} not running normally`,
            to: "/reports/scheduled-jobs"
        })
        if (a.back_duty_items > 0) out.push({
            label: `${count(a.back_duty_items)} back duties outstanding (${money(a.back_duty_owed)})`,
            to: "/reports/back-duties"
        })
        return out
    })
</script>

<style lang="scss" scoped>
    .t2w-waiting { margin-bottom: var(--t2w-space-5); }

    .t2w-attention {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px var(--t2w-space-4);
        padding: var(--t2w-space-2) var(--t2w-space-3);
        margin-top: var(--t2w-space-3);
        border-radius: var(--t2w-radius);
        border: 1px solid color-mix(in srgb, var(--t2w-warning) 40%, transparent);
        background: var(--t2w-warning-soft);
        color: var(--t2w-text);
        font-size: var(--t2w-fs-label);
        a { color: var(--t2w-warning-ink); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
    }

    .t2w-attention__icon { color: var(--t2w-warning-ink); }

</style>

