<template>
    <div class="card">
        <div class="card-body" v-if="showForm || true">
            <h5 class="card-title">Membership Registration Form</h5>
            <CreateForm :fields="fields" 
                :columns="{top: 3, middle: 1, bottom: 2, bottomAfter: 2, middleAfter: 2}"
                @submit="handleSubmit"
                :processing="processing"
                :initialValues="initialValues"
                @values="v => values = v">
                <fieldset>
                    <legend>Affirmation</legend>
                    <div class="checkbox">
                        <label for="affirm" class="form-check-label ">
                            <input id="affirm" v-model="affirm" class="form-check-input" type="checkbox"> I hereby affirm that every information given here is true
                        </label>
                    </div>
                    <div class="checkbox">
                        <label for="terms" class="form-check-label ">
                            <input id="terms" v-model="terms" class="form-check-input" type="checkbox"> I have read and accepted the <a href="https://tokenstowealthcooperative.org/terms-conditions" target="_blank">TERMS AND CONDITIONS</a> of TOKENStoWEALTH Cooperative Multipurpose Society
                        </label>
                    </div>
                </fieldset>
            </CreateForm>
        </div>
        <div v-else>
            <h2>The portal is currently closed for new registration. Please contact support for further assistance.</h2>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted } from 'vue'
    import {useRoute} from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import {Request, isPhone, isPassword, Options} from '@/helpers'
    import {useAlertStore} from '@/store/alert'
    import statesLgas from '@/Modules/Tokens2Wealth/assets/nigeria-state-and-lgas.json'

    const route = useRoute()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const terms = ref(false)
    const affirm = ref(false)
    const values = ref({})
    const showForm = ref(false)
    const states = computed(() => statesLgas.map(i => i.state))
    const lgas = computed(() => {
        if(values.value?.state == undefined) return []
        const r = statesLgas.find(i => i.state == values.value?.state)
        if (r == -1) return []
        return r?.lgas ?? []
    })
    
    const initialValues = computed(() => {
        return route.params.referrer != "" ? {referral: route.params.referrer} : {};
    })

    const fields = computed(() => [
        {
            label: "Surname *",
            name: "surname",
            rules: yup.string().required()
        },
        {
            label: "First name *",
            name: "other_names",
            rules: yup.string().required()
        },
        {
            label: "Middle name",
            name: "middle_name"
        },
        {
            label: "Title",
            name: "title",
            as: "vselect",
            options: ["Mr.", "Mrs.", "Master", "Miss", "Chief", "Sir", "Lady", "Hon.", "Justice", "Barr.", "Engr.", "Dr."],
            column: "center"
        },
        {
            label: "Gender *",
            name: "gender",
            as: "radio",
            class: "pr-3",
            options: ["male", "female"],
            column: "center",
            rules: yup.string().required()
        },
        {
            label: "Phone *",
            name: "phone",
            rules: isPhone,
            column: "center"
        },
        {
            "label": "Profile picture",
            "as": "croppie",
            "name": "profile_picture",
            "class": "form-control",
            "column": "right",
            "viewport": {
                width: 250,
                height: 250,
                type: "circle"
            },
            "boundary": {
                width: 260,
                height: 260
            }
        },
        {
            label: "Occupation *",
            name: "occupation",
            rules: yup.string().required(),
            position: "middle"
        },
        {
            label: "Address *",
            name: "address",
            rules: yup.string().required(),
            as: "textarea",
            position: "middle"
        },
        {
            label: "State *",
            name: "state",
            rules: yup.string().required(),
            position: "middleAfter",
            as: "vselect",
            options: states.value,
            taggable: true
        },
        {
            label: "L.G.A *",
            name: "lga",
            rules: yup.string().required(),
            position: "middleAfter",
            column: "right",
            as: "vselect",
            options: lgas.value,
            taggable: true
        },
        {
            label: "Email *",
            name: "email",
            rules: yup.string().email("Please enter a valid email address").required(),
            position: "bottom"
        },
        {
            label: "Referrer",
            name: "referral",
            position: "bottom",
            column: "right",
            readonly: (initialValues.value?.referral != undefined)
        },
        {
            label: "Password *",
            name: "password",
            rules: isPassword,
            as: "password",
            position: "bottomAfter"
        },
        {
            label: "Repeat password *",
            name: "cpassword",
            rules: () => values.value.password === values.value.cpassword ? true : "Password mismatch",
            as: "password",
            position: "bottomAfter",
            column: "right"
        }
    ])

    const handleSubmit = (data, actions) => {
        if(affirm.value == false) {
            alertStore.add("You must affirm that all information provided are true", "danger")
            return
        }
        if(terms.value == false) {
            alertStore.add("You have not accepted our terms and conditions", "danger")
            return
        }
        delete data.cpassword
        data.file_attachments = ["profile_picture"]
        processing.value = true;
        req.post(req.root+"/t2w/api/registration", data).then(r => {
            processing.value = false
            actions.resetForm()
            alertStore.add("You are registered successfully. Check your email for an account activation link.", "success")
        }).catch(e => {
            processing.value = false
            alertStore.add(e.response.data, "danger")
        })
    }

    onMounted(() => {
        const options = new Options;
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const d = new Date()
        const currentMonth = months[d.getMonth()];
        options.get("regava").then(r => {
            if(r.data.map(j => j.month).findIndex(i => i == currentMonth) != -1) {
                showForm.value = true
            }
        })

    })
</script>

<style lang="scss">
    .pr-3 {
        padding-right: 15px;
    }
</style>