<template>
    <!-- {{ data }} -->
    <Header :data="data" :bg="bgMap" :img="loan" caption="Loan">
      <p>Last approved loan with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
      <template #status>
        <span class="badge" 
          :class="{
            'bg-success': (data.status == 'approved'), 
            'bg-danger': (data.status == 'defaulted'), 
            'bg-primary': (data.status == 'cleared')}">{{ data.status }}
        </span>
        <!-- <div class="form-check form-switch">
            <input class="form-check-input" v-model="status" type="checkbox" @mousedown="updateStatus" role="switch" id="flexSwitchCheckChecked">
        </div> -->
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <div class="card mb-2">
          <div class="card-body">
            <loading :active="processing2" 
            :can-cancel="true" 
            :is-full-page=false></loading>
            <h5 class="card-title">Loan Balance</h5>
            <p class="card-text">
              {{toLocale(balance)}} 
              <small class="text-danger" v-if="isTrial">
                <em>as at {{ date }}</em>
                <a href="javaScript:void(0)" @click.prevent="resetTrial">Reset</a>
              </small>
            </p>
            <router-link :to="`/accounts/statement/${account}`" class="btn btn-primary2">View Statement</router-link>
          </div>
        </div>
        <ol class="list-group list-group-numbered mb-2">
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <!-- <div class="fw-bold">Subheading</div> -->
              Credits
            </div>
            <span class="badge text-bg-success rounded-pill">{{toLocale(credits)}}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <!-- <div class="fw-bold">Subheading</div> -->
              Debits
            </div>
            <span class="badge text-bg-danger rounded-pill">{{toLocale(debits)}}</span>
          </li>
        </ol>
        
        <div class="input-group mb-3">
          <loading :active="processing" 
            :can-cancel="true" 
            :is-full-page=false></loading>
          <input type="date" class="form-control" v-model="date"/>
          <button class="btn btn-outline-secondary" type="button" @click.prevent="getTrialBalance">Get trial balance</button>
        </div>

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
    import {computed, onMounted, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import 'animate.css'

    const store = useAccountsStore()

    const status = ref(false)

    const configStore = useConfigStore()

    const processing = ref(false)

    const processing2 = ref(false)

    const isTrial = ref(false)

    const r = new Request();

    const balance = ref(0)

    const credits = ref(0)

    const debits = ref(0)

    const date = ref(null)

    const loanComponents = ref({})

    const props = defineProps({
        account: String
    })

    onMounted(() => {
      resetTrial()
    })

    const getTrialBalance = () => {
      processing.value = true
      r.post(r.root+"/t2w/api/break-down/"+props.account, {date: `${date.value} 23:59:59`}).then(r => {
        balance.value = r.data.credits - r.data.debits
        credits.value = r.data.credits
        debits.value = r.data.debits
        isTrial.value = true
        processing.value = false
      }).catch(e => {
        processing.value = false
      })
    }

    const resetTrial = () => {
      processing2.value = true
      r.post(r.root+"/t2w/api/break-down/"+props.account).then(r => {
        balance.value = r.data.credits - r.data.debits
        credits.value = r.data.credits
        debits.value = r.data.debits
        isTrial.value = false
        processing2.value = false
      }).catch(e => {
        processing2.value = false
      })
    }

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

    // const updateStatus = () => {
    //   if(confirm(`Are you sure you want to ${status.value ? 'deactivate' : 'activate'} this account?`)) {
    //     r.post(r.root+"/t2w/api/account/edit-status", {
    //       id: data.value.id,
    //       status: status.value ? 'inactive' : 'active'
    //     }).then(r => {
    //         let i = r.data
    //         i = { ...i, ...(JSON.parse(i.meta)) }
    //         delete i.meta
    //         const index = store.data.findIndex(j => j.id == i.id)
    //         if (index == -1) {
    //             store.data = [...store.data, i]
    //         } else {
    //             if (!_.isEqual(store.data[index], i)) {
    //                 store.data[index] = i
    //             }
    //         }
    //     })
    //   } else {
    //     status.value = !status.value
    //   }
    // }
</script>

<style lang="scss" scoped>
    
</style>