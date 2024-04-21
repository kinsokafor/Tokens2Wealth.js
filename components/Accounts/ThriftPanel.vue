<template>
    <Header :data="data" :bg="bgMap" :img="thrift" caption="Regular Thrift">
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
        <balance :account="account" title="Thrift Savings Balance"></balance>
      </div>
      <div class="col-md-4 animate__animated animate__pulse">
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">Monthly Contribution</h5>
            <p class="card-text">{{toLocale(parseFloat(data?.amount ?? 0))}}</p>
            <router-link :to="`/accounts/thrift/${account}/edit`" class="btn btn-primary">Edit Amount</router-link>
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
    import thrift from '../../assets/img/thrift.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingDebits from './PendingCredits.vue';
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