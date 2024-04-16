<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <div class="hasAccount"  v-if="!_.isEmpty(data)">
            <Header :data="data" :bg="bgMap" :img="termdeposit" caption="Term Deposit">
                <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
                <template #status>
                    <span class="badge" 
                    :class="{
                        'bg-success': (data.status == 'active'), 
                        'bg-warning text-black': (data.status == 'inactive')}">{{ data.status }}
                    </span>
                </template>
            </Header>
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
    import _ from 'lodash';

    const store = useAccountsStore()
    const auth = useAuthStore()
    const configStore = useConfigStore()

    const u = computed(() => auth.getUser)

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'term_deposit', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })
</script>

<style lang="scss" scoped>

</style>