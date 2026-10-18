// Shared bits for the notifications page and dashboard widget
// (data from /t2w/api/notifications, Classes/UserNotifications.php)
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faPiggyBank, faBusinessTime, faClockRotateLeft, faHandHoldingDollar, faCoins, faMoneyBillTransfer,
    faShareNodes, faArrowRightArrowLeft, faWallet, faUserPlus, faHeadset, faBell,
} from '@fortawesome/free-solid-svg-icons'

library.add(faPiggyBank, faBusinessTime, faClockRotateLeft, faHandHoldingDollar, faCoins, faMoneyBillTransfer,
    faShareNodes, faArrowRightArrowLeft, faWallet, faUserPlus, faHeadset, faBell)

// category key (from the server) => icon and colour
export const CATEGORY_STYLE = {
    special: { icon: "fa-solid fa-piggy-bank", color: "var(--orange, #f0932b)" },
    term_deposit: { icon: "fa-solid fa-business-time", color: "var(--purple, #6f42c1)" },
    back_duty: { icon: "fa-solid fa-clock-rotate-left", color: "var(--red, #dc3545)" },
    loan: { icon: "fa-solid fa-hand-holding-dollar", color: "var(--red, #dc3545)" },
    thrift: { icon: "fa-solid fa-coins", color: "var(--blue, #0d6efd)" },
    payout: { icon: "fa-solid fa-money-bill-transfer", color: "var(--green, #198754)" },
    shares: { icon: "fa-solid fa-share-nodes", color: "var(--color2, #20c997)" },
    cashflow: { icon: "fa-solid fa-arrow-right-arrow-left", color: "var(--blue, #0d6efd)" },
    wallet: { icon: "fa-solid fa-wallet", color: "var(--green, #198754)" },
    members: { icon: "fa-solid fa-user-plus", color: "var(--purple, #6f42c1)" },
    support: { icon: "fa-solid fa-headset", color: "var(--blue, #0d6efd)" },
    general: { icon: "fa-solid fa-bell", color: "var(--shadow2, #6c757d)" },
}

export const styleFor = (key) => CATEGORY_STYLE[key] ?? CATEGORY_STYLE.general

// "just now", "5 min ago", "3 h ago", "Yesterday", "Mon", then a date
export function relativeTime(ts) {
    if (!ts) return ""
    const d = new Date(ts * 1000)
    const diff = (Date.now() - d.getTime()) / 1000
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`
    if (diff < 2 * 86400) return "Yesterday"
    if (diff < 7 * 86400) return d.toLocaleDateString("en-GB", { weekday: "short" })
    const sameYear = d.getFullYear() === new Date().getFullYear()
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) })
}

export const fullTime = (ts) => ts ? new Date(ts * 1000).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""
