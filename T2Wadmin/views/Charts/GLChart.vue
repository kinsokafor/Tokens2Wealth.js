<template>
    <div class="avoid">
        <div class="row justify-content-end">
            <div class="col-md-6">
                <div class="input-group mb-3">
                    <input type="date" class="form-control" v-model="from"/>
                    <input type="date" class="form-control" v-model="to"/>
                    <button class="btn btn-outline-secondary" type="button" @click.prevent="getTrialBalance">Get trial balance</button>
                </div>
                <a href="javaScript:void(0)" @click.prevent="resetTrialBalance" class="no-print">Reset</a>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 no-print">
                <Bar :data="data" :options="options"/>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">General Ledger Balances</h3>
                        <div class="d-flex justify-content-between">
                            <p>Inflows</p>
                            <p class="text-success">{{ toLocale(inflow) }}</p>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p>Deposits</p>
                            <p class="text-success">{{ toLocale(deposit) }}</p>
                        </div>
                        <div class="d-flex justify-content-between bg-light">
                            <p><strong>Subtotal</strong></p>
                            <p class="text-success"><strong>{{ toLocale(credits) }}</strong></p>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p>Outflows</p>
                            <p class="text-danger">{{ toLocale(outflow) }}</p>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p>Payouts</p>
                            <p class="text-danger">{{ toLocale(payout) }}</p>
                        </div>
                        <div class="d-flex justify-content-between bg-light">
                            <p><strong>Subtotal</strong></p>
                            <p class="text-danger"><strong>{{ toLocale(debits) }}</strong></p>
                        </div><hr>
                        <div class="d-flex justify-content-between">
                            <p><strong>General Ledger Balance</strong></p>
                            <p :class="{'text-danger': (balance < 0), 'text-success': (balance >= 0)}"><strong>{{ toLocale(balance) }}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="break-after"></div>
</template>

<script setup>
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
    } from 'chart.js';
    import { Bar } from 'vue-chartjs';
    import {ref, onMounted, computed} from 'vue'
    import {Request} from '@/helpers'
    import {toLocale} from '@module/Tokens2Wealth/helpers'

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );
    const inflow = ref(0)
    const outflow = ref(0)
    const deposit = ref(0)
    const payout = ref(0)
    const label = ref("All time")
    const from = ref(null)
    const to = ref(null)
    const credits = computed(() => inflow.value + deposit.value)
    const debits = computed(() => outflow.value + payout.value)
    const balance = computed(() => credits.value - debits.value)
    const req = new Request();

    const data = computed(() => {
        return {
            labels: ['Inflow', 'Outflow', 'Deposit', 'Payout'],
            datasets: [
                {
                label: label.value,
                backgroundColor: '#f87979',
                data: [inflow.value, outflow.value, deposit.value, payout.value],
                }
            ],
        }
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
    };

    onMounted(() => {
        resetTrialBalance()
    })

    const resetTrialBalance = async () => {
        to.value = null
        from.value = null
        await req.post(req.root+"/t2w/api/break-down/inflow-outflow").then(r => {
            inflow.value = r.data.inflow
            outflow.value = r.data.outflow
        })

        await req.post(req.root+"/t2w/api/break-down/deposit-payout").then(r => {
            deposit.value = r.data.deposit
            payout.value = r.data.payout
        })
    }

    const getTrialBalance = async () => {
        var data = {}
        if(from.value != null && from.value != "") {
            data.from = from.value
            label.value = "Between "+from.value+" and ";
        } else label.value = "From onset to ";
        if(to.value != null && to.value != "") {
            data.to = to.value
            label.value += to.value;
        } else label.value += "Current date";
        await req.post(req.root+"/t2w/api/break-down/inflow-outflow", data).then(r => {
            inflow.value = r.data.inflow
            outflow.value = r.data.outflow
        })

        await req.post(req.root+"/t2w/api/break-down/deposit-payout", data).then(r => {
            deposit.value = r.data.deposit
            payout.value = r.data.payout
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