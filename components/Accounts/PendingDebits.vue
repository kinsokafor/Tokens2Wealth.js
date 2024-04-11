<template>
    <div>
        <h3>Pending Debits</h3>
        <list-item v-for="item in PDStore.get({status: 'pending', credit_account: account})" :key="item.id">
          <h6>{{ toLocale(item.amount) }}</h6>
          <p>{{ item.narration }}</p>
          <template #right>
            <small>{{ item.time_altered }}</small>
            <Restricted access="1,2,3">
                <br/>
                <a href="javaScript:void(0)" class="link-danger" @click.prevent="deletePD">Delete</a>
                <template #message><div></div></template>
            </Restricted>
          </template>
        </list-item>
    </div>
</template>

<script setup>
    import { usePDStore } from '../../store/pendingDebits'
    import ListItem from '@/components/theme/ListItem.vue'
    import {ref} from 'vue'

    const PDStore = usePDStore()
    
    const props = defineProps({account: String})

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