<template>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Update your Birthday</h5>
                    <CreateForm :fields="fields" @submit="onSubmit" :initial-values="initialValues">
                        <template #submitButton>
                            <Button type="submit" class="btn btn-primary" :processing="processing">Update</Button>
                        </template>
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CreateForm from '@/components/form/CreateForm.vue'
import {computed, ref} from 'vue'
import { useAlertStore } from '@/store/alert'
import { useAuthStore } from '@/store/auth';
import { useUsersStore } from '@/Modules/Main/store/users'
import {Users} from '@/helpers';
import * as yup from 'yup'

const processing = ref(false)
const authStore = useAuthStore()
const alertStore = useAlertStore()
const users = new Users()

const user = computed(() => authStore.getUser);
const usersStore = useUsersStore();
const initialValues = computed(() => {
    return {
        birthday_day: user.value?.birthday_day,
        birthday_month: user.value?.birthday_month
    }
})

const fields = computed(() => [
    {
        label: "Birthday Day",
        name: "birthday_day",
        rules: yup.number().required().min(1).max(31)
    },
    {
        label: "Birthday Month",
        name: "birthday_month",
        rules: yup.string().required(),
        as: "vselect",
        options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }
])

const onSubmit = (values, actions) => {
    processing.value = true;
    users.update(user.value.id, values).then(function(response){
        processing.value = false;
        alertStore.add("Done", "success");
        if(usersStore.data.length > 0) {
            usersStore.data = usersStore.data.map(obj => {
                if (obj.id == user.value.id) {
                    return {...obj, ...response.data}
                }
                return obj;
            })
        }
        
    }).catch(error => {
        alertStore.add(error.message, "danger")
        processing.value = false;
    })
}
</script>

<style lang="scss" scoped>

</style>