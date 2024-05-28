<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="shares" caption="Shares">
                <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
                <template #status>
                    <!-- <span class="badge" 
                    :class="{
                        'bg-success': (data.status == 'active'), 
                        'bg-danger': (data.status == 'pending'),
                        'bg-warning text-black': (data.status == 'inactive' || data.status == 'liquidated')}">{{ data.status }}
                    </span> -->
                </template>
            </Header>
            <div class="row">
                <div class="col-md-4">
                    <balance :ac_type="data.ac_type" title="Shares Balance" @onready="b => bal = b"></balance>
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
                            <hr>
                            <div class="d-flex gap-2 justify-content-between buttons">
                                <router-link  class="btn btn-primary2 red" to="/investments/shares/sell">Sell</router-link>
                                <router-link  class="btn btn-primary2" to="/investments/shares/buy">Buy</router-link>
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
    import AccountIntro from '../../components/SharesIntro.vue';
    import { ref, computed, onMounted } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Header from '../../../components/Accounts/Header.vue';
    import shares from '../../../assets/img/share.png';
    import {useConfigStore} from '@/store/config'
    import _ from 'lodash';
    import balance from '../../components/balance.vue'
    import { Options } from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const store = useAccountsStore()
    const auth = useAuthStore()
    const configStore = useConfigStore()
    const bal = ref(0)
    const shareUnit = ref(0)

    const u = computed(() => auth.getUser)

    const currentShareValue = computed(() => bal.value * shareUnit.value);

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'share', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    onMounted(() => {
        const options = new Options()
        options.get("share_unit").then(res => {
            shareUnit.value = res.data
        })
    })
</script>

<style lang="scss" scoped>

</style>