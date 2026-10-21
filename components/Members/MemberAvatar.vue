<template>
    <img :src="src" :alt="alt" class="member-avatar" :style="{ width: size + 'px', height: size + 'px' }" loading="lazy" />
</template>

<script setup>
    import { ref, watch } from 'vue'
    import { getProfilePicture } from '@/helpers'

    // profile picture, or the default male / female image (core getProfilePicture)
    const props = defineProps({
        member: { type: Object, required: true },
        size: { type: Number, default: 32 },
        alt: { type: String, default: "" }
    })
    const src = ref("")
    watch(() => [props.member.profile_picture, props.member.gender], () => {
        getProfilePicture(props.member).then(r => { src.value = r })
    }, { immediate: true })
</script>

<style lang="scss" scoped>
    .member-avatar {
        border-radius: 50%;
        object-fit: cover;
        background: #eee;
        flex: 0 0 auto;
    }
</style>
