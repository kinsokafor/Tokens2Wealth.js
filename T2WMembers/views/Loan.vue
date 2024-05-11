<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="loanPng" caption="Loan">
                <p>Last approved loan with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
                <template #status>
                    <span class="badge" 
                    :class="{
                        'bg-success': (data.status == 'approved'), 
                        'bg-danger': (data.status == 'defaulted'), 
                        'bg-warning text-black': (data.status == 'in process'),
                        'bg-primary': (data.status == 'cleared')}">{{ data.status }}
                    </span>
                </template>
            </Header>
            <div class="row">
                <div class="col-md-4">
                    <balance :ac_type="data.ac_type" title="Loan Balance"></balance>
                </div>
                <div class="col-md-4 animate__animated animate__pulse" v-if="hasLoan">
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">Loaned Amount</h5>
                            <p class="card-text">{{toLocale(parseFloat(data?.amount ?? 0))}}</p>
                            <div class="alert alert-primary" style="margin: 0; padding: 6px 20px;">
                                To repay {{ toLocale(parseFloat(data?.repayment_sum ?? 0)) }}
                            </div>
                            <!-- <router-link :to="`/accounts/thrift/${account}/edit`" class="btn btn-primary">Edit Amount</router-link> -->
                        </div>
                    </div>
                    <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">Loan particulars</h5>
                        <div class="justify-content-between d-flex">
                            <span>Moratorium</span>
                            <em>{{ data.moratorium }} month</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Interest Rate</span>
                            <em>{{ data.rate }}% per annum</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Plan</span>
                            <em>{{ data.plan }}</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Tenure</span>
                            <em>{{ data.tenure }} month(s)</em>
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
                </div>
                <div class="col-md-4 animate__animated animate__pulse" v-if="hasLoan && data.status != 'in process'">
                    <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">Repayment status</h5>
                        <div class="justify-content-between d-flex">
                            <span>Next settlement</span>
                            <em>{{ loanComponents.nextSettlementDate }}</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Next deduction amount</span>
                            <em>{{ toLocale(loanComponents.debitAmount) }}</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Months spent</span>
                            <em>{{ loanComponents.monthsSpent }} month(s)</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Remaining months</span>
                            <em>{{ loanComponents.remainingMonths }} month(s)</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Principal repaid</span>
                            <em>{{ toLocale(loanComponents.principalRepaid) }}</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Interest repaid</span>
                            <em>{{ toLocale(loanComponents.interestRepaid) }}</em>
                        </div>
                        <div class="justify-content-between d-flex">
                            <span>Total repaid</span>
                            <em>{{ toLocale(loanComponents.sumRepaid) }}</em>
                        </div>
                        <hr/>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-primary">Settle Balance</button>
                            <button class="btn btn-primary2">Recover</button>
                        </div>
                        
                    </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <Menu 
                        :items="items" 
                        :template="MenuButton" 
                        :enableSearch="false"
                        containerClass="col-4"></Menu>
                </div>
            </div>
        </div>
        <AccountIntro v-else></AccountIntro>
        
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../components/LoanIntro.vue';
    import { ref, computed, watchEffect } from 'vue';
    import { useAccountsStore } from '../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../components/Accounts/Header.vue';
    import loanPng from '../../assets/img/loan.png';
    import {useConfigStore} from '@/store/config'
    import Menu from '@/components/menu/Menu.vue'
    import _ from 'lodash';
    import MenuButton from '../../components/Menu/MenuButton.vue'
    import balance from '../components/balance.vue'
    import {Request} from '@/helpers'
    import GuarantorStatus from '../../components/GuarantorStatus.vue';

    const store = useAccountsStore()
    const auth = useAuthStore()
    const configStore = useConfigStore()
    const loanComponents = ref({})

    const u = computed(() => auth.getUser)

    const r = new Request();

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'loan', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const hasLoan = computed(() => {
      if(parseFloat(data.value?.amount) > 0 && 
      (data.value?.status == "in process" || 
      data.value?.status == "approved"|| 
      data.value?.status == "defaulted")) return true
      return false
    })

    watchEffect(async () => {
      if(data.value?.id != undefined) {
        await r.post(r.root+"/t2w/api/get-loan-components", {id: data.value?.id}).then(response => {
          loanComponents.value = response.data
        })
      }
    })

    const timeStampToDate = (timestamp) => {
        const d = new Date(parseInt(timestamp) * 1000);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`
    }

    const toLocale = (str) => {
        if(str == "" || str == undefined) str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }

    const items = computed(() => [
        {
            label: "Change Guarantors",
            link: "/loan/change-guarantor",
            isRouter: true,
            iconClass: "fa-solid fa-business-time",
            condition: ((data.value?.gt1_fullname != 'NA' && data.value?.gt1_approval != 'approved') || 
            (data.value?.gt2_fullname != 'NA' && data.value?.gt2_approval != 'approved'))
        },
        {
            label: "New Loan",
            link: "/loan/new",
            isRouter: true,
            iconClass: "fa-solid fa-hand-pointer"
        }
    ])
</script>

<style lang="scss" scoped>

</style>