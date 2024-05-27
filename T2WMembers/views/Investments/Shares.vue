<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="shares" caption="Shares">
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
                            <!-- <div class="justify-content-between d-flex">
                                <span>Monthly Contribution</span>
                                <em>{{ toLocale(parseFloat(data.amount)) }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Next Settlement Date</span>
                                <em>{{ nsd }}</em>
                            </div>
                            <hr> -->
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <AccountIntro v-else></AccountIntro>
        
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../../components/SharesIntro.vue';
    import { ref, computed, onMounted } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../../components/Accounts/Header.vue';
    import shares from '../../../assets/img/share.png';
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
    const regava = ref([])

    const u = computed(() => auth.getUser)

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'share', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })
    
    onMounted(() => {
        r.post(r.root+"/t2w/api/thrift/next-settlement-date").then(res => {
            nsd.value = res.data
        })

        const options = new Options()
        options.get("regava,rt_review").then(res => {
            rt_review.value = res.data.rt_review
            regava.value = res.data.regava
        })
    })

    const canEdit = computed(() => {
        const date = new Date()
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const thisMonth = months[date.getMonth()];
        const testA = regava.value.map(i => i.month).includes(thisMonth)
        const testB = ((parseInt((data.value?.last_updated ?? 0)) + parseInt(rt_review.value)*60*60*24*30) * 1000) < date.getTime();
        return testB && testA
    })
</script>

<style lang="scss" scoped>

</style>