<template>
    <Panel class="n-widget" flush :loading="loading && !rows.length" :error="error ? 'Notifications are unavailable right now.' : ''"
        :empty="!rows.length" empty-text="No notifications yet.">
        <template #title>
            <h2 class="t2w-section-title">
                Notifications
                <span v-if="unread" class="n-count t2w-num">{{ unread > 99 ? "99+" : unread }}<span class="t2w-visually-hidden"> unread</span></span>
            </h2>
        </template>
        <template #actions>
            <button v-if="unread" type="button" class="n-action" :disabled="busy" @click="markAll">Mark all read</button>
            <router-link to="/notifications">View all</router-link>
        </template>
        <div class="n-scroll">
            <router-link v-for="n in rows" :key="n.id" to="/notifications" class="n-link">
                <NotificationItem :item="n" compact />
            </router-link>
        </div>
    </Panel>
</template>

<script setup>
    import { onMounted, ref } from 'vue'
    import { Request } from '@/helpers'
    import NotificationItem from '../Notifications/NotificationItem.vue'
    import Panel from '../ui/Panel.vue'

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
        max-height: 420px;
        overflow-y: auto;
        padding: var(--t2w-space-1) var(--t2w-space-2);
    }
    .n-link {
        display: block;
        color: inherit;
        text-decoration: none;
        border-radius: var(--t2w-radius-sm);
        &:hover { background: var(--t2w-hover); }
    }
    .n-count {
        display: inline-block;
        min-width: 1.5em;
        padding: 0 6px;
        margin-left: 4px;
        border-radius: var(--t2w-radius-pill);
        background: var(--t2w-primary);
        color: #fff;
        font-size: var(--t2w-fs-small);
        line-height: 1.6;
        text-align: center;
        vertical-align: middle;
    }
    .n-action {
        all: unset;
        cursor: pointer;
        color: var(--t2w-muted);
        &:hover { text-decoration: underline; }
        &:disabled { opacity: 0.5; cursor: default; }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }
</style>
