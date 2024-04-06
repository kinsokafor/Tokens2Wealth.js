<template>
    <div>
        <component :is="selected" :account="route.params.accountNumber"></component>
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import ThriftPanel from '@/Modules/Tokens2Wealth/components/ThriftPanel.vue';
    import {ref, onMounted} from 'vue'

    const selected = ref(null)
    const route = useRoute()

    onMounted(() => {
        switch (route.params.accountType) {
            case "regular_thrift":
                selected.value = ThriftPanel
                break;
        
            default:
                break;
        }
    })
</script>

<style lang="scss" scoped>

</style>