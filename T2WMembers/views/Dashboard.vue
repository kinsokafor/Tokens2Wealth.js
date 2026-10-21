<template>
    <div class="t2w-member-dash">
        <DashboardHeader :data="user">
            <router-link to="/profile" class="t2w-section-link">My profile →</router-link>
        </DashboardHeader>

        <!-- loans other members asked this member to guarantee: accept / decline happens here -->
        <pending-guranteed-loans />

        <Balances />

        <div class="row g-3">
            <div class="col-12 col-lg-7">
                <LatestTransactions :data="user" />
            </div>
            <div class="col-12 col-lg-5">
                <ProfileCompleteness />
                <CurrentRates />
                <LatestNotifications :data="user" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAuthStore } from '@/store/auth'
    import PendingGuranteedLoans from '../components/PendingGuranteedLoans.vue'
    import DashboardHeader from '../../components/Dashboard/DashboardHeader.vue'
    import Balances from '../components/Dashboard/Balances.vue'
    import LatestTransactions from '../components/Dashboard/LatestTransactions.vue'
    import ProfileCompleteness from '../components/Dashboard/ProfileCompleteness.vue'
    import CurrentRates from '../components/Dashboard/CurrentRates.vue'
    import LatestNotifications from '../../components/Dashboard/LatestNotifications.vue'

    const auth = useAuthStore()
    const user = computed(() => auth.getUser)
</script>
