<template>
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <div class="card" id="dataprint">
                <div class="card-body">
                    <div class="row justify-content-between">
                        <div class="col-md-7">
                            <account-card :data="accountsStore.get({ac_number: txn.account})[0] ?? {}"></account-card>
                        </div>
                        <restricted access="1,2" class="col-md-5">
                            <template #message>
                                <span></span>
                            </template>
                            <div class="d-flex gap-2 justify-content-end buttons" v-if="txn.status == 'unconfirmed'">
                                <button  class="btn btn-primary2" @click.prevent="pushModal(MarkPayoutAsPaid, {id: txn.id})">Confirm</button>
                                <button  class="btn btn-primary2 red" @click.prevent="declinePayment">Decline</button>
                            </div>
                            <loading :active="processing" 
                                :can-cancel="true" 
                                :is-full-page=false></loading>
                        </restricted>
                    </div>
                    <h3 class="card-title">
                        Payout Details
                    </h3>
                    <div class="alert alert-info" v-if="txn?.ac_number != undefined">
                        <p><strong>Account Number: <span class="text-danger">{{ txn.ac_number }}</span></strong></p>
                        <p><strong>Account Name:</strong> {{ txn.ac_name }}</p>
                        <p><strong>Bank:</strong> {{ txn.bank_name }}</p>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Amount Requested:</span>
                        <span>{{ toLocale(txn.amount) }}</span>
                    </div>
                    <hr/>
                    <div class="d-flex justify-content-between">
                        <span>Amount paid (less bank charge recovery):</span>
                        <span>{{ toLocale(txn.payout_sum) }}</span>
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
                        <span v-if="txn.status == 'unconfirmed'">Posted by:</span>
                        <span v-else>Reviewed by:</span>
                        <span>{{ getFullname(user) }}</span>
                    </div>
                    <div class="img-container mt-4" v-if="txn.status == 'confirmed'">
                        <img :src="txn.pop" alt="" class="img-fluid img-thumbnail">
                    </div>
                </div>
            </div>
            <button  class="btn btn-primary2 mt-2" @click.prevent="print">Print</button>
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
    import {getFullname, Request, Print} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import {pushModal} from "jenesius-vue-modal";
    import MarkPayoutAsPaid from '../Forms/MarkPayoutAsPaid.vue'

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

    const declinePayment = () => {
        if(confirm("Are you sure you want to decline this payout?")) {
            processing.value = true
            req.post(req.root+"/t2w/api/payout/decline", {id: txn.value.id}).then(r => {
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

    const print = () => {
        let p = new Print({el: '#dataprint', popTitle: "Payment voucher"})
    }
</script>

<style lang="scss" scoped>
    .buttons button {
	    height: fit-content;
    }
</style>