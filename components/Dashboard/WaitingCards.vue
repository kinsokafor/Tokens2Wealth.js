<template>
    <div>
        <div class="alert alert-warning d-flex flex-wrap align-items-center attention" v-if="alerts.length">
            <strong class="me-1">Needs attention:</strong>
            <span v-for="a in alerts" :key="a.label">
                <a :href="a.link">{{ a.label }}</a>
            </span>
        </div>
        <div class="row mb-2">
            <div class="col-12 col-md-3" v-for="c in large" :key="c.title">
                <CountCard :count="c.count" :title="c.title" :link="c.link" />
            </div>
            <div class="col-6 col-md-3" v-for="c in small" :key="c.title">
                <CountCard2 :count="c.count" :title="c.title" :link="c.link" />
            </div>
        </div>
        <div class="text-end small mb-3">
            <a href="/t2w/a/#/reports/approvals">Everything waiting for approval ({{ totalWaiting }}) →</a>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import CountCard from '../CountCard.vue'
    import CountCard2 from '../CountCard2.vue'
    import { toLocale } from '../../helpers'

    // waiting / attention come from /t2w/api/reports/dashboard; the cards and links are the ones
    // the dashboard had before (each card used to make its own request)
    const props = defineProps({
        waiting: { type: Object, default: () => ({}) },
        attention: { type: Object, default: () => ({}) }
    })

    const n = k => Number(props.waiting?.[k] ?? 0)

    const large = computed(() => [
        { title: "Pending Term deposits", count: n("td_pending"), link: "/t2w/a/#/accounts/term-deposits?status=pending" },
        { title: "Unconfirmed Deposits", count: n("deposits"), link: "/t2w/a/#/ewallet-credits?status=unconfirmed" },
        { title: "Unconfirmed Payouts", count: n("payouts"), link: "/t2w/a/#/ewallet-debits?status=unconfirmed" },
        { title: "Unconfirmed Inflow/Outflow", count: n("inflow_outflow"), link: "/t2w/a/#/inflow-outflow?status=unconfirmed" },
    ])

    const small = computed(() => [
        { title: "Pending Loan Requests", count: n("loans"), link: "/t2w/a/#/accounts/loans?status=in process" },
        { title: "Pending Members", count: n("members_paid"), link: "/t2w/a/#/members/pending" },
        { title: "Pending Shares: Buy", count: n("shares_buy"), link: "/t2w/a/#/shares/pending/buy_share" },
        { title: "Pending Shares: Sell", count: n("shares_sell"), link: "/t2w/a/#/shares/pending/sell_share" },
    ])

    const totalWaiting = computed(() =>
        ["td_pending", "deposits", "payouts", "inflow_outflow", "loans_in_process", "members_pending", "shares_buy", "shares_sell"]
            .reduce((a, k) => a + n(k), 0))

    const alerts = computed(() => {
        const a = props.attention ?? {}
        const out = []
        if (a.td_matured_unpaid > 0) out.push({
            label: `${a.td_matured_unpaid} term deposit${a.td_matured_unpaid > 1 ? "s" : ""} matured but not paid out`,
            link: "/t2w/a/#/reports/td-maturity?bucket=" + encodeURIComponent("Matured, not paid out")
        })
        if (a.jobs_attention > 0) out.push({
            label: `${a.jobs_attention} scheduled job${a.jobs_attention > 1 ? "s" : ""} not running normally`,
            link: "/t2w/a/#/reports/scheduled-jobs"
        })
        if (a.back_duty_items > 0) out.push({
            label: `${a.back_duty_items.toLocaleString()} back duties outstanding (${toLocale(a.back_duty_owed)})`,
            link: "/t2w/a/#/reports/back-duties"
        })
        return out
    })
</script>

<style lang="scss" scoped>
    .attention {
        gap: 4px 14px;
        a { font-weight: 500; }
    }
</style>
