<template>
    <span class="t2w-badge" :class="`t2w-badge--${resolvedTone}`">
        <span class="t2w-badge__dot" aria-hidden="true"></span>{{ label || statusLabel(status) }}
    </span>
</template>

<script setup>
    // <StatusBadge status="unconfirmed" />  -> amber "Unconfirmed"
    // <StatusBadge tone="success" label="Paid out" />
    // Colours come from helpers/status.js, so the same status looks the same on every page.
    import { computed } from 'vue'
    import { statusTone, statusLabel } from '../../helpers/status'
    import './tokens.scss'

    const props = defineProps({
        status: { type: String, default: "" },
        // overrides the tone looked up from status: success | warning | danger | info | neutral
        tone: { type: String, default: "" },
        label: { type: String, default: "" }
    })

    const resolvedTone = computed(() => props.tone || statusTone(props.status))
</script>

<style lang="scss" scoped>
    .t2w-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px;
        border-radius: var(--t2w-radius-pill);
        font-size: var(--t2w-fs-small);
        font-weight: 600;
        line-height: 1.5;
        white-space: nowrap;
        vertical-align: middle;
    }

    .t2w-badge__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }

    .t2w-badge--success { background: var(--t2w-success-soft); color: var(--t2w-success-ink); }
    .t2w-badge--warning { background: var(--t2w-warning-soft); color: var(--t2w-warning-ink); }
    .t2w-badge--danger { background: var(--t2w-danger-soft); color: var(--t2w-danger-ink); }
    .t2w-badge--info { background: var(--t2w-info-soft); color: var(--t2w-info-ink); }
    .t2w-badge--neutral { background: var(--t2w-neutral-soft); color: var(--t2w-muted); }

    @media print {
        .t2w-badge { background: none !important; color: #000 !important; padding: 0; }
    }
</style>
