<template>
    <Header :data="data" :bg="bgMap" :img="wallet" caption="E-Wallet">
      <p>A level {{ data.level }} participating member</p>
      <template #status>
        <span class="badge" 
          :class="{
            'bg-success': (data.status == 'active'), 
            'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
        </span>
        <!-- <div class="form-check form-switch">
            <input class="form-check-input" v-model="status" type="checkbox" @mousedown="updateStatus" role="switch" id="flexSwitchCheckChecked">
        </div> -->
      </template>
    </Header>
    <div class="row">
      <div class="col-md-4 animate__animated animate__pulse">
        <balance :account="account" title="E-Wallet Balance"></balance>
      </div>
      <div class="col-md-8 animate__animated animate__pulse">
        <div class="card mb-2">
          <div class="card-body upline-comp">
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="upline-tab" data-bs-toggle="pill" data-bs-target="#upline" type="button" role="tab" aria-controls="upline" aria-selected="false">Uplines</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="level-1-tab" data-bs-toggle="pill" data-bs-target="#level-1" type="button" role="tab" aria-controls="level-1" aria-selected="true">Level-1</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="level-2-tab" data-bs-toggle="pill" data-bs-target="#level-2" type="button" role="tab" aria-controls="level-2" aria-selected="false">Level-2</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="level-3-tab" data-bs-toggle="pill" data-bs-target="#level-3" type="button" role="tab" aria-controls="level-3" aria-selected="false">Level-3</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="level-4-tab" data-bs-toggle="pill" data-bs-target="#level-4" type="button" role="tab" aria-controls="level-4" aria-selected="false">Level-4</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="level-5-tab" data-bs-toggle="pill" data-bs-target="#level-5" type="button" role="tab" aria-controls="level-5" aria-selected="false">Level-5</button>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade" id="upline" role="tabpanel" aria-labelledby="upline-tab" tabindex="0">
                    <uplines :account="account"></uplines>
                </div>
                <div class="tab-pane fade show active" id="level-1" role="tabpanel" aria-labelledby="level-1-tab" tabindex="0">
                    <downlines :level="1" :account="account"></downlines>
                </div>
                <div class="tab-pane fade" id="level-2" role="tabpanel" aria-labelledby="level-2-tab" tabindex="0">
                    <downlines :level="2" :account="account"></downlines>
                </div>
                <div class="tab-pane fade" id="level-3" role="tabpanel" aria-labelledby="level-3-tab" tabindex="0">
                    <downlines :level="3" :account="account"></downlines>
                </div>
                <div class="tab-pane fade" id="level-4" role="tabpanel" aria-labelledby="level-4-tab" tabindex="0">
                    <downlines :level="4" :account="account"></downlines>
                </div>
                <div class="tab-pane fade" id="level-5" role="tabpanel" aria-labelledby="level-5-tab" tabindex="0">
                    <downlines :level="5" :account="account"></downlines>
                </div>
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
</template>

<script setup>
    import Header from './Header.vue';
    import wallet from '../../assets/img/wallet.png';
    import { useAccountsStore } from '../../store/accounts'
    import {computed, onMounted, ref, watchEffect} from 'vue'
    import bgMap from '../../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import downlines from './downlines.vue';
    import uplines from './uplines.vue';
    import balance from './balance.vue'
    import OtherBalances from './OtherBalances.vue'
    import 'animate.css'

    const store = useAccountsStore()

    const status = ref(false)

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
</script>

<style lang="scss" scoped>
    .upline-comp {
      max-height: 287px;
      overflow: auto;
    }
</style>