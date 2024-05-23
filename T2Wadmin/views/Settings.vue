<template>
    <Restricted access="1,2">
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        Loan options
                    </div>
                    <div class="card-body">
                        <SetOption :fields="loan_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        Thrift options
                    </div>
                    <div class="card-body">
                        <SetOption :fields="thrift_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        Shares options
                    </div>
                    <div class="card-body">
                        <SetOption :fields="shares_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        Term deposit options
                    </div>
                    <div class="card-body">
                        <SetOption :fields="td_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        Payout options
                    </div>
                    <div class="card-body">
                        <SetOption :fields="payout_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        Bank Details
                    </div>
                    <div class="card-body">
                        <SetOption :fields="bank_options"></SetOption>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        Other Settings
                    </div>
                    <div class="card-body">
                        <SetOption :fields="other_options"></SetOption>
                    </div>
                </div>
            </div>
        </div>
    </Restricted>
</template>

<script setup>
    import SetOption from '@/components/form/SetOption.vue'
    import { computed } from 'vue'
    import * as yup from 'yup'

    const loan_options = computed(() => [
        {
            label: "How many skips make a bad loan?",
            type: "number",
            name: "bad_loan"
        },
        {
            label: "Loan Interest Rate",
            type: "number",
            name: "loan_rate",
            rules: yup.number()
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
            label: "Max Credit Limit - Loan (%)",
            type: "number",
            name: "credit_limit"
        },
        {
            label: "Loan Tenure in Months (Seperate with commas)",
            name: "loan_tenure"
        },
        {
            label: "Loan amount above balance requires guarantor",
            as: "checkbox",
            name: "require_guarantor"
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
            name: "regava",
            as: "collection",
            rows: 3,
            fields: [
                {
                    label: "",
                    name: "month",
                    as: "select",
                    options: ["January", "February", "March", 
                    "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    col: 12
                }
            ]
        }
    ])

    const shares_options = computed(() => [
        {
            label: "Price per unit of shares",
            name: "share_unit",
            rules: yup.number()
        },
        {
            label: "Minimum Shares (in units)",
            type: "number",
            name: "min_shares"
        },
        {
            label: "Maximum Shares (in units)",
            type: "number",
            name: "max_shares"
        }
    ])

    const td_options = computed(() => [
        {
            label: "Term Deposit Rate",
            name: "td_rate",
            rules: yup.number()
        },
        {
            label: "Minimum term deposit amount",
            type: "number",
            name: "min_td"
        },
        {
            label: "Term Deposit Tenure in months(Seperate by commas)",
            name: "td_tenure"
        }
    ])

    const payout_options = computed(() => [
        {
            label: "Bank Charge (%)",
            name: "bank_charges",
            rules: yup.number()
        },
        {
            label: "Maximum Cashout Request Per Member Per Month",
            type: "number",
            name: "max_monthly_payout"
        },
        {
            label: "Minimum Cashout",
            name: "minimum_cashout",
            rules: yup.number()
        },
        {
            label: "Cashout request days",
            name: "crd",
            as: "collection",
            rows: 3,
            fields: [
                {
                    label: "",
                    name: "day",
                    as: "select",
                    options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    col: 12
                }
            ]
        }
    ])

    const bank_options = computed(() => [
        {
            label: "Account Number",
            name: "co_ac_number",
            rules: yup.number()
        },
        {
            label: "Account Name",
            name: "co_ac_name",
            as: "textarea"
        },
        {
            label: "Bank Name",
            name: "co_bank"
        }
    ])

    const other_options = computed(() => [
        {
            label: "Registration fee",
            name: "t2w_registration_fee",
            rules: yup.number().required()
        },
        {
            label: "Referral bonus",
            name: "ref_bonus",
            rules: yup.number().required()
        },
        {
            label: "Percentage Lien",
            name: "percentage_lien",
            rules: yup.number().required()
        }
    ])
</script>

<style lang="scss" scoped>

</style>