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

    const quickFilters = [
        {
            label: "Active",
            key: "td_active",
            value: "active"
        },
        {
            label: "Pending",
            key: "td_active",
            value: "inactive"
        },
        {
            label: "Liquidated",
            key: "td_active",
            value: "liquidated"
        }
    ]

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