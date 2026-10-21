// Shared helpers for the server-side reports (see Public/Modules/Tokens2Wealth/Classes/Reports.php)

import { money } from "./format"

const pad = (n) => String(n).padStart(2, "0")

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// date range presets; dates are local calendar days (the server expands "to" to 23:59:59)
export const PRESETS = [
    { value: "this-month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "this-quarter", label: "This quarter" },
    { value: "last-quarter", label: "Last quarter" },
    { value: "this-year", label: "This year" },
    { value: "last-year", label: "Last year" },
    { value: "today", label: "Today" },
    { value: "all-time", label: "All time" },
    { value: "custom", label: "Custom" },
]

export function presetRange(preset, today = new Date()) {
    const y = today.getFullYear(), m = today.getMonth()
    const q = Math.floor(m / 3)
    switch (preset) {
        case "today": return { from: ymd(today), to: ymd(today) }
        // the ledger starts in 2018; 2017-01-01 is the floor the balance queries already use
        case "all-time": return { from: "2017-01-01", to: ymd(today) }
        case "last-month": return { from: ymd(new Date(y, m - 1, 1)), to: ymd(new Date(y, m, 0)) }
        case "this-quarter": return { from: ymd(new Date(y, q * 3, 1)), to: ymd(today) }
        case "last-quarter": return { from: ymd(new Date(y, (q - 1) * 3, 1)), to: ymd(new Date(y, q * 3, 0)) }
        case "this-year": return { from: ymd(new Date(y, 0, 1)), to: ymd(today) }
        case "last-year": return { from: ymd(new Date(y - 1, 0, 1)), to: ymd(new Date(y - 1, 11, 31)) }
        case "this-month":
        default: return { from: ymd(new Date(y, m, 1)), to: ymd(today) }
    }
}

const plain = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 })

// NGN amount, or a plain number for unit-based products (shares)
export function amount(value, unit = "NGN") {
    const n = Number(value ?? 0)
    if (!isFinite(n)) return "-"
    return unit === "NGN" ? money(n) : `${plain.format(n)} ${unit}`
}

export function count(value) {
    return plain.format(Number(value ?? 0))
}

// "2026-05-01 00:00:00" -> "1 May 2026"
export function longDate(value) {
    if (!value) return ""
    const d = new Date(String(value).replace(" ", "T"))
    if (isNaN(d)) return value
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function periodLabel(period) {
    if (!period) return ""
    return `${longDate(period.from)} – ${longDate(period.to)}`
}

export function errorMessage(e) {
    return e?.response?.data || e?.message || "Something went wrong while loading the report"
}

// ---- CSV export

function csvCell(value) {
    if (value === null || value === undefined) return ""
    // round to kobo: totals summed in the browser pick up floating-point noise (0.1 + 0.2)
    if (typeof value === "number") return isFinite(value) ? String(Math.round(value * 100) / 100) : ""
    let s = String(value)
    // stop spreadsheet apps from treating text as a formula (CSV injection)
    if (/^[=+\-@\t\r]/.test(s) && isNaN(Number(s))) s = "'" + s
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Downloads rows as CSV. Amounts are written as plain numbers so they can be summed.
 *  columns: [{ key, heading, value?: (row) => any }]
 *  info: lines written above the table, e.g. ["Trial Balance", "Period: ..."]
 *  totals: optional object written as a last "Total" row (same keys as the columns)
 */
export function downloadCsv(filename, columns, rows, { info = [], totals = null } = {}) {
    const lines = []
    info.forEach((line) => lines.push(csvCell(line)))
    if (info.length) lines.push("")
    lines.push(columns.map((c) => csvCell(c.heading)).join(","))
    rows.forEach((row) => {
        lines.push(columns.map((c) => csvCell(c.value ? c.value(row) : row[c.key])).join(","))
    })
    if (totals) {
        lines.push(columns.map((c, i) => csvCell(i === 0 ? "Total" : (c.key in totals ? totals[c.key] : ""))).join(","))
    }
    // BOM so Excel opens UTF-8 (e.g. "–", "₦") correctly
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function csvName(report, period) {
    const range = period ? `_${String(period.from).slice(0, 10)}_${String(period.to).slice(0, 10)}` : `_${ymd(new Date())}`
    return `t2w_${report}${range}.csv`
}
