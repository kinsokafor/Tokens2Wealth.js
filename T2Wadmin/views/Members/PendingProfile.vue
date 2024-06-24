<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">User Profile</h3>
        </div>
    </div>
    <div>
        <profile :menu="items">
            <template #beforeMenu>
                <loading :active="processing" 
                    :can-cancel="true" 
                    :is-full-page=false></loading>
                <div v-if="user?.payment_status == 'paid'">
                    <div class="d-flex justify-content-between">
                        <h4>Proof of payment</h4>
                        <restricted access="2" v-if="user.role == 'pending'">
                            <div class="d-flex">
                                <!-- <button  class="btn btn-primary2 red" @click.prevent="decline">Decline</button> -->
                                <button  class="btn btn-primary2" @click.prevent="approve">Approve</button>
                            </div>
                            <template #message>
                                <span></span>
                            </template>
                        </restricted>
                    </div>
                    <viewer :files="user.pop"/>
                </div>
            </template>
        </profile>
    </div>
</template>

<script setup>
    import {useRoute, useRouter} from 'vue-router'
    import profile from '@/Modules/Main/Admin/views/profile.vue'
    import {computed, ref} from 'vue'
    import {useUsersStore} from '@/Modules/Main/store/users'
    import viewer from '@/components/fileViewer/viewer.vue'
    import {Request} from '@/helpers'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import {useAlertStore} from '@/store/alert'

    const usersStore = useUsersStore()
    const route = useRoute()
    const router = useRouter()
    const alertStore = useAlertStore()

    const processing = ref(false)

    const r = new Request()

    const user = computed(() => usersStore.getUser(route.params.id))

    const items = computed(() => [
        {
            link: `/upload-pop/${route.params.id}`,
            label: 'Upload Payment Receipt',
            iconClass: 'fa-upload',
            access: '3,4',
            isRouter: true
        },
        {
            link: `/member/data/${route.params.id}`,
            label: 'User Data',
            iconClass: 'fa-file',
            access: '3,4',
            isRouter: true
        }
    ])
    
    const approve = () => {
        if(confirm("Are you sure you want to approve this user registration?")) {
            processing.value = true;
            r.post(r.root+"/t2w/api/approve-user", {id: user.value.id}).then(res => {
                const index = usersStore.data.findIndex(i => res.data.id == i.id)
                if (index == -1) {
                    usersStore.data = [...usersStore.data, res.data]
                } else {
                    usersStore.data[index] = res.data
                }
                processing.value = false;
                alertStore.add("Done")
                setTimeout(() => {
                    router.back()
                }, 1000)
            }).catch(e => {
                processing.value = false;
                alertStore.add(e.response?.data, "danger")
            })
        } 
    }
</script>

<style lang="scss" scoped>
    .d-flex {
        display: flex;
        gap: 5px;
    }
</style>