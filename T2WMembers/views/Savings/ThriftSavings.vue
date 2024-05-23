<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="thriftsavings" caption="Regular Thrift Savings">
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
                    <balance :ac_type="data.ac_type" title="Thrift Savings Balance" @onready="b => bal = b"></balance>
                </div>
                <div class="col-md-4 animate__animated animate__pulse" v-if="bal > 0">
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">Particulars</h5>
                            <div class="justify-content-between d-flex">
                                <span>Monthly Contribution</span>
                                <em>{{ toLocale(data.amount) }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Next Settlement Date</span>
                                <em>{{ nsd }}</em>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <AccountIntro v-else></AccountIntro>
        
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../../components/TermDepositIntro.vue';
    import { ref, computed, onMounted } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../../components/Accounts/Header.vue';
    import thriftsavings from '../../../assets/img/thrift.png';
    import {useConfigStore} from '@/store/config'
    import _ from 'lodash';
    import balance from '../../components/balance.vue'
    import { Request, Options } from '@/helpers'

    const store = useAccountsStore()
    const auth = useAuthStore()
    const configStore = useConfigStore()
    const bal = ref(0)
    const r = new Request()
    const nsd = ref("-")
    const rt_review = ref(12)
    const regava = ref(false)

    const u = computed(() => auth.getUser)

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'regular_thrift', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const toLocale = (str) => {
        if(str == "") str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }

    onMounted(() => {
        r.post(r.root+"/t2w/api/thrift/next-settlement-date").then(res => {
            nsd.value = res.data
        })

        const options = new Options()
        options.get("regava,rt_review").then(res => {
            
        })
    })
</script>

<style lang="scss" scoped>

</style>