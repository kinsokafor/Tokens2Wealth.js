<template>
    <DataTable
        class="report-table"
        :columns="columns"
        :rows="rows"
        :totals="totals"
        :totals-label="totalsLabel"
        :before="before"
        :row-key="rowKey"
        :row-link="rowLink"
        :searchable="searchable"
        search-placeholder="Search rows…"
        :empty="empty">
        <template #actions="{ row }" v-if="$slots.actions"><slot name="actions" :row="row"></slot></template>
    </DataTable>
</template>

<script setup>
    // The report pages' table, now the UI kit's DataTable (same props as before, so no page changes).
    // columns: [{ key, heading, format?: (value, row) => string, align?: 'end', sortable? }]
    // optional #actions slot (receives { row }): an extra, unprinted column of row actions
    // Every row is shown (no paging) so that Print includes the whole report.
    import DataTable from '../ui/DataTable.vue'

    defineProps({
        columns: { type: Array, required: true },
        rows: { type: Array, default: () => [] },
        totals: { type: Object, default: null },
        totalsLabel: { type: String, default: "Total" },
        // optional first row, e.g. { label: "Balance brought forward", values: { balance: 100 } }
        before: { type: Object, default: null },
        rowKey: { type: String, default: "id" },
        rowLink: { type: Function, default: null },
        searchable: { type: Boolean, default: true },
        empty: { type: String, default: "Nothing found for this period." }
    })
</script>
