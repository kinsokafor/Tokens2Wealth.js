<template>
    <Header :data="data" :bg="bgMap" :img="share" caption="Shares">
      <p></p>
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
        <balance :account="account" title="Shares Balance" suffix=" units"></balance>
      </div>
      <div class="col-md-4 animate__animated animate__pulse">
        <!-- <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">Monthly Contribution</h5>
            <p class="card-text">{{toLocale(parseFloat(data?.amount ?? 0))}}</p>
            <router-link :to="`/accounts/thrift/${account}/edit`" class="btn btn-primary">Edit Amount</router-link>
          </div>
        </div> -->
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
    import share from '../../assets/img/share.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingDebits from './PendingCredits.vue';
    import {computed, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'

    const store = useAccountsStore()

    const status = ref(false)
    
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
</script>

<style lang="scss" scoped>
    
</style>