<template>
    <ReportShell
        title="Income Summary"
        :subtitle="periodLabel(data?.period)"
        :loading="loading"
        :error="error"
        :generated-at="data?.generated_at"
        :notes="data?.notes ?? []"
        :can-export="!!data"
        @export="exportCsv">
        <template #filters>
            <PeriodFilter :from="from" :to="to" @change="setPeriod" />
        </template>
        <template #summary>
            <SummaryCards :items="cards" />
        </template>
        <ReportTable
            :columns="columns"
            :rows="data?.rows ?? []"
            :totals="data?.totals"
            :searchable="false" />
    </ReportShell>
</template>

<script setup>
    import { computed } from 'vue'
    import ReportShell from '../../../../components/Reports/ReportShell.vue'
    import ReportTable from '../../../../components/Reports/ReportTable.vue'
    import PeriodFilter from '../../../../components/Reports/PeriodFilter.vue'
    import SummaryCards from '../../../../components/Reports/SummaryCards.vue'
    import { useReport } from '../../../../helpers/useReport'
    import { amount, periodLabel, downloadCsv, csvName, presetRange } from '../../../../helpers/reports'

    const { data, loading, error, from, to, setPeriod, route, router } = useReport(() => "income")

    // income is usually read over a year: default to this year when no period is in the URL
    if (!route.query.from && !route.query.to) {
        router.replace({ query: { ...route.query, ...presetRange("this-year") } })
    }

    const money = v => amount(v)
    const COLUMNS = [
        { key: "label", heading: "Month" },
        { key: "interest_recorded", heading: "Loan interest (recorded)", align: "end", format: money },
        { key: "interest_estimated", heading: "Loan interest (estimated)", align: "end", format: money },
        { key: "loan_charges", heading: "Loan charges", align: "end", format: money },
        { key: "bank_charges", heading: "Bank charge recovery", align: "end", format: money },
        { key: "registration_fees", heading: "Registration fees", align: "end", format: money },
        { key: "referral_bonus", heading: "Referral bonus (GSA)", align: "end", format: money },
        { key: "total", heading: "Total", align: "end", format: money },
    ]
    const columns = COLUMNS

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "Total income", value: money(t.total) },
            { label: "Loan interest", value: money((t.interest_recorded ?? 0) + (t.interest_estimated ?? 0)),
              hint: t.interest_estimated ? `${money(t.interest_estimated)} estimated` : "recorded" },
            { label: "Loan charges", value: money(t.loan_charges) },
            { label: "Fees & bank charges", value: money((t.registration_fees ?? 0) + (t.bank_charges ?? 0)) },
        ]
    })

    const exportCsv = () => {
        const d = data.value
        downloadCsv(csvName("income", d.period), COLUMNS.map(c => ({ key: c.key, heading: c.heading })), d.rows, {
            info: [d.title, `Period: ${periodLabel(d.period)}`, `Generated: ${d.generated_at}`, ...(d.notes ?? [])],
            totals: d.totals
        })
    }
</script>
