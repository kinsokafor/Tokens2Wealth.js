<template>
    <Panel :title="title" :error="error" class="t2w-balance-card">
        <template #actions>
            <router-link :to="statementLink">View statement</router-link>
        </template>

        <div class="t2w-balance-card__figure t2w-num" :aria-busy="loading">
            <span v-if="loading" class="t2w-skeleton" style="width: 55%; height: 1.2em"></span>
            <template v-else>{{ show(balance) }}</template>
        </div>
        <div class="t2w-balance-card__asat">
            <template v-if="asAt">as at {{ shortDate(asAt) }} · <button type="button" class="t2w-link-btn" @click="load(null)">back to today</button></template>
            <template v-else>today</template>
        </div>

        <dl class="t2w-balance-card__rows">
            <div><dt>Credits</dt><dd class="t2w-num is-in">{{ loading ? "…" : show(credits) }}</dd></div>
            <div><dt>Debits</dt><dd class="t2w-num is-out">{{ loading ? "…" : show(debits) }}</dd></div>
        </dl>

        <form class="t2w-balance-card__form no-print" @submit.prevent="date && load(date)">
            <label class="t2w-visually-hidden" :for="uid">Balance as at</label>
            <input :id="uid" type="date" class="form-control form-control-sm" v-model="date" :max="today" />
            <button type="submit" class="t2w-btn" :disabled="!date || loading">Show as at date</button>
        </form>
    </Panel>
</template>

<script setup>
    // An account's balance with its credits and debits, optionally as at a past date.
    // endpoint: "/t2w/api/break-down/<account>" (staff) or "/t2w/api/break-down/m/<type>" (the member's own).
    // Emits onready(balance) with today's balance, as the old balance boxes did.
    import { onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import Panel from '../ui/Panel.vue'
    import { money, count, shortDate, toNumber } from '../../helpers/format'
    import { ymd } from '../../helpers/reports'

    const props = defineProps({
        endpoint: { type: String, required: true },
        statementLink: { type: String, required: true },
        title: { type: String, default: "Balance" },
        // "units" for shares, otherwise naira
        unit: { type: String, default: "NGN" }
    })
    const emit = defineEmits(['onready'])

    const req = new Request()
    const uid = `bal${Math.random().toString(36).slice(2, 8)}`
    const today = ymd(new Date())

    const balance = ref(0), credits = ref(0), debits = ref(0)
    const asAt = ref(null)
    const date = ref("")
    const loading = ref(true)
    const error = ref("")

    const show = v => props.unit === "NGN" ? money(v) : `${count(v)} ${props.unit}`

    const load = async (d) => {
        loading.value = true
        error.value = ""
        try {
            const r = await req.post(req.root + props.endpoint, d ? { date: `${d} 23:59:59` } : {})
            credits.value = toNumber(r?.data?.credits) ?? 0
            debits.value = toNumber(r?.data?.debits) ?? 0
            balance.value = credits.value - debits.value
            asAt.value = d
            if (!d) emit("onready", balance.value)
        } catch (e) {
            error.value = "The balance could not be loaded."
        } finally {
            loading.value = false
        }
    }
    onMounted(() => load(null))
</script>

<style lang="scss" scoped>
    .t2w-balance-card__figure {
        font-family: var(--t2w-font-heading);
        font-size: 1.75rem;
        font-weight: 600;
        line-height: 1.2;
    }

    .t2w-balance-card__asat {
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
        margin-bottom: var(--t2w-space-3);
    }

    .t2w-link-btn {
        all: unset;
        cursor: pointer;
        color: var(--t2w-primary);
        &:hover { text-decoration: underline; }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }

    .t2w-balance-card__rows {
        margin: 0 0 var(--t2w-space-3);
        border-top: 1px solid var(--t2w-border);
        > div {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid var(--t2w-border);
            font-size: var(--t2w-fs-table);
        }
        dt { font-weight: 400; color: var(--t2w-muted); }
        dd { margin: 0; font-weight: 600; }
        .is-in { color: var(--t2w-success-ink); }
        .is-out { color: var(--t2w-danger-ink); }
    }

    .t2w-balance-card__form {
        display: flex;
        gap: var(--t2w-space-2);
        .form-control { padding: 3px 8px; border-radius: var(--t2w-radius-sm); }
    }
</style>
