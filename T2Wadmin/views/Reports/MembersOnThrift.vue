<template>
    <div>
        <Table 
        :data="data" 
        :columns="columns">
        <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Members on Regular Thrift</h3>
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
    import { useDateFormat } from '@vueuse/core'



    const store = useAccountsStore();

    const columns = {
        surname: {heading: "Fullname", processor: function() {return getFullname(this)}},
        amount: {heading: "Monthly Savings", processor: function() {return toLocale(this.amount)}},
        balance: {heading: "Balance", processor: function() {return toLocale(this.balance)}},
        time_altered: {heading: "Date started",
            processor: function() {
                const rawDate = new Date(this.time_altered)
                return (useDateFormat(rawDate, 'MMM DD, YYYY')).value
            }
        },
        last_transaction_date: {heading: "Last transation date",
            processor: function() {
                const rawDate = new Date(this.last_transaction_date)
                return (useDateFormat(rawDate, 'MMM DD, YYYY')).value
            }
        }
    }

    const data = computed(() => store.get(
            {
                status: 'active', 
                ac_type: 'regular_thrift', 
                ac_number: '312%'
            }, 'ac_type').filter(i => {
                return i.status == 'active'
            }).map(i => {
                i.link = `/t2w/a/#/accounts/view/regular_thrift/${i.ac_number}`
                return i
            }))
</script>

<style lang="scss" scoped>

</style>