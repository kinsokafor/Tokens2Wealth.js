<template>
    <router-link :to="`/accounts/statement/${data.ac_number}`">
        <div class="ac-card">
            <div class="ac-card-top">
                <div class="img-containerx">
                <img :src="userImg" alt="profile">
                </div>
                <div class="ac-card-heading">
                <h2>{{data.surname}} {{ data.other_names }}</h2>
                <p><span>Account type:</span> <span>{{data.ac_type}}</span></p>
                <p><span>Account number:</span> <span>{{data.ac_number}}</span></p>
                <p><span>Balance:</span> <span>{{balanceDisplay}}</span></p>
                </div>
            </div>
        </div>
    </router-link>
</template>

<script setup>
    import { computed, ref, onMounted, onUnmounted } from 'vue';
    import { Request, imageExists } from '@/helpers'
    import 'animate.css'
    import male from '@/components/images/male_avatar.svg'
    import female from '@/components/images/female_avatar.svg'
    import { useLocalStorage } from '@vueuse/core'


    const props = defineProps({
        data: Object
    })

    const balance = ref(useLocalStorage(`balance-${props.data.ac_number}`, 0));

    const r = new Request;

    const balanceDisplay = computed(() => balance.value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'NGN',
        }))

    onMounted(async () => {   
        await r.post(process.env.EVO_API_URL + `/t2w/api/balance/${props.data.ac_number}`).then(r => {
            balance.value = r.data
        })
    })

    onUnmounted(() => {
        r.abort()
    })

    const tempImg = ref("#")

    const userImg = computed(() => {
        const setTemp = () => {
            switch(props.data.gender) {
                case "female":
                case "Female":
                tempImg.value = female
                    break;
                default:
                tempImg.value = male
                    break;
            }
        }
        if(props.data.profile_picture == undefined) {
            setTemp()
            return tempImg.value
        }
        imageExists("/"+props.data.profile_picture, () => {
            tempImg.value = "/"+props.data.profile_picture
        }, () => {
            setTemp()
        })
        return tempImg.value
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
        width: 100%;
        height: auto;
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