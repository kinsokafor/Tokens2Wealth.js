<template>
    <StatementView :account-number="route.params.accountNumber">
        <template #actions>
            <router-link v-if="accountType" class="btn btn-outline-secondary btn-sm"
                :to="`/accounts/view/${accountType}/${route.params.accountNumber}`">
                Account dashboard
            </router-link>
        </template>
    </StatementView>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import StatementView from '@/Modules/Tokens2Wealth/components/Accounts/StatementView.vue'

    // period statement with brought-forward and running balance, computed on the server
    // (it used to download the account's whole history and add it up in the browser)
    const route = useRoute()

    const TYPES = { '301': 'contribution', '311': 'term_deposit', '312': 'regular_thrift', '313': 'share', '314': 'special', '321': 'loan' }
    const accountType = computed(() => TYPES[String(route.params.accountNumber ?? '').slice(0, 3)] ?? null)
</script>
