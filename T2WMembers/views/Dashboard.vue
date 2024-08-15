<template>
    <div>
        <pending-guranteed-loans/>
        <div class="row">
            <div class="col-md-4">
                <router-link to="profile" style="color: var(--bs-heading-color);">
                    <profile-image :data="data"></profile-image>
                </router-link>
                <profile-completeness></profile-completeness>
            </div>
            <div class="col-md-8">
                <balances :data="data"></balances>
                <current-rates></current-rates>
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
    import ProfileImage from '../../components/Dashboard/ProfileImage.vue';
    import Balances from '../components/Dashboard/Balances.vue';
    import {useAuthStore} from '@/store/auth'
    import {computed} from 'vue'
    import LatestNotifications from '../../components/Dashboard/LatestNotifications.vue';
    import LatestTransactions from '../components/Dashboard/LatestTransactions.vue';
    import ProfileCompleteness from '../components/Dashboard/ProfileCompleteness.vue';
    import CurrentRates from '../components/Dashboard/CurrentRates.vue';

    const auth = useAuthStore()
    const data = computed(() => auth.getUser)
</script>
<style lang="scss" scoped>
</style>