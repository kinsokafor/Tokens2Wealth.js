<template>
    <div v-if="loans.length > 0">
        <pending-guaranteed-loan v-for="loan in loans" :key="loan.id" :data="loan"></pending-guaranteed-loan>
    </div>
</template>

<script setup>
    import PendingGuaranteedLoan from './PendingGuaranteedLoan.vue'
    import {onMounted, ref, provide} from 'vue'
    import {Request} from '@/helpers'

    const loans = ref([]);

    provide("loansList", loans);

    const r = new Request;

    onMounted(() => {
        r.post(r.root+"/t2w/api/pending-guaranteed-loans").then(res => {
            loans.value = res.data.map(i => {
                const meta = JSON.parse(i.meta);
                delete i.meta
                return {...i, ...meta}
            });
        })
    })
</script>

<style lang="scss" scoped>
    
</style>