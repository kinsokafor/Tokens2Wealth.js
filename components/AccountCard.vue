<template>
    <router-link :to="`/accounts/view/${data.ac_type}/${data.ac_number}`">
        <div class="ac-card animate__animated animate__rubberBand">
            <div class="ac-card-top">
                <div class="img-containerx">
                <img :src="userImg" alt="profile">
                </div>
                <div class="ac-card-heading">
                <h2>{{data.surname}} {{ data.other_names }}</h2>
                <p><span>Account type:</span> <span>{{data.ac_type}}</span></p>
                <p><span>Account number:</span> <span>{{data.ac_number}}</span></p>
                <p><span>Balance:</span> <span>{{toLocale(data.balance)}}</span></p>
                </div>
            </div>
        </div>
    </router-link>
</template>

<script setup>
    import { ref } from 'vue';
    import { getProfilePicture } from '@/helpers'
    import 'animate.css'


    const props = defineProps({
        data: Object
    })

    const toLocale = (str) => {
        if(str == undefined) return ""
        return str.toLocaleString('en-US', {
            style: 'currency',
            currency: 'NGN',
        })
    }

    const userImg = ref("#")

    getProfilePicture(props.data).then(r => {
        userImg.value = r
    })

    
</script>

<style lang="scss" scoped>
    * {
    padding: 0;
    margin: 0;
    line-height: 1;
     a {
        color: var(--shadow2);
     }
    }
    .ac-card {
    padding: 24px 15px;
    margin-bottom: 20px;
    box-shadow: 0px 0px 10px -7px var(--shadow1);
    border-radius: 10px;
    .ac-card-top {
        display: flex;
        gap: 10px;
        .ac-card-heading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: calc(100% - 80px);
        h2 {
            font-size: 1.3rem;
            margin-bottom: 10px;
            color: var(--color2);
        }
        p {
            display: flex;
            justify-content: space-between;
            font-size: 0.9em;
            span {
            display: block;
            }
        }
        }
    }
    }
    .img-containerx {
        width: 80px;
        height: 80px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: top;
        align-items: center;
        align-content: center;
        border-radius: 50%;
        border: var(--color2) 2px solid;
        img {
            width: auto;
            height: 100%;
            transform: scale(1.35);
        }
    }
    .ac-card-foot {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        text-align: center;
        font-size: 0.9rem;
        div {
            padding: 10px;
            border: 1px solid;
            width: 40%;
            border-radius: 5px;
            position: relative;
        }
        div.ac-credit {
            color: green;
            background: lightgreen;
        }
        div.ac-debit {
            color: red;
            background: lightred;
        }
        h4 {
            position: relative;
        }
        h4 span {
            background: red;
            border-radius: 50%;
            color: white;
            display: flex;
            width:20px;
            height:20px;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: -8px;
            right: 10px;
            font-size: 0.6rem;
        }
    }

</style>