<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Upload Payment Receipt</h5>
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
    import { computed, ref } from 'vue'
    import {useRoute,useRouter} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {getFullname, Request} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import {useConfigStore} from '@/store/config'
    import {useUsersStore} from '@/Modules/Main/store/users'

    const usersStore = useUsersStore()
    const route = useRoute()
    const router = useRouter()
    const user = computed(() => usersStore.getUser(route.params.id))
    const fullname = computed(() => getFullname(user.value))
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
            label: "Payment Evidence",
            name: "pop",
            as: "filepond",
            acceptedFileTypes: ['image/*', 'application/pdf'],
            rules: yup.string().required()
        },
        {
            label: "Date of payment",
            name: "date_of_payment",
            type: "date",
            rules: yup.string().required()
        }
    ])

    const handleSubmit = (data, actions) => {
        processing.value = true;
        data.user_id = user.value.id
        req.post(req.root+"/t2w/api/upload-pop/admin", data).then(r => {
            let i = r.data
            const index = usersStore.data.findIndex(j => j.id == i.id)
            if (index == -1) {
                usersStore.data = [...usersStore.data, i]
            } else {
                if (!_.isEqual(usersStore.data[index], i)) {
                    usersStore.data[index] = i
                }
            }
            processing.value = false
            router.back()
        }).catch(e => {
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>