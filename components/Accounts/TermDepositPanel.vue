<template>
    <Header :data="data" :bg="bgMap" :img="termdeposit" caption="Term Deposit">
      <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
      <template #status>
        <span class="badge" 
          :class="{
            'bg-success': (data.status == 'active'), 
            'bg-danger': (data.status == 'pending'), 
            'bg-warning text-black': (data.status == 'inactive' || data.status == 'liquidated')}">{{ data.status }}
        </span>
        <div class="form-check form-switch" v-if="data.status != 'pending' && data.status != 'liquidated'">
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
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Tenure Started</span>
              <em>{{ timeStampToDate(data.tenure_begins) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Maturity</span>
              <em>{{ timeStampToDate(data.maturity) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Interest Earned</span>
              <em>{{ toLocale(parseFloat(data.interest_earned)) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status == 'pending'">
              <span></span>
              <em><router-link :to="`/accounts/term-deposit/${data.ac_number}/modify`" class="link-success">Modify</router-link></em>
            </div>
            <hr/>
            <button class="btn btn-primary2" v-if="data.status != 'pending'" @click.prevent="liquidate">Liquidate</button>
            <div class="d-flex gap-2 justify-content-between buttons" v-else>
              <button  class="btn btn-primary2 red" @click.prevent="decline">Decline</button>
              <button  class="btn btn-primary2" @click.prevent="approve">Approve</button>
            </div>
            <loading :active="processing" 
              :can-cancel="true" 
              :is-full-page=false></loading>
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
        <PendingCredits :account="account"></PendingCredits>
      </div>
    </div>
</template>

<script setup>
    import Header from './Header.vue';
    import termdeposit from '../../assets/img/term-deposit.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingCredits from './PendingCredits.vue';
    import {computed, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const store = useAccountsStore()

    const status = ref(false)

    const configStore = useConfigStore()

    const bal = ref(0)

    const r = new Request();

    const processing = ref(false)
    
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

    const updateData = (response) => {
      const meta = JSON.parse(response.data.meta)
      delete response.data.meta
      let i = { ...response.data, ...meta }
      const index = store.data.findIndex(j => j.id == i.id)
      if (index == -1) {
        store.data = [...store.data, i]
      } else {
          if (!_.isEqual(store.data[index], i)) {
            store.data[index] = i
          }
      }
    }

    const approve = () => {
      if(confirm("Are you sure you want to approve this term deposit?")) {
        processing.value = true
        r.post(r.root+"/t2w/api/term-deposit/approve/"+data.value.id).then(response => {
          updateData(response);
          processing.value = false
        }).catch(e => {
          processing.value = false
        })
      }
    }

    const decline = () => {
      if(confirm("Are you sure you want to decline this term deposit?")) {
        processing.value = true
        r.post(r.root+"/t2w/api/term-deposit/decline/"+data.value.id).then(response => {
          updateData(response);
          processing.value = false
        }).catch(e => {
          processing.value = false
        })
      }
    }
    
    const liquidate = () => {
      if(confirm("Are you sure you want to liquidate this term deposit?")) {
        if(confirm("Do you want to liquidate without paying interest except the deposit is past maturity date? Click cancel for other options.")) {
          processing.value = true
          r.post(r.root+"/t2w/api/term-deposit/liquidate/"+data.value.id).then(response => {
            updateData(response);
            processing.value = false
          }).catch(e => {
            processing.value = false
          })
        } else {
          if(confirm("Click okay to liquidate with all the interests earned over the period invested. Click cancel to exit.")) {
            processing.value = true
            r.post(r.root+"/t2w/api/term-deposit/liquidate/"+data.value.id, {withInterest: true}).then(response => {
              updateData(response);
              processing.value = false
            }).catch(e => {
              processing.value = false
            })
          }
        }
      }
    }
</script>

<style lang="scss" scoped>
    
</style>