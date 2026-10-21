<template>
    <Panel :title="title" :subtitle="subtitle" :loading="loading" :error="error"
        :empty="isEmpty" :empty-text="emptyText" class="t2w-chart-card">
        <template #actions>
            <slot name="actions"></slot>
            <button v-if="allowTable" type="button" class="t2w-chart-card__toggle no-print"
                :aria-pressed="asTable" @click="asTable = !asTable">
                {{ asTable ? "Show chart" : "Show table" }}
            </button>
        </template>

        <div v-if="!asTable" class="t2w-chart-card__canvas" :style="{ height: `${height}px` }"
            role="img" :aria-label="ariaLabel">
            <component :is="chartComponent" :key="dark ? 'dark' : 'light'" :data="chartData" :options="options" />
        </div>
        <DataTable v-else :columns="tableColumns" :rows="tableRows" row-key="label"
            :searchable="false" :totals="tableTotals" dense />

        <template #footer v-if="$slots.footer"><slot name="footer"></slot></template>
    </Panel>
</template>

<script setup>
    // A titled chart with the brand theme, hover tooltips and a table view of the same numbers.
    // <ChartCard title="Past 30 days" type="bar" :labels="['Inflow', 'Outflow']"
    //     :datasets="[{ label: 'Current', data: [120000, 80000] }, { label: 'Previous', data: [90000, 70000] }]" />
    // datasets: [{ label, data, color?, colorIndex? }]. For a doughnut pass one dataset; slices take the palette in order.
    // One value axis only: two measures on different scales belong in two charts.
    import { computed, ref } from 'vue'
    import { Bar, Line, Doughnut } from 'vue-chartjs'
    import {
        Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
        ArcElement, Filler, Tooltip, Legend
    } from 'chart.js'
    import Panel from './Panel.vue'
    import DataTable from './DataTable.vue'
    import { chartOptions, styleDataset, useThemeMode } from './chartTheme'
    import { formatAs, toNumber } from '../../helpers/format'
    import './tokens.scss'

    ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend)
    ChartJS.defaults.font.family = '"Open Sans", sans-serif'
    ChartJS.defaults.font.size = 12

    const props = defineProps({
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        // bar | line | doughnut
        type: { type: String, default: "bar" },
        labels: { type: Array, default: () => [] },
        datasets: { type: Array, default: () => [] },
        // money | count | percent
        format: { type: String, default: "money" },
        horizontal: { type: Boolean, default: false },
        stacked: { type: Boolean, default: false },
        // null: shown automatically for 2+ series and for doughnuts
        legend: { type: Boolean, default: null },
        height: { type: Number, default: 260 },
        loading: { type: Boolean, default: false },
        error: { type: String, default: "" },
        emptyText: { type: String, default: "No figures for this period." },
        allowTable: { type: Boolean, default: true },
        // first column heading of the table view
        labelHeading: { type: String, default: "" },
        // add a totals row to the table view
        showTotals: { type: Boolean, default: false }
    })

    const dark = useThemeMode()
    const asTable = ref(false)

    const chartComponent = computed(() => ({ bar: Bar, line: Line, doughnut: Doughnut }[props.type] ?? Bar))

    const isEmpty = computed(() => !props.labels.length ||
        props.datasets.every(ds => (ds.data ?? []).every(v => !toNumber(v))))

    const chartData = computed(() => {
        dark.value // re-style when the theme changes
        return {
            labels: props.labels,
            datasets: props.datasets.map((ds, i) => styleDataset(
                { ...ds, data: (ds.data ?? []).map(v => toNumber(v) ?? 0) }, i,
                { type: props.type, stacked: props.stacked, labelsCount: props.labels.length }
            ))
        }
    })

    const options = computed(() => {
        dark.value
        return chartOptions({
            type: props.type,
            format: props.format,
            horizontal: props.horizontal,
            stacked: props.stacked,
            legend: props.legend,
            seriesCount: props.datasets.length
        })
    })

    // ---- table view: one row per label, one column per series
    const formatType = computed(() => props.format === "count" ? "count" : props.format === "percent" ? "percent" : "money")

    const tableColumns = computed(() => [
        { key: "label", heading: props.labelHeading || "Item" },
        ...props.datasets.map((ds, i) => ({ key: `s${i}`, heading: ds.label || props.title || "Value", type: formatType.value }))
    ])

    const tableRows = computed(() => props.labels.map((label, r) => {
        const row = { label }
        props.datasets.forEach((ds, i) => { row[`s${i}`] = toNumber(ds.data?.[r]) ?? 0 })
        return row
    }))

    const tableTotals = computed(() => {
        if (!props.showTotals) return null
        const t = {}
        props.datasets.forEach((ds, i) => { t[`s${i}`] = tableRows.value.reduce((a, r) => a + r[`s${i}`], 0) })
        return t
    })

    // a screen-reader summary of what the chart shows
    const ariaLabel = computed(() => {
        const parts = props.labels.slice(0, 12).map((l, r) =>
            `${l}: ${props.datasets.map(ds => `${ds.label ? ds.label + " " : ""}${formatAs(formatType.value, ds.data?.[r])}`).join(", ")}`)
        return `${props.title || "Chart"}. ${parts.join("; ")}`
    })
</script>

<style lang="scss" scoped>
    .t2w-chart-card__canvas {
        position: relative;
        width: 100%;
    }

    .t2w-chart-card__toggle {
        all: unset;
        cursor: pointer;
        font-size: var(--t2w-fs-small);
        font-weight: 500;
        color: var(--t2w-primary);
        &:hover { text-decoration: underline; }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; border-radius: 2px; }
    }

    @media print {
        .t2w-chart-card__canvas canvas { max-width: 100%; }
    }
</style>
