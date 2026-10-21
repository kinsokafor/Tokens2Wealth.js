<template>
    <BalanceCard :endpoint="`/t2w/api/break-down/m/${ac_type}`" :statement-link="`/${ac_type}/statement`"
        :title="title" :unit="ac_type === 'share' ? 'units' : 'NGN'" @onready="b => $emit('onready', b)" />
</template>

<script setup>
    // The member's own balance for one product (same props and event as before); see BalanceCard.
    import BalanceCard from '../../components/Accounts/BalanceCard.vue'

    defineProps({
        ac_type: String,
        title: { type: String, default: "Balance" }
    })
    defineEmits(['onready'])
</script>
