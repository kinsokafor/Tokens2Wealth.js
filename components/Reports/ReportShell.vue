<template>
    <div class="t2w-report">
        <div class="d-flex flex-wrap justify-content-between align-items-start report-head">
            <div>
                <h3 class="page-title mb-1">{{ title }}</h3>
                <div class="text-muted small" v-if="subtitle">{{ subtitle }}</div>
            </div>
            <div class="d-flex report-actions">
                <slot name="actions"></slot>
                <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading || !canExport" @click="$emit('export')">
                    Export CSV
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading || !!error" @click="print">
                    Print
                </button>
            </div>
        </div>

        <div class="mb-3"><slot name="filters"></slot></div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div :id="printId">
            <div class="print-header">
                <h4>{{ title }}</h4>
                <div v-if="subtitle">{{ subtitle }}</div>
            </div>
            <div v-if="loading" class="text-muted py-4">Loading report…</div>
            <template v-else-if="!error">
                <slot name="summary"></slot>
                <slot></slot>
                <ul class="report-notes small text-muted mt-2" v-if="notes.length">
                    <li v-for="n in notes" :key="n">{{ n }}</li>
                </ul>
                <p class="small text-muted mt-2 mb-0" v-if="generatedAt">Generated {{ generatedAt }}</p>
            </template>
        </div>
    </div>
</template>

<script setup>
    import { Print } from '@/helpers'

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
    .report-head { gap: 8px; margin-bottom: 12px; }
    .report-actions { gap: 6px; }
    .print-header { display: none; }
    .report-notes { padding-left: 1.1rem; }
    @media print {
        .print-header { display: block; margin-bottom: 12px; }
    }
</style>
