<template>
    <div class="t2w-legacy-section" role="region" aria-labelledby="t2w-oi-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-oi-title">Other income <span class="t2w-legacy-asat">{{ periodText }}</span></h2>
        </div>
        <div class="t2w-legacy-filter no-print">
            <PeriodFilter :from="period.from" :to="period.to" @change="p => load(p)" />
        </div>

        <div class="row g-3">
            <div class="col-12 col-lg-5">
                <DataTable :columns="columns" :rows="items" row-key="key" :totals="{ value: total }" totals-label="Total income"
                    :searchable="false" :loading="loading" :error="error" :stack-on-mobile="false" />
            </div>
            <div class="col-12 col-lg-7">
                <ChartCard title="Income by month" subtitle="All months on record (not the period above)" type="bar" stacked
                    label-heading="Month" show-totals :height="260" :loading="monthlyLoading" :error="monthlyError"
                    :labels="months.map(m => m.month)"
                    :datasets="SOURCES.map((s, i) => ({ label: s.label, colorIndex: i, data: months.map(m => toNumber(m[s.key]) ?? 0) }))" />
            </div>
        </div>
    </div>
</template>

<script setup>
    // Other income for a period (/t2w/api/report/other-income) and by month (/t2w/api/report/chart/other-income),
    // the same endpoints as before. The monthly chart is now one stacked bar per month, one colour per source
    // (it drew five overlapping pale lines with the total as a bar on the same axis).
    import { computed, onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import DataTable from '../../../components/ui/DataTable.vue'
    import ChartCard from '../../../components/ui/ChartCard.vue'
    import PeriodFilter from '../../../components/Reports/PeriodFilter.vue'
    import { toNumber } from '../../../helpers/format'
    import { presetRange, periodLabel } from '../../../helpers/reports'

    const req = new Request()
    const allTime = presetRange("all-time")

    // five sources: exactly the five chart colours
    const SOURCES = [
        { key: "lir", label: "Loan interest repaid" },
        { key: "brc", label: "Bank recovery charges" },
        { key: "rf", label: "Registration fees" },
        { key: "lipp", label: "Loan insurance premium" },
        { key: "rbgsa", label: "Bonus on system account" },
    ]

    const period = ref(allTime)
    const totals = ref({})
    const loading = ref(true)
    const error = ref("")

    const load = async (p) => {
        loading.value = true
        error.value = ""
        try {
            const r = await req.post(req.root + "/t2w/api/report/other-income", { from: p.from, to: p.to })
            totals.value = r?.data ?? {}
            period.value = p
        } catch (e) {
            error.value = "The income totals could not be loaded."
        } finally {
            loading.value = false
        }
    }

    const months = ref([])
    const monthlyLoading = ref(true)
    const monthlyError = ref("")

    onMounted(async () => {
        load(allTime)
        try {
            const r = await req.post(req.root + "/t2w/api/report/chart/other-income")
            months.value = Array.isArray(r?.data) ? r.data : []
        } catch (e) {
            monthlyError.value = "The monthly figures could not be loaded."
        } finally {
            monthlyLoading.value = false
        }
    })

    const columns = [
        { key: "label", heading: "Source", sortable: false },
        { key: "value", heading: "Amount", type: "money" },
    ]
    const items = computed(() => SOURCES.map(s => ({ key: s.key, label: s.label, value: toNumber(totals.value[s.key]) ?? 0 })))
    const total = computed(() => items.value.reduce((a, i) => a + i.value, 0))
    const periodText = computed(() => period.value.from === allTime.from && period.value.to === allTime.to
        ? "all time" : periodLabel(period.value))

    defineExpose({ items, total, period })
</script>
