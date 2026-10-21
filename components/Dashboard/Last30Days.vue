<template>
    <div class="t2w-last30" role="region" aria-labelledby="t2w-last30-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-last30-title">Past 30 days</h2>
            <router-link to="/inflow-outflow" class="t2w-section-link">Inflow &amp; outflow →</router-link>
        </div>
        <div class="row g-2 g-md-3">
            <div class="col-12 col-lg-5">
                <div class="row g-2 g-md-3">
                    <div class="col-6" v-for="item in items" :key="item.key">
                        <StatCard :label="item.label" :value="data?.[item.key]?.current ?? null"
                            :delta="data?.[item.key]?.change ?? null" :good-when="item.goodWhen"
                            :delta-label="data?.[item.key]?.change != null ? 'vs previous 30 days' : ''"
                            :hint="hintFor(item.key)"
                            :to="item.to" :loading="loading" />
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-7">
                <ChartCard class="h-100 mb-0" title="Compared with the 30 days before" type="bar"
                    :labels="items.map(i => i.label)"
                    :datasets="datasets" :height="200" :loading="loading" label-heading="Flow" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import StatCard from '../ui/StatCard.vue'
    import ChartCard from '../ui/ChartCard.vue'

    // data: { inflow, outflow, deposit, payout } each { current, previous, change } from /t2w/api/reports/dashboard
    // (confirmed records only; change is a whole percent, null when the previous 30 days had nothing)
    const props = defineProps({
        data: { type: Object, default: null },
        loading: { type: Boolean, default: false }
    })

    // money coming in is good news when it rises; outgoing flows are shown without a judgement
    const items = [
        { key: "inflow", label: "Inflow", goodWhen: "up", to: "/inflow-outflow" },
        { key: "outflow", label: "Outflow", goodWhen: "none", to: "/inflow-outflow" },
        { key: "deposit", label: "Deposits", goodWhen: "up", to: "/ewallet-credits" },
        { key: "payout", label: "Payouts", goodWhen: "none", to: "/ewallet-debits" },
    ]

    // shown instead of a percentage when there is nothing to compare against
    const hintFor = (key) => {
        const d = props.data?.[key]
        if (!d || d.change != null) return ""
        return Number(d.current) || Number(d.previous)
            ? "Nothing to compare in the 30 days before"
            : "No confirmed activity in either period"
    }

    const datasets = computed(() => [
        { label: "Previous 30 days", colorIndex: 1, data: items.map(i => props.data?.[i.key]?.previous ?? 0) },
        { label: "Past 30 days", colorIndex: 0, data: items.map(i => props.data?.[i.key]?.current ?? 0) },
    ])
</script>

<style lang="scss" scoped>
    .t2w-last30 { margin-bottom: var(--t2w-space-5); }
</style>
