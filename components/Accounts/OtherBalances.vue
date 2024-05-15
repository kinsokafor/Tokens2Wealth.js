<template>
    <div class="row">
        <div class="col-md-4 col-sm-6" v-for="account in filtered" :key="account.id">
            <router-link :to="`/accounts/view/${account?.ac_type}/${account?.ac_number}`">
                <div class="card mb-3"
                    :class="{
                        'text-bg-success': (account.balance >= 0),
                        'text-bg-warning': (account.balance < 0)}"
                >
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
    import {useAuthStore} from '@/store/auth'

    const authStore = useAuthStore()

    const user = computed(() => authStore.getUser)
    
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

    const getLink = (a) => {
        if(a?.user_id == parseInt(user.value?.id ?? 0)) {
            return `#`
        } else {
            return 
        }
    }
</script>

<style lang="scss" scoped>

</style>