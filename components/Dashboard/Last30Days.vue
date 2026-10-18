<template>
    <div class="row">
        <div class="col-12">
            <h5><em>Past 30 days</em></h5>
        </div>
        <div class="col-6 col-md-6 mb-2" v-for="item in items" :key="item.key">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">{{ item.label }}</h5>
                    <span v-if="data">{{ toLocale(data[item.key]?.current ?? 0) }}</span>
                    <span v-else class="text-muted">…</span>
                    <sup v-if="data && data[item.key]?.change !== null && data[item.key]?.change !== undefined">
                        <span :class="data[item.key].change < 0 ? 'text-danger' : 'text-success'"
                            :title="`Previous 30 days: ${toLocale(data[item.key].previous)}`">
                            <span v-if="data[item.key].change > 0">+</span>{{ data[item.key].change }}%
                        </span>
                    </sup>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { toLocale } from '../../helpers'

    // data: { inflow, outflow, deposit, payout } each { current, previous, change } from /t2w/api/reports/dashboard
    defineProps({
        data: { type: Object, default: null }
    })

    const items = [
        { key: "inflow", label: "Inflow" },
        { key: "outflow", label: "Outflow" },
        { key: "deposit", label: "Deposit" },
        { key: "payout", label: "Payout" },
    ]
</script>
