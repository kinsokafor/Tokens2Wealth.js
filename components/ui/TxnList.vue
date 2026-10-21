<template>
    <div class="t2w-txns">
        <ul v-if="loading" class="t2w-txns__list" aria-busy="true">
            <li v-for="n in Math.min(limit || 5, 5)" :key="n" class="t2w-txns__skeleton">
                <span class="t2w-skeleton" style="width: 32px; height: 32px; border-radius: 50%"></span>
                <span class="flex-grow-1"><span class="t2w-skeleton mb-1" style="width: 55%"></span><span class="t2w-skeleton" style="width: 30%"></span></span>
                <span class="t2w-skeleton" style="width: 70px"></span>
            </li>
        </ul>

        <ul v-else-if="shown.length" class="t2w-txns__list">
            <li v-for="(item, index) in shown" :key="item[fields.key] ?? index">
                <slot name="item" :item="item">
                    <TxnRow
                        :amount="item[fields.amount]"
                        :ledger="item[fields.ledger]"
                        :narration="item[fields.narration]"
                        :date="item[fields.date]"
                        :status="item[fields.status]"
                        :meta="item[fields.meta]"
                        :date-style="dateStyle"
                        :show-status="showStatus"
                        :to="itemLink ? itemLink(item) : null">
                        <template #actions v-if="$slots.actions"><slot name="actions" :item="item"></slot></template>
                    </TxnRow>
                </slot>
            </li>
        </ul>

        <div v-else class="t2w-txns__empty"><slot name="empty">{{ emptyText }}</slot></div>
    </div>
</template>

<script setup>
    // A list of TxnRows from t2w_transactions-shaped records.
    // <TxnList :items="latest" :limit="5" :item-link="t => `/ewallet-${t.ledger}s/${t.id}`" />
    // Field names default to the t2w_transactions columns; override any with :fields="{ date: 'created_at' }".
    import { computed } from 'vue'
    import TxnRow from './TxnRow.vue'
    import './tokens.scss'

    const DEFAULT_FIELDS = {
        key: "id",
        amount: "amount",
        ledger: "ledger",
        narration: "narration",
        date: "time_altered",
        status: "status",
        meta: "classification"
    }

    const props = defineProps({
        items: { type: Array, default: () => [] },
        fields: { type: Object, default: () => ({}) },
        // 0 shows everything
        limit: { type: Number, default: 0 },
        loading: { type: Boolean, default: false },
        emptyText: { type: String, default: "No transactions yet." },
        dateStyle: { type: String, default: "relative" },
        showStatus: { type: Boolean, default: true },
        itemLink: { type: Function, default: null }
    })

    const fields = computed(() => ({ ...DEFAULT_FIELDS, ...props.fields }))
    const shown = computed(() => props.limit > 0 ? props.items.slice(0, props.limit) : props.items)
</script>

<style lang="scss" scoped>
    .t2w-txns__list {
        list-style: none;
        margin: 0;
        padding: 0;
        > li + li { border-top: 1px solid var(--t2w-border); }
    }

    .t2w-txns__skeleton {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        padding: var(--t2w-space-3) var(--t2w-space-4);
    }

    .t2w-txns__empty {
        padding: var(--t2w-space-5) var(--t2w-space-4);
        text-align: center;
        color: var(--t2w-muted);
        font-size: var(--t2w-fs-table);
    }
</style>
