<template>
    <div>
        <div class="card mb-2">
          <div class="card-body">
            <loading :active="processing2" 
            :can-cancel="true" 
            :is-full-page=false></loading>
            <h5 class="card-title">{{title}}</h5>
            <div class="card-text">
              {{toLocale(balance)}} 
              <small class="text-danger" v-if="isTrial">
                <em>as at {{ date }}</em>
                <a href="javaScript:void(0)" @click.prevent="resetTrial">Reset</a>
              </small>
              <hr/>
              <div class="justify-content-between d-flex">
                <strong>Credits</strong>
                <span class="text-success">{{toLocale(credits)}}</span>
              </div>
              <div class="justify-content-between d-flex">
                <strong>Debits</strong>
                <span class="text-danger">{{toLocale(debits)}}</span>
              </div>
              <hr/>
            </div>
            <router-link :to="`/${ac_type}/statement`" class="btn btn-primary2">View Statement</router-link>
          </div>
        </div>
        <div class="input-group mb-3">
          <loading :active="processing" 
            :can-cancel="true" 
            :is-full-page=false></loading>
          <input type="date" class="form-control" v-model="date"/>
          <button class="btn btn-outline-secondary" type="button" @click.prevent="getTrialBalance">Get trial balance</button>
        </div>
    </div>
</template>

<script setup>
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
    import {onMounted, ref} from 'vue'
    import {Request} from '@/helpers'

    const props = defineProps({
        ac_type: String,
        title: {
          type: String,
          default: "Balance"
        }
    })

    const emit = defineEmits(['onready'])

    const processing = ref(false)

    const processing2 = ref(false)

    const isTrial = ref(false)

    const r = new Request();

    const balance = ref(0)

    const credits = ref(0)

    const debits = ref(0)

    const date = ref(null)

    onMounted(() => {
      resetTrial()
    })

    const getTrialBalance = () => {
      processing.value = true
      r.post(r.root+"/t2w/api/break-down/m/"+props.ac_type, {date: `${date.value} 23:59:59`}).then(r => {
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
      r.post(r.root+"/t2w/api/break-down/m/"+props.ac_type).then(r => {
        balance.value = r.data.credits - r.data.debits
        credits.value = r.data.credits
        debits.value = r.data.debits
        emit("onready", balance.value)
        isTrial.value = false
        processing2.value = false
      }).catch(e => {
        processing2.value = false
      })
    }

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