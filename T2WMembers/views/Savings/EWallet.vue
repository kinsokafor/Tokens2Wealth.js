<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="wallet" caption="E-Wallet">
                <p>A level {{ data.level }} participating member</p>
                <template #status>
                    <span class="badge" 
                    :class="{
                        'bg-success': (data.status == 'active'), 
                        'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
                    </span>
                </template>
            </Header>
            <div class="row">
                <div class="col-md-4">
                    <balance :ac_type="data.ac_type" title="Thrift Savings Balance" @onready="b => bal = b"></balance>
                </div>
                <div class="col-md-8 animate__animated animate__pulse">
                    <div class="card mb-2">
                        <div class="card-body upline-comp">
                            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="upline-tab" data-bs-toggle="pill" data-bs-target="#upline" type="button" role="tab" aria-controls="upline" aria-selected="false">Uplines</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="level-1-tab" data-bs-toggle="pill" data-bs-target="#level-1" type="button" role="tab" aria-controls="level-1" aria-selected="true">Level-1</button>
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
                                <div class="tab-pane fade show active" id="upline" role="tabpanel" aria-labelledby="upline-tab" tabindex="0">
                                    <uplines :account="data.ac_number"></uplines>
                                </div>
                                <div class="tab-pane fade" id="level-1" role="tabpanel" aria-labelledby="level-1-tab" tabindex="0">
                                    <downlines :level="1" :account="data.ac_number"></downlines>
                                </div>
                                <div class="tab-pane fade" id="level-2" role="tabpanel" aria-labelledby="level-2-tab" tabindex="0">
                                    <downlines :level="2" :account="data.ac_number"></downlines>
                                </div>
                                <div class="tab-pane fade" id="level-3" role="tabpanel" aria-labelledby="level-3-tab" tabindex="0">
                                    <downlines :level="3" :account="data.ac_number"></downlines>
                                </div>
                                <div class="tab-pane fade" id="level-4" role="tabpanel" aria-labelledby="level-4-tab" tabindex="0">
                                    <downlines :level="4" :account="data.ac_number"></downlines>
                                </div>
                                <div class="tab-pane fade" id="level-5" role="tabpanel" aria-labelledby="level-5-tab" tabindex="0">
                                    <downlines :level="5" :account="data.ac_number"></downlines>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>Your e-Wallet account is not yet active</div>
        
    </Restricted>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../../components/Accounts/Header.vue';
    import wallet from '../../../assets/img/wallet.png';
    import {useConfigStore} from '@/store/config'
    import _ from 'lodash';
    import balance from '../../components/balance.vue'
    import { Request, Options } from '@/helpers'
    import downlines from '../../../components/Accounts/downlines.vue';
    import uplines from '../../../components/Accounts/uplines.vue';

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
        const myAcc = store.get({ac_type: 'contribution', user_id: u.value.id})
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