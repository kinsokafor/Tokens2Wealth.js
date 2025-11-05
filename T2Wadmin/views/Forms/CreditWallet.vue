<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Credit E-Wallet</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{
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
    import { useEWalletTxnsStore } from '../../../store/ewalletTransactions'
    import { computed, ref } from 'vue'
    import {useRoute,useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {getFullname, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import {useConfigStore} from '@/store/config'

    const store = useEWalletTxnsStore()
    const accountsStore = useAccountsStore()
    const route = useRoute()
    const router = useRouter()
    const account = computed(() => accountsStore.get({ac_number: route.params.accountNumber})[0] ?? {})
    const fullname = computed(() => getFullname(account.value))
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const configStore = useConfigStore()

    const fields = computed(() => [
        {
            label: "Name",
            name: "fullname",
            disabled: true
        },
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().min(0)
        },
        {
            label: "Narration",
            name: "narration",
            as: "textarea",
            rules: yup.string().required()
        },
        {
            label: "Payment Evidence",
            name: "pop",
            as: "filepond",
            acceptedFileTypes: ['image/*'],
            rules: yup.string().required()
        },
        {
            label: "Purpose of payment",
            name: "purpose",
            as: "select",
            options: [
                {name: "Thrift Savings", value: "rt"},
                {name: "Loan Repayment", value: "loan"},
                {name: "Both", value: null}
            ]
        },
        {
            label: "Date of payment",
            name: "date_of_payment",
            type: "date",
            rules: yup.string().required()
        },
        {
            label: "Mode of payment",
            name: "mode_of_payment",
            as: "select",
            options: ['Cash', 'Bank Deposit', 'Bank Transfer'],
            rules: yup.string().required()
        },
        {
            label: "Classification",
            name: "classification",
            as: "select",
            options: Object.values(configStore.get('classification') ?? {}),
            rules: yup.string().required()
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        data.account = route.params.accountNumber
        req.post(req.root+"/t2w/api/credit-ewallet", data).then(r => {
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
            alertStore.add("Done. Wait for approval")
        }).catch(e => {
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>