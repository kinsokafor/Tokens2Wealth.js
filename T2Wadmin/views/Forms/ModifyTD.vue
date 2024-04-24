<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                
                <div class="card-body">
                    <h5 class="card-title">Modify term deposit</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{
                            td_rate: account?.td_rate,
                            fullname: fullname
                        }"
                        @submit="handleSubmit"
                        :processing="processing">
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useAccountsStore } from '../../../store/accounts'
    import { computed, ref } from 'vue'
    import {useRoute,useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {getFullname, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const route = useRoute()
    const router = useRouter()
    const account = computed(() => store.get({ac_number: route.params.accountNumber})[0] ?? {})
    const fullname = computed(() => getFullname(account.value))
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()

    const fields = computed(() => [
        {
            label: "Name",
            name: "fullname",
            disabled: true
        },
        {
            label: "Rate",
            name: "td_rate",
            rules: yup.number().required().min(0)
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        data.id = account.value.id
        req.post(req.root+"/t2w/api/modify-term-deposit", data).then(r => {
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
            alertStore.add(e.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>