<template>
    <div>
        <component :is="selected" :account="route.params.accountNumber"></component>
    </div>
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import ThriftPanel from '@/Modules/Tokens2Wealth/components/Accounts/ThriftPanel.vue';
    import LoanPanel from '@/Modules/Tokens2Wealth/components/Accounts/LoanPanel.vue';
    import {ref, onMounted} from 'vue'

    const selected = ref(null)
    const route = useRoute()

    onMounted(() => {
        switch (route.params.accountType) {
            case "regular_thrift":
                selected.value = ThriftPanel
                break;

            case "loan":
                selected.value = LoanPanel
                break;
        
            default:
                break;
        }
    })
</script>

<style lang="scss" scoped>

</style>