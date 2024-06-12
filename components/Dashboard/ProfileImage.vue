<template>
    <div class="d-flex justify-content-center gap-2 mb-4">
        <div class="img-container">
            <img :src="userImg" alt="Profile picture">
        </div>
        <div class="data d-flex justify-content-center flex-column">
            <h4>{{ fullname }}</h4>
            <p><small>Membership number: {{ data.username }}</small></p>
        </div>
    </div>
</template>

<script setup>
    import { watchEffect, ref } from 'vue';
    import { getFullname, getProfilePicture } from '@/helpers'

    const props = defineProps({
        data: Object
    })

    const userImg = ref("#")
    const fullname = ref("")

    watchEffect(() => {
        getProfilePicture(props.data).then(r => {
            userImg.value = r
        })
    })

    watchEffect(() => {
        fullname.value = getFullname(props.data)
    })
</script>

<style lang="scss" scoped>
    * {
        margin: 0;
        padding: 0;
    }
    .data {
        width: calc(100% - 100px);
        h4 {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
    .img-container {
        width: 80px !important;
        height: 80px !important;
        overflow: hidden;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid var(--color2);
        img {
            width: 100%;
            transform: scale(1.5);
        }
    }
    .gap-2 {
        gap: 20px;
    }
    
</style>