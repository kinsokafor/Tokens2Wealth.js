<template>
    <div class="t2w-legacy-section" role="region" aria-labelledby="t2w-gl-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-gl-title">General ledger <span class="t2w-legacy-asat">{{ periodText }}</span></h2>
        </div>
        <div class="t2w-legacy-filter no-print">
            <PeriodFilter :from="period.from" :to="period.to" @change="p => load(p)" />
        </div>

        <div class="row g-2 g-md-3 mb-3">
            <div class="col-6 col-md-4"><StatCard label="Money in" :value="credits" :loading="loading"
                :hint="`Inflows ${money(inflow)} · Deposits ${money(deposit)}`" /></div>
            <div class="col-6 col-md-4"><StatCard label="Money out" :value="debits" :loading="loading"
                :hint="`Outflows ${money(outflow)} · Payouts ${money(payout)}`" /></div>
            <div class="col-12 col-md-4"><StatCard label="General ledger balance" :value="balance" :loading="loading"
                :tone="balance < 0 ? 'danger' : 'success'" hint="Money in minus money out" /></div>
        </div>

        <ChartCard title="Money in and out" type="bar" label-heading="Ledger" :height="220" :loading="loading" :error="error"
            :labels="['Inflow / outflow', 'Deposits / payouts']"
            :datasets="[
                { label: 'In', colorIndex: 0, data: [inflow, deposit] },
                { label: 'Out', colorIndex: 2, data: [outflow, payout] }
            ]" />
    </div>
</template>

<script setup>
    // General ledger: inflow & outflow plus deposits & payouts for a period (same endpoints as before).
    // The old panel's date fields are now the shared period filter; "All time" is what it showed by default.
    import { computed, onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import StatCard from '../../../components/ui/StatCard.vue'
    import ChartCard from '../../../components/ui/ChartCard.vue'
    import PeriodFilter from '../../../components/Reports/PeriodFilter.vue'
    import { money, toNumber } from '../../../helpers/format'
    import { presetRange, periodLabel } from '../../../helpers/reports'

    const req = new Request()
    const allTime = presetRange("all-time")

    const period = ref(allTime)
    const inflow = ref(0), outflow = ref(0), deposit = ref(0), payout = ref(0)
    const loading = ref(true)
    const error = ref("")

    const load = async (p) => {
        loading.value = true
        error.value = ""
        try {
            const body = { from: p.from, to: p.to }
            const [io, dp] = await Promise.all([
                req.post(req.root + "/t2w/api/break-down/inflow-outflow", body),
                req.post(req.root + "/t2w/api/break-down/deposit-payout", body),
            ])
            inflow.value = toNumber(io?.data?.inflow) ?? 0
            outflow.value = toNumber(io?.data?.outflow) ?? 0
            deposit.value = toNumber(dp?.data?.deposit) ?? 0
            payout.value = toNumber(dp?.data?.payout) ?? 0
            period.value = p
        } catch (e) {
            error.value = "The ledger totals could not be loaded."
        } finally {
            loading.value = false
        }
    }
    onMounted(() => load(allTime))

    const credits = computed(() => inflow.value + deposit.value)
    const debits = computed(() => outflow.value + payout.value)
    const balance = computed(() => credits.value - debits.value)
    const periodText = computed(() => period.value.from === allTime.from && period.value.to === allTime.to
        ? "all time" : periodLabel(period.value))

    defineExpose({ inflow, outflow, deposit, payout, balance, period })
</script>
