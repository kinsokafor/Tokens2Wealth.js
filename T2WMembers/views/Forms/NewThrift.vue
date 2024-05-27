<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">New thrift savings</h5>
                    
                    <CreateForm :fields="fields" 
                        @submit="handleSubmit"
                        :processing="processing"
                        :initialValues="initialValues">
                        <div class="quick-select">
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(5000)">N5,000</button>
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(10000)">N10,000</button>
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(20000)">N20,000</button>
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(30000)">N30,000</button>
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(50000)">N50,000</button>
                            <button class="btn btn-rounded btn-sm btn-success" @click.prevent="set(100000)">N100,000</button>
                        </div>
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useAccountsStore } from '../../../store/accounts'
    import { computed, ref, onMounted } from 'vue'
    import {useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import { Request, Options} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const maxThrift = ref(100000)
    const minThrift = ref(2000)
    const initialValues = ref({amount: 5000})

    const options = new Options()

    const fields = computed(() => [
        {
            label: "Amount to save monthly",
            name: "amount",
            rules: yup.number().required().min(minThrift.value).max(maxThrift.value)
        }
    ])

    const set = (value) => {
        initialValues.value = {amount: value}
    }

    onMounted(() => {
        options.get("max_thrift,min_thrift").then(r => {
            maxThrift.value = parseFloat(r.data.max_thrift)
            minThrift.value = parseFloat(r.data.min_thrift)
        })
    })

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/new-thrift-savings", data).then(r => {
            let i = r.data
            console.log(i)
            i = { ...i, ...(JSON.parse(i.meta)) }
            delete i.meta
            const index = store.data.findIndex(j => j.id == i.id)
            if (index == -1) {
                store.data = [...store.data, i]
            } else {
                if (!_.isEqual(store.data[index], i)) {
                    store.data[index] = i
                }
            }
            processing.value = false
            router.back()
        }).catch(e => {
            processing.value = false
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>
    .quick-select {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
        button {
            border-radius: 20px;
            font-size: small;
        }
    }
</style>