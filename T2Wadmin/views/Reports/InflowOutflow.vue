<template>
    <MoneyRecordsList title="Inflows and Outflows" :rows="store.get()" :filter-options="quickFilters"
        :view-link="row => `/${row.ledger === 'credit' ? 'inflow' : 'outflow'}/${row.id}`"
        :type-label="row => row.ledger === 'credit' ? 'Inflow' : 'Outflow'" csv-report="inflow-outflow" />
</template>

<script setup>
    import { onUnmounted } from 'vue'
    import { useInflowOutflowStore } from '@/Modules/Tokens2Wealth/store/inflowOutflow'
    import MoneyRecordsList from '../../../components/Lists/MoneyRecordsList.vue'

    const store = useInflowOutflowStore()

    // same filters as before; all records, no period (as before)
    const quickFilters = [
        { label: "Confirmed", key: "status", value: "confirmed" },
        { label: "Unconfirmed", key: "status", value: "unconfirmed" },
        { label: "Declined", key: "status", value: "declined" },
        { label: "Inflow", key: "ledger", value: "credit" },
        { label: "Outflow", key: "ledger", value: "debit" },
    ]

    onUnmounted(() => store.abort())
</script>
