<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-2 report-table-tools" v-if="searchable">
            <input type="search" class="form-control form-control-sm" style="max-width: 280px"
                placeholder="Search…" v-model="search" aria-label="Search rows" />
            <span class="small text-muted">{{ filtered.length }} of {{ rows.length }} rows</span>
        </div>
        <div class="table-responsive">
            <table class="table table-sm table-hover report-table">
                <thead>
                    <tr>
                        <th v-for="c in columns" :key="c.key" :class="alignClass(c)">{{ c.heading }}</th>
                        <th v-if="$slots.actions" class="no-print"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="before" class="fw-semibold table-light">
                        <td v-for="(c, i) in columns" :key="c.key" :class="alignClass(c)">
                            {{ i === 0 ? before.label : (c.key in before.values ? display(c, before.values) : "") }}
                        </td>
                        <td v-if="$slots.actions" class="no-print"></td>
                    </tr>
                    <tr v-for="(row, index) in filtered" :key="row[rowKey] ?? index">
                        <td v-for="(c, i) in columns" :key="c.key" :class="alignClass(c)">
                            <router-link v-if="i === 0 && rowLink && rowLink(row)" :to="rowLink(row)">{{ display(c, row) }}</router-link>
                            <template v-else>{{ display(c, row) }}</template>
                        </td>
                        <td v-if="$slots.actions" class="text-end text-nowrap no-print"><slot name="actions" :row="row"></slot></td>
                    </tr>
                    <tr v-if="filtered.length === 0">
                        <td :colspan="columns.length + ($slots.actions ? 1 : 0)"><em>{{ empty }}</em></td>
                    </tr>
                </tbody>
                <tfoot v-if="totals">
                    <tr class="fw-bold">
                        <td v-for="(c, i) in columns" :key="c.key" :class="alignClass(c)">
                            {{ i === 0 ? totalsLabel : (c.key in totals ? display(c, totals) : "") }}
                        </td>
                        <td v-if="$slots.actions" class="no-print"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'

    // columns: [{ key, heading, format?: (value, row) => string, align?: 'end' }]
    // optional #actions slot (receives { row }): an extra, unprinted column of row actions
    // The table shows every row (no paging) so that Print includes the whole report.
    const props = defineProps({
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

    const search = ref("")

    const display = (c, row) => {
        const v = row[c.key]
        return c.format ? c.format(v, row) : (v ?? "")
    }

    const filtered = computed(() => {
        const q = search.value.trim().toLowerCase()
        if (!q) return props.rows
        return props.rows.filter(row => props.columns.some(c => String(display(c, row)).toLowerCase().includes(q)))
    })

    const alignClass = (c) => c.align === 'end' ? 'text-end text-nowrap' : ''
</script>

<style lang="scss" scoped>
    .report-table-tools { gap: 8px; }
    .report-table td, .report-table th { vertical-align: middle; }
    @media print {
        .report-table-tools { display: none !important; }
    }
</style>
