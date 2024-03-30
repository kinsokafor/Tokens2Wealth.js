<template>
    <div v-if="account.ac_number != undefined">
        <AccountStatement :account-number="account.ac_number" />
    </div>
    <div v-else>
        <em>You don't have {{route.params.ac_type}} account</em>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import {useRoute} from 'vue-router'
    import AccountStatement from '@/Modules/Tokens2Wealth/components/AccountStatement.vue';

    const store = useAccountsStore()
    const auth = useAuthStore()
    const route = useRoute()

    const u = computed(() => auth.getUser)

    const account = computed(() => {
        const myAcc = store.get({ac_type: route.params.ac_type, user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })
</script>

<style lang="scss" scoped>

</style>