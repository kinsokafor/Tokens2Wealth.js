<template>
    <div class="row">
        <div class="col-md-4">
            <CounterCard 
            end-point="api/user?status=active&role=member" 
            title="active Users" 
            icon-class="fa-users" 
            color="var(--green)"
            text-color="var(--shadow1)"
            />
        </div>
        <div class="col-md-4">
            <router-link to="accounts" class="counter-link">
                <CounterCard 
                end-point="api/post/type/account" 
                title="accounts" 
                icon-class="fa-solid fa-money-check-dollar" 
                color="var(--blue)"
                text-color="var(--blue)"
                />
            </router-link>
        </div>
    </div>
</template>
<script setup>
    import CounterCard from '@/components/theme/CounterCard.vue';
</script>
<style lang="scss" scoped>
</style>