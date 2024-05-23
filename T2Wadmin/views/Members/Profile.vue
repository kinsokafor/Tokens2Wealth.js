<template>
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
            link: `/upload-pop/${route.params.id}`,
            label: 'Upload Payment Receipt',
            iconClass: 'fa-upload',
            access: '3,4',
            isRouter: true
        }
    ])
</script>

<style lang="scss" scoped>

</style>