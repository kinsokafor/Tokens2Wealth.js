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
            i.credit = i.ledger == 'credit' ? i.amount : '-';
            i.debit = i.ledger == 'debit' ? i.amount : '-';
            return i;
        })
    })
</script>

<style lang="scss" scoped>

</style>