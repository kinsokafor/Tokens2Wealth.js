<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">Pending Shares</h3>
        </div>
    </div>
    <DataFilter :data="data" v-slot="{outputData}">
        <list-item v-for="item in outputData" :key="item.id">
            <member-name :id="item.user_id"></member-name>
            <span class="badge bg-success" v-if="route.params.ledger == 'buy_share'">Buying</span>
            <span class="badge bg-danger" v-if="route.params.ledger == 'sell_share'">Selling</span>
            {{ toLocale(item.units, "", " units") }} at {{ toLocale(item.amount) }}
            <template #right>
                <restricted access="1,2">
                    <loading :active="processing" 
                        :can-cancel="true" 
                        :is-full-page=false></loading>
                    <template #message><span></span></template>
                    <div class="d-flex flex-column gap-2 buttons">
                        <button  class="btn btn-primary2" @click.prevent="approve(item.id)">Approve</button>
                        <button  class="btn btn-primary2 red" @click.prevent="decline(item.id)">Decline</button>
                    </div>
                </restricted>
            </template>
        </list-item>
    </DataFilter>
</template>

<script setup>
    import {onMounted, ref} from 'vue'
    import DataFilter from '@filter/DataFilter.vue'
    import ListItem from '@theme/ListItem.vue'
    import {Store, Request} from '@/helpers'
    import MemberName from '../../components/MemberName.vue'
    import {toLocale} from '@module/Tokens2Wealth/helpers'
    import { useRoute } from 'vue-router'
    import _ from 'lodash'
    import {useAlertStore} from '@/store/alert'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const data = ref([])
    const s = new Store()
    const route = useRoute()
    const req = new Request()
    const processing = ref(false)
    const alertStore = useAlertStore()

    onMounted(() => {
        s.get({approval: 0}, route.params.ledger).then(r => {
            r.data.forEach(i => {
                i = { ...i, ...(JSON.parse(i.meta)) }
                delete i.meta
                data.value = [...data.value, i]
            })
        })
    })

    const approve = (id) => {
        if(confirm('Are you sure you want to approve this?')) {
            processing.value = true
            req.post(req.root+"/t2w/api/shares/approve", {id: id}).then(r => {
                processing.value = false;
                const index = data.value.findIndex(i => i.id == r.data.id)
                data.value.splice(index, 1)
                alertStore.add("Done");
            }).catch(e => {
                processing.value = false;
                alertStore.add(e.response.data, "danger");
            })
        }
    }

    const decline = (id) => {
        if(confirm('Are you sure you want to decline this?')) {
            processing.value = true
            req.post(req.root+"/t2w/api/shares/decline", {id: id}).then(r => {
                processing.value = false;
                const index = data.value.findIndex(i => i.id == r.data.id)
                data.value.splice(index, 1)
                alertStore.add("Done");
            }).catch(e => {
                processing.value = false;
                alertStore.add(e.response.data, "danger");
            })
        }
    }
</script>

<style lang="scss" scoped>

</style>