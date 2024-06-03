<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                
                <div class="card-body" v-if="canRequest.status">
                    <h5 class="card-title">Request Payout</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{
                            amount: 0
                        }"
                        @submit="handleSubmit"
                        :processing="processing">
                    </CreateForm>
                </div>
                <div class="card-body" v-else>
                    <profile-completeness 
                        v-if="profileComplete == false" 
                        @complete="profileComplete = true"
                    ></profile-completeness>
                    <div class="alert alert-danger" v-else>
                        {{canRequest.message}}
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
    import {Request, Options} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import ProfileCompleteness from '../../components/Dashboard/ProfileCompleteness.vue'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const crd = ref([])
    const maxMonthlyPayout = ref({status: false, message: "Please wait"})
    const profileComplete = ref(false)
    const minimum_cashout = ref(1000)

    onMounted(() => {
        const options = new Options()
        options.get("crd,minimum_cashout").then(res => {
            crd.value = res.data.crd
            minimum_cashout.value = res.data.minimum_cashout
        })

        req.post(req.root+"/t2w/api/m/okay-to-request-payout").then(r => {
            maxMonthlyPayout.value = r.data
        })
    })

    const fields = computed(() => [
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().min(minimum_cashout.value)
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/m/request-payout", data).then(r => {
            processing.value = false
            alertStore.add("Done")
            router.back()
        }).catch(e => {
            processing.value = false
            alertStore.add(e.response.data, "danger")
        })
    }

    const canRequest = computed(() => {
        if(!profileComplete.value) {
            return {status: false, message: ""}
        }
        const date = new Date()
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const thisDay = days[date.getDay()];
        const testA = crd.value.map(i => i.day).includes(thisDay)
        if(!testA) {
            return {status: false, message: "Sorry you cannot request payout today. Payout is available only on: "+crd.value.map(i => i.day).join(", ")}
        }
        return maxMonthlyPayout.value
    })
</script>

<style lang="scss" scoped>

</style>