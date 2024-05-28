<template>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Introduce Your Business</h5>
                    <!-- <password-restriction> -->
                        <CreateForm :fields="fields" @submit="onSubmit" :initial-values="initialValues">
                            <template #submitButton>
                                <Button type="submit" class="btn btn-primary" :processing="processing">Update</Button>
                            </template>
                        </CreateForm>
                    <!-- </password-restriction> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CreateForm from '@/components/form/CreateForm.vue'
import {computed, ref, onMounted} from 'vue'
import { useAlertStore } from '@/store/alert'
import { useAuthStore } from '@/store/auth';
import { useUsersStore } from '@/Modules/Main/store/users'
import {Users, Options} from '@/helpers';
import * as yup from 'yup'
import PasswordRestriction from '@components/PasswordRestriction.vue';

const processing = ref(false)
const authStore = useAuthStore()
const alertStore = useAlertStore()
const users = new Users()
const categories = ref([]);

const user = computed(() => authStore.getUser);
const usersStore = useUsersStore();
const initialValues = computed(() => {
    return {
        business_name: user.value?.business_name,
        business_cat: user.value?.business_cat,
        business_desc: user.value?.business_desc,
        business_address: user.value?.business_address,
        business_tags: user.value?.business_tags
    }
})

const fields = computed(() => [
    {
        label: "Business Name",
        name: "business_name",
        rules: yup.string().required()
    },
    {
        label: "Business Category",
        name: "business_cat",
        as: "vselect",
        options: categories.value,
        rules: yup.string().required()
    },
    {
        label: "Business Description",
        name: "business_desc",
        as: "textarea",
        rules: yup.string().required()
    },
    {
        label: "Business Address",
        name: "business_address",
        as: "textarea",
        rules: yup.string().required()
    },
    {
        label: "Business Search Tags (seperate with commas)",
        name: "business_tags"
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

onMounted(() => {
    const options = new Options()
    options.get("business_cat").then(r => {
        categories.value = r.data;
    })
})
</script>

<style lang="scss" scoped>

</style>