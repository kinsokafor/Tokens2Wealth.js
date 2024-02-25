<template>
    <div>
        <AccountStatement :account-number="route.params.accountNumber" />
        <SidePanel class="glass-bg side-panel">
            <div class="row">
                <div class="col-md-12">
                    <AccountBalance :account-number="route.params.accountNumber"></AccountBalance>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="chart-wrap">
                        <Bar :data="scoresChartData" :options="options" />
                    </div>
                </div>
                <div class="col-md-12">
                    <div>Total Credits:<br>{{ totalCD }}</div>
                    <div>Total Debits:<br>{{ totalDB }}</div>
                </div>
            </div>
        </SidePanel>
    </div>
</template>

<script setup>
    import AccountStatement from '@/Modules/Tokens2Wealth/components/AccountStatement.vue';
    import { useRoute } from 'vue-router';
    import SidePanel from '@/components/theme/SidePanel.vue';
    import AccountBalance from '@/Modules/Tokens2Wealth/components/AccountBalance.vue';
    import { Chart as ChartJS, registerables } from 'chart.js'
    import { Bar } from 'vue-chartjs'
    import {computed, ref, onMounted} from 'vue'
    import {Request} from '@/helpers'
    
    const amountsBD = ref([]);

    const countBD = ref([]);

    const totalCD = ref(0);

    const totalDB = ref(0)

    const scoresChartData = computed(() => {
        return {
            labels: ["CR", "DR"],
            datasets: [
                { 
                    type: 'pie',
                    label: "Amount",
                    backgroundColor: ['#41B883', '#E46651'],
                    data: amountsBD.value,
                    borderWidth: 1
                },
                { 
                    type: 'pie',
                    label: "Count",
                    backgroundColor: ['#41B883', '#E46651'],
                    data: countBD.value,
                    borderWidth: 1
                }
            ]
        }
    })

    const options= {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: "20px"
        }
    }

    ChartJS.register(...registerables)

    const route = useRoute()

    const r = new Request;

    onMounted(() => {
        r.post(process.env.EVO_API_URL + `/t2w/api/break-down/${route.params.accountNumber}`).then(r => {
            amountsBD.value = [Math.round(r.data.credits), Math.round(r.data.debits)]
            totalCD.value = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'NGN',
            }).format(r.data.credits)

            totalDB.value = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'NGN',
            }).format(r.data.debits)
        })
        r.post(process.env.EVO_API_URL + `/t2w/api/break-down/count/${route.params.accountNumber}`).then(r => {
            countBD.value = [r.data.credits, r.data.debits]
        })
    })

</script>

<style lang="scss" scoped>
    .side-panel {
        position: relative;
    }
</style>