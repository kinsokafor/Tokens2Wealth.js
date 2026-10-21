<template>
    <component :is="tag" v-bind="linkAttrs" class="t2w-stat"
        :class="[`t2w-stat--${tone}`, `t2w-stat--${size}`, { 'is-link': !!(to || href) }]">
        <div class="t2w-stat__head">
            <span class="t2w-stat__label">{{ label }}</span>
            <span v-if="attention" class="t2w-stat__dot" title="Needs attention">
                <span class="t2w-visually-hidden">Needs attention</span>
            </span>
            <FontAwesomeIcon v-if="icon" :icon="icon" class="t2w-stat__icon" aria-hidden="true" />
        </div>

        <div class="t2w-stat__value t2w-num" :style="{ '--t2w-fit': fit }">
            <!-- same height as the figure's line (line-height 1.2), so nothing moves when it arrives -->
            <span v-if="loading" class="t2w-skeleton" style="width: 60%; height: 1.2em"></span>
            <template v-else>{{ display }}</template>
        </div>

        <div class="t2w-stat__foot" v-if="!loading && (hasDelta || hint || $slots.default)">
            <span v-if="hasDelta" class="t2w-stat__delta t2w-num" :class="`is-${deltaMood}`">
                <span aria-hidden="true">{{ delta > 0 ? "▲" : delta < 0 ? "▼" : "•" }}</span>
                {{ percent(delta, { signed: true }) }}
            </span>
            <span v-if="hasDelta && deltaLabel" class="t2w-stat__hint">{{ deltaLabel }}</span>
            <span v-if="hint" class="t2w-stat__hint">{{ hint }}</span>
            <slot></slot>
        </div>
    </component>
</template>

<script setup>
    // A single figure with its label: KPIs, balances, counts waiting for approval.
    // <StatCard label="Inflow" :value="1250000" :delta="12.4" delta-label="vs previous 30 days" />
    // <StatCard label="Unconfirmed deposits" :value="4" format="count" :attention="true" to="/ewallet-credits" />
    import { computed } from 'vue'
    import { RouterLink } from 'vue-router'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { formatAs, percent } from '../../helpers/format'
    import './tokens.scss'

    const props = defineProps({
        label: { type: String, required: true },
        value: { type: [Number, String], default: null },
        // money | money-compact | count | percent | text
        format: { type: String, default: "money" },
        // percent change; null hides it
        delta: { type: Number, default: null },
        deltaLabel: { type: String, default: "" },
        // which direction is good news: "up" (inflow), "down" (arrears), "none" (just show it)
        goodWhen: { type: String, default: "up" },
        hint: { type: String, default: "" },
        to: { type: [String, Object], default: null },
        href: { type: String, default: null },
        // default | brand | success | warning | danger | info
        tone: { type: String, default: "default" },
        // something here is waiting on staff: shows a static amber dot
        attention: { type: Boolean, default: false },
        loading: { type: Boolean, default: false },
        icon: { type: [Object, Array, String], default: null },
        size: { type: String, default: "md" } // md | lg
    })

    const tag = computed(() => props.to ? RouterLink : props.href ? "a" : "div")
    const linkAttrs = computed(() => props.to ? { to: props.to } : props.href ? { href: props.href } : {})

    // no value yet is "—", not ₦0.00
    const display = computed(() => {
        if (props.value === null || props.value === undefined || props.value === "") return "—"
        return props.format === "text" ? props.value : formatAs(props.format, props.value)
    })

    // largest font that still fits the figure in the card: a digit is about 0.6em wide, so
    // characters × 0.6 × size must stay under the card width (100cqi)
    const fit = computed(() => `${(150 / Math.max(String(display.value).length, 1)).toFixed(1)}cqi`)

    const hasDelta = computed(() => props.delta !== null && props.delta !== undefined && isFinite(props.delta))
    const deltaMood = computed(() => {
        if (props.goodWhen === "none" || props.delta === 0) return "neutral"
        const up = props.delta > 0
        return (props.goodWhen === "up") === up ? "good" : "bad"
    })
</script>

<style lang="scss" scoped>
    .t2w-stat {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--t2w-space-1);
        height: 100%;
        padding: var(--t2w-space-3) var(--t2w-space-4);
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        box-shadow: var(--t2w-shadow);
        color: var(--t2w-text);
        text-decoration: none;
        overflow: hidden;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        // tone shows as a thin bar on the left edge, never as the value colour
        &::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 0;
            width: 3px;
            background: transparent;
        }
        &--success::before { background: var(--t2w-success); }
        &--warning::before { background: var(--t2w-warning); }
        &--danger::before { background: var(--t2w-danger); }
        &--info::before { background: var(--t2w-info); }
    }

    .t2w-stat.is-link {
        cursor: pointer;
        &:hover { border-color: var(--t2w-primary); box-shadow: 0 2px 12px color-mix(in srgb, var(--t2w-primary) 18%, transparent); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }

    .t2w-stat__head {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-2);
        min-width: 0;
    }

    .t2w-stat__label {
        flex: 1 1 auto;
        min-width: 0;
        font-size: var(--t2w-fs-label);
        line-height: 1.3;
        color: var(--t2w-muted);
        // wrap to two lines on narrow cards rather than cutting the label off
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .t2w-stat__icon {
        flex: none;
        color: var(--t2w-primary);
        opacity: 0.85;
    }

    .t2w-stat__dot {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--t2w-warning);
        box-shadow: 0 0 0 3px var(--t2w-warning-soft);
    }

    // the figure shrinks with the card instead of being cut off ("₦1,250,0…" on a half-width phone card)
    .t2w-stat { container-type: inline-size; }

    .t2w-stat__value {
        font-family: var(--t2w-font-heading);
        font-size: clamp(0.95rem, var(--t2w-fit, 10cqi), var(--t2w-fs-kpi));
        font-weight: 600;
        line-height: 1.2;
    }

    .t2w-stat--lg .t2w-stat__value { font-size: clamp(1.1rem, var(--t2w-fit, 11cqi), 2rem); }

    .t2w-stat__foot {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 2px var(--t2w-space-2);
        font-size: var(--t2w-fs-small);
    }

    .t2w-stat__hint { color: var(--t2w-muted); }

    .t2w-stat__delta {
        font-weight: 600;
        &.is-good { color: var(--t2w-success-ink); }
        &.is-bad { color: var(--t2w-danger-ink); }
        &.is-neutral { color: var(--t2w-muted); }
    }

    // brand hero: the theme gradient with light ink
    .t2w-stat--brand {
        background: var(--t2w-gradient);
        border-color: transparent;
        color: #fff;
        .t2w-stat__label, .t2w-stat__hint { color: rgba(255, 255, 255, 0.82); }
        .t2w-stat__icon { color: var(--t2w-accent); }
        .t2w-stat__delta.is-good { color: var(--t2w-accent); }
        .t2w-stat__delta.is-bad { color: #ffd2d2; }
        .t2w-stat__delta.is-neutral { color: rgba(255, 255, 255, 0.82); }
        &.is-link:hover { border-color: var(--t2w-accent); }
    }
</style>
