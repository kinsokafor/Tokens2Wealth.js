<template>
    <div class="notifications-page">
        <div class="d-flex flex-wrap justify-content-between align-items-start head">
            <div>
                <h3 class="page-title mb-1">Notifications</h3>
                <div class="small text-muted">
                    {{ unread ? `${count(unread)} unread of ${count(total)}` : `All ${count(total)} read` }}
                </div>
            </div>
            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="busy || !unreadInView"
                @click="markAll">
                {{ category ? `Mark all ${categoryLabel} as read` : "Mark all as read" }}
            </button>
        </div>

        <ul class="nav nav-tabs mb-2">
            <li class="nav-item" v-for="t in TABS" :key="t.value">
                <button type="button" class="nav-link" :class="{ active: status === t.value }" @click="setQuery({ status: t.value })">
                    {{ t.label }}<span v-if="t.value === 'unread' && unread" class="badge bg-primary ms-1">{{ count(unread) }}</span>
                </button>
            </li>
        </ul>

        <div class="d-flex flex-wrap align-items-center filters mb-2">
            <input type="search" class="form-control form-control-sm search" placeholder="Search notifications"
                :value="q" @input="onSearch($event.target.value)" aria-label="Search notifications" />
        </div>
        <div class="d-flex flex-wrap chips mb-3" v-if="categories.length > 1">
            <button type="button" class="btn btn-sm" :class="!category ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setQuery({ category: undefined })">All topics</button>
            <button v-for="c in categories" :key="c.key" type="button" class="btn btn-sm"
                :class="category === c.key ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setQuery({ category: category === c.key ? undefined : c.key })">
                {{ c.label }}<span v-if="c.unread" class="ms-1 fw-semibold">{{ count(c.unread) }}</span>
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div class="card">
            <div class="card-body p-0" ref="listEl">
                <NotificationItem v-for="n in items" :key="n.id" :item="n"
                    @toggle-read="toggleRead" @opened="n => markRead([n.id])" />
                <div v-if="!loading && !items.length" class="p-4 text-center text-muted">
                    {{ status === 'unread' ? "You're all caught up." : "No notifications match." }}
                </div>
                <div v-if="loading" class="p-3 text-muted small">Loading…</div>
            </div>
        </div>
        <div class="text-center mt-3" v-if="more && !loading">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="loadMore">Load more</button>
        </div>
    </div>
</template>

<script setup>
    import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import _ from 'lodash'
    import { Request } from '@/helpers'
    import { useAlertStore } from '@/store/alert'
    import NotificationItem from './NotificationItem.vue'
    import { count, errorMessage } from '../../helpers/reports'

    // The signed-in user's notifications (/t2w/api/notifications), for both the admin and member apps.
    // Unread items are marked read once they have been on screen for a moment (as the old page did),
    // in batches; they can also be marked read / unread one by one, or all at once.
    const route = useRoute()
    const router = useRouter()
    const req = new Request()
    const alertStore = useAlertStore()

    const TABS = [{ value: "unread", label: "Unread" }, { value: "all", label: "All" }, { value: "read", label: "Read" }]
    const status = computed(() => TABS.some(t => t.value === route.query.status) ? route.query.status : "unread")
    const category = computed(() => route.query.category ?? "")
    const q = computed(() => route.query.q ?? "")

    const items = ref([])
    const categories = ref([])
    const unread = ref(0)
    const total = ref(0)
    const more = ref(false)
    const loading = ref(false)
    const busy = ref(false)
    const error = ref("")
    const listEl = ref(null)

    const categoryLabel = computed(() => categories.value.find(c => c.key === category.value)?.label ?? "")
    const unreadInView = computed(() => category.value
        ? (categories.value.find(c => c.key === category.value)?.unread ?? 0) > 0
        : unread.value > 0)

    const setQuery = (query) => router.replace({ query: { ...route.query, ...query } })
    const onSearch = _.debounce(v => setQuery({ q: v || undefined }), 350)

    const params = (offset) => {
        const p = { status: status.value, offset }
        if (category.value) p.category = category.value
        if (q.value) p.q = q.value
        return p
    }

    let latest = 0
    const load = async (append = false) => {
        const ticket = ++latest
        loading.value = true
        error.value = ""
        try {
            const r = await req.get(`${req.root}/t2w/api/notifications`, params(append ? items.value.length : 0))
            if (ticket !== latest || !r) return
            if (typeof r.data !== "object" || r.data === null) throw new Error("The server returned an unexpected response.")
            items.value = append ? [...items.value, ...r.data.rows] : r.data.rows
            categories.value = r.data.categories
            unread.value = r.data.unread
            total.value = r.data.total
            more.value = r.data.more
        } catch (e) {
            if (ticket === latest) error.value = String(errorMessage(e))
        } finally {
            if (ticket === latest) loading.value = false
            await nextTick()
            observeUnread()
        }
    }
    const loadMore = () => load(true)
    watch(() => [status.value, category.value, q.value], () => load(false), { immediate: true })

    // update the counts locally after a change, without reloading the list
    const applyStatus = (ids, newStatus) => {
        let delta = 0
        items.value.forEach(n => {
            if (ids.includes(n.id) && n.status !== newStatus) {
                delta += newStatus === 'read' ? -1 : 1
                const cat = categories.value.find(c => c.key === n.category)
                if (cat) cat.unread += newStatus === 'read' ? -1 : 1
                n.status = newStatus
            }
        })
        return delta
    }

    // the header and chips count what the current filters show, so they are adjusted locally
    // (the server replies with the user's overall unread count, which ignores the search)
    const markRead = async (ids) => {
        if (!ids.length) return
        unread.value = Math.max(0, unread.value + applyStatus(ids, 'read'))
        try {
            await req.post(`${req.root}/t2w/api/notifications/read`, { ids })
        } catch (e) { /* the next load shows the real state */ }
    }

    const toggleRead = async (n) => {
        const to = n.status === 'unread' ? 'read' : 'unread'
        unread.value = Math.max(0, unread.value + applyStatus([n.id], to))
        try {
            await req.post(`${req.root}/t2w/api/notifications/${to}`, { ids: [n.id] })
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        }
    }

    const markAll = async () => {
        const what = category.value ? `all ${categoryLabel.value} notifications` : "all notifications"
        if (!confirm(`Mark ${what} as read?`)) return
        busy.value = true
        try {
            await req.post(`${req.root}/t2w/api/notifications/read`, { all: true, ...(category.value ? { category: category.value } : {}) })
            alertStore.add("Marked as read")
            await load(false)
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        } finally {
            busy.value = false
        }
    }

    // ---- mark unread items read after they have been visible for a moment (batched)
    const SEEN_AFTER_MS = 1500
    const timers = new Map()
    let pending = []
    const flush = _.debounce(() => { const ids = pending; pending = []; markRead(ids) }, 800)
    let observer = null
    const observeUnread = () => {
        if (!('IntersectionObserver' in window) || !listEl.value) return
        if (!observer) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    const id = parseInt(e.target.dataset.id)
                    if (e.isIntersecting) {
                        if (!timers.has(id)) timers.set(id, setTimeout(() => {
                            timers.delete(id)
                            const n = items.value.find(x => x.id === id)
                            if (n && n.status === 'unread') { pending.push(id); flush() }
                            observer.unobserve(e.target)
                        }, SEEN_AFTER_MS))
                    } else if (timers.has(id)) {
                        clearTimeout(timers.get(id))
                        timers.delete(id)
                    }
                })
            }, { threshold: 0.6 })
        }
        listEl.value.querySelectorAll('.n-item.unread').forEach(el => observer.observe(el))
    }
    onBeforeUnmount(() => {
        observer?.disconnect()
        timers.forEach(t => clearTimeout(t))
        flush.flush()
    })
</script>

<style lang="scss" scoped>
    .head { gap: 8px; margin-bottom: 10px; }
    .filters, .chips { gap: 6px; }
    .search { max-width: 320px; }
</style>
