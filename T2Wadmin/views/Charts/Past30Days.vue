<template>
    <div class="row">
        <div class="col-12">
            <h5><em>Past 30 days</em></h5>
        </div>
        <div class="col-6 col-md-4 mb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Inflow</h5>
                    {{toLocale(inflow)}}
                    <sup>
                        <span class="" :class="{'text-danger': (inflowPerc < 0), 'text-success': (inflowPerc >= 0)}">
                            <span v-if="inflowPerc > 0">+</span>{{inflowPerc}}%
                        </span>
                    </sup>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-4 mb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Outflow</h5>
                    {{toLocale(outflow)}}
                    <sup>
                        <span :class="{'text-danger': (0 > outflowPerc), 'text-success': (0 <= outflowPerc)}">
                            <span v-if="outflowPerc > 0">+</span>{{outflowPerc}}%
                        </span>
                    </sup>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-4 mb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Deposit</h5>
                    {{toLocale(deposit)}}
                    <sup>
                        <span :class="{'text-danger': (depositPerc < 0), 'text-success': (depositPerc >= 0)}">
                            <span v-if="depositPerc > 0">+</span>{{depositPerc}}%
                        </span>
                    </sup>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-4 mb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Payout</h5>
                    {{toLocale(payout)}}
                    <sup>
                        <span :class="{'text-danger': (payoutPerc < 0), 'text-success': (payoutPerc >= 0)}">
                            <span v-if="payoutPerc > 0">+</span>{{payoutPerc}}%
                        </span>
                    </sup>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, computed, ref } from 'vue';
    import { Request } from '@/helpers';
    import {toLocale} from '../../../helpers'

    var today = new Date();
    var past30days = new Date(new Date().setDate(today.getDate() - 30));
    var past60days = new Date(new Date().setDate(today.getDate() - 60));
    var past30daysString = `${past30days.getFullYear()}-${past30days.getMonth()}-${past30days.getDate()} ${past30days.getHours()}:${past30days.getMinutes()}:00`
    var past60daysString = `${past60days.getFullYear()}-${past60days.getMonth()}-${past60days.getDate()} ${past60days.getHours()}:${past60days.getMinutes()}:00`

    const inflow = ref(0)
    const outflow = ref(0)
    const deposit = ref(0)
    const payout = ref(0)
    const inflowPrev = ref(0)
    const outflowPrev = ref(0)
    const depositPrev = ref(0)
    const payoutPrev = ref(0)
    const inflowPerc = computed(() => {
        const diff = inflow.value - inflowPrev.value;
        if(inflowPrev.value == 0) return 100;
        return Math.round((100*diff)/inflowPrev.value)
    })
    const outflowPerc = computed(() => {
        const diff = outflow.value - outflowPrev.value;
        if(outflowPrev.value == 0) return 100;
        return Math.round((100*diff)/outflowPrev.value)
    })
    const depositPerc = computed(() => {
        const diff = deposit.value - depositPrev.value;
        if(depositPrev.value == 0) return 100;
        return Math.round((100*diff)/depositPrev.value)
    })
    const payoutPerc = computed(() => {
        const diff = payout.value - payoutPrev.value;
        if(payoutPrev.value == 0) return 100;
        return Math.round((100*diff)/payoutPrev.value)
    })

    const req = new Request()

    onMounted(async () => {
        
        await req.post(req.root+"/t2w/api/break-down/inflow-outflow", {
            from: past30daysString
        }).then(r => {
            inflow.value = r.data.inflow ?? 0
            outflow.value = r.data.outflow ?? 0
        })

        await req.post(req.root+"/t2w/api/break-down/inflow-outflow", {
            from: past60daysString,
            to: past30daysString
        }).then(r => {
            inflowPrev.value = r.data.inflow ?? 0
            outflowPrev.value = r.data.outflow ?? 0
        })

        await req.post(req.root+"/t2w/api/break-down/deposit-payout", {
            from: past30daysString
        }).then(r => {
            deposit.value = r.data.deposit ?? 0
            payout.value = r.data.payout ?? 0
        })

        await req.post(req.root+"/t2w/api/break-down/deposit-payout", {
            from: past60daysString,
            to: past30daysString
        }).then(r => {
            depositPrev.value = r.data.deposit ?? 0
            payoutPrev.value = r.data.payout ?? 0
        })
    })
</script>

<style lang="scss" scoped>

</style>