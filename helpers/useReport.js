import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Request } from '@/helpers'
import { presetRange, errorMessage } from './reports'

/**
 * Loads one server-side report from /t2w/api/reports/<path>.
 *  path:   (route) => "trial-balance" | null   (null = nothing to load yet)
 *  params: (route) => extra query parameters
 *  period: send from/to (kept in the URL query so links, refresh and Back keep the period)
 *  base:   API group under /t2w/api ("reports", or "accounts" for the account pages)
 *  defaultPreset: period used when the URL has none
 *  watchKey: (route) => value; the report reloads when it changes (default: any URL change).
 *            Return something narrower when some query values only filter in the browser.
 */
export function useReport(path, { params = () => ({}), period = true, watchKey = r => r.fullPath, base = "reports", defaultPreset = "this-month" } = {}) {
    const route = useRoute()
    const router = useRouter()
    const req = new Request()

    const data = ref(null)
    const loading = ref(false)
    const error = ref("")

    const defaults = presetRange(defaultPreset)
    const from = computed(() => route.query.from || defaults.from)
    const to = computed(() => route.query.to || defaults.to)

    let latest = 0
    const load = async () => {
        const p = path(route)
        if (!p) {
            data.value = null
            error.value = ""
            return
        }
        const ticket = ++latest
        loading.value = true
        error.value = ""
        try {
            const query = { ...(period ? { from: from.value, to: to.value } : {}), ...params(route) }
            const r = await req.get(`${req.root}/t2w/api/${base}/${p}`, query)
            if (ticket !== latest) return
            // a PHP error page can arrive with status 200: anything that is not a JSON object is an error
            if (r && (typeof r.data !== "object" || r.data === null)) throw new Error("The server returned an unexpected response. Please try again or contact support.")
            data.value = r?.data ?? null
        } catch (e) {
            if (ticket !== latest) return
            data.value = null
            error.value = String(errorMessage(e))
        } finally {
            if (ticket === latest) loading.value = false
        }
    }

    const setPeriod = ({ from, to }) => router.replace({ query: { ...route.query, from, to } })
    const setQuery = (q) => router.replace({ query: { ...route.query, ...q } })

    watch(() => watchKey(route), load, { immediate: true })

    return { data, loading, error, from, to, setPeriod, setQuery, reload: load, route, router }
}
