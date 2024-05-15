<template>
    <div>
        <profile>
            <template #beforeMenu>
                <other-balances account="" :userId="route.params.id"></other-balances>
            </template>
        </profile>
    </div>
</template>

<script setup>
    import {useRoute} from 'vue-router'
    import profile from '@/Modules/Main/Admin/views/profile.vue'
    import OtherBalances from '../../../components/Accounts/OtherBalances.vue'

    const route = useRoute()
</script>

<style lang="scss" scoped>

</style>