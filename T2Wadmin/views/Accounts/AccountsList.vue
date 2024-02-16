<template>
    <div>
        <InfiniteScroll :data="store.get({ac_number: `${accountCode}%`})" v-slot="{data}">
            <div class="row">
                <div class="col-md-4" v-for="item in data" :key="item.id" v-memo="item">
                    <AccountCard :data="item"></AccountCard>
                </div>
                
            </div>
        </InfiniteScroll>
    </div>
</template>

<script setup>
    import {useRoute} from 'vue-router'
    import {computed} from 'vue'
    import {useAccountsStore} from '@/Modules/Tokens2Wealth/store/accounts'
    import AccountCard from '@/Modules/Tokens2Wealth/components/AccountCard.vue'
    import InfiniteScroll from '@/components/InfiniteScroll.vue';

    const route = useRoute()

    const store = useAccountsStore()

    const accountCode = computed(() => {
        switch (route.params.accountType) {
            case 'thrift-savings':
                return 312
                break;
            
            case 'loan':
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