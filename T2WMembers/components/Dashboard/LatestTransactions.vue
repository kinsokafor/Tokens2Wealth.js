<template>
    <Panel title="Latest transactions" subtitle="E-wallet" flush :loading="loading" :error="error"
        :empty="!latest.length" empty-text="No transactions yet.">
        <template #actions>
            <router-link to="/contribution/statement">View statement</router-link>
        </template>
        <TxnList :items="latest" :limit="limit" :show-status="false" />
    </Panel>
</template>

<script setup>
    // The member's latest successful e-wallet transactions (same query as before).
    import { watch, ref, computed } from 'vue'
    import { dbTable } from '@/helpers'
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Panel from '../../../components/ui/Panel.vue'
    import TxnList from '../../../components/ui/TxnList.vue'

    const props = defineProps({
        data: Object,   // kept for the dashboard's existing binding; the signed-in user is used
        limit: { type: Number, default: 6 }
    })

    const store = useAccountsStore()
    const auth = useAuthStore()
    const req = new dbTable()

    const latest = ref([])
    const loading = ref(true)
    const error = ref("")

    const account = computed(() => store.get({ ac_type: 'contribution', user_id: auth.getUser?.id })[0] ?? null)

    watch(() => account.value?.ac_number, async (acNumber) => {
        if (!acNumber) return
        loading.value = true
        error.value = ""
        try {
            const r = await req.get("t2w_transactions", { account: acNumber, status: 'successful', limit: props.limit, order_by: "time_altered", order: "DESC" })
            latest.value = Array.isArray(r?.data) ? r.data : []
        } catch (e) {
            error.value = "Your transactions could not be loaded right now."
        } finally {
            loading.value = false
        }
    }, { immediate: true })

    // the accounts store loads in the background and starts empty, so "no e-wallet account" can only be
    // concluded after a while; until then the panel keeps showing its loading state
    setTimeout(() => { if (!account.value) loading.value = false }, 8000)
</script>
