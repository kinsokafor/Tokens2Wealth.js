<template>
    <MoneyRecordsList title="Deposits" :rows="data" :filter-options="quickFilters" :period="period"
        :view-link="row => `/ewallet-credits/${row.id}`" csv-report="deposits" @period="setPeriod" />
</template>

<script setup>
    import { computed, onUnmounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useEWalletTxnsStore } from '@/Modules/Tokens2Wealth/store/ewalletTransactions'
    import MoneyRecordsList from '../../../components/Lists/MoneyRecordsList.vue'
    import { ymd } from '../../../helpers/reports'

    const store = useEWalletTxnsStore()
    const route = useRoute()
    const router = useRouter()

    // default period as before: from the 1st of the month a year ago, to today (kept in the URL once changed)
    const now = new Date()
    const defaultFrom = ymd(new Date(now.getFullYear() - 1, now.getMonth(), 1))
    const period = computed(() => ({ from: route.query.from || defaultFrom, to: route.query.to || ymd(now) }))
    const setPeriod = ({ from, to }) => router.replace({ query: { ...route.query, from, to } })

    // full timestamps: with bare dates the store helper compares against midnight UTC of the end day,
    // which dropped that whole day (today, by default). As text, "YYYY-MM-DD HH:MM:SS" values compare correctly.
    const data = computed(() => store.get({ ledger: 'credit', between: `time_altered,${period.value.from} 00:00:00,${period.value.to} 23:59:59` }))

    const quickFilters = [
        { label: "Confirmed", key: "status", value: "confirmed" },
        { label: "Unconfirmed", key: "status", value: "unconfirmed" },
        { label: "Declined", key: "status", value: "declined" },
    ]

    onUnmounted(() => store.abort())
</script>
