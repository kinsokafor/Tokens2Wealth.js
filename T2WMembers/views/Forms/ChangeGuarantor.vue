<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Change Guarantor</h5>
                    <CreateForm :fields="fields" 
                        @submit="handleSubmit"
                        :processing="processing"
                        :initialValues="initialValues">
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watchEffect } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import {Request} from '@/helpers'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {useAlertStore} from '@/store/alert'
    import {useRouter} from 'vue-router'

    const store = useAccountsStore()
    const auth = useAuthStore()
    const alertStore = useAlertStore()
    const processing = ref(false)
    const router = useRouter()

    const u = computed(() => auth.getUser)

    const req = new Request();

    const data = computed(() => {
        const myAcc = store.get({ac_type: 'loan', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const initialValues = computed(() => {
        return {
            gt1_id: data.value?.gt1_id,
            gt1_fullname: data.value?.gt1_fullname,
            gt2_id: data.value?.gt2_id,
            gt2_fullname: data.value?.gt2_fullname
        }
    })

    const fields = computed(() => [
        {
            label: "First Guarantor Membership ID",
            name: "gt1_id",
            rules: yup.string().required(),
            condition: data.value.gt1_approval == "pending" || data.value.gt1_approval == "declined"
        },
        {
            label: "First Guarantor Full Name",
            name: "gt1_fullname",
            rules: yup.string().required(),
            condition: data.value.gt1_approval == "pending" || data.value.gt1_approval == "declined"
        },
        {
            label: "Second Guarantor Membership ID",
            name: "gt2_id",
            rules: yup.string().required(),
            condition: data.value.gt2_approval == "pending" || data.value.gt2_approval == "declined"
        },
        {
            label: "Second Guarantor Full Name",
            name: "gt2_fullname",
            rules: yup.string().required(),
            condition: data.value.gt2_approval == "pending" || data.value.gt2_approval == "declined"
        }
    ])

    const handleSubmit = (d, actions) => {
        processing.value = true;
        d.id = data.value.id
        req.post(req.root+"/t2w/api/change-guarantor", d).then(r => {
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
</script>

<style lang="scss" scoped>

</style>