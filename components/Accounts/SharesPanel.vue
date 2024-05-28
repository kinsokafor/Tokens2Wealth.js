<template>
    <Header :data="data" :bg="bgMap" :img="share" caption="Shares">
      <p></p>
      <template #status>
        <!-- <span class="badge" 
          :class="{
            'bg-success': (data.status == 'active'), 
            'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
        </span> -->
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="Shares Balance" suffix=" units"  @onready="b => bal = b"></balance>
      </div>
      <div class="col-md-4 animate__animated animate__pulse">
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">Particulars</h5>
            <div class="justify-content-between d-flex">
                <span>Cost of each unit</span>
                <em>{{ toLocale(parseFloat(shareUnit)) }}</em>
            </div>
            <div class="justify-content-between d-flex">
                <span>Current share value</span>
                <em>{{ toLocale(currentShareValue) }}</em>
            </div>
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
    import share from '../../assets/img/share.png';
    import { useAccountsStore } from '../../store/accounts'
    import PendingDebits from './PendingCredits.vue';
    import {computed, ref, onMounted} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'
    import { Options } from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const store = useAccountsStore()

    const bal = ref(0)

    const shareUnit = ref(0)

    const currentShareValue = computed(() => bal.value * shareUnit.value);
    
    const props = defineProps({
        account: String
    })

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    onMounted(() => {
        const options = new Options()
        options.get("share_unit").then(res => {
            shareUnit.value = res.data
        })
    })
</script>

<style lang="scss" scoped>
    
</style>