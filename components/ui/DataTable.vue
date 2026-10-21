<template>
    <div class="t2w-dt" :class="{ 'is-stacked': stackOnMobile, 'is-dense': dense }">
        <div class="t2w-dt__tools no-print" v-if="searchable || $slots.toolbar">
            <input v-if="searchable" type="search" class="form-control form-control-sm t2w-dt__search"
                :placeholder="searchPlaceholder" v-model="search" :aria-label="searchPlaceholder" />
            <div class="t2w-dt__toolbar"><slot name="toolbar"></slot></div>
            <span class="t2w-dt__count t2w-num" v-if="!loading">
                {{ count(filtered.length) }}<template v-if="filtered.length !== rows.length"> of {{ count(rows.length) }}</template>
                {{ rows.length === 1 ? "row" : "rows" }}
            </span>
        </div>

        <div class="t2w-dt__scroll" :style="maxHeight ? { maxHeight, overflowY: 'auto' } : null">
            <table class="table t2w-dt__table" :aria-busy="loading">
                <caption v-if="caption" class="t2w-visually-hidden">{{ caption }}</caption>
                <thead>
                    <tr>
                        <th v-for="c in cols" :key="c.key" scope="col" :class="c.cls" :style="c.width ? { width: c.width } : null"
                            :aria-sort="sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : null">
                            <button v-if="c.sortable" type="button" class="t2w-dt__sort" @click="toggleSort(c.key)">
                                {{ c.heading }}
                                <span class="t2w-dt__arrow" :class="{ 'is-active': sortKey === c.key }" aria-hidden="true">
                                    {{ sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕' }}
                                </span>
                            </button>
                            <template v-else>{{ c.heading }}</template>
                        </th>
                        <th v-if="$slots.actions" class="no-print t2w-dt__actions-col"><span class="t2w-visually-hidden">Actions</span></th>
                    </tr>
                </thead>

                <tbody v-if="loading">
                    <tr v-for="n in 5" :key="'sk' + n">
                        <td v-for="c in cols" :key="c.key" :class="c.cls"><span class="t2w-skeleton" style="width: 70%"></span></td>
                        <td v-if="$slots.actions" class="no-print"></td>
                    </tr>
                </tbody>

                <tbody v-else>
                    <tr v-if="error">
                        <td :colspan="colspan" class="t2w-dt__message t2w-dt__error" role="alert">{{ error }}</td>
                    </tr>
                    <template v-else>
                        <tr v-if="before && (page === 1 || printing)" class="t2w-dt__before">
                            <td v-for="(c, i) in cols" :key="c.key" :class="[c.cls, { 'is-lead': i === 0, 'is-blank': i > 0 && !(c.key in before.values) }]"
                                :data-label="c.heading">
                                {{ i === 0 ? before.label : (c.key in before.values ? formatCell(c, before.values) : "") }}
                            </td>
                            <td v-if="$slots.actions" class="no-print is-blank"></td>
                        </tr>
                        <tr v-for="(row, index) in pageRows" :key="row[rowKey] ?? index">
                            <td v-for="(c, i) in cols" :key="c.key" :class="c.cls" :data-label="c.heading">
                                <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]" :formatted="formatCell(c, row)">
                                    <StatusBadge v-if="c.type === 'status'" :status="String(row[c.key] ?? '')" />
                                    <router-link v-else-if="i === 0 && rowLink && rowLink(row)" :to="rowLink(row)">{{ formatCell(c, row) }}</router-link>
                                    <template v-else>{{ formatCell(c, row) }}</template>
                                </slot>
                            </td>
                            <td v-if="$slots.actions" class="t2w-dt__actions no-print"><slot name="actions" :row="row"></slot></td>
                        </tr>
                        <tr v-if="filtered.length === 0">
                            <td :colspan="colspan" class="t2w-dt__message">
                                <slot name="empty">{{ search ? `Nothing matches “${search}”.` : empty }}</slot>
                            </td>
                        </tr>
                    </template>
                </tbody>

                <tfoot v-if="totals && !loading && !error && filtered.length">
                    <tr>
                        <td v-for="(c, i) in cols" :key="c.key" :class="[c.cls, { 'is-lead': i === 0, 'is-blank': i > 0 && !(c.key in totals) }]"
                            :data-label="c.heading">
                            {{ i === 0 ? totalsLabel : (c.key in totals ? formatCell(c, totals) : "") }}
                        </td>
                        <td v-if="$slots.actions" class="no-print is-blank"></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <nav class="t2w-dt__pager no-print" v-if="pageCount > 1 && !printing" aria-label="Table pages">
            <span class="t2w-num">{{ count(pageStart + 1) }}–{{ count(Math.min(pageStart + pageSize, filtered.length)) }} of {{ count(filtered.length) }}</span>
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary" :disabled="page === 1" @click="page--">Previous</button>
                <button type="button" class="btn btn-outline-secondary" :disabled="page === pageCount" @click="page++">Next</button>
            </div>
        </nav>
    </div>
</template>

<script setup>
    // Sortable, searchable table for lists and reports.
    // columns: [{ key, heading, type?, format?(value, row), align?, sortable?, width? }]
    //   type: money | money-compact | count | percent | date | datetime | status | text
    //   money/count/percent columns are right-aligned with equal-width digits; status renders a StatusBadge.
    // Slots: #cell-<key>="{ row, value, formatted }", #actions="{ row }" (unprinted), #toolbar, #empty.
    // pageSize 0 (default) shows every row. With paging on, printing still prints every row.
    import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
    import StatusBadge from './StatusBadge.vue'
    import { formatAs, count, toNumber, parseDate } from '../../helpers/format'
    import './tokens.scss'

    const props = defineProps({
        columns: { type: Array, required: true },
        rows: { type: Array, default: () => [] },
        rowKey: { type: String, default: "id" },
        rowLink: { type: Function, default: null },
        totals: { type: Object, default: null },
        totalsLabel: { type: String, default: "Total" },
        // optional first row, e.g. { label: "Balance brought forward", values: { balance: 100 } }
        before: { type: Object, default: null },
        searchable: { type: Boolean, default: true },
        searchPlaceholder: { type: String, default: "Search…" },
        pageSize: { type: Number, default: 0 },
        // { key, dir: "asc" | "desc" }
        defaultSort: { type: Object, default: null },
        loading: { type: Boolean, default: false },
        error: { type: String, default: "" },
        empty: { type: String, default: "Nothing to show." },
        caption: { type: String, default: "" },
        // turn rows into label/value cards on phones
        stackOnMobile: { type: Boolean, default: true },
        dense: { type: Boolean, default: false },
        // e.g. "60vh": the body scrolls and the header stays in view
        maxHeight: { type: String, default: "" }
    })

    const NUMERIC = ["money", "money-compact", "count", "percent"]

    const cols = computed(() => props.columns.map(c => {
        const numeric = NUMERIC.includes(c.type)
        const align = c.align ?? (numeric ? "end" : "start")
        return {
            ...c,
            numeric,
            sortable: c.sortable ?? true,
            cls: [
                align === "end" ? "text-end" : align === "center" ? "text-center" : "",
                numeric ? "t2w-num" : "",
                c.class ?? ""
            ].join(" ").trim()
        }
    }))

    const colspan = computed(() => cols.value.length + 1)

    const formatCell = (c, row) => {
        const v = row?.[c.key]
        if (c.format) return c.format(v, row)
        return c.type && c.type !== "text" && c.type !== "status" ? formatAs(c.type, v) : (v ?? "")
    }

    // ---- search
    const search = ref("")
    const filtered = computed(() => {
        const q = search.value.trim().toLowerCase()
        if (!q) return props.rows
        return props.rows.filter(row => cols.value.some(c => String(formatCell(c, row)).toLowerCase().includes(q)))
    })

    // ---- sort
    const sortKey = ref(props.defaultSort?.key ?? null)
    const sortDir = ref(props.defaultSort?.dir ?? "asc")

    // numbers and dates usually want the biggest / newest first
    const firstDir = (c) => c?.numeric || c?.type === "date" || c?.type === "datetime" ? "desc" : "asc"

    // first click sorts, second reverses, third goes back to the original order
    const toggleSort = (key) => {
        const c = cols.value.find(x => x.key === key)
        if (sortKey.value !== key) {
            sortKey.value = key
            sortDir.value = firstDir(c)
        } else if (sortDir.value === firstDir(c)) {
            sortDir.value = sortDir.value === "asc" ? "desc" : "asc"
        } else {
            sortKey.value = null
        }
        page.value = 1
    }

    const sortValue = (c, row) => {
        const v = row?.[c.key]
        if (c.numeric) return toNumber(v)
        if (c.type === "date" || c.type === "datetime") return parseDate(v)?.getTime() ?? null
        return v
    }

    const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

    const sorted = computed(() => {
        const c = cols.value.find(x => x.key === sortKey.value)
        if (!c) return filtered.value
        const dir = sortDir.value === "asc" ? 1 : -1
        return [...filtered.value].sort((a, b) => {
            const x = sortValue(c, a), y = sortValue(c, b)
            // empty values always last
            const ex = x === null || x === undefined || x === "", ey = y === null || y === undefined || y === ""
            if (ex || ey) return ex === ey ? 0 : ex ? 1 : -1
            if (typeof x === "number" && typeof y === "number") return (x - y) * dir
            return collator.compare(String(x), String(y)) * dir
        })
    })

    // ---- paging (switched off while printing so the whole list prints)
    const page = ref(1)
    const printing = ref(false)
    const pageCount = computed(() => props.pageSize > 0 ? Math.max(1, Math.ceil(filtered.value.length / props.pageSize)) : 1)
    const pageStart = computed(() => (page.value - 1) * props.pageSize)
    const pageRows = computed(() => props.pageSize > 0 && !printing.value
        ? sorted.value.slice(pageStart.value, pageStart.value + props.pageSize)
        : sorted.value)

    watch([search, () => props.rows], () => { page.value = 1 })
    watch(pageCount, n => { if (page.value > n) page.value = n })

    const onBeforePrint = () => { printing.value = true }
    const onAfterPrint = () => { printing.value = false }
    onMounted(() => {
        window.addEventListener("beforeprint", onBeforePrint)
        window.addEventListener("afterprint", onAfterPrint)
    })
    onBeforeUnmount(() => {
        window.removeEventListener("beforeprint", onBeforePrint)
        window.removeEventListener("afterprint", onAfterPrint)
    })
</script>

<style lang="scss" scoped>
    .t2w-dt__tools {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--t2w-space-2);
        margin-bottom: var(--t2w-space-2);
    }

    .t2w-dt__search { max-width: 280px; }
    .t2w-dt__toolbar { display: flex; flex-wrap: wrap; gap: var(--t2w-space-2); flex: 1 1 auto; }
    .t2w-dt__count { font-size: var(--t2w-fs-small); color: var(--t2w-muted); margin-left: auto; }

    .t2w-dt__scroll {
        overflow-x: auto;
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        background: var(--t2w-surface);
    }

    .t2w-dt__table {
        --bs-table-bg: transparent;
        --bs-table-color: var(--t2w-text);
        margin: 0;
        font-size: var(--t2w-fs-table);
        color: var(--t2w-text);

        th, td {
            padding: 10px 12px;
            vertical-align: middle;
            border-bottom: 1px solid var(--t2w-border);
            border-top: 0;
        }

        thead th {
            position: sticky;
            top: 0;
            z-index: 1;
            background: var(--t2w-surface);
            font-size: var(--t2w-fs-small);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: var(--t2w-muted);
            white-space: nowrap;
            border-bottom: 1px solid var(--t2w-border-strong);
        }

        tbody tr:hover td { background: var(--t2w-hover); }
        tbody tr:last-child td { border-bottom: 0; }

        a { color: var(--t2w-primary); font-weight: 500; text-decoration: none; }
        a:hover { text-decoration: underline; }
    }

    .t2w-dt.is-dense .t2w-dt__table :is(th, td) { padding: 6px 10px; }

    .t2w-dt__sort {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; border-radius: 2px; }
    }
    .text-end .t2w-dt__sort { flex-direction: row-reverse; }

    .t2w-dt__arrow {
        font-size: 0.7em;
        opacity: 0.35;
        &.is-active { opacity: 1; color: var(--t2w-primary); }
    }

    .t2w-dt__before td { font-weight: 600; background: var(--t2w-neutral-soft); }

    tfoot td {
        font-weight: 700;
        border-top: 2px solid var(--t2w-border-strong) !important;
        border-bottom: 0 !important;
        background: var(--t2w-neutral-soft);
    }

    .t2w-dt__actions { text-align: end; white-space: nowrap; }
    .t2w-dt__actions-col { width: 1%; }

    .t2w-dt__message {
        text-align: center;
        color: var(--t2w-muted);
        padding: var(--t2w-space-5) var(--t2w-space-4) !important;
    }
    .t2w-dt__error { color: var(--t2w-danger-ink); }

    .t2w-dt__pager {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--t2w-space-3);
        margin-top: var(--t2w-space-2);
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
        .btn { border-radius: var(--t2w-radius-sm); text-transform: none; padding: 2px 10px; font-size: var(--t2w-fs-small); }
    }

    // phones: each row becomes a small card of label / value pairs
    @media (max-width: 575.98px) {
        .t2w-dt.is-stacked {
            .t2w-dt__search { max-width: none; flex: 1 1 100%; }
            .t2w-dt__scroll { border: 0; background: none; overflow: visible; }
            .t2w-dt__table {
                thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
                &, tbody, tfoot, tr, td { display: block; width: 100%; }
                tr {
                    background: var(--t2w-surface);
                    border: 1px solid var(--t2w-border);
                    border-radius: var(--t2w-radius);
                    margin-bottom: var(--t2w-space-2);
                    padding: var(--t2w-space-1) 0;
                }
                td {
                    display: flex;
                    justify-content: space-between;
                    gap: var(--t2w-space-3);
                    text-align: end !important;
                    border: 0 !important;
                    padding: 4px 12px;
                }
                td[data-label]::before {
                    content: attr(data-label);
                    text-align: start;
                    color: var(--t2w-muted);
                    font-size: var(--t2w-fs-small);
                    font-weight: 600;
                }
                td.t2w-dt__message, td.t2w-dt__actions { justify-content: center; }
                // brought-forward and totals rows: just the row name and the cells that hold a figure
                td.is-blank { display: none; }
                td.is-lead { justify-content: flex-start; text-align: start !important; }
                td.is-lead::before { content: none; }
                tbody tr:hover td { background: none; }
                tfoot tr { background: var(--t2w-neutral-soft); }
                tfoot td { background: none; border-top: 0 !important; }
            }
        }
    }

    @media print {
        .t2w-dt__scroll { border: 0; overflow: visible; max-height: none !important; }
        .t2w-dt__table thead th { position: static; color: #000; }
        .t2w-dt__arrow { display: none; }
    }
</style>
