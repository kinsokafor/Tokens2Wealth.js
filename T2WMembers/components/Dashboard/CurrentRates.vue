<template>
    <div class="ticker">
        <div class="caption">
            TODAY
        </div>
        <marquee scrollamount="4">
            <div class="marquee">
                <div><span>Current Loan Rate: </span>{{ loan }}%</div>
                <div><span>Current Term Deposit Rate: </span>{{ td }}%</div>
                <div><span>Loan Insurance Charge: </span>{{ loan }}%</div>
            </div>
            
        </marquee>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { Options } from '@/helpers'

    const loan = ref(null)
    const td = ref(null)
    const loanInsurrance = ref(null)

    onMounted(() => {
        const options = new Options;
        options.get("loan_rate,td_rate,percentage_charge_on_loan").then(r => {
            loan.value = r.data?.loan_rate ?? 0;
            td.value = r.data?.td_rate ?? 0;
            loanInsurrance.value = r.data?.percentage_charge_on_loan ?? 0;
        })
    })
</script>

<style lang="scss" scoped>
    * {
        margin: 0;
        padding: 0;
        line-height: normal;
    }
    .ticker {
        display: flex;
        background: #f3f5fa;
        margin-bottom: 20px;
        .caption {
            background: rgb(16, 45, 22);
            color: rgb(0, 175, 67);
            font-weight: 700;
            padding: 3px 8px;
            text-wrap: nowrap;
            font-size: small;
        }
    }
    .marquee {
        display: flex;
        gap: 39px;
    }
    .marquee span {
        font-style: italic;
        font-weight: 300;
        color: #102d16;
    }
</style>