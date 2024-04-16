<template>
    <div class="row">
        <div class="col-md-4 col-sm-6" v-for="account in filtered" :key="account.id">
            <router-link :to="`/accounts/view/${account.ac_type}/${account.ac_number}`">
                <div class="card text-bg-success mb-3">
                    <div class="card-body">
                        <h5 class="card-title">{{titleCase(account.ac_type)}}</h5>
                        <p class="card-text">{{ toLocale(account.balance) }}</p>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup>
    import {Request, titleCase} from '@/helpers'
    import {ref, watchEffect, computed} from 'vue'

    const r = new Request

    const accounts = ref([])

    const props = defineProps({account: String, userId: Number})

    const filtered = computed(() => accounts.value.filter(i => i.ac_number != props.account))

    const getBalances = () => {
        if(props.userId == undefined) return;
        r.post(r.root+"/t2w/api/get/user-accounts", {user_id: props.userId}).then(r => {
            accounts.value = r.data
        })
    }

    watchEffect(() => {
        if(props.userId != undefined) {
            getBalances()
        }
    })

    const toLocale = (str) => {
        if(str == "" || str == undefined) str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }
</script>

<style lang="scss" scoped>

</style>