<template>
    <div>
       <Table
        :data="statement"
        :columns="columns"
       ></Table>
    </div>  
</template>

<script setup>
    import { useWalletsStore } from '../store/wallets'
    import { computed, ref, onMounted } from 'vue'
    import Table from '@/components/Table.vue'

    const props = defineProps({
        accountNumber: String
    })

    const store = useWalletsStore();
    const trigger = ref(false)

    const statement = computed(() => {
        if(!trigger.value) return []
        let balance = 0;
        return store.get({account: props.accountNumber}).map(i => {
            if(i.ledger == 'credit') {
                i.balance = balance = balance + i.amount  
                i.credit = toLocale(i.amount)
                i.debit = "-" 
            }
            if(i.ledger == 'debit') {
                i.balance = balance = balance - i.amount 
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
        return str.toLocaleString("en-US", {
            type: "currency"
        })
    }

    const columns = {
        time_altered: 'Date',
        narration: 'Description',
        credit: 'Credit',
        debit: 'Debit',
        balance: {'heading': 'Balance', 'processor': function() { return toLocale(this.balance)}}
    };
</script>

<style lang="scss" scoped>

</style>