<template>
    <div>
        <pending-guranteed-loans/>
        <div class="row">
            <div class="col-md-4">
                <profile-image :data="data"></profile-image>
                <profile-completeness></profile-completeness>
            </div>
            <div class="col-md-8">
                <balances :data="data"></balances>
            </div>
        </div>
        <div class="row">
            <div class="col-md-5">
                <latest-notifications :data="data"></latest-notifications>
            </div>
            <div class="col-md-7">
                <latest-transactions :data="data"></latest-transactions>
            </div>
        </div>
    </div>
</template>
<script setup>
    import PendingGuranteedLoans from '../components/PendingGuranteedLoans.vue';
    import ProfileImage from '../components/Dashboard/ProfileImage.vue';
    import Balances from '../components/Dashboard/Balances.vue';
    import {useAuthStore} from '@/store/auth'
    import {computed, watchEffect} from 'vue'
    import LatestNotifications from '../../components/Dashboard/LatestNotifications.vue';
    import LatestTransactions from '../components/Dashboard/LatestTransactions.vue';
    import ProfileCompleteness from '../components/Dashboard/ProfileCompleteness.vue';

    const auth = useAuthStore()
    const data = computed(() => auth.getUser)
</script>
<style lang="scss" scoped>
</style>