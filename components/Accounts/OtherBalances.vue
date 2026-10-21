<template>
    <div class="t2w-other-balances" v-if="filtered.length">
        <h3 class="t2w-section-title mb-2">Other accounts</h3>
        <div class="row g-2 g-md-3">
            <div class="col-6 col-md-4" v-for="account in filtered" :key="account.id">
                <StatCard :label="label(account)" format="text" :value="show(account)"
                    :to="`/accounts/view/${account?.ac_type}/${account?.ac_number}`"
                    :tone="Number(account.balance) < 0 ? 'warning' : 'default'" :hint="account.ac_number" />
            </div>
        </div>
    </div>
</template>

<script setup>
    // The member's other accounts (not the one on this page), each linking to its own page.
    // Negative balances get an amber edge (they had an amber card before).
    import { ref, watchEffect, computed } from 'vue'
    import { Request, titleCase } from '@/helpers'
    import StatCard from '../ui/StatCard.vue'
    import { money, count } from '../../helpers/format'

    const props = defineProps({ account: String, userId: Number })

    const r = new Request()
    const accounts = ref([])

    const filtered = computed(() => accounts.value.filter(i => i.ac_number != props.account))

    watchEffect(() => {
        if (props.userId == undefined) return
        r.post(r.root + "/t2w/api/get/user-accounts", { user_id: props.userId }).then(res => {
            accounts.value = Array.isArray(res?.data) ? res.data : []
        }).catch(() => { accounts.value = [] })
    })

    const label = a => a.ac_type == 'special' ? 'Special Savings' : a.ac_type == 'contribution' ? 'E-Wallet' : titleCase(String(a.ac_type).replace(/_/g, ' '))
    const show = a => a.ac_type == 'share' ? `${count(a.balance)} units` : money(a.balance)
</script>

<style lang="scss" scoped>
    .t2w-other-balances { margin: var(--t2w-space-4) 0; }
</style>
