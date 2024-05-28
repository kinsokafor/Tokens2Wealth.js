<template>
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Next of Kin/Nominees</h5>
                        <password-restriction>
                            <CreateForm :fields="fields" @submit="onSubmit" :initial-values="initialValues" :columns="2">
                                <div class="alert alert-info">
                                    On successful registration as a member of {{ configStore.get('site_name') }}, I hereby declare that the 
                                    person/persons named below shall be my nominee/nominees under 
                                    the terms of Bye-Laws 4.5 of the said Society, 
                                    namely the person/persons to whom all sum (shares, savings or interests) 
                                    due to me by the Society shall be transferred to in the event of my death 
                                    or becoming permanently incapacitated.
                                </div>
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
    import {useConfigStore} from '@/store/config'
    import PasswordRestriction from '@components/PasswordRestriction.vue';

    const processing = ref(false)
    const authStore = useAuthStore()
    const alertStore = useAlertStore()
    const configStore = useConfigStore()
    const users = new Users()

    const user = computed(() => authStore.getUser);
    const usersStore = useUsersStore();
    const initialValues = computed(() => {
    return {
        n1_fullname: user.value?.n1_fullname,
        n1_phone: user.value?.n1_phone,
        n2_fullname: user.value?.n2_fullname,
        n2_phone: user.value?.n2_phone,
        n3_fullname: user.value?.n3_fullname,
        n3_phone: user.value?.n3_phone
    }
})

    const fields = computed(() => [
        {
            label: "Fullname",
            name: "n1_fullname",
            column: "left",
            rules: yup.string().required()
        },
        {
            label: "Phone Number",
            name: "n1_phone",
            column: "right",
            rules: yup.string().required()
        },
        {
            label: "Fullname",
            name: "n2_fullname",
            column: "left",
            position: "middle"
        },
        {
            label: "Phone Number",
            name: "n2_phone",
            column: "right",
            position: "middle"
        },
        {
            label: "Fullname",
            name: "n3_fullname",
            column: "left",
            position: "bottom"
        },
        {
            label: "Phone Number",
            name: "n3_phone",
            column: "right",
            position: "bottom"
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