<template>
    <div>
        <Table 
        :data="data" 
        :columns="columns"
        :quick-filters="filters">
        <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Members on Loan</h3>
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
        amount: {heading: "Amount Loan", processor: function() {return toLocale(this.amount)}},
        balance: {heading: "Balance", processor: function() {return toLocale(this.balance)}},
        repayment_sum: {heading: "Data", processor: function() {
            return `Repayment: ${toLocale(this.repayment_sum)}<br/>
                    Rate: ${this.rate}%<br/>
                    Status: ${this.status}`
        }},
        time_altered: "Date"
    }

    const data = computed(() => store.get(
            { 
                ac_type: 'loan', 
                ac_number: '321%'
            }, 'ac_type').filter(i => {
                return (i.status == 'approved' || i.status == 'defaulted') && Math.round(i.balance) < 0
            }).map(i => {
                i.link = `/t2w/a/#/accounts/view/loan/${i.ac_number}`
                return i
            }))

    const filters = [
        {
            label: "Defaulted",
            key: "status",
            value: "defaulted"
        },
        {
            label: "Compliant",
            key: "status",
            value: "approved"
        }
    ]
</script>

<style lang="scss" scoped>

</style>