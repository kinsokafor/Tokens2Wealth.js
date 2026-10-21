<template>
    <Restricted access="3,4">
        <div class="d-flex flex-wrap justify-content-between align-items-start head">
            <div>
                <h3 class="page-title mb-1">Members</h3>
                <div class="small text-muted" v-if="data">
                    {{ count(data.totals.members) }} {{ data.totals.members === 1 ? "person" : "people" }} match these filters
                </div>
            </div>
            <div class="d-flex flex-wrap actions">
                <div class="dropdown">
                    <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" @click.stop="showColumns = !showColumns"
                        :aria-expanded="showColumns">Columns</button>
                    <div class="dropdown-menu p-2 show columns-menu" v-if="showColumns" @click.stop>
                        <template v-for="g in COLUMN_GROUPS" :key="g">
                            <div class="columns-group">{{ g }}</div>
                            <label v-for="c in COLUMNS.filter(c => c.group === g)" :key="c.key" class="form-check small d-block">
                                <input class="form-check-input" type="checkbox" :value="c.key" v-model="visibleColumns" />
                                <span class="form-check-label">{{ c.heading }}</span>
                            </label>
                        </template>
                        <button type="button" class="btn btn-link btn-sm p-0 mt-1" @click="visibleColumns = [...DEFAULT_COLUMNS]">Reset to default</button>
                    </div>
                </div>
                <button class="btn btn-outline-secondary btn-sm" type="button" :disabled="!data || exporting" @click="exportCsv">
                    {{ exporting ? "Exporting…" : "Export CSV" }}
                </button>
                <router-link class="btn btn-outline-secondary btn-sm" to="/members/pending">Pending registrations</router-link>
            </div>
        </div>

        <!-- filters (kept in the URL) -->
        <div class="d-flex flex-wrap align-items-end filters mb-2">
            <div class="search">
                <label class="form-label small mb-1" for="m-q">Search</label>
                <input id="m-q" type="search" class="form-control form-control-sm" placeholder="Name, membership ID, email, phone or wallet"
                    :value="query.q" @input="onSearch($event.target.value)" />
            </div>
            <div>
                <label class="form-label small mb-1" for="m-status">Status</label>
                <select id="m-status" class="form-select form-select-sm" :value="query.status" @change="setQuery({ status: $event.target.value || undefined })">
                    <option value="">Any status</option>
                    <option v-for="(n, s) in data?.status_counts ?? {}" :key="s" :value="s" class="text-capitalize">{{ s }} ({{ n }})</option>
                </select>
            </div>
        </div>
        <div class="d-flex flex-wrap chips mb-2" v-if="data">
            <button type="button" class="btn btn-sm" :class="!query.role ? 'btn-primary' : 'btn-outline-secondary'" @click="setQuery({ role: undefined })">Everyone</button>
            <button v-for="r in data.roles" :key="r.key" type="button" class="btn btn-sm"
                :class="query.role === r.key ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setQuery({ role: query.role === r.key ? undefined : r.key })">{{ r.name }} ({{ r.count }})</button>
        </div>
        <div class="d-flex flex-wrap chips mb-3" v-if="data">
            <button v-for="s in data.segments" :key="s.key" type="button" class="btn btn-sm"
                :class="query.segment === s.key ? 'btn-dark' : 'btn-outline-secondary'" :disabled="!s.count && query.segment !== s.key"
                @click="setQuery({ segment: query.segment === s.key ? undefined : s.key })">{{ s.label }} ({{ s.count }})</button>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div class="row cards mb-3" v-if="data">
            <div class="col-6 col-md" v-for="c in cards" :key="c.label">
                <div class="card h-100"><div class="card-body py-2 px-3">
                    <div class="small text-muted">{{ c.label }}</div>
                    <div class="fs-5 fw-semibold text-nowrap">{{ c.value }}</div>
                </div></div>
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th v-for="c in columns" :key="c.key" :class="[c.align === 'end' ? 'text-end' : '', c.sort ? 'sortable' : '']"
                                @click="c.sort && sortBy(c.sort)">
                                {{ c.heading }}<span v-if="c.sort && query.sort === c.sort">{{ query.dir === 'desc' ? ' ▼' : ' ▲' }}</span>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="m in data?.rows ?? []" :key="m.id" class="clickable" @click="open(m)">
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <MemberAvatar :member="m" />
                                    <div>
                                        <div class="fw-semibold">{{ m.member || "(no name)" }}</div>
                                        <div class="small text-muted">{{ m.membership_id }}<span v-if="m.wallet_ac"> · {{ m.wallet_ac }}</span></div>
                                    </div>
                                </div>
                            </td>
                            <td v-for="c in shownColumns" :key="c.key"
                                :class="[c.align === 'end' ? 'text-end text-nowrap' : (c.cls ?? ''), { 'text-danger': c.key === 'back_duties' && m.back_duties > 0 }]">
                                <template v-if="c.key === 'role'">
                                    <span class="badge" :class="ROLE_BADGE[m.role] ?? 'bg-secondary'">{{ m.role_name }}</span>
                                    <span v-if="m.status !== 'active'" class="badge bg-light text-dark ms-1 text-capitalize">{{ m.status }}</span>
                                    <div v-if="m.role === 'pending'" class="small text-muted">{{ m.payment_status === 'paid' ? "fee paid" : "fee not paid" }}</div>
                                </template>
                                <template v-else-if="c.key === 'wallet'">
                                    {{ money(m.wallet) }}<div class="small text-muted" v-if="m.level">level {{ m.level }}</div>
                                </template>
                                <template v-else-if="c.key === 'thrift'">
                                    {{ m.thrift ? money(m.thrift) : "—" }}
                                    <div class="small text-muted" v-if="m.thrift_status === 'active'">{{ money(m.thrift_monthly) }}/month</div>
                                </template>
                                <template v-else-if="c.key === 'loan'">
                                    <template v-if="m.loan">{{ money(m.loan) }}
                                        <div class="small" :class="m.loan_note ? 'text-danger' : 'text-muted'" :title="m.loan_note">
                                            {{ m.loan_note ? `⚠ ${m.loan_status}` : m.loan_status }}
                                        </div>
                                    </template>
                                    <span v-else class="text-muted">—</span>
                                </template>
                                <template v-else-if="c.key === 'back_duties'">
                                    {{ m.back_duties ? money(m.back_duties) : "—" }}
                                    <div class="small text-muted" v-if="m.back_duty_items">{{ m.back_duty_items }} item{{ m.back_duty_items > 1 ? "s" : "" }}</div>
                                </template>
                                <template v-else>{{ c.format ? c.format(m[c.key], m) : (m[c.key] || "—") }}</template>
                            </td>
                            <td @click.stop class="text-end">
                                <DropdownActions :actions="rowActions" :data="m" @action="handleAction" />
                            </td>
                        </tr>
                        <tr v-if="data && !data.rows.length"><td :colspan="columns.length + 1"><em>Nobody matches these filters.</em></td></tr>
                        <tr v-if="loading && !data"><td :colspan="columns.length + 1" class="text-muted">Loading…</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-2" v-if="data && pages > 1">
            <span class="small text-muted">{{ data.offset + 1 }}–{{ Math.min(data.offset + data.rows.length, data.totals.members) }} of {{ data.totals.members }}</span>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" :disabled="page <= 1" @click="setQuery({ page: String(page - 1) }, false)">Previous</button>
                <button class="btn btn-outline-secondary" disabled>Page {{ page }} of {{ pages }}</button>
                <button class="btn btn-outline-secondary" :disabled="page >= pages" @click="setQuery({ page: String(page + 1) }, false)">Next</button>
            </div>
        </div>
    </Restricted>
</template>

<script setup>
    import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useLocalStorage } from '@vueuse/core'
    import _ from 'lodash'
    import { Request, Users } from '@/helpers'
    import { useAlertStore } from '@/store/alert'
    import DropdownActions from '@components/DropdownActions.vue'
    import MemberAvatar from '@/Modules/Tokens2Wealth/components/Members/MemberAvatar.vue'
    import { amount, count, longDate, downloadCsv, errorMessage } from '@/Modules/Tokens2Wealth/helpers/reports'

    // Members with their balances (/t2w/api/members): searched, filtered, sorted and paged on the server.
    const route = useRoute()
    const router = useRouter()
    const req = new Request()
    const alertStore = useAlertStore()

    const PAGE_SIZE = 50
    const data = ref(null)
    const loading = ref(false)
    const error = ref("")
    const exporting = ref(false)
    const showColumns = ref(false)

    const OPTIONAL = [
        { key: "email", heading: "Email" }, { key: "phone", heading: "Phone" }, { key: "gender", heading: "Gender" },
        { key: "referral", heading: "Referrer" }, { key: "occupation", heading: "Occupation" }, { key: "address", heading: "Address" },
        { key: "lga", heading: "L.G.A" }, { key: "state", heading: "State" }, { key: "country", heading: "Country" },
        { key: "bank_name", heading: "Bank" }, { key: "ac_name", heading: "Account name" }, { key: "ac_number", heading: "Bank account no." },
        { key: "business_name", heading: "Business" },
    ]
    // every column after "Member" can be shown or hidden (the Columns menu); the choice is kept per browser
    const money = v => amount(v)
    const day = v => v ? longDate(v) : "—"
    const orDash = f => v => (v === null || v === undefined || v === "" || Number(v) === 0) ? "—" : f(v)
    const COLUMN_GROUPS = ["Main", "Accounts & balances", "Profile"]
    const COLUMNS = [
        { key: "role", heading: "Role", group: "Main" },
        { key: "joined", heading: "Joined", sort: "joined", group: "Main", cls: "text-nowrap small", format: day },
        { key: "last_active", heading: "Last login", sort: "last_active", group: "Main", cls: "text-nowrap small", format: day },
        { key: "wallet", heading: "E-wallet", align: "end", sort: "wallet", group: "Main" },
        { key: "thrift", heading: "Thrift", align: "end", sort: "thrift", group: "Main" },
        { key: "loan", heading: "Loan owed", align: "end", sort: "loan", group: "Main" },
        { key: "back_duties", heading: "Back duties", align: "end", sort: "back_duties", group: "Main" },
        { key: "membership_id", heading: "Membership ID", sort: "membership_id", group: "Accounts & balances", cls: "text-nowrap small" },
        { key: "status", heading: "Status", group: "Accounts & balances", cls: "small text-capitalize" },
        { key: "payment_status", heading: "Registration fee", group: "Accounts & balances", cls: "small text-capitalize" },
        { key: "last_activity", heading: "Last transaction", sort: "last_activity", group: "Accounts & balances", cls: "text-nowrap small", format: day },
        { key: "wallet_ac", heading: "E-wallet account", group: "Accounts & balances", cls: "text-nowrap small" },
        { key: "level", heading: "Level", group: "Accounts & balances", cls: "small" },
        { key: "thrift_monthly", heading: "Thrift monthly", align: "end", group: "Accounts & balances", format: orDash(money) },
        { key: "loan_status", heading: "Loan status", group: "Accounts & balances", cls: "small text-capitalize" },
        { key: "term_deposit", heading: "Term deposit", align: "end", group: "Accounts & balances", format: orDash(money) },
        { key: "shares", heading: "Shares", align: "end", group: "Accounts & balances", format: orDash(v => `${count(v)} units`) },
        { key: "special", heading: "Special savings", align: "end", group: "Accounts & balances", format: orDash(money) },
        ...OPTIONAL.map(f => ({ ...f, group: "Profile", cls: "small" })),
    ]
    const DEFAULT_COLUMNS = ["role", "joined", "last_active", "wallet", "thrift", "loan", "back_duties", "phone"]
    // the old setting listed only the chosen profile fields: carry it over the first time
    const legacyProfileColumns = useLocalStorage("t2wMembersColumns", ["phone"])
    const visibleColumns = useLocalStorage("t2wMembersVisibleColumns",
        [...new Set([...DEFAULT_COLUMNS.filter(k => !OPTIONAL.some(f => f.key === k)), ...legacyProfileColumns.value])])
    const shownColumns = computed(() => COLUMNS.filter(c => visibleColumns.value.includes(c.key)))
    // profile fields shown in the table also go into the CSV export
    const extraCols = computed(() => shownColumns.value.filter(c => c.group === "Profile"))
    const ROLE_BADGE = { member: "bg-success", pending: "bg-warning text-dark", admin: "bg-info text-dark", super_admin: "bg-primary", software_engineer: "bg-dark" }

    const query = computed(() => ({
        q: route.query.q ?? "", role: route.query.role ?? "", status: route.query.status ?? "",
        segment: route.query.segment ?? "", sort: route.query.sort ?? "member", dir: route.query.dir ?? "asc",
    }))
    const page = computed(() => Math.max(1, parseInt(route.query.page ?? "1") || 1))
    const pages = computed(() => data.value ? Math.max(1, Math.ceil(data.value.totals.members / PAGE_SIZE)) : 1)

    const setQuery = (q, resetPage = true) => router.replace({ query: { ...route.query, ...q, ...(resetPage ? { page: undefined } : {}) } })
    const onSearch = _.debounce(v => setQuery({ q: v || undefined }), 350)
    const sortBy = (key) => setQuery({ sort: key, dir: query.value.sort === key && query.value.dir === "asc" ? "desc" : "asc" })

    const params = (extra = {}) => {
        const p = { limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE, sort: query.value.sort, dir: query.value.dir, ...extra }
        ;["q", "role", "status", "segment"].forEach(k => { if (query.value[k]) p[k] = query.value[k] })
        return p
    }

    let latest = 0
    const load = async () => {
        const ticket = ++latest
        loading.value = true
        error.value = ""
        try {
            const r = await req.get(`${req.root}/t2w/api/members`, params())
            if (ticket !== latest || !r) return
            if (typeof r.data !== "object" || r.data === null) throw new Error("The server returned an unexpected response.")
            data.value = r.data
        } catch (e) {
            if (ticket === latest) { data.value = null; error.value = String(errorMessage(e)) }
        } finally {
            if (ticket === latest) loading.value = false
        }
    }
    // the old page always opened on "active"; keep that default unless the URL says otherwise
    onMounted(() => { if (!("status" in route.query)) setQuery({ status: "active" }) })
    watch(() => route.query, load, { immediate: true, deep: true })

    const columns = computed(() => [
        { key: "member", heading: "Member", sort: "member" },
        ...shownColumns.value,
    ])

    const cards = computed(() => {
        const t = data.value?.totals ?? {}
        return [
            { label: "People", value: count(t.members) },
            { label: "E-wallets", value: money(t.wallet) },
            { label: "Thrift", value: money(t.thrift) },
            { label: "Loans owed", value: money(t.loan) },
            { label: "Back duties", value: money(t.back_duties) },
        ]
    })

    const open = (m) => {
        // profile links come from the role config (e.g. /t2w/a/#/member/profile/12)
        const link = m.profile_link ?? ""
        if (link.startsWith("/t2w/a/#")) router.push(link.replace("/t2w/a/#", ""))
        else window.location.href = link
    }

    // the same actions as before (core Users API), shown according to status
    const rowActions = [
        { name: "Profile", type: "action", callback: "openProfile" },
        { name: "Disable", type: "action", callback: "disableUser", conditions: { status: "active" } },
        { name: "Enable", type: "action", callback: "enableUser", conditions: { status: "inactive" } },
        { name: "Delete", type: "action", callback: "deleteUser", conditions: { status: "inactive" } },
    ]
    const STATUS_FOR = { disableUser: "inactive", enableUser: "active", deleteUser: "deleted" }

    async function handleAction(options) {
        if (options.action === "openProfile") return open(options.data)
        const to = STATUS_FOR[options.action]
        if (!to) return
        const verb = { inactive: "Disable", active: "Enable", deleted: "Delete" }[to]
        if (!confirm(`${verb} ${options.data.member || options.data.membership_id}?`)) return
        try {
            const res = await new Users().update(options.data.id, { status: to })
            if (res?.status === 200) {
                alertStore.add(`${verb}d`)
                await load()
            }
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        }
    }

    // every member matching the filters, with the chosen optional columns
    const exportCsv = async () => {
        exporting.value = true
        try {
            const r = await req.get(`${req.root}/t2w/api/members`, params({ limit: 0, offset: 0 }))
            const d = r.data
            const cols = [
                { key: "membership_id", heading: "Membership ID" }, { key: "member", heading: "Name" },
                { key: "role_name", heading: "Role" }, { key: "status", heading: "Status" },
                { key: "payment_status", heading: "Registration fee" },
                { key: "joined", heading: "Joined" }, { key: "last_active", heading: "Last login" },
                { key: "last_activity", heading: "Last transaction" }, { key: "wallet_ac", heading: "E-wallet" },
                { key: "level", heading: "Level" }, { key: "wallet", heading: "E-wallet balance" },
                { key: "thrift", heading: "Thrift balance" }, { key: "thrift_monthly", heading: "Thrift monthly" },
                { key: "loan", heading: "Loan owed" }, { key: "loan_status", heading: "Loan status" },
                { key: "term_deposit", heading: "Term deposit" }, { key: "shares", heading: "Share units" },
                { key: "back_duties", heading: "Back duties" },
                ...extraCols.value.map(c => ({ key: c.key, heading: c.heading })),
            ]
            const filters = ["role", "status", "segment", "q"].filter(k => query.value[k]).map(k => `${k}: ${query.value[k]}`).join(", ")
            downloadCsv(`t2w_members_${String(d.as_at).slice(0, 10)}.csv`, cols, d.rows, {
                info: ["Members", `As at ${d.as_at}`, `Filters: ${filters || "none"}`],
                totals: { wallet: d.totals.wallet, thrift: d.totals.thrift, loan: d.totals.loan,
                    term_deposit: d.totals.term_deposit, shares: d.totals.shares, back_duties: d.totals.back_duties },
            })
        } catch (e) {
            alertStore.add(String(errorMessage(e)), "danger")
        } finally {
            exporting.value = false
        }
    }

    // close the column menu when clicking elsewhere
    const closeMenu = () => { showColumns.value = false }
    onMounted(() => document.addEventListener("click", closeMenu))
    onBeforeUnmount(() => document.removeEventListener("click", closeMenu))
</script>

<style lang="scss" scoped>
    .head, .actions, .filters, .chips { gap: 8px; }
    .head { margin-bottom: 10px; }
    .search { min-width: 260px; flex: 1 1 260px; max-width: 420px; }
    .cards { --bs-gutter-y: 0.6rem; }
    .clickable { cursor: pointer; }
    .sortable { cursor: pointer; user-select: none; white-space: nowrap; }
    .columns-menu { max-height: 360px; overflow-y: auto; min-width: 220px; }
    .columns-group { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--shadow2, #615959); margin: 6px 0 2px; }
    .columns-group:first-child { margin-top: 0; }
    .dropdown { position: relative; }
</style>
