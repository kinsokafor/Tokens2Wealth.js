<template>
    <div class="card">
        <div class="card-body">
            
            <div class="row justify-content-between">
                <div class="col-md-5 col-sm-6">
                    <account-card :data="accountsStore.get({ac_number: txn.account})[0] ?? {}"></account-card>
                </div>
                <restricted access="1,2" class="col-md-4 col-sm-6">
                    <template #message>
                        <span></span>
                    </template>
                    <div class="d-flex gap-2 justify-content-end buttons" v-if="txn.status == 'unconfirmed'">
                        <button  class="btn btn-primary2" @click.prevent="confirmPayment">Confirm</button>
                        <button  class="btn btn-primary2 red" @click.prevent="declinePayment">Decline</button>
                    </div>
                    <loading :active="processing" 
                        :can-cancel="true" 
                        :is-full-page=false></loading>
                </restricted>
            </div>
            <h3 class="card-title">
                Credit Details
            </h3>
            <div class="d-flex justify-content-between">
                <span>Amount:</span>
                <span>{{ toLocale(txn.amount) }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Narration:</span>
                <span>{{ txn.narration }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Classification:</span>
                <span>{{ txn.classification }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Status:</span>
                <span>{{ txn.status }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Date of payment:</span>
                <span>{{ txn.date_of_payment }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Mode of payment:</span>
                <span>{{ txn.mode_of_payment }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Date of posting:</span>
                <span>{{ txn.time_altered }}</span>
            </div>
            <hr/>
            <div class="d-flex justify-content-between">
                <span>Posted by:</span>
                <span>{{ getFullname(user) }}</span>
            </div>
            <div class="img-container mt-4">
                <img :src="txn.pop" alt="" class="img-fluid img-thumbnail">
            </div>
            <!-- {{ txn }} -->
        </div>
    </div>
</template>

<script setup>
    import {useEWalletTxnsStore} from '@/Modules/Tokens2Wealth/store/ewalletTransactions'
    import {useAccountsStore} from '@/Modules/Tokens2Wealth/store/accounts'
    import {useUsersStore} from '@/Modules/Main/store/users'
    import {computed, ref} from 'vue'
    import {useRoute} from 'vue-router'
    import AccountCard from '../../../components/AccountCard.vue'
    import {getFullname, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const props = defineProps({
            id: Number
        })
    const store = useEWalletTxnsStore()
    const usersStore = useUsersStore()
    const accountsStore = useAccountsStore()
    const alertStore = useAlertStore()

    const route = useRoute()

    const txn = computed(() => store.get({id: parseInt(route.params.id)})[0] ?? {})

    const user = computed(() => usersStore.getUser(txn.value?.last_altered_by))

    const processing = ref(false)

    const req = new Request();

    const toLocale = (str) => {
        if(str == undefined) return ""
        return str.toLocaleString('en-US', {
            style: 'currency',
            currency: 'NGN',
        })
    }

    const confirmPayment = () => {
        if(confirm("Are you sure you want to confirm this payment?")) {
            processing.value = true
            req.post(req.root+"/t2w/api/confirm-ewallet-payment", {id: txn.value.id}).then(r => {
                const meta = JSON.parse(r.data.meta)
                delete r.data.meta
                let i = { ...r.data, ...meta }
                const index = store.data.findIndex(j => j.id == i.id)
                if (index == -1) {
                    store.data = [...store.data, i]
                } else {
                    if (!_.isEqual(store.data[index], i)) {
                        store.data[index] = i
                    }
                }
                processing.value = false
                alertStore.add("Done");
            }).catch(e => {
                processing.value = false
                alertStore.add(e.response.data, "danger")
            })
        }
    }

    const declinePayment = () => {
        if(confirm("Are you sure you want to decline this payment?")) {
            processing.value = true
            req.post(req.root+"/t2w/api/decline-ewallet-payment", {id: txn.value.id}).then(r => {
                const meta = JSON.parse(r.data.meta)
                delete r.data.meta
                let i = { ...r.data, ...meta }
                const index = store.data.findIndex(j => j.id == i.id)
                if (index == -1) {
                    store.data = [...store.data, i]
                } else {
                    if (!_.isEqual(store.data[index], i)) {
                        store.data[index] = i
                    }
                }
                processing.value = false
                alertStore.add("Done");
            }).catch(e => {
                processing.value = false
                alertStore.add(e.response.data, "danger")
            })
        }
    }
</script>

<style lang="scss" scoped>
    .buttons button {
	    height: fit-content;
    }
</style>