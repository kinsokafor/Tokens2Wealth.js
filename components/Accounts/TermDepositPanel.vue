<template>
    <Header :data="data" :bg="bgMap" :img="termdeposit" caption="Term Deposit">
      <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
      <template #status>
        <span class="badge" 
          :class="{
            'bg-success': (data.status == 'active'), 
            'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
        </span>
        <div class="form-check form-switch">
            <input class="form-check-input" v-model="status" type="checkbox" @mousedown="updateStatus" role="switch" id="flexSwitchCheckChecked">
        </div>
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="Term Deposit Balance" @onready="b => bal = b"></balance>
      </div>
      <div class="col-md-4 animate__animated animate__pulse" v-show="bal > 0">
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">Term Deposit Particulars</h5>
            <div class="justify-content-between d-flex">
              <span>Rate</span>
              <em>{{ data.td_rate }}%</em>
            </div>
            <div class="justify-content-between d-flex">
              <span>Tenure</span>
              <em>{{ data.td_tenure }} month(s)</em>
            </div>
            <div class="justify-content-between d-flex">
              <span>Tenure Started</span>
              <em>{{ timeStampToDate(data.tenure_begins) }}</em>
            </div>
            <div class="justify-content-between d-flex">
              <span>Maturity</span>
              <em>{{ timeStampToDate(data.maturity) }}</em>
            </div>
            <div class="justify-content-between d-flex">
              <span>Interest Earned</span>
              <em>{{ toLocale(parseFloat(data.interest_earned)) }}</em>
            </div>
            <hr/>
            <button class="btn btn-primary2">Liquidate</button>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 animate__animated animate__pulse">
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
    import termdeposit from '../../assets/img/term-deposit.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingDebits from './PendingDebits.vue';
    import {computed, onMounted, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'

    const store = useAccountsStore()

    const status = ref(false)

    const configStore = useConfigStore()

    const bal = ref(0)

    const r = new Request();
    
    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    watchEffect(() => {
      if(data.value?.status == 'active') {
        status.value = true
      } else {
        status.value = false
      }
    })

    const toLocale = (str) => {
        if(str == "") str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }

    const timeStampToDate = (timestamp) => {
        const d = new Date(parseInt(timestamp) * 1000);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`
    }

    const updateStatus = () => {
      if(confirm(`Are you sure you want to ${status.value ? 'deactivate' : 'activate'} this account?`)) {
        r.post(r.root+"/t2w/api/account/edit-status", {
          id: data.value.id,
          status: status.value ? 'inactive' : 'active'
        }).then(r => {
            let i = r.data
            i = { ...i, ...(JSON.parse(i.meta)) }
            delete i.meta
            const index = store.data.findIndex(j => j.id == i.id)
            if (index == -1) {
                store.data = [...store.data, i]
            } else {
                if (!_.isEqual(store.data[index], i)) {
                    store.data[index] = i
                }
            }
        })
      } else {
        status.value = !status.value
      }
    }
</script>

<style lang="scss" scoped>
    
</style>