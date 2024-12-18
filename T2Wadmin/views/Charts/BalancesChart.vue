<template>
    <div class="avoid">
        <restricted access="1,2">
            <template #message><span></span></template>
            <div class="row justify-content-end">
                <div class="col-md-4">
                    <div class="input-group mb-3">
                        <input type="date" class="form-control" v-model="date"/>
                        <button class="btn btn-outline-secondary" type="button" @click.prevent="getTrialBalance">Get trial balance</button>
                    </div>
                    <a href="javaScript:void(0)" @click.prevent="resetTrialBalance" class="no-print">Reset</a>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 no-print">
                    <Doughnut :data="data" :options="options" />
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title">Balances <small v-if="isTrial"><em>as at {{ date }}</em></small></h4>
                            <div class="d-flex justify-content-between">
                                <p>E-Wallets</p>
                                <p>{{ toLocale(ewallet) }}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p>Term Deposits</p>
                                <p>{{ toLocale(termDeposit) }}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p>Regular Thrift</p>
                                <p>{{ toLocale(thrift) }}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p>Loan</p>
                                <p>{{ toLocale(loan) }}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p>Share @ {{ toLocale(shareUnit) }}/unit</p>
                                <p>{{ toLocale(share) }}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p>Special Savings</p>
                                <p>{{ toLocale(special) }}</p>
                            </div><hr>
                            <div class="d-flex justify-content-between">
                                <strong>Total</strong>
                                <strong>{{ toLocale(total) }}</strong>
                            </div>
                            <restricted access="1">
                                <template #message><span></span></template>
                                <hr>
                                <div class="d-flex justify-content-between">
                                    <p>General System Account</p>
                                    <p>
                                        {{ toLocale(generalSystem) }}
                                        <br>
                                        <small>
                                            <router-link :to="`/accounts/statement/${gsa}`">View Statement</router-link>
                                        </small>
                                    </p>
                                </div>
                            </restricted>
                        </div>
                    </div>
                </div>
            </div>
        </restricted>
    </div>
</template>

<script setup>
    import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
    import { Doughnut } from 'vue-chartjs'
    import { Request, Options } from '@/helpers'
    import { onMounted, ref, computed } from 'vue';
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    ChartJS.register(ArcElement, Tooltip, Legend)

    const req = new Request();
    const opt = new Options();

    const totalUnits = ref(0)
    const shareUnit = ref(1)
    const ewallet = ref(0)
    const termDeposit = ref(0)
    const thrift = ref(0)
    const share = computed(() => totalUnits.value * shareUnit.value)
    const loan = ref(0)
    const special = ref(0)
    const generalSystem = ref(0)
    const gsa = ref("")
    

    const date = ref(null)
    const isTrial = ref(false)

    const total = computed(() => ewallet.value + termDeposit.value + thrift.value + share.value + loan.value + special.value)

    const data = computed(() => {
        return {
            labels: ['E-wallet', 'Term Deposit', 'Thrift Savings', 'Shares', 'Loan', 'Special'],
            datasets: [
                {
                backgroundColor: ['#00af43', '#d43690', '#4aa1db', '#00af43', '#cc2929', '#ff9a3b'],
                data: [ewallet.value, termDeposit.value, thrift.value, share.value, loan.value, special.value]
                }
            ]
        }
    })

    const options = {
        responsive: true,
        maintainAspectRatio: false
    }

    const resetTrialBalance = () => {
        isTrial.value = false
        date.value = null
        req.post(req.root+encodeURI("/t2w/api/balance/301%")).then(r => {
            ewallet.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/311%")).then(r => {
            termDeposit.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/312%")).then(r => {
            thrift.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/313%")).then(r => {
            totalUnits.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/321%")).then(r => {
            loan.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/201%")).then(r => {
            generalSystem.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/314%")).then(r => {
            special.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+"/t2w/api/get-general-system-account").then(r => {
            gsa.value = r.data
        })
    }


    onMounted(async () => {
        resetTrialBalance();
        await opt.get("share_unit").then(res => {
            shareUnit.value = parseFloat(res.data)
        })
    })

    const getTrialBalance = () => {
        isTrial.value = true
        req.post(req.root+encodeURI("/t2w/api/balance/301%"), {date: `${date.value} 23:59:59`}).then(r => {
            ewallet.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/311%"), {date: `${date.value} 23:59:59`}).then(r => {
            termDeposit.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/312%"), {date: `${date.value} 23:59:59`}).then(r => {
            thrift.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/313%"), {date: `${date.value} 23:59:59`}).then(r => {
            totalUnits.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/321%"), {date: `${date.value} 23:59:59`}).then(r => {
            loan.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/201%"), {date: `${date.value} 23:59:59`}).then(r => {
            generalSystem.value = Math.round(r.data * 100) / 100
        })
        req.post(req.root+encodeURI("/t2w/api/balance/314%"), {date: `${date.value} 23:59:59`}).then(r => {
            special.value = Math.round(r.data * 100) / 100
        })
    }
</script>

<style lang="scss" scoped>
    @media print {
        .no-print {
            display: none;
        }
        .break-after {
            page-break-after: always;
        }
        .avoid {
            page-break-inside: avoid;
        }
    }
</style>