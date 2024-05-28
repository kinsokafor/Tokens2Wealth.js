<template>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Account Details</h5>
                    <password-restriction>
                        <CreateForm :fields="fields" @submit="onSubmit" :initial-values="initialValues">
                            <template #submitButton>
                                <Button type="submit" class="btn btn-primary" :processing="processing">Update</Button>
                            </template>
                        </CreateForm>
                    </password-restriction>
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
import PasswordRestriction from '@components/PasswordRestriction.vue';

const processing = ref(false)
const authStore = useAuthStore()
const alertStore = useAlertStore()
const users = new Users()

const user = computed(() => authStore.getUser);
const usersStore = useUsersStore();
const initialValues = computed(() => {
    return {
        ac_name: user.value?.ac_name,
        ac_number: user.value?.ac_number,
        bank_name: user.value?.bank_name
    }
})

const fields = computed(() => [
    {
        label: "Account Name",
        name: "ac_name",
        rules: yup.string().required()
    },
    {
        label: "Account Number",
        name: "ac_number",
        rules: yup.string().required()
    },
    {
        label: "Bank Name",
        name: "bank_name",
        rules: yup.string().required()
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