<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">All Accounts</h3>
        </div>
    </div>
    <div class="row">
        <div class="col-md-4 mb-2">
            <router-link to="accounts/wallets" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=301%" 
                title="Wallets" 
                icon-class="fa-solid fa-wallet" 
                color="var(--green)"
                text-color="var(--green)"
                />
            </router-link>
        </div>
        <div class="col-md-4 mb-2">
            <router-link to="accounts/thrift-savings" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=312%&status=active" 
                title="Thrift savings" 
                icon-class="fa-solid fa-piggy-bank" 
                color="var(--blue)"
                text-color="var(--blue)"
                />
            </router-link>
        </div>
        <div class="col-md-4 mb-2">
            <router-link to="accounts/loans" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=321%&status=approved" 
                title="Loan" 
                icon-class="fa-solid fa-user-tie" 
                color="var(--red)"
                text-color="var(--red)"
                />
            </router-link>
        </div>
        <div class="col-md-4 mb-2">
            <router-link to="accounts/term-deposits" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=311%&status=active" 
                title="Term deposit" 
                icon-class="fa-solid fa-business-time" 
                color="var(--purple)"
                text-color="var(--purple)"
                />
            </router-link>
        </div>
        <div class="col-md-4 mb-2">
            <router-link to="accounts/shares" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=313%" 
                title="Shares" 
                icon-class="fa-solid fa-share-nodes" 
                color="var(--color2)"
                text-color="var(--color2)"
                />
            </router-link>
        </div>
        <div class="col-md-4 mb-2">
            <router-link to="accounts/special-savings" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_number=314%&status=active" 
                title="Special savings" 
                icon-class="fa-solid fa-money-check-dollar" 
                color="var(--orange)"
                text-color="var(--orange)"
                />
            </router-link>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <balances-chart></balances-chart>
        </div>
    </div>
</template>

<script setup>
    import CounterCard from '@/components/theme/CounterCard.vue';
    import BalancesChart from '../Charts/BalancesChart.vue';
</script>

<style lang="scss" scoped>

</style>