<template>
    <div class="row">
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">E-wallet</div>
                <router-link v-if="ewallet != null" to="/savings/e-wallet"><h2>{{ toLocale(ewallet) }}</h2></router-link>
            </div>
        </div>
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">Thrift Savings</div>
                <router-link v-if="thrift != null" to="/savings/thrift"><h2>{{ toLocale(thrift) }}</h2></router-link>
                <router-link v-else to="/savings/thrift/new" class="mt-2 btn btn-rounded btn-primary">Get Started</router-link>
            </div>
        </div>
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">Loan</div>
                <router-link v-if="loan != null" to="/loan"><h2>{{ toLocale(loan) }}</h2></router-link>
                <router-link v-else to="/loan/new" class="mt-2 btn btn-rounded btn-primary">Apply loan</router-link>
            </div>
        </div>
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">Term Deposit</div>
                <router-link v-if="td != null" to="/savings/term-deposit"><h2>{{ toLocale(td) }}</h2></router-link>
                <router-link v-else to="/savings/term-deposit/new" class="mt-2 btn btn-rounded btn-primary">Get Started</router-link>
            </div>
        </div>
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">Special Savings</div>
                <router-link v-if="special != null" to="/savings/special"><h2>{{ toLocale(special) }}</h2></router-link>
                <router-link v-else to="/savings/special/new" class="mt-2 btn btn-rounded btn-primary">Get Started</router-link>
            </div>
        </div>
        <div class="col-6 col-md-4 animate__animated animate__pulse">
            <div class="balance">
                <div class="title">Shares</div>
                <router-link v-if="share != null" to="/investments/shares"><h2>{{ toLocale(share) }}</h2></router-link>
                <router-link v-else to="/investments/shares/buy" class="mt-2 btn btn-rounded btn-primary">Buy Shares</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
    import {ref, watchEffect} from 'vue'
    import {Request} from '@/helpers'
    import 'animate.css'

    const ewallet = ref(null)
    const thrift = ref(null)
    const loan = ref(null)
    const td = ref(null)
    const special = ref(null)
    const share = ref(null)

    const props = defineProps({
        data: Object
    })

    const req = new Request();

    const getBalances = (userId) => {
        req.post(req.root+"/t2w/api/balance/m/contribution").then(r => {
            ewallet.value = r.data
        })
        req.post(req.root+"/t2w/api/balance/m/regular_thrift").then(r => {
            thrift.value = r.data
        })
        req.post(req.root+"/t2w/api/balance/m/loan").then(r => {
            loan.value = r.data
        })
        req.post(req.root+"/t2w/api/balance/m/share").then(r => {
            share.value = r.data
        })
        req.post(req.root+"/t2w/api/balance/m/term_deposit").then(r => {
            td.value = r.data
        })
        req.post(req.root+"/t2w/api/balance/m/special").then(r => {
            special.value = r.data
        }).catch(() => {
            special.value = null
        })
    }

    watchEffect(() => {
        getBalances(props.data.id)
    })

    const toLocale = (str) => {
        var parts = (Math.round(str * 100) / 100).toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
</script>

<style lang="scss" scoped>
    .balance {
        border: 1px solid #d7d7d7;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 15px;
        position: relative;
        .title {
            position: absolute;
            top: -11px;
            background: white;
            padding: 0 10px;
            font-size: small;
        }
        h2 {
            cursor: pointer;
        }
        a {
            text-decoration: none;
            color: inherit;
        }
    }
    /* Extra small devices (phones, 600px and down) */
    @media only screen and (max-width: 600px) {}

    /* Small devices (portrait tablets and large phones, 600px and up) */
    @media only screen and (min-width: 600px) {}

    /* Medium devices (landscape tablets, 768px and up) */
    @media only screen and (min-width: 768px) {}

    /* Large devices (laptops/desktops, 992px and up) */
    @media only screen and (min-width: 992px) {}

    /* Extra large devices (large laptops and desktops, 1200px and up) */
    @media only screen and (min-width: 1200px) {}
</style>
