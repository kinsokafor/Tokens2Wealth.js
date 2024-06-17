<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Bulk Credit</h5>
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
    import { computed, ref } from 'vue'
    import {useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()

    const fields = computed(() => [
        {
            label: "Credit type",
            name: "mode",
            as: "select",
            options: [
                {
                    name: 'All E-wallets',
                    value: 'all_ewallets'
                },
                {
                    name: 'Regular Thrift Dividends',
                    value: 'rt_dividends'
                },
                {
                    name: 'Share Dividends',
                    value: 'share_dividends'
                }
            ],
            rules: yup.string().required()
        },
        {
            label: "Total amount",
            name: "amount",
            rules: yup.number().required().min(0)
        },
        {
            label: "Narration",
            name: "narration",
            as: "textarea",
            rules: yup.string().required()
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/bulk-credit", data).then(r => {
            actions.resetForm()
            router.back()
            alertStore.add("Done. The system is processing it in background. Please don't resend.")
        }).catch(e => {
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>