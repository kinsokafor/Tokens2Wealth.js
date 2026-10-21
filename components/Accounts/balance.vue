<template>
    <BalanceCard :endpoint="`/t2w/api/break-down/${account}`" :statement-link="`/accounts/statement/${account}`"
        :title="title" :unit="suffix.trim() ? suffix.trim() : 'NGN'" @onready="b => $emit('onready', b)" />
</template>

<script setup>
    // Staff view of an account's balance (same props and event as before); see BalanceCard.
    import BalanceCard from './BalanceCard.vue'

    defineProps({
        account: String,
        title: { type: String, default: "Balance" },
        // " units" for shares
        suffix: { type: String, default: "" }
    })
    defineEmits(['onready'])
</script>
