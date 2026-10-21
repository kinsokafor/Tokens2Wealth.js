<template>
    <ReportShell :title="title" :subtitle="period ? periodLabel(period) : subtitle" :loading="loading"
        :can-export="shown.length > 0" @export="exportCsv">
        <template #filters>
            <div class="t2w-records-filters">
                <PeriodFilter v-if="period" :from="period.from" :to="period.to" @change="p => $emit('period', p)" />
                <FilterChips :options="filterOptions" :active="active" :counts="o => countFor(rows, o)"
                    @toggle="toggle" @clear="clear" />
            </div>
        </template>

        <DataTable :columns="columns" :rows="shown" :page-size="50" :row-link="viewLink"
            :default-sort="{ key: 'time_altered', dir: 'desc' }" :empty="emptyText"
            search-placeholder="Search amount, narration, type…">
            <template #cell-amount="{ row, formatted }">
                <span :class="row.ledger === 'debit' ? 'is-out' : 'is-in'">{{ formatted }}</span>
            </template>
            <template #actions="{ row }">
                <span class="t2w-records-actions">
                    <a v-if="row.ledger === 'credit' && row.pop" href="#" @click.prevent="showAttachment(row)">Attachment</a>
                    <router-link :to="viewLink(row)">View</router-link>
                </span>
            </template>
        </DataTable>
        <container />
    </ReportShell>
</template>

<script setup>
    // Deposits, payouts and inflow/outflow records (t2w_ewallet_transactions / t2w_inflow_outflow rows):
    // period, status chips kept in the URL, a sortable table with 50 rows a page, CSV export and print.
    import { computed } from 'vue'
    import { container, openModal } from 'jenesius-vue-modal'
    import ReportShell from '../Reports/ReportShell.vue'
    import PeriodFilter from '../Reports/PeriodFilter.vue'
    import DataTable from '../ui/DataTable.vue'
    import FilterChips from '../ui/FilterChips.vue'
    import PaymentInvoicePopUp from '../PaymentInvoicePopUp.vue'
    import { useQueryFilters } from '../../helpers/useQueryFilters'
    import { useSettledLoading } from '../../helpers/useSettledLoading'
    import { periodLabel, downloadCsv, csvName } from '../../helpers/reports'
    import { dateTime } from '../../helpers/format'
    import { statusLabel } from '../../helpers/status'

    const props = defineProps({
        title: { type: String, required: true },
        subtitle: { type: String, default: "" },
        rows: { type: Array, default: () => [] },
        // [{ label, key, value }]
        filterOptions: { type: Array, default: () => [] },
        // row => route of the record's page
        viewLink: { type: Function, required: true },
        // row => "Inflow" / "Outflow"; adds a Type column when given
        typeLabel: { type: Function, default: null },
        // { from, to } shows the period filter; the page loads the rows for it
        period: { type: Object, default: null },
        csvReport: { type: String, default: "records" }
    })
    defineEmits(['period'])

    const { active, toggle, clear, apply, countFor } = useQueryFilters(computed(() => props.filterOptions))
    const shown = computed(() => apply(props.rows))

    // the stores load in the background and don't say when they are done
    const loading = useSettledLoading(() => props.rows, { resetOn: () => props.period })

    const emptyText = computed(() => props.rows.length ? "No records match these filters." : "No records in this period.")

    const columns = computed(() => [
        { key: "time_altered", heading: "Date", type: "datetime" },
        ...(props.typeLabel ? [{ key: "ledger", heading: "Type", format: (v, row) => props.typeLabel(row) }] : []),
        { key: "classification", heading: "Classification" },
        { key: "narration", heading: "Narration", sortable: false },
        { key: "amount", heading: "Amount", type: "money" },
        { key: "status", heading: "Status", type: "status" },
    ])

    const showAttachment = (row) => openModal(PaymentInvoicePopUp, { img: row.pop, title: "Payment Invoice" })

    const exportCsv = () => {
        downloadCsv(csvName(props.csvReport, props.period), [
            { key: "id", heading: "ID" },
            { key: "time_altered", heading: "Date", value: r => dateTime(r.time_altered) },
            ...(props.typeLabel ? [{ key: "ledger", heading: "Type", value: r => props.typeLabel(r) }] : []),
            { key: "classification", heading: "Classification" },
            { key: "narration", heading: "Narration" },
            { key: "amount", heading: "Amount", value: r => Number(r.amount) },
            { key: "status", heading: "Status", value: r => statusLabel(r.status) },
        ], shown.value, {
            info: [
                props.title,
                ...(props.period ? [`Period: ${periodLabel(props.period)}`] : []),
                // the chips that were on, e.g. "Filter: Unconfirmed"
                ...props.filterOptions.filter(o => active.value[o.key] === String(o.value)).map(o => `Filter: ${o.label}`)
            ]
        })
    }
</script>

<style lang="scss" scoped>
    .t2w-records-filters {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--t2w-space-3);
    }

    .is-in { color: var(--t2w-success-ink); font-weight: 600; }
    .is-out { color: var(--t2w-danger-ink); font-weight: 600; }

    .t2w-records-actions {
        display: inline-flex;
        gap: var(--t2w-space-3);
        font-size: var(--t2w-fs-label);
        a { color: var(--t2w-primary); font-weight: 500; text-decoration: none; }
        a:hover { text-decoration: underline; }
    }
</style>
