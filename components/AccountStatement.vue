<template>
    <div>
       <Table
        :data="statement"
        :columns="columns"
        :actions="actions"
        @reverse="reverse"
        @delete="deleteItem"
       >
        <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Statement of Account - {{ accountNumber }}</h3>
                </div>
            </div>
        </template>
    </Table>
    </div>  
</template>

<script setup>
    import { useWalletsStore } from '../store/wallets'
    import { computed, ref, onMounted } from 'vue'
    import Table from '@/components/Table.vue'
    import {Request, dbTable} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const props = defineProps({
        accountNumber: String
    })

    const req = new Request();

    const store = useWalletsStore();
    const alertStore = useAlertStore()
    const trigger = ref(false)

    const statement = computed(() => {
        if(!trigger.value) return []
        let balance = 0;
        return store.get({account: props.accountNumber}).map(i => {
            if(i.ledger == 'credit') {
                if(i.status == 'successful') {
                    i.balance = balance = balance + i.amount 
                } else i.balance = balance
                i.credit = toLocale(i.amount)
                i.debit = "-" 
            }
            if(i.ledger == 'debit') {
                if(i.status == 'successful') {
                    i.balance = balance = balance - i.amount 
                } else i.balance = balance
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
        status: 'Status',
        credit: 'Credit',
        debit: 'Debit',
        balance: {'heading': 'Balance', 'processor': function() { return toLocale(this.balance)}}
    };

    const actions = [
        {
            name: "Reverse",
            type: "action",
            callback: "reverse",
            access: [1,2]
        },
        {
            name: "Delete",
            type: "action",
            callback: "delete",
            access: [1]
        }
    ]

    const reverse = (data, index) => {
        if(confirm("Are you sure you want to reverse this transaction?")) {
            req.post(req.root+"/t2w/api/reverse-statement", {id: data.id}).then(r => {
                const meta = JSON.parse(r.data.meta)
                delete r.data.meta
                let i = { ...r.data, ...meta }
                if(!(i.account in store.data)) {
                    store.data[i.account] = []
                }
                const index = store.data[i.account].findIndex(j => j.id == i.id)
                if (index == -1) {
                    store.data[i.account] = [...store.data[i.account], i]
                } else {
                    if (!_.isEqual(store.data[i.account][index], i)) {
                        store.data[i.account][index] = i
                    }
                }
                alertStore.add("Reversed")
            })
        }
    }

    const deleteItem = (data, index) => {
        const dbt = new dbTable()
        if(confirm("Are you sure you want to delete this transaction?")) {
            dbt.delete("t2w_transactions", {id: parseInt(data.id)}).then(r => {
                const index = store.data[data.account].findIndex(j => j.id == data.id)
                if (index != -1) {
                    store.data[data.account].splice(index, 1);
                }
                alertStore.add("Deleted")
            })
        }
    }
</script>

<style lang="scss" scoped>

</style>