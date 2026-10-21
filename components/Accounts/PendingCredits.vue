<template>
    <Panel title="Pending credits" subtitle="Payments due to this account, waiting to be settled" flush
        :empty="!items.length" empty-text="Nothing pending.">
        <DataTable :columns="columns" :rows="items" :searchable="false" dense class="t2w-pd-table">
            <template #actions="{ row }">
                <Restricted access="1,2,3">
                    <template #message><span></span></template>
                    <span class="t2w-pd-actions">
                        <button type="button" class="t2w-pd-act is-success" @click="settlePD(row)">Settle</button>
                        <button type="button" class="t2w-pd-act is-danger" @click="deletePD(row)">Delete</button>
                    </span>
                </Restricted>
            </template>
        </DataTable>
    </Panel>
</template>

<script setup>
    // Pending credits to this account (same store, same delete and settle as before).
    import { computed } from 'vue'
    import { usePDStore } from '../../store/pendingDebits'
    import { dbTable, Request } from '@/helpers'
    import { useAlertStore } from '@/store/alert'
    import Panel from '../ui/Panel.vue'
    import DataTable from '../ui/DataTable.vue'
    import { money } from '../../helpers/format'
    import './account.scss'

    const PDStore = usePDStore()
    const alertStore = useAlertStore()
    const props = defineProps({ account: String })
    const req = new dbTable()

    const items = computed(() => PDStore.get({ status: 'pending', credit_account: props.account }) ?? [])

    const columns = [
        { key: "time_altered", heading: "Since", type: "date" },
        { key: "narration", heading: "For", sortable: false },
        { key: "amount", heading: "Amount", type: "money" },
    ]

    const deletePD = (item) => {
        if (confirm(`Are you sure you want to delete this pending debit of ${money(item.amount)}?`)) {
            req.delete("t2w_pending_debits", { id: item.id }).then(r => {
                if (item.debit_account in PDStore.data.debit_account) {
                    const index = PDStore.data.debit_account[item.debit_account].findIndex(i => i.id == item.id)
                    if (index != -1) PDStore.data.debit_account[item.debit_account].splice(index, 1)
                }
                if (item.credit_account in PDStore.data.credit_account) {
                    const index = PDStore.data.credit_account[item.credit_account].findIndex(i => i.id == item.id)
                    if (index != -1) PDStore.data.credit_account[item.credit_account].splice(index, 1)
                }
                alertStore.add("Deleted")
            }).catch(e => {
                alertStore.add(e?.data ?? e?.message ?? "Could not delete", "danger")
            })
        }
    }

    const settlePD = async (item) => {
        const rq = new Request()
        await rq.post(rq.root + "/t2w/api/settle-pending-credit", { id: item.id })
    }
</script>
