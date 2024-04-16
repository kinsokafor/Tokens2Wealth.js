<template>
    <Header :data="data" :bg="bgMap" :img="loan" caption="Loan">
      <p>Last approved loan with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
      <template #status>
        <span class="badge" 
          :class="{
            'bg-success': (data.status == 'approved'), 
            'bg-danger': (data.status == 'defaulted'), 
            'bg-primary': (data.status == 'cleared')}">{{ data.status }}
        </span>
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="Loan Balance"></balance>
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
                <em>{{data.gt1_fullname}}</em>
                <br/>
                <em><small>ID: {{ data.gt1_id }}</small></em>
              </span>
            </div>
            <div class="justify-content-between d-flex" v-if="data.gt2_fullname != 'NA'">
              <span>Second Guarantor</span>
              <span style="text-align: end;">
                <em>{{data.gt2_fullname}}</em>
                <br/>
                <em><small>ID: {{ data.gt2_id }}</small></em>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 animate__animated animate__pulse" v-if="hasLoan">
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
    </div>
    <div class="row">
      <div class="col-md-12">
        <OtherBalances :account="account" :userId="data.user_id"></OtherBalances>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mt-4">
        <PendingDebits :account="account"></PendingDebits>
      </div>
    </div>
</template>

<script setup>
    import Header from './Header.vue';
    import loan from '../../assets/img/loan.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingDebits from './PendingDebits.vue';
    import {computed, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import OtherBalances from './OtherBalances.vue'
    import balance from './balance.vue'
    import 'animate.css'

    const store = useAccountsStore()

    const status = ref(false)

    const configStore = useConfigStore()

    const r = new Request();

    const loanComponents = ref({})

    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    const hasLoan = computed(() => {
      if(parseFloat(data.value?.amount) > 0) return true
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

    const toLocale = (str) => {
        if(str == "" || str == undefined) str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }
</script>

<style lang="scss" scoped>
    
</style>