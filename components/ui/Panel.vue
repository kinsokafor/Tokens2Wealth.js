<template>
    <component :is="as" class="t2w-panel" :class="{ 'is-flush': flush }">
        <header class="t2w-panel__head" v-if="title || $slots.title || $slots.actions">
            <div class="t2w-panel__titles">
                <slot name="title">
                    <h2 class="t2w-section-title">{{ title }}</h2>
                </slot>
                <div class="t2w-panel__subtitle" v-if="subtitle">{{ subtitle }}</div>
            </div>
            <div class="t2w-panel__actions" v-if="$slots.actions">
                <slot name="actions"></slot>
            </div>
        </header>

        <div class="t2w-panel__body">
            <div v-if="loading" class="t2w-panel__state" aria-busy="true">
                <span class="t2w-visually-hidden">Loading…</span>
                <span v-for="w in [92, 76, 84]" :key="w" class="t2w-skeleton mb-2" :style="{ width: w + '%' }"></span>
            </div>
            <div v-else-if="error" class="t2w-panel__state t2w-panel__error" role="alert">
                {{ error }}
                <button v-if="retry" type="button" class="btn btn-sm btn-link p-0 ms-2 align-baseline" @click="$emit('retry')">Try again</button>
            </div>
            <div v-else-if="empty" class="t2w-panel__state t2w-panel__empty">
                <slot name="empty">{{ emptyText }}</slot>
            </div>
            <slot v-else></slot>
        </div>

        <footer class="t2w-panel__foot" v-if="$slots.footer && !loading && !error">
            <slot name="footer"></slot>
        </footer>
    </component>
</template>

<script setup>
    // A titled block with built-in loading / error / empty states.
    // <Panel title="Latest transactions" :loading="busy" :empty="!rows.length">
    //     <template #actions><router-link to="/statement">View all</router-link></template>
    //     ...
    // </Panel>
    import './tokens.scss'

    defineProps({
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        loading: { type: Boolean, default: false },
        error: { type: String, default: "" },
        // show a "Try again" link next to the error, which emits retry
        retry: { type: Boolean, default: false },
        empty: { type: Boolean, default: false },
        emptyText: { type: String, default: "Nothing to show yet." },
        // no padding around the body (tables, lists that run edge to edge)
        flush: { type: Boolean, default: false },
        as: { type: String, default: "section" }
    })
    defineEmits(['retry'])
</script>

<style lang="scss" scoped>
    .t2w-panel {
        display: flex;
        flex-direction: column;
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        box-shadow: var(--t2w-shadow);
        color: var(--t2w-text);
        margin-bottom: var(--t2w-space-4);
        min-width: 0;
    }

    .t2w-panel__head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--t2w-space-2);
        padding: var(--t2w-space-3) var(--t2w-space-4);
        border-bottom: 1px solid var(--t2w-border);
    }

    .t2w-panel__titles { min-width: 0; }

    .t2w-panel__subtitle {
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
        margin-top: 2px;
    }

    .t2w-panel__actions {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-2);
        font-size: var(--t2w-fs-label);
        :deep(a) { color: var(--t2w-primary); text-decoration: none; font-weight: 500; }
        :deep(a:hover) { text-decoration: underline; }
    }

    .t2w-panel__body {
        flex: 1 1 auto;
        padding: var(--t2w-space-4);
        min-width: 0;
    }

    .t2w-panel.is-flush .t2w-panel__body { padding: 0; }
    .t2w-panel.is-flush .t2w-panel__state { padding: var(--t2w-space-4); }

    .t2w-panel__empty {
        color: var(--t2w-muted);
        font-size: var(--t2w-fs-table);
        text-align: center;
        padding-block: var(--t2w-space-5) !important;
    }

    .t2w-panel__error {
        color: var(--t2w-danger-ink);
        font-size: var(--t2w-fs-table);
    }

    .t2w-panel__foot {
        padding: var(--t2w-space-2) var(--t2w-space-4);
        border-top: 1px solid var(--t2w-border);
        font-size: var(--t2w-fs-label);
    }

    @media print {
        .t2w-panel { box-shadow: none; border-color: #ccc; break-inside: avoid; }
    }
</style>
