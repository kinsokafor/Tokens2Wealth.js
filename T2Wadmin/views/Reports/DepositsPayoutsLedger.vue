<template>
    <div>
       <Table
        :data="statement"
        :columns="columns"
       ></Table>
    </div>  
</template>

<script setup>
    import { useEWalletTxnsStore } from '../../../store/ewalletTransactions'
    import { computed, ref, onMounted } from 'vue'
    import Table from '@/components/Table.vue'

    const props = defineProps({
        accountNumber: String
    })

    const store = useEWalletTxnsStore();
    const trigger = ref(false)

    const statement = computed(() => {
        if(!trigger.value) return []
        let balance = 0;
        return store.get({status: "confirmed"}).map(i => {
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

    const toLocale = (str) => {
        return str.toLocaleString("en-NG", {
            type: "currency"
        })
    }

    const columns = {
        time_altered: 'Date',
        last_altered_by: 'Name of Depositor/Beneficiary',
        narration: 'Purpose of Payment',
        classification: 'Classification',
        debit: 'Debit',
        credit: 'Credit',
        balance: {'heading': 'Balance', 'processor': function() { return toLocale(this.balance)}}
    };
</script>

<style lang="scss" scoped>

</style>