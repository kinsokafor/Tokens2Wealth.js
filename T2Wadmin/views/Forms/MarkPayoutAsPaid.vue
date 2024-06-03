<template>
    <div class="card w-100">
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <h5 class="card-title">Confirm transfer</h5>
                <a href="javaScript:void(0)" @click.prevent="closeModal">close</a>
            </div>
            <CreateForm :fields="fields" 
                @submit="handleSubmit"
                :processing="processing">
            </CreateForm>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import {useEWalletTxnsStore} from '@/Modules/Tokens2Wealth/store/ewalletTransactions'
    import {closeModal} from "jenesius-vue-modal";
    import {useConfigStore} from '@/store/config'

    const store = useEWalletTxnsStore()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const configStore = useConfigStore()
    const props = defineProps({
        id: Number
    })

    const fields = computed(() => [
        {
            label: "Transfer Receipt",
            name: "pop",
            as: "filepond",
            acceptedFileTypes: ['image/*', 'application/pdf']
        },
        {
            label: "Date of payment *",
            name: "date_of_payment",
            type: "date",
            rules: yup.string().required()
        },
        {
            label: "Mode of payment *",
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
        data.id = props.id
        req.post(req.root+"/t2w/api/payout/confirm", data).then(r => {
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
            alertStore.add("Done")
            closeModal();
        }).catch(e => {
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>
    .w-100 {
        width: 100%;
        max-width: 500px;
    }
</style>