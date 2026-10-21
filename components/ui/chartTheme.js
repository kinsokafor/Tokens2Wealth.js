// Chart.js theme for the T2W portal: brand palette, recessive axes, ₦ ticks and tooltips.
//
// Series colours are assigned in this fixed order and never cycled. Slot 1 is the brand green
// (--color2). The other slots are tuned steps of the brand's blue, orange, purple and lime, so that
// the set passes colour-blind separation in both themes (checked with the dataviz palette validator:
// light vs #fcfcfb, dark vs the dark-theme surface #222020). The raw --yellow (#cdf737) and
// --color3 (#032618) are too light / too dark to read as chart marks, so they are not used as series.
// Red is never a series colour: it stays reserved for debits, losses and errors.
// More than 5 series: fold the rest into "Other" (foldOther) instead of adding colours.

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { moneyCompact, money, countCompact, count, percent } from '../../helpers/format'

const LIGHT = ["#00af43", "#3a8cc6", "#e07b1a", "#c22f85", "#869e00"]
const DARK = ["#00af43", "#3a8cc6", "#d4741a", "#d0408f", "#8a9f10"]
export const MAX_SERIES = LIGHT.length
const OTHER = { light: "#9a9a9a", dark: "#7a7a7a" }

export function cssVar(name, fallback = "") {
    if (typeof window === "undefined") return fallback
    const v = getComputedStyle(document.body).getPropertyValue(name).trim()
    return v || fallback
}

export const isDarkTheme = () => typeof document !== "undefined" && document.body.classList.contains("dark-theme")

// "#rrggbb" / "#rgb" + alpha -> rgba(); anything else is returned unchanged
export function withAlpha(color, alpha) {
    let h = String(color).trim()
    if (!h.startsWith("#")) return h
    h = h.slice(1)
    if (h.length === 3) h = h.split("").map(c => c + c).join("")
    const n = parseInt(h.slice(0, 6), 16)
    if (isNaN(n)) return color
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export function palette(dark = isDarkTheme()) {
    const p = [...(dark ? DARK : LIGHT)]
    p[0] = cssVar("--color2", p[0]) // follow the brand green from color-scheme.css
    return p
}

export function seriesColor(index, dark = isDarkTheme()) {
    const p = palette(dark)
    if (index < p.length) return p[index]
    console.warn(`[chartTheme] series ${index + 1} has no colour; fold extra series into "Other"`)
    return dark ? OTHER.dark : OTHER.light
}

export const otherColor = (dark = isDarkTheme()) => dark ? OTHER.dark : OTHER.light

// keep the largest (max - 1) items and sum the rest into "Other": [{ label, value }] -> same shape
export function foldOther(items, max = MAX_SERIES, label = "Other") {
    if (items.length <= max) return items
    const sorted = [...items].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    const kept = sorted.slice(0, max - 1)
    const rest = sorted.slice(max - 1).reduce((a, i) => a + Number(i.value || 0), 0)
    return [...kept, { label, value: rest, isOther: true }]
}

// surface and ink from the theme variables, as concrete colours Chart.js can draw
export function inks() {
    const dark = isDarkTheme()
    const text = cssVar("--shadow1", dark ? "#ffffff" : "#222020")
    const surface = cssVar("--highlight1", dark ? "#222020" : "#ffffff")
    return {
        text,
        muted: withAlpha(text, 0.62),
        grid: withAlpha(text, 0.08),
        axis: withAlpha(text, 0.18),
        surface,
    }
}

export const formatters = {
    money: { tick: moneyCompact, value: money },
    count: { tick: countCompact, value: count },
    percent: { tick: v => percent(v, { digits: 0 }), value: v => percent(v) },
}

// Chart.js options for one chart. type: bar | line | doughnut
export function chartOptions({ type = "bar", format = "money", horizontal = false, stacked = false, legend = null, seriesCount = 1 } = {}) {
    const ink = inks()
    const fmt = formatters[format] ?? formatters.money
    // a legend whenever colour identifies something: 2+ series, or the slices of a doughnut
    const showLegend = legend ?? (type === "doughnut" || seriesCount > 1)

    const tooltip = {
        backgroundColor: ink.surface,
        titleColor: ink.text,
        bodyColor: ink.text,
        borderColor: ink.axis,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { weight: "600" },
        callbacks: {
            label(ctx) {
                const raw = type === "doughnut" ? ctx.parsed : (horizontal ? ctx.parsed.x : ctx.parsed.y)
                const name = type === "doughnut" ? ctx.label : ctx.dataset.label
                let line = `${name ? name + ": " : ""}${fmt.value(raw)}`
                if (type === "doughnut") {
                    const total = ctx.dataset.data.reduce((a, v) => a + Math.abs(Number(v) || 0), 0)
                    if (total) line += ` (${percent((Math.abs(raw) / total) * 100)})`
                }
                return line
            },
        },
    }

    const base = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 400 },
        plugins: {
            legend: {
                display: showLegend,
                position: "bottom",
                labels: { color: ink.muted, usePointStyle: true, pointStyle: "circle", boxWidth: 8, boxHeight: 8, padding: 14 },
            },
            tooltip,
        },
    }

    if (type === "doughnut") {
        return { ...base, cutout: "62%" }
    }

    const valueAxis = {
        stacked,
        beginAtZero: true,
        border: { display: false },
        grid: { color: ink.grid, drawTicks: false },
        ticks: { color: ink.muted, padding: 8, maxTicksLimit: 6, callback: v => fmt.tick(v) },
    }
    const categoryAxis = {
        stacked,
        border: { color: ink.axis },
        grid: { display: false },
        ticks: { color: ink.muted, padding: 6, autoSkipPadding: 12, maxRotation: 0 },
    }

    return {
        ...base,
        indexAxis: horizontal ? "y" : "x",
        // line charts: hovering anywhere over a date shows every series for it
        interaction: type === "line" ? { mode: "index", intersect: false } : { mode: "nearest", intersect: true },
        scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
    }
}

// mark styling per dataset (thin marks, rounded bar ends, 2px lines, surface gaps)
export function styleDataset(ds, index, { type = "bar", stacked = false, labelsCount = 0 } = {}) {
    const ink = inks()
    if (type === "doughnut") {
        const colours = ds.colors ?? Array.from({ length: labelsCount }, (_, i) => seriesColor(i))
        return {
            ...ds,
            backgroundColor: colours,
            borderColor: ink.surface,
            borderWidth: 2,
            hoverOffset: 4,
        }
    }
    const color = ds.color ?? seriesColor(ds.colorIndex ?? index)
    if (type === "line") {
        return {
            ...ds,
            borderColor: color,
            backgroundColor: withAlpha(color, 0.12),
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHitRadius: 12,
            pointBackgroundColor: color,
            pointHoverBorderColor: ink.surface,
            pointHoverBorderWidth: 2,
            tension: 0.25,
            fill: ds.fill ?? false,
        }
    }
    return {
        ...ds,
        backgroundColor: color,
        hoverBackgroundColor: withAlpha(color, 0.85),
        borderColor: ink.surface,
        // stacked segments get a 2px surface gap; single bars get rounded ends away from the baseline
        borderWidth: stacked ? { top: 2 } : 0,
        borderRadius: stacked ? 0 : 4,
        borderSkipped: "start",
        maxBarThickness: 32,
        categoryPercentage: 0.72,
        barPercentage: 0.88,
    }
}

// re-renders charts when body.dark-theme is toggled
export function useThemeMode() {
    const dark = ref(isDarkTheme())
    let observer = null
    onMounted(() => {
        dark.value = isDarkTheme()
        observer = new MutationObserver(() => { dark.value = isDarkTheme() })
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })
    })
    onBeforeUnmount(() => observer?.disconnect())
    return dark
}
