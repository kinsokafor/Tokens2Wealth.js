<template>
    <div class="card mb-4">
        <div class="card-body">
            <div class="card-title d-flex justify-content-between">
                <span class="badge bg-info text-black">Latest Notifications</span>
                <a href="/#/notifications">View all</a>
            </div>
            <div class="scroll" v-if="latest.length > 0">
                <list-item v-for="n in latest" :key="n.id" :footer="timeStampToDate(n.last_sent)">
                    <small>{{ n.content }}</small>
                    <hr>
                </list-item>
            </div>
            <div v-else><em>Nothing to show</em></div>
        </div>
    </div>
</template>

<script setup>
    import { watchEffect, ref } from 'vue';
    import { dbTable, timeStampToDate } from '@/helpers'
    import ListItem from '@theme/ListItem.vue'

    const req = new dbTable()
    const latest = ref([])
    const sent = ref(false)

    const props = defineProps({
        data: Object,
        limit: {
            type: Number,
            default: 5
        }
    })

    watchEffect(() => {
        if(props.data?.id == undefined || sent.value) return;
        sent.value = true
        req.get("notification", {user_id: props.data.id, limit: 5, order_by: "last_sent", order: "DESC"}).then(r => {
            latest.value = r.data
        })
    })
</script>

<style lang="scss" scoped>
    .scroll {
        height: 300px;
        overflow-y: scroll;
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
    }
    .scroll::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
    }
</style>