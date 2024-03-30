<template>
    <div class="row">
        <div class="col-md-4">
            <a href="/admin/#/users" class="counter-link">
                <CounterCard 
                end-point="api/user?status=active&role=member" 
                title="active Users" 
                icon-class="fa-users" 
                color="var(--green)"
                text-color="var(--shadow1)"
                />
            </a>
        </div>
        <div class="col-md-4">
            <router-link to="accounts" class="counter-link">
                <CounterCard 
                end-point="api/dbtable/t2w_accounts" 
                title="accounts" 
                icon-class="fa-solid fa-money-check-dollar" 
                color="var(--blue)"
                text-color="var(--blue)"
                />
            </router-link>
        </div>
    </div>
    <Menu :items="fields"></Menu>
</template>
<script setup>
    import CounterCard from '@/components/theme/CounterCard.vue';
    import Menu from '@/components/menu/Menu.vue'
    import { computed } from 'vue'

    const fields = computed(() => [
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