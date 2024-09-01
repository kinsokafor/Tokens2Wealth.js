<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Sell Shares</h5>
                    
                    <CreateForm :fields="fields" 
                        @submit="handleSubmit"
                        @values="v => values = v"
                        :processing="processing"
                        :initial-values="initialValues">
                        <label for="amount">Amount</label>
                        <input type="text" readonly class="form-control" id="amount" v-model="amount">
                    <div class="alert alert-info">
                        Today's rate is {{ rate }} naira per unit.
                    </div>
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useAccountsStore } from '../../../store/accounts'
    import { computed, ref, onMounted, watchEffect } from 'vue'
    import {useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Options, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const rate = ref(0)
    const values = ref({})

    const initialValues = ref({})

    const options = new Options()

    const fields = computed(() => [
        {
            label: "Units",
            name: "units",
            rules: yup.number().required().min(0)
        }
    ])

    onMounted(() => {
        options.get("share_unit").then(r => {
            rate.value = r.data
        })
    })

    const handleSubmit = (data) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/shares/sell", data).then(r => {
            let i = r.data
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

    const amount = computed(() => (values.value?.units ?? 0) * (rate.value ?? 1))
</script>

<style lang="scss" scoped>

</style>