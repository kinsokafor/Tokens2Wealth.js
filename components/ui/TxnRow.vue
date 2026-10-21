<template>
    <component :is="tag" v-bind="linkAttrs" class="t2w-txn" :class="{ 'is-link': !!(to || href) }">
        <span class="t2w-txn__icon" :class="isCredit ? 'is-in' : 'is-out'" aria-hidden="true">
            <FontAwesomeIcon :icon="isCredit ? faArrowDown : faArrowUp" />
        </span>

        <span class="t2w-txn__main">
            <span class="t2w-txn__narration">{{ narration || (isCredit ? "Credit" : "Debit") }}</span>
            <span class="t2w-txn__meta">
                <template v-if="meta">{{ meta }}<span aria-hidden="true"> · </span></template>
                <time :datetime="isoDate" :title="dateTime(date)">{{ shownDate }}</time>
            </span>
            <slot></slot>
        </span>

        <span class="t2w-txn__side">
            <span class="t2w-txn__amount t2w-num" :class="isCredit ? 'is-in' : 'is-out'">
                <span class="t2w-visually-hidden">{{ isCredit ? "Credit" : "Debit" }}</span>
                {{ signedMoney(amount, isCredit ? "credit" : "debit") }}
            </span>
            <StatusBadge v-if="status && showStatus" :status="status" />
        </span>

        <span class="t2w-txn__actions no-print" v-if="$slots.actions" @click.stop>
            <slot name="actions"></slot>
        </span>
    </component>
</template>

<script setup>
    // One money movement: direction icon, narration, date, signed amount, status.
    // Only the amount is coloured (green in, red out), not the whole row.
    import { computed } from 'vue'
    import { RouterLink } from 'vue-router'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
    import StatusBadge from './StatusBadge.vue'
    import { signedMoney, shortDate, dateTime, relativeTime, parseDate } from '../../helpers/format'
    import './tokens.scss'

    const props = defineProps({
        amount: { type: [Number, String], default: 0 },
        // credit (money in) | debit (money out)
        ledger: { type: String, default: "credit" },
        narration: { type: String, default: "" },
        date: { type: [String, Number, Date], default: null },
        status: { type: String, default: "" },
        // e.g. the classification, shown before the date
        meta: { type: String, default: "" },
        // relative | date | datetime
        dateStyle: { type: String, default: "relative" },
        // hide the badge when every row has the same status (e.g. a statement of successful entries)
        showStatus: { type: Boolean, default: true },
        to: { type: [String, Object], default: null },
        href: { type: String, default: null }
    })

    const isCredit = computed(() => String(props.ledger).toLowerCase() !== "debit")
    const tag = computed(() => props.to ? RouterLink : props.href ? "a" : "div")
    const linkAttrs = computed(() => props.to ? { to: props.to } : props.href ? { href: props.href } : {})

    const isoDate = computed(() => parseDate(props.date)?.toISOString() ?? null)
    const shownDate = computed(() => props.dateStyle === "date" ? shortDate(props.date)
        : props.dateStyle === "datetime" ? dateTime(props.date)
        : relativeTime(props.date))
</script>

<style lang="scss" scoped>
    .t2w-txn {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        padding: var(--t2w-space-3) var(--t2w-space-4);
        color: var(--t2w-text);
        text-decoration: none;
        min-width: 0;
        &.is-link:hover { background: var(--t2w-hover); }
        &.is-link:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: -2px; }
    }

    .t2w-txn__icon {
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 0.8rem;
        &.is-in { background: var(--t2w-success-soft); color: var(--t2w-success-ink); }
        &.is-out { background: var(--t2w-danger-soft); color: var(--t2w-danger-ink); }
    }

    .t2w-txn__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .t2w-txn__narration {
        font-size: var(--t2w-fs-table);
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .t2w-txn__meta {
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .t2w-txn__side {
        flex: none;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .t2w-txn__amount {
        font-size: var(--t2w-fs-table);
        font-weight: 600;
        &.is-in { color: var(--t2w-success-ink); }
        &.is-out { color: var(--t2w-danger-ink); }
    }

    .t2w-txn__actions {
        flex: none;
        display: flex;
        gap: var(--t2w-space-2);
        font-size: var(--t2w-fs-small);
    }

    @media (max-width: 575.98px) {
        .t2w-txn { padding: var(--t2w-space-3); gap: var(--t2w-space-2); flex-wrap: wrap; }
        .t2w-txn__actions { flex-basis: 100%; justify-content: flex-end; }
    }
</style>
