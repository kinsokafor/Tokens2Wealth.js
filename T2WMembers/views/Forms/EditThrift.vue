<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                
                <div class="card-body" v-if="canEdit">
                    <h5 class="card-title">Edit thrift amount</h5>
                    <CreateForm :fields="fields" 
                        :initial-values="{
                            amount: account?.amount
                        }"
                        @submit="handleSubmit"
                        :processing="processing">
                    </CreateForm>
                </div>
                <div class="card-body" v-else>
                    <div class="alert alert-danger">
                        Sorry you cannot edit your thrift savings at the moment. Contact support.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import { computed, ref, onMounted } from 'vue'
    import {useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request, Options} from '@/helpers'
    import {useAlertStore} from '@/store/alert'

    const store = useAccountsStore()
    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const auth = useAuthStore()
    const rt_review = ref(12)
    const regava = ref([])

    onMounted(() => {
        const options = new Options()
        options.get("regava,rt_review").then(res => {
            rt_review.value = res.data.rt_review
            regava.value = res.data.regava
        })
    })

    const u = computed(() => auth.getUser)

    const account = computed(() => {
        const myAcc = store.get({ac_type: 'regular_thrift', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const fields = computed(() => [
        {
            label: "Amount",
            name: "amount",
            rules: yup.number().required().min(0)
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        data.id = account.value.id
        req.post(req.root+"/t2w/api/user/edit-thrift-amount", data).then(r => {
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

    const canEdit = computed(() => {
        const date = new Date()
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const thisMonth = months[date.getMonth()];
        const testA = regava.value.map(i => i.month).includes(thisMonth)
        const testB = ((parseInt((account.value?.last_updated ?? 0)) + parseInt(rt_review.value)*60*60*24*30) * 1000) < date.getTime();
        return testB && testA
    })
</script>

<style lang="scss" scoped>

</style>