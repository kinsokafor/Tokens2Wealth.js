<template>
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <div class="card" id="dataprint">
                <div class="card-body">
                    <div class="row justify-content-between">
                        <restricted access="1,2" class="col-md-12">
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
                        Inflow Details
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
            <button  class="btn btn-primary2 mt-2" @click.prevent="print">Print</button>
        </div>
    </div>
</template>

<script setup>
    import {useInflowOutflowStore} from '@/Modules/Tokens2Wealth/store/inflowOutflow'
    import {useUsersStore} from '@/Modules/Main/store/users'
    import {computed, ref} from 'vue'
    import {useRoute} from 'vue-router'
    import {getFullname, Request, Print} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const props = defineProps({
            id: Number
        })
    const store = useInflowOutflowStore()
    const usersStore = useUsersStore()
    const alertStore = useAlertStore()

    const route = useRoute()

    const txn = computed(() => store.get({id: parseInt(route.params.id)})[0] ?? {})

    const user = computed(() => usersStore.getUser(txn.value?.last_altered_by))

    const processing = ref(false)

    const req = new Request();

    const confirmPayment = () => {
        if(confirm("Are you sure you want to confirm this payment?")) {
            processing.value = true
            req.post(req.root+"/t2w/api/confirm-inflow-outflow", {id: txn.value.id}).then(r => {
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
            req.post(req.root+"/t2w/api/decline-inflow-outflow", {id: txn.value.id}).then(r => {
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