<template>
    <Panel title="Today's rates" :loading="loading">
        <dl class="t2w-rates">
            <div v-for="r in rates" :key="r.label">
                <dt>{{ r.label }}</dt>
                <dd class="t2w-num">{{ percent(r.value) }}</dd>
            </div>
        </dl>
    </Panel>
</template>

<script setup>
    // The cooperative's current rates (General Settings options), as a short list instead of a scrolling ticker.
    import { ref, computed, onMounted } from 'vue'
    import { Options } from '@/helpers'
    import Panel from '../../../components/ui/Panel.vue'
    import { percent } from '../../../helpers/format'

    const loan = ref(0)
    const td = ref(0)
    const loanInsurance = ref(0)
    const loading = ref(true)

    onMounted(async () => {
        try {
            const r = await new Options().get("loan_rate,td_rate,percentage_charge_on_loan")
            loan.value = r?.data?.loan_rate ?? 0
            td.value = r?.data?.td_rate ?? 0
            loanInsurance.value = r?.data?.percentage_charge_on_loan ?? 0
        } finally {
            loading.value = false
        }
    })

    const rates = computed(() => [
        { label: "Loan interest", value: loan.value },
        { label: "Term deposit interest", value: td.value },
        { label: "Loan insurance charge", value: loanInsurance.value },
    ])
</script>

<style lang="scss" scoped>
    .t2w-rates {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--t2w-space-2);
        > div {
            display: flex;
            justify-content: space-between;
            gap: var(--t2w-space-3);
            font-size: var(--t2w-fs-table);
        }
        dt { font-weight: 400; color: var(--t2w-muted); }
        dd { margin: 0; font-weight: 600; color: var(--t2w-text); }
    }
</style>
