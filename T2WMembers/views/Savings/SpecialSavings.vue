<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">Special Savings Goals</h4>
            <router-link to="/savings/special/new" class="btn btn-primary">New Goal</router-link>
        </div>
        <loading :active="processing" :can-cancel="true" :is-full-page="false"></loading>
        <div v-if="goals.length > 0">
            <special-savings-goal-card v-for="goal in goals" :key="goal.id" :data="goal"></special-savings-goal-card>
        </div>
        <div v-else-if="!processing">
            <AccountIntro></AccountIntro>
        </div>
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../../components/SpecialSavingsIntro.vue';
    import SpecialSavingsGoalCard from '../../components/SpecialSavingsGoalCard.vue';
    import { onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const r = new Request();
    const goals = ref([]);
    const processing = ref(false);

    onMounted(() => {
        processing.value = true;
        r.get(r.root+"/t2w/api/special-savings/my-goals").then(res => {
            goals.value = res.data;
            processing.value = false;
        }).catch(() => {
            processing.value = false;
        })
    })
</script>

<style lang="scss" scoped>

</style>
