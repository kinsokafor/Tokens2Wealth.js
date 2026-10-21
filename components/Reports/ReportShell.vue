<template>
    <div class="t2w-report">
        <div class="report-head">
            <div class="report-head__titles">
                <h1 class="t2w-page-title">{{ title }}</h1>
                <div class="report-head__subtitle" v-if="subtitle">{{ subtitle }}</div>
            </div>
            <div class="report-actions">
                <slot name="actions"></slot>
                <button type="button" class="t2w-report-btn" :disabled="loading || !canExport" @click="$emit('export')">
                    <FontAwesomeIcon :icon="faFileCsv" aria-hidden="true" /> Export CSV
                </button>
                <button type="button" class="t2w-report-btn" :disabled="loading || !!error" @click="print">
                    <FontAwesomeIcon :icon="faPrint" aria-hidden="true" /> Print
                </button>
            </div>
        </div>

        <div class="report-filters no-print" v-if="$slots.filters"><slot name="filters"></slot></div>

        <div v-if="error" class="report-error" role="alert">{{ error }}</div>

        <div :id="printId">
            <div class="print-header">
                <h4>{{ title }}</h4>
                <div v-if="subtitle">{{ subtitle }}</div>
            </div>
            <div v-if="loading" class="report-loading" aria-busy="true">
                <span class="t2w-visually-hidden">Loading report…</span>
                <div class="row g-2 g-md-3 mb-3">
                    <div class="col-6 col-md-3" v-for="n in 4" :key="n"><StatCard label="" loading /></div>
                </div>
                <DataTable :columns="[{ key: 'a', heading: '' }, { key: 'b', heading: '' }, { key: 'c', heading: '' }]"
                    :searchable="false" loading />
            </div>
            <template v-else-if="!error">
                <slot name="summary"></slot>
                <slot></slot>
                <ul class="report-notes" v-if="notes.length">
                    <li v-for="n in notes" :key="n">{{ n }}</li>
                </ul>
                <p class="report-generated" v-if="generatedAt">Generated {{ generatedAt }}</p>
            </template>
        </div>
    </div>
</template>

<script setup>
    import { Print } from '@/helpers'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faFileCsv, faPrint } from '@fortawesome/free-solid-svg-icons'
    import StatCard from '../ui/StatCard.vue'
    import DataTable from '../ui/DataTable.vue'
    import '../ui/tokens.scss'

    const props = defineProps({
        title: { type: String, required: true },
        subtitle: { type: String, default: "" },
        loading: { type: Boolean, default: false },
        error: { type: String, default: "" },
        generatedAt: { type: String, default: "" },
        notes: { type: Array, default: () => [] },
        canExport: { type: Boolean, default: true }
    })
    defineEmits(['export'])

    const printId = `report-${Math.random().toString(36).slice(2, 8)}`

    const print = () => {
        new Print({ el: `#${printId}`, popTitle: props.subtitle ? `${props.title} — ${props.subtitle}` : props.title })
    }
</script>

<style lang="scss" scoped>
    .report-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-4);
    }

    .report-head__subtitle {
        font-size: var(--t2w-fs-label);
        color: var(--t2w-muted);
    }

    .report-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--t2w-space-2);
        // buttons pages put in the actions slot get the same shape (the theme makes .btn an uppercase pill)
        :deep(.btn) {
            border-radius: var(--t2w-radius-sm);
            text-transform: none;
            font-size: var(--t2w-fs-label);
            padding: 4px 12px;
        }
    }

    .t2w-report-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border: 1px solid var(--t2w-border-strong);
        border-radius: var(--t2w-radius-sm);
        background: var(--t2w-surface);
        color: var(--t2w-text);
        font-size: var(--t2w-fs-label);
        font-weight: 500;
        cursor: pointer;
        &:hover:not(:disabled) { border-color: var(--t2w-primary); color: var(--t2w-primary); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        svg { color: var(--t2w-primary); }
    }

    .report-filters {
        padding: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-4);
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        // form controls inside the filter bar: the theme gives .form-control 11px padding and square corners
        :deep(.form-control), :deep(.form-select) {
            border-radius: var(--t2w-radius-sm);
            padding-top: 4px;
            padding-bottom: 4px;
        }
    }

    .report-error {
        padding: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-4);
        border-radius: var(--t2w-radius);
        background: var(--t2w-danger-soft);
        color: var(--t2w-danger-ink);
        font-size: var(--t2w-fs-table);
    }

    .report-notes {
        margin: var(--t2w-space-3) 0 0;
        padding-left: 1.1rem;
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
    }

    .report-generated {
        margin: var(--t2w-space-2) 0 0;
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
    }

    .print-header { display: none; }
    @media print {
        .print-header { display: block; margin-bottom: 12px; }
    }
</style>
