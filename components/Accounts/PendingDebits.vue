<template>
    <div>
        <h3>Pending Debits</h3>
        <list-item v-for="item in PDStore.get({status: 'pending', credit_account: account})" :key="item.id">
          <h6>{{ toLocale(item.amount) }}</h6>
          <p>{{ item.narration }}</p>
          <template #right>
            <small>{{ item.time_altered }}</small>
            <Restricted access="1,2,3">
                <a href="javaScript:void(0)" class="link-danger" @click.prevent="deletePD(item)"><small>Delete</small></a>
                <template #message><div></div></template>
            </Restricted>
          </template>
        </list-item>
    </div>
</template>

<script setup>
    import { usePDStore } from '../../store/pendingDebits'
    import ListItem from '@/components/theme/ListItem.vue'
    import {dbTable} from '@/helpers'
    import { useAlertStore } from '@/store/alert'

    const PDStore = usePDStore()

    const alertStore = useAlertStore()
    
    const props = defineProps({account: String})

    const req = new dbTable();

    const toLocale = (str) => {
        if(str == "" || str == undefined) str = 0;
        return str.toLocaleString("en-US", {
          style:"currency", 
          currency:"NGN"
        })
    }

    const deletePD = (item) => {
      if(confirm(`Are you sure you want to delete this pending debit of ${toLocale(item.amount)}?`)) {
        req.delete("t2w_pending_debits", {id: item.id}).then(r => {
          if(item.credit_account in PDStore.data) {
            const index = PDStore.data[item.credit_account].findIndex(i => i.id == item.id);
            if(index != -1) {
              PDStore.data[item.credit_account].splice(index, 1);
            }
          }
          alertStore.add("Deleted")
        }).catch(e => {
          alertStore.add(e.data, "danger")
        })
      }
    }
</script>

<style lang="scss" scoped>

</style>