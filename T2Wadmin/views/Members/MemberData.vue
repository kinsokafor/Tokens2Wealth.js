<template>
    <div class="container" id="print">
        <div class="card">
            <div class="card-body">
                <h3 class="card-title">{{ fullname }}'s profile data</h3><hr>
                <fieldset>
                    <legend>Basic Information</legend>
                    <div class="row">
                        <div class="col-md-10">
                            <div class="row">
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Surname</label>
                                        <div>{{user.surname}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Middle Name</label>
                                        <div>{{user.middle_name}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Other Names</label>
                                        <div>{{user.other_names}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Birthday</label>
                                        <div>{{ user.birthday_month }}, {{ user.birthday_day }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Gender</label>
                                        <div>{{user.gender}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Membership Number</label>
                                        <div>{{user.username}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Occupation</label>
                                        <div>{{user.occupation}}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="field">
                                        <label for="">Membership Status</label>
                                        <div>{{user.status}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="img-responsive">
                                <img :src="userImg" alt="" class="img-fluid img-thumbnail float-end">
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Contact Information</legend>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="field">
                                <label for="">Address</label>
                                <div>{{user.address}} {{ user.city }} {{ user.state }} {{ user.country }}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">L.G.A</label>
                                <div>{{user.lga}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">State</label>
                                <div>{{user.state}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Phone Number</label>
                                <div>{{user.phone}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Email</label>
                                <div>{{user.email}}</div>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>In Event of Emergency</legend>
                    <div class="row">
                        <div class="col-md-7 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Contact person</label>
                                <div>{{user.n1_fullname}}</div>
                            </div>
                        </div>
                        <div class="col-md-5 col-sm-12">
                            <div class="field">
                                <label for="">Phone number</label>
                                <div>{{user.n1_phone}}</div>
                            </div>
                        </div>
                        <div class="col-md-7 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Contact person 2</label>
                                <div>{{user.n2_fullname}}</div>
                            </div>
                        </div>
                        <div class="col-md-5 col-sm-12">
                            <div class="field">
                                <label for="">Phone number</label>
                                <div>{{user.n2_phone}}</div>
                            </div>
                        </div>
                        <div class="col-md-7 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Contact person 3</label>
                                <div>{{user.n3_fullname}}</div>
                            </div>
                        </div>
                        <div class="col-md-5 col-sm-12">
                            <div class="field">
                                <label for="">Phone number</label>
                                <div>{{user.n3_phone}}</div>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Business Information</legend>
                    <div class="row">
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Business Name</label>
                                <div>{{user.business_name}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Business Category</label>
                                <div>{{user.business_cat}}</div>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="field">
                                <label for="">Business Description</label>
                                <div v-html="user.business_desc" style="text-align: left;"></div>
                            </div>
                        </div>
                        <div class="col-md-12 col-sm-12">
                            <div class="field">
                                <label for="">Business Address</label>
                                <div>{{user.business_address}}</div>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Account Details</legend>
                    <div class="row">
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Account Number</label>
                                <div>{{user.ac_number}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Bank</label>
                                <div>{{user.bank_name}}</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6 col-xs-6">
                            <div class="field">
                                <label for="">Account Name</label>
                                <div>{{user.ac_name}}</div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    </div>
    <button class="btn btn-primary mt-4" @click="print()">Print</button>
</template>

<script setup>
    import { useUsersStore } from '@/Modules/Main/store/users';
    import {useRoute} from 'vue-router'
    import {computed, watchEffect, ref} from 'vue';
    import { Print, getFullname, getProfilePicture } from '@/helpers'

    const userStore = useUsersStore()
    const route = useRoute()

    const user = computed(() => userStore.getUser(route.params.id));

    const fullname = computed(() => getFullname(user.value))

    const userImg = ref("#")

    watchEffect(() => {
        getProfilePicture(user.value).then(r => {
            userImg.value = r
        })
    })

    const print = () => {
        let p = new Print({el: '#print', popTitle: `Patient Data - ${user.surname} ${user.middle_name} ${user.other_names}`})
    }
</script>

<style lang="scss" scoped>
    * {
        font-size: 1em;
    }
    .field {
        display: flex;
        gap: 10px;
        margin-bottom: 21px;
        justify-content: start;
    }
    .field div {
        width: 100%;
        text-align: center;
        border-bottom: 1px dashed;
    }
    .field label {
        text-transform: uppercase;
        font-size: 0.9em;
        font-style: italic;
        height: 100%;
        display: ruby;
        // width: 40%;
        white-space: nowrap;
        // overflow: hidden;
        // text-overflow: ellipsis;
    }
    legend {
        font-weight: 800;
    }
</style>