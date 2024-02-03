<template>
    <div>
        {{ store.get({ac_number: "301%"}) }}
    </div>
</template>
<script setup>
    import {useAccountsStore} from '../../store/accounts'

    const store = useAccountsStore()
</script>
<style lang="scss" scoped>
</style>