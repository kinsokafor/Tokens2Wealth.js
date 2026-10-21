// One place for how the portal shows money, counts, percentages and dates.
// API values often arrive as strings ("12500.5", "12,500.50"), so everything goes through toNumber().

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })
const ngnCompact = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 })

// number, or null when the value isn't a number ("", null, "abc", Infinity)
export function toNumber(value) {
    if (value === null || value === undefined || value === "") return null
    const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim())
    return isFinite(n) ? n : null
}

// "₦12,500.50". Empty values show as ₦0.00 (as the old toLocale did); non-numbers show as "—".
// Negative amounts use a true minus sign ("−₦500.00"): the hyphen Intl puts there runs into the ₦ in Jost.
export function money(value) {
    if (value === null || value === undefined || value === "") return ngn.format(0)
    const n = toNumber(value)
    if (n === null) return "—"
    return n < 0 ? "−" + ngn.format(-n) : ngn.format(n)
}

// "₦1.2M": chart ticks and tight spaces only, never in tables or statements
export function moneyCompact(value) {
    const n = toNumber(value)
    return n === null ? "—" : ngnCompact.format(n)
}

// "+₦500.00" / "−₦500.00". With a ledger, credit is + and debit is − whatever the sign of the amount
export function signedMoney(value, ledger = null) {
    const n = toNumber(value)
    if (n === null) return "—"
    const negative = ledger ? ledger === "debit" : n < 0
    if (n === 0 && !ledger) return ngn.format(0)
    return (negative ? "−" : "+") + ngn.format(Math.abs(n))
}

export function count(value) {
    const n = toNumber(value)
    return n === null ? "—" : plain.format(n)
}

export function countCompact(value) {
    const n = toNumber(value)
    return n === null ? "—" : compact.format(n)
}

// "12.5%"; signed: "+12.5%" / "−3%"
export function percent(value, { signed = false, digits = 1 } = {}) {
    const n = toNumber(value)
    if (n === null) return "—"
    const s = new Intl.NumberFormat("en-NG", { maximumFractionDigits: digits }).format(Math.abs(n)) + "%"
    if (n < 0) return "−" + s
    return signed && n > 0 ? "+" + s : s
}

// change from previous to current in percent; null when there is nothing to compare against
export function percentChange(current, previous) {
    const c = toNumber(current) ?? 0
    const p = toNumber(previous)
    if (!p) return null
    return Math.round(((c - p) / Math.abs(p)) * 1000) / 10
}

// accepts "2026-05-01 14:05:00", "2026-05-01", Date, unix seconds or milliseconds
export function parseDate(value) {
    if (value === null || value === undefined || value === "") return null
    if (value instanceof Date) return isNaN(value) ? null : value
    if (typeof value === "number" || /^\d+$/.test(String(value))) {
        const n = Number(value)
        const d = new Date(n < 1e12 ? n * 1000 : n)
        return isNaN(d) ? null : d
    }
    const s = String(value).trim()
    // a bare date is a local calendar day, not UTC midnight
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T00:00:00") : new Date(s.replace(" ", "T"))
    return isNaN(d) ? null : d
}

// "1 May 2026"
export function shortDate(value) {
    const d = parseDate(value)
    if (!d) return value ?? ""
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

// "1 May 2026, 14:05"
export function dateTime(value) {
    const d = parseDate(value)
    if (!d) return value ?? ""
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const UNITS = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]

// "3 days ago", "in 2 weeks"; past a month it falls back to the date
export function relativeTime(value, now = new Date()) {
    const d = parseDate(value)
    if (!d) return value ?? ""
    const seconds = (d - now) / 1000
    if (Math.abs(seconds) > 2592000) return shortDate(d)
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
    }
    return "just now"
}

// format by a column/field type name, used by DataTable and StatCard
export function formatAs(type, value) {
    switch (type) {
        case "money": return money(value)
        case "money-compact": return moneyCompact(value)
        case "count": return count(value)
        case "percent": return percent(value)
        case "date": return shortDate(value)
        case "datetime": return dateTime(value)
        default: return value ?? ""
    }
}
