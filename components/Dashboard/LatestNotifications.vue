<template>
    <div class="card mb-4 n-widget">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h5 class="card-title mb-0">
                    Notifications
                    <span v-if="unread" class="badge bg-primary ms-1">{{ unread > 99 ? "99+" : unread }}</span>
                </h5>
                <div class="d-flex align-items-center gap-3">
                    <button v-if="unread" type="button" class="btn btn-link btn-sm p-0 text-muted" :disabled="busy" @click="markAll">Mark all read</button>
                    <router-link to="/notifications" class="btn btn-link btn-sm p-0">View all</router-link>
                </div>
            </div>
            <div v-if="loading && !rows.length" class="text-muted small py-2">Loading…</div>
            <div v-else-if="error" class="text-muted small py-2">Notifications are unavailable right now.</div>
            <div v-else-if="!rows.length" class="text-muted py-3 text-center"><em>No notifications yet.</em></div>
            <div v-else class="n-scroll">
                <router-link v-for="n in rows" :key="n.id" to="/notifications" class="n-link">
                    <NotificationItem :item="n" compact />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import NotificationItem from '../Notifications/NotificationItem.vue'

    // latest notifications and the unread count in one request (/t2w/api/notifications/summary).
    // "View all" opens the module's notifications page in whichever app this widget is in.
    const props = defineProps({
        data: Object,   // kept for the existing dashboards; the server uses the signed-in user
        limit: { type: Number, default: 6 }
    })

    const req = new Request()
    const rows = ref([])
    const unread = ref(0)
    const loading = ref(false)
    const busy = ref(false)
    const error = ref(false)

    const load = async () => {
        loading.value = true
        try {
            const r = await req.get(`${req.root}/t2w/api/notifications/summary`, { limit: props.limit })
            if (r && typeof r.data === "object" && r.data !== null) {
                rows.value = r.data.rows
                unread.value = r.data.unread
                error.value = false
            }
        } catch (e) {
            error.value = true
        } finally {
            loading.value = false
        }
    }
    onMounted(load)

    const markAll = async () => {
        if (!confirm("Mark all notifications as read?")) return
        busy.value = true
        try {
            await req.post(`${req.root}/t2w/api/notifications/read`, { all: true })
            await load()
        } finally {
            busy.value = false
        }
    }
</script>

<style lang="scss" scoped>
    .n-scroll {
        max-height: 360px;
        overflow-y: auto;
        margin: 0 -8px;
    }
    .n-link {
        color: inherit;
        text-decoration: none;
        display: block;
        &:hover { background: rgba(0, 0, 0, .03); }
    }
</style>
