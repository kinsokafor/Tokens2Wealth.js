<template>
    <MoneyRecordsList title="Payouts" :rows="data" :filter-options="quickFilters" :period="period"
        :view-link="row => `/ewallet-debits/${row.id}`" csv-report="payouts" @period="setPeriod" />
</template>

<script setup>
    import { computed, onUnmounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useEWalletTxnsStore } from '@/Modules/Tokens2Wealth/store/ewalletTransactions'
    import MoneyRecordsList from '../../../components/Lists/MoneyRecordsList.vue'
    import { presetRange } from '../../../helpers/reports'

    const store = useEWalletTxnsStore()
    const route = useRoute()
    const router = useRouter()

    // The old page showed date fields but listed every payout regardless of them. It now defaults to
    // all time (so no old unconfirmed payout drops out of view) and the dates do filter.
    const defaults = presetRange("all-time")
    const period = computed(() => ({ from: route.query.from || defaults.from, to: route.query.to || defaults.to }))
    const setPeriod = ({ from, to }) => router.replace({ query: { ...route.query, from, to } })

    // full timestamps: with bare dates the store helper compares against midnight UTC of the end day,
    // which dropped that whole day (today, by default). As text, "YYYY-MM-DD HH:MM:SS" values compare correctly.
    const data = computed(() => store.get({ ledger: 'debit', between: `time_altered,${period.value.from} 00:00:00,${period.value.to} 23:59:59` }))

    const quickFilters = [
        { label: "Confirmed", key: "status", value: "confirmed" },
        { label: "Unconfirmed", key: "status", value: "unconfirmed" },
        { label: "Declined", key: "status", value: "declined" },
    ]

    onUnmounted(() => store.abort())
</script>
