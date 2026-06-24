<template>
    <Header :data="data" :bg="bgMap" :img="termdeposit" caption="Term Deposit">
      <p v-if="data.status == 'active'">Monthly savings with {{configStore.get("site_name")}} as from {{ timeStampToDate(data.tenure_begins) }}</p>
      <div class="alert alert-info" v-if="data.status == 'active'">
        Saved {{ toLocale(parseFloat(data.balance)) }} for {{ otherData?.totalDays }} days, an an interest rate of {{ data.td_rate }}% per annum. Currently at day {{ otherData?.daysSpent }}<template v-if="remainingDays > 0">, remaining {{ remainingDays }} day<template v-if="remainingDays > 1">s</template> to maturity</template>.
      </div>
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
              <span>Daily Interest</span>
              <em>{{ toLocale(parseFloat(dailyInterest)) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Interest Earned</span>
              <em>{{ toLocale(parseFloat(data.interest_earned)) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Outstanding Interest</span>
              <em>{{ toLocale(parseFloat(otherData?.outstanding)) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status != 'pending'">
              <span>Estimated MV</span>
              <em>{{ toLocale(parseFloat(emv)) }}</em>
            </div>
            <div class="justify-content-between d-flex" v-if="data.status == 'pending'">
              <span></span>
              <em><router-link :to="`/accounts/term-deposit/${data.ac_number}/modify`" class="link-success">Modify</router-link></em>
            </div>
            <hr/>
            <div class="d-flex gap-2 justify-content-between buttons" v-if="data.status != 'pending'">
            <button class="btn btn-primary2" @click.prevent="liquidate">Liquidate</button>
            <button class="btn btn-primary2" @click.prevent="rollover" v-if="remainingDays <= 0">Roll over</button>
            </div>
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
    import {computed, ref, watchEffect, onMounted} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import { useAlertStore } from '@/store/alert'

    const store = useAccountsStore();

    const alertStore = useAlertStore();

    const status = ref(false)

    const configStore = useConfigStore()

    const bal = ref(0)

    const r = new Request();

    const processing = ref(false)
    
    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    const otherData = ref(null);

    const dailyInterest = computed(() => (data.value?.td_rate*bal.value)/36000)

    const emv = computed(() => {
      return bal.value + (dailyInterest.value * data.value?.td_tenure * 30)
    })

    const remainingDays = computed(() => Math.max(0, otherData.value?.totalDays - otherData.value?.daysSpent));

    watchEffect(() => {
      if(data.value?.status == 'active') {
        status.value = true
      } else {
        status.value = false
      }
    })

    async function fetchData()
    {
      const res = await r.get(r.root+`/t2w/api/term-deposit/data/${props.account}`)
      if(res.status === 200) {
        return res.data;
      }
    }

    onMounted(async () => {
      const t = await fetchData();
      otherData.value = t;
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
            fetchData();
            alertStore.success("Done");
            processing.value = false
          }).catch(e => {
            alertStore.error(e);
            processing.value = false
          })
        } else {
          if(confirm("Click okay to liquidate with all the interests earned over the period invested. Click cancel to exit.")) {
            processing.value = true
            r.post(r.root+"/t2w/api/term-deposit/liquidate/"+data.value.id, {withInterest: true}).then(response => {
              updateData(response);
              fetchData();
              alertStore.success("Done");
              processing.value = false
            }).catch(e => {
              alertStore.error(e);
              processing.value = false
            })
          }
        }
      }
    }

    const rollover = () => {
      if(confirm("Are you sure you want to rollover this term deposit?")) {
        if(confirm("Do you want to roll over with the interest. Meaning that the interest will be reinvested? Click cancel for other options.")) {
          processing.value = true
          r.post(r.root+"/t2w/api/term-deposit/roll-over/"+data.value.id, {withInterest: true}).then(response => {
            updateData(response);
            fetchData();
            alertStore.success("Done");
            processing.value = false
          }).catch(e => {
            console.log(e)
            alertStore.error(e);
            processing.value = false
          })
        } else {
          if(confirm("Click okay to roll over the principal amount only, interest will be paid into the e-wallet. Click cancel to exit.")) {
            processing.value = true
            r.post(r.root+"/t2w/api/term-deposit/roll-over/"+data.value.id, {withInterest: false}).then(response => {
              updateData(response);
              fetchData();
              alertStore.success("Done");
              processing.value = false
            }).catch(e => {
              alertStore.error(e);
              processing.value = false
            })
          }
        }
      }
    }
</script>

<style lang="scss" scoped>
    
</style>