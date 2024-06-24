<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">{{accountTitle}}</h3>
        </div>
    </div>
    <div>
        <DataFilter 
            :data="store.get({ac_number: `${accountCode}%`})" 
            v-slot="{outputData}"
            :search-columns="['surname', 'other_names', 'ac_number']"
            :quick-filters="quickFilters">
            <div class="row">
                <div class="col-md-4" v-for="data in outputData" :key="data.id" v-memo="data">
                    <AccountCard :data="data"></AccountCard>
                </div>  
            </div>
        </DataFilter>
    </div>
</template>

<script setup>
    import {useRoute} from 'vue-router'
    import {computed, onUnmounted} from 'vue'
    import {useAccountsStore} from '@/Modules/Tokens2Wealth/store/accounts'
    import AccountCard from '@/Modules/Tokens2Wealth/components/AccountCard.vue'
    import DataFilter from '@/components/filters/DataFilter.vue';

    const route = useRoute()

    const store = useAccountsStore()

    onUnmounted(() => {
        store.abort()
    })

    const accountTitle = computed(() => {
        switch (route.params.accountType) {
            case 'thrift-savings':
                return "Regular Thrift Savings"
                break;

            case 'term-deposits':
                return "Term Deposit Accounts"
                break;

            case 'loans':
                return "Loan Accounts"
                break;

            case 'wallets':
                return "E-Wallets"
                break;

            case 'shares':
                return "Shares"
                break;

            case 'special-savings':
                return "Special Savings Accounts"
                break;
        
            default:
                return ""
                break;
        }
    })

    const quickFilters = computed(() => {
        switch (route.params.accountType) {
            case 'thrift-savings':
                return [
                    {label: "Active",key: "status",value: "active"},
                    {label: "Inactive",key: "status",value: "inactive"},
                    {label: "Liquidated",key: "status",value: "liquidated"}
                ]
                break;

            case 'term-deposits':
                return [
                    {label: "Active",key: "status",value: "active"},
                    {label: "Inactive",key: "status",value: "inactive"},
                    {label: "Pending",key: "status",value: "pending"},
                    {label: "Liquidated",key: "status",value: "liquidated"}
                ]
                break;

            case 'loans':
                return [
                    {label: "Approved",key: "status",value: "approved"},
                    {label: "Pending",key: "status",value: "in process"},
                    {label: "Defaulted",key: "status",value: "defaulted"},
                    {label: "Cleared",key: "status",value: "cleared"},
                    {label: "Declined",key: "status",value: "declined"}
                ]
                break;

            case 'wallets':
                return [
                    {label: "Level 1",key: "level",value: "1"},
                    {label: "Level 2",key: "level",value: "2"},
                    {label: "Level 3",key: "level",value: "3"},
                    {label: "Level 4",key: "level",value: "4"},
                    {label: "Level 5",key: "level",value: "5"}
                ]
                break;
        
            default:
                return []
                break;
        }
    })
    

    const accountCode = computed(() => {
        switch (route.params.accountType) {
            case 'thrift-savings':
                return 312
                break;
            
            case 'loans':
                return 321
                break;

            case 'term-deposits':
                return 311
                break;

            case 'special-savings':
                return 314
                break;

            case 'shares':
                return 313
                break;
        
            default:
                return 301
                break;
        }
    })

</script>

<style lang="scss" scoped>

</style>