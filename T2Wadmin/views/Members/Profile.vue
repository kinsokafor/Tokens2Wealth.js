<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">User Profile</h3>
        </div>
    </div>
    <div>
        <profile :menu="items">
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
    import {computed, ref} from 'vue'

    const route = useRoute()

    const items = computed(() => [
        {
            link: `/member/data/${route.params.id}`,
            label: 'User Data',
            iconClass: 'fa-file',
            access: '3,4',
            isRouter: true
        }
    ])
</script>

<style lang="scss" scoped>

</style>