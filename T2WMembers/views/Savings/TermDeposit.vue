<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="termdeposit" caption="Term Deposit">
                <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
                <template #status>
                    <span class="badge" 
                    :class="{
                        'bg-success': (data.status == 'active'), 
                        'bg-danger': (data.status == 'pending'),
                        'bg-warning text-black': (data.status == 'inactive' || data.status == 'liquidated')}">{{ data.status }}
                    </span>
                </template>
            </Header>
            <div class="row">
                <div class="col-md-4">
                    <balance :ac_type="data.ac_type" title="Term Deposit Balance" @onready="b => bal = b"></balance>
                </div>
                <div class="col-md-4 animate__animated animate__pulse" v-if="bal > 0">
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
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <Menu 
                        :items="items" 
                        :template="MenuButton" 
                        :enableSearch="false"
                        containerClass="col-4"></Menu>
                </div>
            </div>
        </div>
        <AccountIntro v-else></AccountIntro>
        
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../../components/TermDepositIntro.vue';
    import { ref, computed } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../../components/Accounts/Header.vue';
    import termdeposit from '../../../assets/img/term-deposit.png';
    import {useConfigStore} from '@/store/config'
    import Menu from '@/components/menu/Menu.vue'
    import _ from 'lodash';
    import MenuButton from '../../../components/Menu/MenuButton.vue'
    import balance from '../../components/balance.vue'

    const store = useAccountsStore()
    const auth = useAuthStore()
    const configStore = useConfigStore()
    const bal = ref(0)

    const u = computed(() => auth.getUser)

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'term_deposit', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const timeStampToDate = (timestamp) => {
        const d = new Date(parseInt(timestamp) * 1000);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`
    }

    const toLocale = (str) => {
        if(str == "") str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }

    const items = computed(() => [
        {
            label: "New term deposit",
            link: "/savings/term-deposit/new",
            isRouter: true,
            iconClass: "fa-solid fa-business-time",
            condition: (data.value.status == "liquidated")
        },
        {
            label: "Top-up term deposit",
            link: "/savings/term-deposit/top-up",
            isRouter: true,
            iconClass: "fa-solid fa-hand-pointer",
            condition: (data.value.status == "active")
        }
    ])
</script>

<style lang="scss" scoped>

</style>