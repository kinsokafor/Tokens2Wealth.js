<template>
    <div>
        <profile :menu="items">
            <template #beforeMenu>
                {{user}}
            </template>
        </profile>
    </div>
</template>

<script setup>
    import {useRoute} from 'vue-router'
    import profile from '@/Modules/Main/Admin/views/profile.vue'
    import {computed} from 'vue'
    import {useUsersStore} from '@/Modules/Main/store/users'

    const usersStore = useUsersStore()
    const route = useRoute()

    const user = computed(() => usersStore.getUser(route.params.id))

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