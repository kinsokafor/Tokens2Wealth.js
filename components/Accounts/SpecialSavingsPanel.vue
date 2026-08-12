<template>
    <Header :data="data" :bg="bgMap" :img="wallet" caption="Special Savings">
      <p>Special Savings ledger for {{ getFullname(data) }}</p>
      <template #status>
        <span class="badge"
          :class="{
            'bg-success': (data.status == 'active'),
            'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
        </span>
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="Total in Special Savings ledger (all goals combined)"></balance>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-md-12">
        <h5>Goals</h5>
        <loading :active="processing" :can-cancel="true" :is-full-page=false></loading>
        <div v-if="goals.length > 0">
          <div class="card mb-2" v-for="goal in goals" :key="goal.id">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title mb-0">{{ goal.goal_name }}</h5>
                <span class="badge" :class="{
                    'bg-success': goal.status == 'active',
                    'bg-primary': goal.status == 'matured'
                  }">{{ goal.status }}</span>
              </div>
              <div class="progress mt-2 mb-2" style="height: 10px;">
                <div class="progress-bar bg-success" role="progressbar" :style="{width: percent(goal)+'%'}"></div>
              </div>
              <div class="justify-content-between d-flex">
                <span>Saved so far</span>
                <em>{{ toLocale(parseFloat(goal.total_contributed)) }}</em>
              </div>
              <div class="justify-content-between d-flex">
                <span>Target</span>
                <em>{{ toLocale(parseFloat(goal.target_amount)) }}</em>
              </div>
              <div class="justify-content-between d-flex">
                <span>Contribution</span>
                <em>{{ toLocale(parseFloat(goal.contribution_amount)) }} {{ goal.frequency }}</em>
              </div>
              <div class="justify-content-between d-flex" v-if="goal.status == 'active'">
                <span>Next due</span>
                <em>{{ goal.next_due_date }}</em>
              </div>
              <div class="justify-content-between d-flex">
                <span>Maturity date</span>
                <em>{{ goal.maturity_date }}</em>
              </div>
              <template v-if="goal.status == 'active'">
                <hr/>
                <button class="btn btn-primary2" @click.prevent="forceMature(goal)">Force Mature</button>
              </template>
            </div>
          </div>
        </div>
        <div v-else-if="!processing">
          <em>This cooperator has no Special Savings goals yet</em>
        </div>
      </div>
    </div>
</template>

<script setup>
    import Header from './Header.vue';
    import wallet from '../../assets/img/wallet.png';
    import { useAccountsStore } from '../../store/accounts'
    import { computed, ref, watch } from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import { Request, getFullname } from '@/helpers'
    import balance from './balance.vue'
    import 'animate.css'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import { useAlertStore } from '@/store/alert'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const store = useAccountsStore();
    const alertStore = useAlertStore();
    const r = new Request();
    const processing = ref(false)
    const goals = ref([])

    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    function percent(goal) {
        const target = parseFloat(goal.target_amount)
        const contributed = parseFloat(goal.total_contributed)
        if(!target || target <= 0) return 0
        return Math.min(100, Math.round((contributed / target) * 100))
    }

    function fetchGoals() {
        if(!data.value?.user_id) return
        processing.value = true
        r.get(r.root+`/t2w/api/special-savings/goals/user/${data.value.user_id}`).then(res => {
            goals.value = res.data
            processing.value = false
        }).catch(() => {
            processing.value = false
        })
    }

    watch(() => data.value?.user_id, (userId) => {
        if(userId != undefined) fetchGoals()
    }, { immediate: true })

    function forceMature(goal) {
        if(confirm(`Are you sure you want to force-mature the goal "${goal.goal_name}"? This will immediately pay out NGN ${toLocale(parseFloat(goal.total_contributed))} to the cooperator's e-wallet and cancel any pending debit for this goal.`)) {
            processing.value = true
            r.post(r.root+`/t2w/api/special-savings/goal/${goal.id}/force-mature`).then(() => {
                alertStore.success("Goal matured successfully")
                fetchGoals()
            }).catch(e => {
                alertStore.error(e.response?.data ?? "Something went wrong")
                processing.value = false
            })
        }
    }
</script>

<style lang="scss" scoped>

</style>
