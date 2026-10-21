import { computed, ref, watch, onMounted } from 'vue'

/**
 * Loading state for lists fed by the background-loading stores (they fetch in batches and never
 * say when they are done): loading until the first rows arrive, or for `ms` at most.
 *  rows:    () => array
 *  resetOn: optional () => value; when it changes (e.g. the period), wait again
 */
export function useSettledLoading(rows, { ms = 6000, resetOn = null } = {}) {
    const waited = ref(false)
    let timer = null
    const start = () => {
        waited.value = false
        clearTimeout(timer)
        timer = setTimeout(() => { waited.value = true }, ms)
    }
    onMounted(start)
    if (resetOn) watch(resetOn, start)
    return computed(() => !(rows() ?? []).length && !waited.value)
}
