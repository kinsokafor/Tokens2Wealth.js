<template>
    <div v-if="loans.length > 0">
        <approved-guaranteed-loan v-for="loan in loans" :key="loan.id" :data="loan"></approved-guaranteed-loan>
    </div>
    <div v-else>
        <em>You did not suretee/guranty any active loan</em>
    </div>
</template>

<script setup>
    import ApprovedGuaranteedLoan from '../components/ApprovedGuaranteedLoan.vue'
    import {onMounted, ref, provide} from 'vue'
    import {Request} from '@/helpers'

    const loans = ref([]);

    const r = new Request;

    onMounted(() => {
        r.post(r.root+"/t2w/api/approved-guaranteed-loans").then(res => {
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