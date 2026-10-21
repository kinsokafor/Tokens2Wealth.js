import { computed, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Quick filters (e.g. status = unconfirmed) kept in the URL query, so links such as
 * /ewallet-credits?status=unconfirmed open filtered, and Back / refresh keep the choice.
 *  options: [{ label, key, value }] (a ref or a plain array)
 * Returns:
 *  active    { key: value } for the options' keys present in the URL
 *  toggle(o) switch one option on, or off when it is already on (one value per key)
 *  clear()   remove every option key from the URL
 *  apply(rows)        rows matching every active filter
 *  countFor(rows, o)  how many rows would match with o switched on (other keys' filters kept)
 */
export function useQueryFilters(options) {
    const route = useRoute()
    const router = useRouter()

    const keys = computed(() => [...new Set(unref(options).map(o => o.key))])

    const active = computed(() => Object.fromEntries(
        keys.value
            .filter(k => route.query[k] !== undefined && route.query[k] !== null && route.query[k] !== "")
            .map(k => [k, String(route.query[k])])
    ))

    const toggle = (o) => {
        const query = { ...route.query }
        if (String(query[o.key]) === String(o.value)) delete query[o.key]
        else query[o.key] = o.value
        router.replace({ query })
    }

    const clear = () => {
        const query = { ...route.query }
        keys.value.forEach(k => delete query[k])
        router.replace({ query })
    }

    const matches = (row, filters) => Object.entries(filters).every(([k, v]) => String(row?.[k] ?? "") === v)

    const apply = (rows) => (rows ?? []).filter(r => matches(r, active.value))

    const countFor = (rows, o) => {
        const filters = { ...active.value, [o.key]: String(o.value) }
        return (rows ?? []).filter(r => matches(r, filters)).length
    }

    return { active, toggle, clear, apply, countFor }
}
