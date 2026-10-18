<template>
    <div>
        <thrift-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'regular_thrift'"></thrift-panel>
        <loan-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'loan'"></loan-panel>
        <e-wallet-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'contribution'"></e-wallet-panel>
        <shares-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'share'"></shares-panel>
        <term-deposit-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'term_deposit'"></term-deposit-panel>
        <special-savings-panel :account="route.params.accountNumber" v-if="route.params.accountType == 'special'"></special-savings-panel>
        <!-- every account dashboard: the latest entries, with a link to the full statement -->
        <div class="row mt-3">
            <div class="col-12">
                <RecentTransactions :account="route.params.accountNumber" :key="route.params.accountNumber" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import ThriftPanel from '@/Modules/Tokens2Wealth/components/Accounts/ThriftPanel.vue';
    import LoanPanel from '@/Modules/Tokens2Wealth/components/Accounts/LoanPanel.vue';
    import EWalletPanel from '@/Modules/Tokens2Wealth/components/Accounts/EWalletPanel.vue';
    import SharesPanel from '@/Modules/Tokens2Wealth/components/Accounts/SharesPanel.vue';
    import TermDepositPanel from '@/Modules/Tokens2Wealth/components/Accounts/TermDepositPanel.vue';
    import SpecialSavingsPanel from '@/Modules/Tokens2Wealth/components/Accounts/SpecialSavingsPanel.vue';
    import RecentTransactions from '@/Modules/Tokens2Wealth/components/Accounts/RecentTransactions.vue';

    const route = useRoute()
</script>

<style lang="scss" scoped>

</style>
