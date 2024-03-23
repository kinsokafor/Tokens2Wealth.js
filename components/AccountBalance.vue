<template>
    <div>
        <div class="balance-card">
        <div class="title">
            ACCOUNT BALANCE
        </div>
        <div class="balance">
            {{balanceDisplay}}
        </div>
        </div>
    </div>
</template>

<script setup>
    import {onMounted, ref, computed} from 'vue'
    import { Request } from '@/helpers'

    const props = defineProps({
        accountNumber: String
    })

    const balance = ref(0)

    const balanceDisplay = computed(() => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
        }).format(balance.value))

    onMounted(async () => {
        const r = new Request;
        await r.post(process.env.EVO_API_URL + `/t2w/api/balance/${props.accountNumber}`).then(r => {
            balance.value = r.data
        })
    })
</script>

<style lang="scss" scoped>
    .balance-card {
        border: 4px solid;
        border-radius: 5px;
        padding: 50px 20px;
        color: var(--shadow2);
        width: 100%;
        min-width: 350px;
        .balance {
            font-weight: 700;
            font-size: 2rem;
        }
        .title {
            font-size: 0.8rem;
        }
    }
</style>