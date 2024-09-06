<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Credit Single</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{}"
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
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()

    const fields = computed(() => [
        {
            label: "Ewallet Number",
            name: "account",
            rules: yup.number().required()
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
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/credit-single", data).then(r => {
            processing.value = false
            actions.resetForm()
            alertStore.add("Done")
        }).catch(e => {
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>