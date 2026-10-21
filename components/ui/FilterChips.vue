<template>
    <div class="t2w-chips" role="group" :aria-label="label">
        <span class="t2w-chips__label">{{ label }}</span>
        <button v-for="o in options" :key="o.key + ':' + o.value" type="button" class="t2w-chip"
            :class="{ 'is-on': isOn(o) }" :aria-pressed="isOn(o)" @click="$emit('toggle', o)">
            {{ o.label }}<span v-if="counts" class="t2w-chip__count t2w-num">{{ counts(o) }}</span>
        </button>
        <button v-if="Object.keys(active).length" type="button" class="t2w-chips__clear" @click="$emit('clear')">Clear</button>
    </div>
</template>

<script setup>
    // Toggle chips for quick filters. Pair with helpers/useQueryFilters.js:
    // <FilterChips :options="opts" :active="active" :counts="o => countFor(rows, o)" @toggle="toggle" @clear="clear" />
    import './tokens.scss'

    const props = defineProps({
        options: { type: Array, required: true },
        active: { type: Object, default: () => ({}) },
        // optional (option) => number shown inside the chip
        counts: { type: Function, default: null },
        label: { type: String, default: "Show" }
    })
    defineEmits(['toggle', 'clear'])

    const isOn = o => props.active[o.key] === String(o.value)
</script>

<style lang="scss" scoped>
    .t2w-chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--t2w-space-2);
    }

    .t2w-chips__label {
        font-size: var(--t2w-fs-label);
        color: var(--t2w-muted);
    }

    .t2w-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border: 1px solid var(--t2w-border-strong);
        border-radius: var(--t2w-radius-pill);
        background: var(--t2w-surface);
        color: var(--t2w-text);
        font-size: var(--t2w-fs-label);
        cursor: pointer;
        &:hover { border-color: var(--t2w-primary); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
        &.is-on {
            background: var(--t2w-primary);
            border-color: var(--t2w-primary);
            color: #fff;
            .t2w-chip__count { background: rgba(255, 255, 255, 0.25); color: #fff; }
        }
    }

    .t2w-chip__count {
        min-width: 1.4em;
        padding: 0 5px;
        border-radius: var(--t2w-radius-pill);
        background: var(--t2w-neutral-soft);
        color: var(--t2w-muted);
        font-size: var(--t2w-fs-small);
        text-align: center;
    }

    .t2w-chips__clear {
        all: unset;
        cursor: pointer;
        font-size: var(--t2w-fs-label);
        color: var(--t2w-primary);
        &:hover { text-decoration: underline; }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }
</style>
