<template>
    <Header :data="data" :bg="bgMap" :img="wallet" caption="E-Wallet">
      <p>A level {{ data.level }} participating member</p>
      <template #status>
        <span class="badge text-capitalize" :class="data.status === 'active' ? 'bg-success' : 'bg-secondary'">{{ data.status || "…" }}</span>
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
            <!-- only the open tab is rendered, so each list loads when it is first opened
                 (the uplines and all five levels used to load together when the page opened) -->
            <ul class="nav nav-pills mb-3" role="tablist">
                <li class="nav-item" role="presentation" v-for="t in tabs" :key="t.key">
                    <button class="nav-link" :class="{ active: activeTab === t.key }" type="button" role="tab"
                        :aria-selected="activeTab === t.key" @click="activeTab = t.key">{{ t.label }}</button>
                </li>
            </ul>
            <div>
                <uplines v-if="activeTab === 'uplines'" :account="account"></uplines>
                <template v-for="level in 5" :key="level">
                    <downlines v-if="activeTab === level" :level="level" :account="account"></downlines>
                </template>
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
      <div class="col-md-12">
        <Menu :items="items"></Menu>
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
    import Menu from '@/components/menu/Menu.vue'
    import PendingDebits from './PendingDebits.vue';

    const store = useAccountsStore()

    const status = ref(false)

    const tabs = [{ key: 'uplines', label: "Uplines" }, ...[1, 2, 3, 4, 5].map(l => ({ key: l, label: `Level-${l}` }))]
    const activeTab = ref(1)

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
    // /accounts/post/credit/:accountNumber
    const items = computed(() => [
      {
        label: "Credit E-wallet",
        isRouter: false,
        link: `/t2w/a/#/accounts/post/credit/${props.account}`,
        iconClass: "fa-solid fa-file-circle-plus"
      },
      {
        label: "Debit E-wallet",
        isRouter: false,
        link: `/t2w/a/#/accounts/post/debit/${props.account}`,
        iconClass: "fa-solid fa-file-circle-minus"
      }
    ])
</script>

<style lang="scss" scoped>
    .upline-comp {
      max-height: 287px;
      overflow: auto;
    }
</style>