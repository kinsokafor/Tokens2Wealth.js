<template>
    <div>
        <div class="row justify-content-end">
            <div class="col-md-6 d-flex justify-content-end">
                <date-input type="date" label="Date From" v-model="from" name="from" column="left" class="form-control"/>
                <date-input type="date" label="Date To" v-model="to" name="to" column="left" class="form-control"/>
                <!-- <button class="btn btn-primary" @click="trigger = true">Filter</button> -->
            </div>
        </div>
       <Table
        :data="statement"
        :columns="columns"
       >
       <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Inflow & Outflow ledger</h3>
                </div>
            </div>
        </template>
        <template #after>
            <div class="row mb-4 justify-content-end">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title">Report Summary</h4>
                            <div class="d-flex justify-content-between">
                                <span>Total Credit</span>
                                <span>{{ toLocale(totalCredit) }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Total Debit</span>
                                <span>{{ toLocale(totalDebit) }}</span>
                            </div><hr>
                            <div class="d-flex justify-content-between">
                                <strong>Balance</strong>
                                <strong>{{ toLocale(balance) }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Table>
    </div>  
</template>

<script setup>
    import { useInflowOutflowStore } from '../../../store/inflowOutflow'
    import { computed, ref, onMounted } from 'vue'
    import Table from '@/components/Table.vue'
    import {toLocale} from '@module/Tokens2Wealth/helpers'
    import { leadingZero } from '@/helpers'
    import DateInput from '@/components/form/Date.vue'

    const props = defineProps({
        accountNumber: String
    })

    const store = useInflowOutflowStore();
    const trigger = ref(false)
    const now = new Date();
    var oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const from = ref(`${oneYearAgo.getFullYear()}-${leadingZero(oneYearAgo.getMonth()+1)}-01`)
    const to = ref(`${now.getFullYear()}-${leadingZero(now.getMonth()+1)}-${leadingZero(now.getDate())}`)
    const between = computed(() => `time_altered,${from.value},${to.value}`)

    const statement = computed(() => {
        if(!trigger.value) return []
        let balance = 0;
        return store.getLedger({status: "confirmed", between: between.value}).map(i => {
            if(i.ledger == 'credit') {
                i.balance = balance = balance + parseFloat(i.amount)  
                i.credit = toLocale(i.amount)
                i.debit = "-" 
            }
            if(i.ledger == 'debit') {
                i.balance = balance = balance - parseFloat(i.amount) 
                i.debit = toLocale(i.amount)
                i.credit = "-" 
            }
            return i;
        })
    })

    onMounted(() => {
        trigger.value = true
    })

    const totalCredit = computed(() => statement.value.reduce((a,b,i) => {
        return b.ledger === 'credit' ? a + parseFloat(b.amount) : a;
    }, 0))

    const totalDebit = computed(() => statement.value.reduce((a,b,i) => {
        return b.ledger === 'debit' ? a + parseFloat(b.amount) : a;
    }, 0))

    const balance = computed(() => totalCredit.value - totalDebit.value)

    const columns = {
        time_altered: 'Date',
        // last_altered_by: 'Name of Depositor/Beneficiary',
        narration: 'Purpose of Payment',
        classification: 'Classification',
        debit: 'Debit',
        credit: 'Credit',
        balance: {'heading': 'Balance', 'processor': function() { return toLocale(this.balance)}}
    };
</script>

<style lang="scss" scoped>
.d-flex {
    gap: 5px;
}
</style>