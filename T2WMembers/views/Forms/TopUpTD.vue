<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Top-up Term Deposit</h5>
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
    import { computed, ref } from 'vue'
    import {useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()

    const fields = computed(() => [
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().min(0)
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/m/top-up-term-deposit", data).then(r => {
            processing.value = false
            router.back()
        }).catch(e => {
            processing.value = false
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>