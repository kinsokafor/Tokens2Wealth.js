<template>
    <div class="card mb-4">
        <div class="card-body">
            <div class="card-title d-flex justify-content-between">
                <span class="badge bg-warning text-black">Latest Transactions</span>
                <router-link to="contribution/statement">View all</router-link>
            </div>
            <div class="scroll" v-if="latest.length > 0">
                <!-- {{ latest }} -->
                <div
                    v-for="n in latest" 
                    :key="n.id"
                    class="alert d-flex justify-content-between gap-2"
                    :class="{
                        'alert-danger': (n.ledger == 'debit'),
                        'alert-success': (n.ledger == 'credit')
                    }"
                >
                <div>
                    <span 
                        class="badge"
                        :class="{
                            'bg-danger': (n.ledger == 'debit'),
                            'bg-success': (n.ledger == 'credit')
                        }"
                    >
                        {{ toLocale(n.amount) }}
                    </span><br>
                    <small>{{ n.narration }}</small>
                </div>
                <div class="w-20">
                    <small>{{ n.time_altered }}</small>
                </div>
                </div>
            </div>
            <div v-else><em>Nothing to show</em></div>
        </div>
    </div>
</template>

<script setup>
    import { watchEffect, ref, computed } from 'vue';
    import { dbTable, timeStampToDate } from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'

    const store = useAccountsStore()
    const auth = useAuthStore()

    const req = new dbTable()
    const latest = ref([])
    const account = ref({})

    const u = computed(() => auth.getUser)

    const props = defineProps({
        data: Object,
        limit: {
            type: Number,
            default: 5
        }
    })

    watchEffect(() => {
        if(account.value?.ac_number == undefined) return;
        req.get("t2w_transactions", {account: account.value.ac_number, status: 'successful', limit: 10, order_by: "time_altered", order: "DESC"}).then(r => {
            latest.value = r.data
        })
    })

    watchEffect(() => {
        const myAcc = store.get({ac_type: 'contribution', user_id: u.value.id})
        if(myAcc.length > 0) account.value = myAcc[0]
    })
</script>

<style lang="scss" scoped>
    .scroll {
        height: 300px;
        overflow-y: scroll;
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
    }
    .scroll::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
    }
    .w-20 {
        width: 20%;
    }
    .gap-2 {
        gap: 10px;
    }
</style>