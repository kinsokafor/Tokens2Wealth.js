// One mapping from the statuses used across T2W records to a display tone.
// Tones: success, warning, danger, info, neutral (colours in components/ui/tokens.scss).

const TONES = {
    success: ["confirmed", "successful", "approved", "active", "paid", "cleared", "completed", "running", "ok", "credit"],
    warning: ["unconfirmed", "pending", "in process", "processing", "awaiting", "matured", "due", "unread", "stale"],
    danger: ["declined", "defaulted", "failed", "rejected", "cancelled", "overdue", "debit", "error", "not running"],
    neutral: ["inactive", "liquidated", "closed", "read", "draft"],
}

const LOOKUP = Object.fromEntries(
    Object.entries(TONES).flatMap(([tone, statuses]) => statuses.map(s => [s, tone]))
)

const normalise = (status) => String(status ?? "").trim().toLowerCase().replace(/[_-]+/g, " ")

export function statusTone(status) {
    return LOOKUP[normalise(status)] ?? "info"
}

// "in process" -> "In process"
export function statusLabel(status) {
    const s = normalise(status)
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""
}

export const STATUS_TONES = TONES
