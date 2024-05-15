<template>
    <div class="row mb-4">
        <div class="col-md-4">
            <CounterCard 
                end-point="api/dbtable/t2w_accounts?ac_type=term_deposit&status=pending" 
                title="Pending Term deposits" 
                :template="CountCard"
                link="/t2w/a/#/accounts/term-deposits"
            />
        </div>
        <div class="col-md-4">
            <CounterCard 
                end-point="api/dbtable/t2w_ewallet_transactions?status=unconfirmed" 
                title="Unconfirmed deposits" 
                :template="CountCard"
                link="/t2w/a/#/ewallet-credits"
            />
        </div>
        <div class="col-md-4">
            <CounterCard 
                end-point="t2w/api/pending-loan/count" 
                title="Pending Loan Requests" 
                :template="CountCard"
                link="/t2w/a/#/accounts/loans"
                method="post"
            />
        </div>
    </div>
    <Menu :items="members" 
        :template="MenuButton" 
        containerClass="col-4 col-md-2 col-sm-3"
        :enable-search="false"
        title="Members"
    ></Menu>
    <Menu :items="accounts" 
        :template="MenuButton" 
        containerClass="col-4 col-md-2 col-sm-3"
        :enable-search="false"
        title="Accounts"
    ></Menu>
    <Menu :items="transactions" 
        :template="MenuButton" 
        containerClass="col-4 col-md-2 col-sm-3"
        :enable-search="false"
        title="Transactions"
    ></Menu>
    <Menu :items="settings" 
        :template="MenuButton" 
        containerClass="col-4 col-md-2 col-sm-3"
        :enable-search="false"
        title="Settings"
    ></Menu>
</template>
<script setup>
    import Menu from '@/components/menu/Menu.vue'
    import MenuButton from '../../components/Menu/MenuButton.vue';
    import { computed } from 'vue'
    import CounterCard from '@/components/theme/CounterCard.vue';
    import CountCard from '../../components/CountCard.vue';

    const members = computed(() => [
        {
            label: "Members",
            link: "/members",
            isRouter: true,
            iconClass: "fa-users",
            access: "1,2,3,4"
        }
    ])

    const accounts = computed(() => [
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
            label: "E-Wallet Credits",
            link: "/ewallet-credits",
            isRouter: true,
            iconClass: "fa-wallet",
            access: "1,2,3,4"
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
</style>