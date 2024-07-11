<template>
    <Header :data="data" :bg="bgMap" :img="loan" caption="Loan">
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
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="Loan Balance" @onready="b => loanBalance = b"></balance>
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
      <div class="col-md-4 animate__animated animate__pulse">
        <loading :active="processing" 
            :can-cancel="true" 
            :is-full-page=false></loading>
        <Restricted access="1,2" class="card mb-2" v-if="enableApproval()">
          <div class="card-body">
            <h5 class="card-title">Approval</h5>
            <hr>
            <div class="d-flex gap-2 justify-content-between buttons">
                <button  class="btn btn-primary2 red" @click.prevent="decline">Decline</button>
                <button  class="btn btn-primary2" @click.prevent="approve">Approve</button>
            </div>
          </div>
          <template #message>
            <span></span>
          </template>
        </Restricted>
        <div class="card mb-2" v-if="hasLoan && data.status != 'in process'">
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
              <button class="btn btn-primary" @click.prevent="settle">Settle Balance</button>
              <button class="btn btn-primary2" @click.prevent="recover">Recover</button>
            </div>
            
          </div>
        </div>
        <div v-else>
          <div class="card mb-2" v-if="loanBalance != 0">
            <div class="card-body">
              <button class="btn btn-primary" @click.prevent="settle">Settle Balance</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <OtherBalances :account="account" :userId="data.user_id"></OtherBalances>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mt-4">
        <PendingCredits :account="account"></PendingCredits>
      </div>
    </div>
</template>

<script setup>
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import Header from './Header.vue';
    import loan from '../../assets/img/loan.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingCredits from './PendingCredits.vue';
    import {computed, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import OtherBalances from './OtherBalances.vue'
    import balance from './balance.vue'
    import 'animate.css'
    import GuarantorStatus from '../GuarantorStatus.vue';
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()

    const alertStore = useAlertStore()

    const status = ref(false)

    const configStore = useConfigStore()

    const r = new Request();

    const loanComponents = ref({})

    const processing = ref(false)

    const loanBalance = ref(0)

    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    const hasLoan = computed(() => {
      if(parseFloat(data.value?.amount) > 0 && 
      (data.value?.status == "in process" || 
      data.value?.status == "approved"|| 
      data.value?.status == "defaulted")) return true
      return false
    })

    watchEffect(() => {
      if(data.value?.status == 'active') {
        status.value = true
      } else {
        status.value = false
      }
    })

    watchEffect(async () => {
      if(data.value?.id != undefined) {
        await r.post(r.root+"/t2w/api/get-loan-components", {id: data.value?.id}).then(response => {
          loanComponents.value = response.data
        })
      }
    })

    const enableApproval = () => {
      if(data.value?.gt1_id == "NA" 
          && data.value?.gt2_id == "NA" 
          && data.value?.status == "in process") {
        return true
      }
      else if(data.value?.gt1_approval == "approved" 
          && data.value?.gt2_approval == "approved" 
          && data.value?.status == "in process") {
        return true
      } else return false
    }

    const approve = async () => {
      if(confirm("Are you sure you want to approve this loan application?")) {
        processing.value = true
        await r.post(r.root+"/t2w/api/approve-loan", {id: data.value?.id}).then(response => {
          const meta = JSON.parse(response.data.meta)
          delete response.data.meta
          let i = { ...response.data, ...meta }
          const index = store.data.findIndex(j => j.id == i.id)
          if (index == -1) {
            store.data = [...store.data, i]
          } else {
            store.data[index] = i
          }
          processing.value = false
        })
      }
    }

    const decline = async () => {
      if(confirm("Are you sure you want to decline this loan application?")) {
        processing.value = true
        await r.post(r.root+"/t2w/api/decline-loan", {id: data.value?.id}).then(response => {
          const meta = JSON.parse(response.data.meta)
          delete response.data.meta
          let i = { ...response.data, ...meta }
          const index = store.data.findIndex(j => j.id == i.id)
          if (index == -1) {
            store.data = [...store.data, i]
          } else {
            store.data[index] = i
          }
          processing.value = false
        })
      }
    }

    const settle = async () => {
      if(data.value?.ac_number == undefined) return;
      if(confirm("Are you sure you want to debit the ewallet account to clear this loan?")) {
        processing.value = true
        await r.post(r.root+"/t2w/api/settle-loan", {ac_number: data.value?.ac_number, user_id: data.value?.user_id}).then(response => {
          const meta = JSON.parse(response.data.meta)
          delete response.data.meta
          let i = { ...response.data, ...meta }
          const index = store.data.findIndex(j => j.id == i.id)
          if (index == -1) {
            store.data = [...store.data, i]
          } else {
            store.data[index] = i
          }
          processing.value = false
        }).catch(e => {
          alertStore.add(e.response.data, "danger")
        })
      }
    }

    const recover = async () => {
      if(data.value?.ac_number == undefined) return;
      if(confirm("Are you sure you want to recover this loan?")) {
        processing.value = true
        await r.post(r.root+"/t2w/api/recover-loan", {ac_number: data.value?.ac_number, user_id: data.value?.user_id}).then(response => {
          const meta = JSON.parse(response.data.meta)
          delete response.data.meta
          let i = { ...response.data, ...meta }
          const index = store.data.findIndex(j => j.id == i.id)
          if (index == -1) {
            store.data = [...store.data, i]
          } else {
            store.data[index] = i
          }
          processing.value = false
        }).catch(e => {
          alertStore.add(e.response.data, "danger")
        })
      }
    }
</script>

<style lang="scss" scoped>
    
</style>