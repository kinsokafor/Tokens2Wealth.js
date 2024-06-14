<template>
    <div>
        {{ fullname }}
    </div>
</template>

<script setup>
    import {useUsersStore} from '@main/store/users'
    import {watchEffect, ref, computed} from 'vue'
    import {getFullname} from '@/helpers'

    const usersStore = useUsersStore()

    const props = defineProps({
        id: Number
    })

    const data = ref({})

    const fullname = computed(() => getFullname(data.value))

    watchEffect(() => {
        data.value = usersStore.get({id: props.id})[0] ?? {}
    })
</script>

<style lang="scss" scoped>
    * {
        margin: 0;
        padding: 0;
    }
</style>