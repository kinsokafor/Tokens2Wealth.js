<template>
    <div class="img-responsive">
        <img class="img-fluid" :src="img" :alt="title"/>
    </div>
</template>

<script setup>
    const props = defineProps({
        img: String,
        title: {
            type: String,
            default: ""
        }
    })
</script>

<style lang="scss" scoped>

</style>