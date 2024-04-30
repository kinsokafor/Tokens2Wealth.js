<template>
    <div class="card">
        <div class="container">
            <div class="cloud front">
            <span class="left-front"></span>
            <span class="right-front"></span>
            </div>
            <span class="sun sunshine"></span>
            <span class="sun"></span>
            <div class="cloud back">
            <span class="left-back"></span>
            <span class="right-back"></span>
            </div>
        </div>

        <div class="card-header">
            <span>Loan Interest Rate <br/>Today</span>
            <span>{{ today }}</span>
        </div>

        <span class="temp">{{ rate }}<small>%</small></span>

        <div class="temp-scale">
            <router-link to="/loan/new" class="btn btn-rounded">Get Started</router-link>
        </div>
        </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { Options } from '@/helpers'

    const today = ref("")
    const rate = ref(null)

    onMounted(() => {
        const options = new Options;
        const months = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"]
        const d = new Date;
        today.value = d.getDate() + " " + months[d.getMonth()]
        options.get("loan_rate").then(r => {
            rate.value = r.data
        })
    })

</script>

<style lang="scss" scoped>
    .card {
        height: 235px;
        position: relative;
        padding: 25px;
        background: radial-gradient(178.94% 106.41% at 26.42% 106.41%, #E0F78E 0%, rgba(255, 255, 255, 0) 71.88%), #FFF;
        box-shadow: 0px 155px 62px rgba(0, 0, 0, 0.01), 0px 87px 52px rgba(0, 0, 0, 0.05), 0px 39px 39px rgba(0, 0, 0, 0.09), 0px 10px 21px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
        transition: all 0.8s cubic-bezier(0.15, 0.83, 0.66, 1);
    }

    .card:hover {
        transform: scale(1.02);
    }

    .container {
    width: 250px;
    height: 250px;
    position: absolute;
    right: -35px;
    top: -50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.7);
    }

    .cloud {
    width: 250px;
    }

    .front {
    padding-top: 45px;
    margin-left: 25px;
    display: inline;
    position: absolute;
    z-index: 11;
    animation: clouds 8s infinite;
    animation-timing-function: ease-in-out;
    }

    .back {
    margin-top: -30px;
    margin-left: 150px;
    z-index: 12;
    animation: clouds 12s infinite;
    animation-timing-function: ease-in-out;
    }

    .right-front {
    width: 45px;
    height: 45px;
    border-radius: 50% 50% 50% 0%;
    background-color: var(--blue);
    display: inline-block;
    margin-left: -25px;
    z-index: 5;
    }

    .left-front {
    width: 65px;
    height: 65px;
    border-radius: 50% 50% 0% 50%;
    background-color: var(--blue);
    display: inline-block;
    z-index: 5;
    }

    .right-back {
    width: 50px;
    height: 50px;
    border-radius: 50% 50% 50% 0%;
    background-color: var(--blue);
    display: inline-block;
    margin-left: -20px;
    z-index: 5;
    }

    .left-back {
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 0% 50%;
    background-color: var(--blue);
    display: inline-block;
    z-index: 5;
    }

    .sun {
    width: 120px;
    height: 120px;
    background: -webkit-linear-gradient(to right, #fcbb04, #fffc00);
    background: linear-gradient(to right, #fcbb04, #fffc00);
    border-radius: 60px;
    display: inline;
    position: absolute;
    }

    .sunshine {
    animation: sunshines 2s infinite;
    }

    @keyframes sunshines {
    0% {
        transform: scale(1);
        opacity: 0.6;
    }

    100% {
        transform: scale(1.4);
        opacity: 0;
    }
    }

    @keyframes clouds {
    0% {
        transform: translateX(15px);
    }

    50% {
        transform: translateX(0px);
    }

    100% {
        transform: translateX(15px);
    }
    }

    .card-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    }

    .card-header span:first-child {
    word-break: break-all;
    font-weight: 800;
    font-size: 15px;
    line-height: 135%;
    color: var(--shadow2);
    }

    .card-header span:last-child {
    font-weight: 400;
    font-size: 15px;
    line-height: 135%;
    color: var(--shadow2);
    }

    .temp {
    position: absolute;
    left: 25px;
    bottom: 12px;
    font-weight: 700;
    font-size: 64px;
    line-height: 77px;
    color: var(--shadow2);
    small {
        font-size: 40px;
    }
    }

    .temp-scale {
        // width: 80px;
        height: 36px;
        position: absolute;
        right: 25px;
        bottom: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        .btn {
            padding: 8px 20px;
            margin-left: 30px;
            border-radius: 50px;
            color: var(--color2);
            font-size: 14px;
            border: 2px solid var(--color2);
            font-weight: 600;
        }
        .btn:hover, .btn:focus:hover {
            color: var(--highlight1);
            background: var(--color2) !important;
            color: var(--highlight1);
        }
    }

    .temp-scale span {
    font-weight: 700;
    font-size: 13px;
    line-height: 134.49%;
    color: rgba(87, 77, 51, 0.66);
    }
</style>