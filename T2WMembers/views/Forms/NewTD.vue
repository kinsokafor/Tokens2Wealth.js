<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">New term deposit</h5>
                    <CreateForm :fields="fields" 
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
    import { computed, ref, onMounted } from 'vue'
    import {useRoute,useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Options, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const tenure = ref([])
    const min_td = ref(0)

    const options = new Options()

    const fields = computed(() => [
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().min(min_td.value)
        },
        {
            label: "Tenure",
            name: "tenure",
            rules: yup.number().required(),
            as: "select",
            options: tenure.value
        }
    ])

    onMounted(() => {
        options.get("td_tenure,min_td").then(r => {
            min_td.value = r.data.min_td
            tenure.value = r.data.td_tenure.split(",").map(i => {
                return {
                    name: `${i} month(s)`,
                    value: i
                }
            })
        })
    })

    const handleSubmit = (data, actions) => {
        processing.value = true;
        data.id = account.value.id
        req.post(req.root+"/t2w/api/new-term-deposit", data).then(r => {
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