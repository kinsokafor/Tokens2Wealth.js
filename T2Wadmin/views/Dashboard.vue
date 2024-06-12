<template>
    <div class="row mb-4">
        <div class="col-md-5">
            <profile-image :data="data"></profile-image>
        </div>
        <div class="col-md-7">
            <Past30Days />
        </div>
    </div>
    <div class="row mb-4">
        <div class="col-12 col-md-4">
            <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_type=term_deposit&status=pending" 
                title="Pending Term deposits" 
                :template="CountCard"
                link="/t2w/a/#/accounts/term-deposits?status=pending"
            />
        </div>
        <div class="col-12 col-md-4">
            <CounterCard 
                end-point="api/dbtable/t2w_ewallet_transactions?status=unconfirmed" 
                title="Unconfirmed Deposits/Payouts" 
                :template="CountCard"
                link="/t2w/a/#/ewallet-credits?status=unconfirmed"
            />
        </div>
        <div class="col-12 col-md-4">
            <CounterCard 
                end-point="api/dbtable/t2w_inflow_outflow?status=unconfirmed" 
                title="Unconfirmed Inflow/Outflow" 
                :template="CountCard"
                link="/t2w/a/#/inflow-outflow?status=unconfirmed"
            />
        </div>
        <div class="col-6 col-md-3">
            <CounterCard 
                end-point="t2w/api/pending-loan/count" 
                title="Pending Loan Requests" 
                :template="CountCard2"
                link="/t2w/a/#/accounts/loans"
                method="post"
            />
        </div>
        <div class="col-6 col-md-3">
            <CounterCard 
                end-point="api/user?role=pending&payment_status=paid" 
                title="Pending Members" 
                :template="CountCard2"
                link="/t2w/a/#/members/pending"
            />
        </div>
        <div class="col-6 col-md-3">
            <CounterCard 
                end-point="api/store/type/buy_share?approval=0" 
                title="Pending Shares: Buy" 
                :template="CountCard2"
                link="/t2w/a/#/shares/pending/buy_share"
            />
        </div>
        <div class="col-6 col-md-3">
            <CounterCard 
                end-point="api/store/type/sell_share?approval=0" 
                title="Pending Shares: Sell" 
                :template="CountCard2"
                link="/t2w/a/#/shares/pending/sell_share"
            />
        </div>
    </div>
    <div class="row">
        <div class="col-md-8">
            <Search @value="v => searchQuery = v" />
            <Menu :items="accounts" 
                :search="searchQuery"
                :template="MenuButton" 
                containerClass="col-4 col-md-2 col-sm-3"
                :enable-search="false"
                title="Accounts"
            ></Menu>
            <Menu :items="transactions" 
                :search="searchQuery"
                :template="MenuButton" 
                containerClass="col-4 col-md-2 col-sm-3"
                :enable-search="false"
                title="Transactions"
            ></Menu>
            <Menu :items="reports" 
                :search="searchQuery"
                :template="MenuButton" 
                containerClass="col-4 col-md-2 col-sm-3"
                :enable-search="false"
                title="Reports"
            ></Menu>
            <Menu :items="settings" 
                :search="searchQuery"
                :template="MenuButton" 
                containerClass="col-4 col-md-2 col-sm-3"
                :enable-search="false"
                title="Settings"
            ></Menu>
        </div>
        <div class="col-md-4">
            <latest-notifications :data="data"></latest-notifications>
        </div>
    </div>
</template>
<script setup>
    import Menu from '@menu/Menu.vue'
    import MenuButton from '../../components/Menu/MenuButton.vue';
    import { computed, ref } from 'vue'
    import CounterCard from '@/components/theme/CounterCard.vue';
    import CountCard from '../../components/CountCard.vue';
    import CountCard2 from '../../components/CountCard2.vue';
    import Search from '@menu/Search.vue'
    import ProfileImage from '../../components/Dashboard/ProfileImage.vue';
    import {useAuthStore} from '@/store/auth'
    import Past30Days from './Charts/Past30Days.vue';
    import LatestNotifications from '../../components/Dashboard/LatestNotifications.vue';

    const searchQuery = ref("")

    const auth = useAuthStore()
    const data = computed(() => auth.getUser)

    const accounts = computed(() => [
        {
            label: "Members",
            link: "/members",
            isRouter: true,
            iconClass: "fa-users",
            access: "1,2,3,4"
        },
        {
            label: "All Accounts",
            link: "/accounts",
            isRouter: true,
            iconClass: "fa-regular fa-address-card",
            access: "1,2,3,4"
        },
        {
            label: "E-Wallets",
            link: "/accounts/wallets",
            isRouter: true,
            iconClass: "fa-wallet",
            access: "1,2,3,4"
        },
        {
            label: "Thrift savings",
            link: "/accounts/thrift-savings",
            isRouter: true,
            iconClass: "fa-solid fa-piggy-bank",
            access: "1,2,3,4"
        },
        {
            label: "Loans",
            link: "/accounts/loans",
            isRouter: true,
            iconClass: "fa-solid fa-user-tie",
            access: "1,2,3,4"
        },
        {
            label: "Term deposits",
            link: "/accounts/term-deposits",
            isRouter: true,
            iconClass: "fa-solid fa-business-time",
            access: "1,2,3,4"
        },
        {
            label: "Shares",
            link: "/accounts/shares",
            isRouter: true,
            iconClass: "fa-solid fa-share-nodes",
            access: "1,2,3,4"
        },
        {
            label: "Special savings",
            link: "/accounts/special-savings",
            isRouter: true,
            iconClass: "fa-solid fa-money-check-dollar",
            access: "1,2,3,4"
        }
    ])

    const transactions = computed(() => [
        {
            label: "E-Wallet Credits/Payouts",
            link: "/ewallet-credits",
            isRouter: true,
            iconClass: "fa-wallet",
            access: "1,2,3,4"
        },
        {
            label: "Pending Shares: Buy",
            link: "/shares/pending/buy_share",
            isRouter: true,
            iconClass: "fa-share",
            access: "1,2,3,4"
        },
        {
            label: "Pending Shares: Sell",
            link: "/shares/pending/sell_share",
            isRouter: true,
            iconClass: "fa-share",
            access: "1,2,3,4"
        },
        {
            label: "Post Inflow",
            link: "/post-inflow",
            isRouter: true,
            iconClass: "fa-download",
            access: "1,2,3,4"
        },
        {
            label: "Post Outflow",
            link: "/post-outflow",
            isRouter: true,
            iconClass: "fa-upload",
            access: "1,2,3,4"
        },
        {
            label: "Inflow & Outflow",
            link: "/inflow-outflow",
            isRouter: true,
            iconClass: "fa-solid fa-arrows-turn-to-dots",
            access: "1,2,3,4"
        }
    ])

    const reports = computed(() => [
        {
            label: "Inflow & Outflow Ledger",
            link: "/reports/ledger/inflow-outflow",
            isRouter: true,
            iconClass: "fa-list",
            access: "1,2"
        },
        {
            label: "Deposits & Payouts Ledger",
            link: "/reports/ledger/deposits-payouts",
            isRouter: true,
            iconClass: "fa-list",
            access: "1,2"
        },
        {
            label: "Balances",
            link: "/reports/balances",
            isRouter: true,
            iconClass: "fa-regular fa-chart-bar",
            access: "1,2"
        }
    ])

    const settings = computed(() => [
        {
            label: "General Settings",
            link: "/admin/#/options",
            isRouter: false,
            iconClass: "fa-gears",
            access: "1"
        },
        {
            label: "Admin Settings",
            link: "/settings",
            isRouter: true,
            iconClass: "fa-gear",
            access: "1,2"
        }
    ])
</script>
<style lang="scss" scoped>
    .row {
        --bs-gutter-x: 0.6rem;
        --bs-gutter-y: 0;
    }
</style>