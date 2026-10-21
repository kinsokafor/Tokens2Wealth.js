<template>
    <div class="row g-2 g-md-3 mb-3 summary-cards">
        <div class="col-6 col-md-3" v-for="item in items" :key="item.label">
            <StatCard :label="item.label" :value="item.value" format="text" :hint="item.hint ?? ''"
                :tone="item.tone ?? 'default'" />
        </div>
    </div>
</template>

<script setup>
    // Report summary figures as StatCards. items: [{ label, value, hint?, tone? }]
    // value arrives already formatted by the report page (money, counts or units), so it is shown as text.
    import StatCard from '../ui/StatCard.vue'

    defineProps({
        items: { type: Array, default: () => [] }
    })
</script>
