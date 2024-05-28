<template>
    <div>
        <profile :menu="items">
            
        </profile>
    </div>
</template>

<script setup>
    import {useRoute} from 'vue-router'
    import profile from '@/Modules/Main/Main/views/myprofile.vue'
    import {computed, ref} from 'vue'

    const route = useRoute()

    const items = computed(() => [
        {
            link: `profile/update-nok`,
            label: 'Update Nominees',
            iconClass: 'fa-solid fa-user-shield',
            isRouter: true
        },
        {
            link: `profile/update-account-details`,
            label: 'Update Account Details',
            iconClass: 'fa-solid fa-bank',
            isRouter: true
        },
        {
            link: `profile/update-business`,
            label: 'Update Business Details',
            iconClass: 'fa-solid fa-user-tie',
            isRouter: true
        }
    ])
</script>

<style lang="scss" scoped>

</style>