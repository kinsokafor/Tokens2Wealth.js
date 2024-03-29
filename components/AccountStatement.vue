<template>
    <div>
       <!-- {{store.get({account: accountNumber})}} -->
       <Table
        :data="statement"
        :columns="{
            time_altered: 'Date',
            narration: 'Description',
            credit: 'Credit',
            debit: 'Debit',
            status: 'Status'
        }"
       ></Table>
    </div>  
</template>

<script setup>
    import { useAccountsStore } from '../store/accounts'
    import { useWalletsStore } from '../store/wallets'
    import { computed } from 'vue'
    import Table from '@/components/Table.vue'

    const props = defineProps({
        accountNumber: String
    })

    const accountsStore = useAccountsStore();
    const store = useWalletsStore();

    const statement = computed(() => {
        return store.get({account: props.accountNumber}).map(i => {
            i.credit = i.ledger == 'credit' ? toLocale(i.amount) : '-';
            i.debit = i.ledger == 'debit' ? toLocale(i.amount) : '-';
            return i;
        })
    })

    const toLocale = (str) => {
        return str.toLocaleString("en-US", {
            type: "currency"
        })
    }
</script>

<style lang="scss" scoped>

</style>