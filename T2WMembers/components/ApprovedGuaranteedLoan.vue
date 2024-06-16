<template>
    <div class="card">
        <div class="card-body">
            <h4 class="card-title">
                {{ getFullname(umeta) }}'s Loan
            </h4>
            <div class="row justify-content-between">
                <div class="col-md-5">
                    <div class="img-cont">
                        <img :src="profilePicture" alt="">
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Surname</span>
                        <span>{{ umeta.surname }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Middle name</span>
                        <span>{{ umeta?.middle_name ?? "-" }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Other names</span>
                        <span>{{ umeta?.other_names }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Membership ID</span>
                        <span>{{ data?.username }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Email</span>
                        <span><a :href="`mailto:${data?.email ?? '#'}`">{{ data?.email ?? "-"  }}</a></span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Address</span>
                        <span>{{ umeta?.address ?? "-" }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>State</span>
                        <span>{{ umeta?.state ?? "-" }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Local Government Area</span>
                        <span>{{ umeta?.lga ?? "-" }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Phone Number</span>
                        <span>{{ umeta?.phone ?? "-" }}</span>
                    </div>
                    <div class="alert alert-danger" v-if="data.status == 'defaulted'">
                        This loan has defaulted in payment and stands the risk of being recovered by the cooperative. <hr/>
                        Disclaimer: Note that the cooperative has every authority to recover this loan and your account may be charged during the process of recovery.
                        Please take steps to get your suretee to clear the backlogs.
                    </div>
                </div>
                <div class="col-md-5">
                    <h4>Loan details</h4>
                    <div class="d-flex justify-content-between">
                        <span>Amount</span>
                        <span>{{ toLocale(data.amount) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Rate</span>
                        <span>{{ data.rate }}% per annum</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>To pay back</span>
                        <span>{{ toLocale(data?.repayment_sum ?? 0) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Tenure</span>
                        <span>{{ data.tenure }} Month(s)</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Moratorium</span>
                        <span>{{ data.moratorium }} Month(s)</span>
                    </div>
                    <div class="justify-content-between d-flex" v-if="data.gt1_fullname != 'NA'">
                        <span>First Guarantor</span>
                        <span style="text-align: end;">
                            <em>{{data.gt1_fullname}} <GuarantorStatus :status="data?.gt1_approval ?? ''" /></em>
                            <br/>
                            <em><small>ID: {{ data.gt1_id }}</small></em>
                        </span>
                    </div>
                    <div class="justify-content-between d-flex" v-if="data.gt2_fullname != 'NA'">
                        <span>Second Guarantor</span>
                        <span style="text-align: end;">
                            <em>{{data.gt2_fullname}} <GuarantorStatus :status="data?.gt2_approval ?? ''" /></em>
                            <br/>
                            <em><small>ID: {{ data.gt2_id }}</small></em>
                        </span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Loan Balance</span>
                        <span>{{toLocale(lc.balance)}}</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Sum Repaid</span>
                        <span>{{toLocale(lc.sumRepaid)}}</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Next Repayment Date</span>
                        <span>{{lc.nextSettlementDate}}</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Next Deduction</span>
                        <span>{{toLocale(lc.debitAmount)}}</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Percentage Completed</span>
                        <span>{{Math.round(lc.percentageCompleted)}}%</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Months Spent</span>
                        <span>{{lc.monthsSpent}} month(s)</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Remaining Months</span>
                        <span>{{lc.remainingMonths}} month(s)</span>
                    </div>
                    <div class="justify-content-between d-flex">
                        <span>Loan Status</span>
                        <span>{{data.status}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import {ref, watchEffect, onMounted} from 'vue'
    import {getFullname, getProfilePicture, Request} from '@/helpers'
    import GuarantorStatus from '../../components/GuarantorStatus.vue'

    const props = defineProps({
        data: Object
    })

    const lc = ref({})

    const r = new Request;

    const umeta = ref({...JSON.parse(props.data.usermeta), 
                username: props.data.username,
                email: props.data.email,
                id: props.data.user_id})

                const profilePicture = ref("#")

    watchEffect(() => {
        getProfilePicture(umeta.value).then(r => {
            profilePicture.value = r
        })
    })

    onMounted(() => {
        r.post(r.root+"/t2w/api/get-loan-components", {id: props.data.id}).then(res => {
            lc.value = res.data
        })
    })
</script>

<style lang="scss" scoped>
    .img-cont {
        width: 50px;
        height: 50px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            width: 50px;
            height: auto;
        }
    }
</style>