<template>
    <div class="row summary-cards mb-3">
        <div class="col-6 col-md-3" v-for="item in items" :key="item.label">
            <div class="card h-100">
                <div class="card-body py-2 px-3">
                    <div class="small text-muted">{{ item.label }}</div>
                    <div class="fs-5 fw-semibold text-nowrap">{{ item.value }}</div>
                    <div class="small text-muted" v-if="item.hint">{{ item.hint }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    // items: [{ label, value, hint? }]
    defineProps({
        items: { type: Array, default: () => [] }
    })
</script>

<style lang="scss" scoped>
    .summary-cards { --bs-gutter-y: 0.6rem; }
</style>
