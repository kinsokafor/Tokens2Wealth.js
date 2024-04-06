<template>
    <div class="row">
        <div class="col-md-12">
            <div class="ac-header" :style="`background-image: url(${bgMap})`">
                <img :src="thrift" alt="image" class="image">
                <div class="heading">
                    <h1>Regular Thrift</h1>
                    <p>Monthly savings with {{configStore.get("site_name")}} as from {{ data.time_altered }}</p>
                    <MemberCard v-if="data?.user_id != undefined" :userId="parseInt(data.user_id)">
                        Account Number: {{account}}
                    </MemberCard>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
      <div class="col-md-4">
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">Monthly Contribution</h5>
            <p class="card-text">{{toLocale(parseFloat(data?.amount ?? 0))}}</p>
            <a href="#" class="btn btn-primary">Edit Amount</a>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-2">
          <div class="card-body">
            <loading :active="processing2" 
            :can-cancel="true" 
            :is-full-page=false></loading>
            <h5 class="card-title">Thrift Savings Balance</h5>
            <p class="card-text">
              {{toLocale(balance)}} 
              <small class="text-danger" v-if="isTrial">
                <em>as at {{ date }}</em>
                <a href="javaScript:void(0)" @click.prevent="resetTrial">Reset</a>
              </small>
            </p>
            <router-link :to="`/accounts/statement/${account}`" class="btn btn-primary2">View Statement</router-link>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <ol class="list-group list-group-numbered mb-2">
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <!-- <div class="fw-bold">Subheading</div> -->
              Credits
            </div>
            <span class="badge text-bg-success rounded-pill">{{toLocale(credits)}}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <!-- <div class="fw-bold">Subheading</div> -->
              Debits
            </div>
            <span class="badge text-bg-danger rounded-pill">{{toLocale(debits)}}</span>
          </li>
        </ol>
        
        <div class="input-group mb-3">
          <loading :active="processing" 
            :can-cancel="true" 
            :is-full-page=false></loading>
          <input type="date" class="form-control" v-model="date"/>
          <button class="btn btn-outline-secondary" type="button" @click.prevent="getTrialBalance">Get trial balance</button>
        </div>
      </div>
    </div>
</template>

<script setup>
    import MemberCard from './MemberCard.vue';
    import thrift from '../assets/img/thrift.png';
    import { useAccountsStore } from '../store/accounts'
    import {computed, onMounted, ref} from 'vue'
    import bgMap from '../assets/img/bgMap.png'
    import {Request} from '@/helpers'
    import {useConfigStore} from '@/store/config'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const store = useAccountsStore()

    const configStore = useConfigStore()

    const processing = ref(false)

    const processing2 = ref(false)

    const isTrial = ref(false)

    const r = new Request();

    const balance = ref(0)

    const credits = ref(0)

    const debits = ref(0)

    const date = ref(null)
    
    const props = defineProps({
        account: String
    })

    onMounted(() => {
      resetTrial()
    })

    const getTrialBalance = () => {
      processing.value = true
      r.post(r.root+"/t2w/api/break-down/"+props.account, {date: `${date.value} 23:59:59`}).then(r => {
        balance.value = r.data.credits - r.data.debits
        credits.value = r.data.credits
        debits.value = r.data.debits
        isTrial.value = true
        processing.value = false
      }).catch(e => {
        processing.value = false
      })
    }

    const resetTrial = () => {
      processing2.value = true
      r.post(r.root+"/t2w/api/break-down/"+props.account).then(r => {
        balance.value = r.data.credits - r.data.debits
        credits.value = r.data.credits
        debits.value = r.data.debits
        isTrial.value = false
        processing2.value = false
      }).catch(e => {
        processing2.value = false
      })
    }

    const data = computed(() => store.get({ac_number: props.account})[0] ?? {})

    const toLocale = (str) => {
        if(str == "") str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }
</script>

<style lang="scss" scoped>
    .ac-header {
        text-align: center;
        background-repeat: no-repeat;
        background-size: contain;
        background-position-x: 0px;
        .image {
            width: 100%;
            max-width: 380px;
        }
        h1 {
            font-size: 1.5em;
            text-transform: uppercase;
            font-weight: 800;
            background-image: linear-gradient(180deg,#032618 10%,#00af43 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }

@media only screen and (max-width: 600px) {}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
  .ac-header {
    background-position-x: 46px;
  }
  .ac-header h1 {
    font-size: 1.8em;
  }
  .ac-header {
    display: flex;
    align-items: center;
    text-align: left;
  }
  .ac-header .image {
    width: 50%;
  }
  .ac-header .heading {
    width: 50%;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
  .ac-header .image {
    width: 40%;
  }
  .ac-header .heading {
    width: 60%;
  }
  .ac-header h1 {
    font-size: 2.2em;
  }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {}
</style>