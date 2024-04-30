<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">New loan</h5>
                    
                    <CreateForm :fields="fields" 
                        @submit="handleSubmit"
                        @values="v => values = v"
                        :processing="processing"
                        v-if="loanable != null">
                    <div class="alert alert-info">
                        You are eligible to collect up to {{toLocale(loanable)}} loan. Today's interest rate is {{ rate }}%.
                    </div>
                    </CreateForm>
                    <div class="alert alert-danger" v-else>
                        <span class="badge bg-danger">Legibility</span> {{ message }}
                    </div>
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
    import {Options, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const rate = ref(0)
    const values = ref({})
    const loanable = ref(null)
    const message = ref("Please wait while we check your legibility to access loan.");
    const tenure = ref([])
    const balance = ref(0)
    const require_guarantor = ref(true);

    const options = new Options()

    const fields = computed(() => [
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().max(loanable.value)
        },
        {
            label: "Tenure",
            name: "tenure",
            rules: yup.number().required(),
            as: "select",
            options: tenure.value
        },
        {
            label: "First Guarantor Membership ID",
            name: "gt1_id",
            rules: yup.string().required(),
            condition: ((values.value?.amount ?? 0) > balance.value) && require_guarantor.value
        },
        {
            label: "First Guarantor Full Name",
            name: "gt1_fullname",
            rules: yup.string().required(),
            condition: ((values.value?.amount ?? 0) > balance.value) && require_guarantor.value
        },
        {
            label: "Second Guarantor Membership ID",
            name: "gt2_id",
            rules: yup.string().required(),
            condition: ((values.value?.amount ?? 0) > balance.value) && require_guarantor.value
        },
        {
            label: "Second Guarantor Full Name",
            name: "gt2_fullname",
            rules: yup.string().required(),
            condition: ((values.value?.amount ?? 0) > balance.value) && require_guarantor.value
        }
    ])

    onMounted(() => {
        options.get("loan_rate,loan_tenure,require_guarantor").then(r => {
            rate.value = r.data.loan_rate
            require_guarantor.value = r.data.require_guarantor
            tenure.value = r.data.loan_tenure.split(",").map(i => {
                return {
                    name: `${i} month(s)`,
                    value: i
                }
            })
        })
        req.post(req.root+"/t2w/api/legibility").then(r => {
            loanable.value = r.data
        }).catch(e => {
            message.value = e.response.data
        })
        req.post(req.root+"/t2w/api/balance/m/regular_thrift").then(r => {
            balance.value = r.data
        })
    })

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/new-loan", data).then(r => {
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

    const toLocale = (str) => {
        if(str == "" || str == undefined) str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }
</script>

<style lang="scss" scoped>

</style>