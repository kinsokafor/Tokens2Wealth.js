<template>
    <div class="member-card">
        <div class="img-cont">
            <img :src="profilePicture" alt="">
        </div>
        <div class="data">
            <p>{{ getFullname(data) }}</p>
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
    import {computed, ref, watchEffect} from 'vue'
    import {getFullname, getProfilePicture} from '@/helpers'

    const props = defineProps({data: Object})

    const profilePicture = ref("#")

    watchEffect(() => {
        getProfilePicture(props.data).then(r => {
            profilePicture.value = r
        })
    })
</script>

<style lang="scss" scoped>
    * {
        padding: 0;
        margin: 0;
    }
    .member-card {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        width: 216px;
        background: #eefde8;
        padding: 7px;
        border-radius: 3px;
        color: #367136;
        font-size: smaller;
        float: left;
        margin-right: 10px;
        .img-cont {
            width: 40px;
            height: 40px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                width: 40px;
                height: auto;
            }
        }
    }
    
</style>