<template>
    <img :src="src" alt="" :title="title">
</template>

<script setup>
    import fail from '../assets/icons/fail.png'
    import wait from '../assets/icons/wait.png'
    import check from '../assets/icons/check.png'
    import {computed, ref} from 'vue'

    const props = defineProps({
        status: [String]
    })

    const title = ref("");

    const src = computed(() => {
        switch(props.status) {

            case "pending":
                title.value = "Awaiting approval"
                return wait;
                break;

            case "declined":
                title.value = "Approval declined"
                return fail;
                break;

            case "approved":
            default:
                title.value = "Approved"
                return check;
                break;
        }
    })
</script>

<style lang="scss" scoped>
    img {
        width: 18px;
        height: auto;
        cursor: pointer;
    }
</style>