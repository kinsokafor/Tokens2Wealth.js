<template>
    <div>
        <Table 
        :data="data" 
        :columns="columns">
        <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Members holding shares</h3>
                </div>
            </div>
        </template>
    </Table>
    </div>
</template>

<script setup>
    import Table from '@/components/Table.vue'
    import { useAccountsStore } from '@module/Tokens2Wealth/store/accounts'
    import {computed} from 'vue'
    import {getFullname} from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const store = useAccountsStore();

    const columns = {
        surname: {heading: "Fullname", processor: function() {return getFullname(this)}},
        balance: {heading: "Units", processor: function() {return toLocale(this.balance, "", " units")}},
        time_altered: "Date"
    }

    const data = computed(() => store.get(
            {
                status: 'active', 
                ac_type: 'share', 
                ac_number: '313%'
            }, 'ac_type').filter(i => {
                return Math.round(i.balance) > 0
            }).map(i => {
                i.link = `/t2w/a/#/accounts/view/share/${i.ac_number}`
                return i
            }))
</script>

<style lang="scss" scoped>

</style>