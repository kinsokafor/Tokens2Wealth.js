<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">Balances</h3>
        </div>
    </div>
    <div>
        <div id="print-div" class="mb-2">
            <div class="row mb-4">
                <div class="col-12">
                    <balances-chart></balances-chart>
                </div>
            </div><hr>
            <div class="row">
                <div class="col-12">
                    <GLChart></GLChart>
                </div>
            </div><hr>
            <div class="row">
                <div class="col-12">
                    <OtherReports></OtherReports>
                </div>
            </div>
        </div>
        <button  class="btn btn-primary" @click.prevent="print">Print</button>
    </div>
</template>

<script setup>
    import BalancesChart from '../Charts/BalancesChart.vue';
    import GLChart from '../Charts/GLChart.vue';
    import OtherReports from '../Charts/OtherReports.vue';
    import {Print} from '@/helpers'

    const print = () => {
        let p = new Print({el: '#print-div', popTitle: "System balances"})
    }
</script>

<style lang="scss" scoped>

</style>