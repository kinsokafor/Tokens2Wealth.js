<template>
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

    const quickFilters = computed(() => {
        switch (route.params.accountType) {
            case 'thrift-savings':
                return [
                    {label: "Active",key: "status",value: "active"},
                    {label: "Inactive",key: "status",value: "inactive"},
                    {label: "Liquidated",key: "status",value: "liquidated"}
                ]
                break;

            case 'loans':
                return [
                    {label: "Active",key: "status",value: "approved"},
                    {label: "In process",key: "status",value: "in process"},
                    {label: "Defaulted",key: "status",value: "defaulted"},
                    {label: "Cleared",key: "status",value: "cleared"},
                    {label: "Declined",key: "status",value: "declined"}
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