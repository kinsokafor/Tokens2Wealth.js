<template>
    <div class="t2w-admin-dash">
        <DashboardHeader :data="user" />

        <!-- one request (/t2w/api/reports/dashboard) feeds the attention bar, the waiting cards and the 30-day section -->
        <div v-if="summaryError" class="alert alert-warning py-2 small">
            The dashboard figures could not be loaded. <a href="#" @click.prevent="loadSummary">Try again</a>
        </div>
        <WaitingCards :waiting="summary?.waiting ?? {}" :attention="summary?.attention ?? {}" :loading="loadingSummary" />
        <Last30Days :data="summary?.last30 ?? null" :loading="loadingSummary" />

        <div class="row g-3">
            <div class="col-12 col-xl-8">
                <BalancesSnapshot v-if="seesBalances" />
                <QuickLinks :groups="linkGroups" />
            </div>
            <div class="col-12 col-xl-4">
                <LatestNotifications :data="user" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted } from 'vue'
    import { useAuthStore } from '@/store/auth'
    import { Request } from '@/helpers'
    import DashboardHeader from '../../components/Dashboard/DashboardHeader.vue'
    import WaitingCards from '../../components/Dashboard/WaitingCards.vue'
    import Last30Days from '../../components/Dashboard/Last30Days.vue'
    import BalancesSnapshot from '../../components/Dashboard/BalancesSnapshot.vue'
    import QuickLinks from '../../components/Dashboard/QuickLinks.vue'
    import LatestNotifications from '../../components/Dashboard/LatestNotifications.vue'
    import { accounts, transactions, reports, previousReports, settings } from './dashboardLinks'

    const auth = useAuthStore()
    const user = computed(() => auth.getUser)

    // balances come from the trial balance report, which only capacities 1 and 2 may read
    const seesBalances = computed(() => auth.hasAccess("1,2"))

    const summary = ref(null)
    const loadingSummary = ref(true)
    const summaryError = ref(false)

    const loadSummary = async () => {
        const req = new Request()
        loadingSummary.value = true
        summaryError.value = false
        try {
            const r = await req.get(req.root + "/t2w/api/reports/dashboard")
            if (!r || typeof r.data !== "object" || r.data === null) throw new Error("unexpected response")
            summary.value = r.data
        } catch (e) {
            summary.value = null
            summaryError.value = true
        } finally {
            loadingSummary.value = false
        }
    }
    onMounted(loadSummary)

    const linkGroups = [
        { title: "Accounts", items: accounts },
        { title: "Transactions", items: transactions },
        { title: "Reports", items: reports },
        { title: "Settings", items: settings },
        { title: "Previous reports (until the new ones are signed off)", items: previousReports, collapsed: true },
    ]
</script>
