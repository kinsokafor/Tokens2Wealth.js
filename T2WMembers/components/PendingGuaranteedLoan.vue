<template>
    <div class="card">
        <div class="card-body">
            <h4 class="card-title">
                {{ getFullname(umeta) }} is requesting for you to surety his/her loan application
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
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-12">
                    <h4>Very Important: <small class="badge bg-danger">Please Read!!!</small></h4>
                    <p>Accepting to suretee a participant's loan automatically makes you liable if he/she eventually defaults. 
                        Therefore by clicking the accept button, it means that you 
                        <strong><em>AGREE</em></strong> to the following statements:
                    </p>
                    <ol>
                        <li>That you know <strong>{{ getFullname(umeta) }}</strong></li>
                        <li>That you can provide him/her whenever he/she is needed?</li>
                        <li>That you authorize the cooperative to penalize or surcharge you in other to repay <i>this</i> loan if he/she eventually defaults?</li>
                        <li>That you can provide useful information about the applicant whenever such is required?</li>
                    </ol>
                    <div class="d-flex gap-2 justify-content-between buttons">
                        <button  class="btn btn-primary2 red" @click.prevent="decline">I Decline</button>
                        <button  class="btn btn-primary2" @click.prevent="accept">I Accept</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import {ref, watchEffect, inject} from 'vue'
    import {getFullname, getProfilePicture, Request} from '@/helpers'
    import GuarantorStatus from '../../components/GuarantorStatus.vue'
    import {useAlertStore} from '@/store/alert'

    const alertStore = useAlertStore()

    const props = defineProps({
        data: Object
    })

    const loans = inject("loansList", []);

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

    const accept = () => {
        if(confirm("Are you sure you want to accept to surety this loan?")) {
            r.post(r.root+"/t2w/api/gaurantor-accept", {id: props.data.id}).then(r => {
                const index = loans.value.findIndex(i => i.id == r.data.id)
                loans.value.splice(index, 1)
                alertStore.add("Done")
            }).catch(e => {
                alertStore.add(e.response?.data, "danger")
            })
        }
    }

    const decline = () => {
        if(confirm("Are you sure you want to decline?")) {
            r.post(r.root+"/t2w/api/gaurantor-decline", {id: props.data.id}).then(r => {
                const index = loans.value.findIndex(i => i.id == r.data.id)
                loans.value.splice(index, 1)
                alertStore.add("Done")
            }).catch(e => {
                console.log(e)
                alertStore.add(e.response?.data, "danger")
            })
        }
    }
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