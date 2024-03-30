<template>
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    Loan options
                </div>
                <div class="card-body">
                    <SetOption :fields="loan_options"></SetOption>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    Thrift options
                </div>
                <div class="card-body">
                    <SetOption :fields="thrift_options"></SetOption>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import SetOption from '@/components/form/SetOption.vue'
    import { computed } from 'vue'

    const loan_options = computed(() => [
        {
            label: "How many skips make a bad loan?",
            type: "number",
            name: "bad_loan"
        },
        {
            label: "Loanable Sum (% of Balance)",
            type: "number",
            name: "loanable_sum"
        },
        {
            label: "Moratorium Period (in Months)",
            type: "number",
            name: "moratorium"
        },
        {
            label: "Percentage Charge On Loan",
            type: "number",
            name: "percentage_charge_on_loan"
        },
        {
            label: "Legible for loan after X months of active account",
            type: "number",
            name: "loan_legibility"
        },
        {
            label: "Loan Tenure in Months (Seperate with commas)",
            name: "loan_tenure"
        }
    ])

    const thrift_options = computed(() => [
        {
            label: "Months interval to review regular thrift?",
            type: "number",
            name: "rt_review"
        },
        {
            label: "Regular thrift settlement day within the month",
            type: "number",
            name: "rt_settlement"
        },
        {
            label: "Minimum thrift savings amount",
            type: "number",
            name: "min_thrift"
        },
        {
            label: "Maximum thrift savings amount",
            type: "number",
            name: "max_thrift"
        },
        {
            label: "Registration & Thrift Available",
            name: "regava"
        }
    ])
</script>

<style lang="scss" scoped>

</style>