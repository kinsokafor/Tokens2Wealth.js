<template>
  <div class="row">
    <div class="col-md-12 d-flex flex-wrap justify-content-between align-items-start list-head">
      <div>
        <h3 class="page-title mb-1">{{ data?.title ?? titleFallback }}</h3>
        <div class="small text-muted" v-if="data">
          {{ data.is_trial ? `Balances as at ${longDate(data.as_at)}` : "Current balances" }}
        </div>
      </div>
      <div class="d-flex list-actions">
        <button class="btn btn-outline-secondary btn-sm" type="button" :disabled="!data || exporting" @click="exportCsv">
          {{ exporting ? "Exporting…" : "Export CSV" }}
        </button>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" :class="{ active: layout === 'tiles' }" type="button" @click="layout = 'tiles'">Tiles</button>
          <button class="btn btn-sm btn-secondary" :class="{ active: layout === 'table' }" type="button" @click="layout = 'table'">Table</button>
        </div>
      </div>
    </div>
  </div>

  <!-- filters: kept in the URL so Back / refresh / shared links keep them -->
  <div class="d-flex flex-wrap align-items-end filters mb-2">
    <div>
      <label class="form-label small mb-1" for="al-q">Search</label>
      <input id="al-q" type="search" class="form-control form-control-sm" placeholder="Name, account or membership ID"
        :value="query.q" @input="onSearch($event.target.value)" />
    </div>
    <div>
      <label class="form-label small mb-1" for="al-date">Balances as at</label>
      <div class="input-group input-group-sm">
        <input id="al-date" type="date" class="form-control" :value="query.date" @change="setQuery({ date: $event.target.value || undefined })" />
        <button v-if="query.date" class="btn btn-outline-secondary" type="button" @click="setQuery({ date: undefined })">Today</button>
      </div>
    </div>
  </div>
  <div class="d-flex flex-wrap chips mb-2" v-if="data">
    <button type="button" class="btn btn-sm" :class="!query.status ? 'btn-primary' : 'btn-outline-secondary'"
      @click="setQuery({ status: undefined })">All statuses</button>
    <button v-for="(n, s) in data.status_counts" :key="s" type="button" class="btn btn-sm text-capitalize"
      :class="query.status === s ? 'btn-primary' : 'btn-outline-secondary'"
      @click="setQuery({ status: query.status === s ? undefined : s })">{{ s }} ({{ n }})</button>
  </div>
  <div class="d-flex flex-wrap chips mb-3" v-if="data && Object.keys(data.level_counts).length">
    <button type="button" class="btn btn-sm" :class="!query.level ? 'btn-primary' : 'btn-outline-secondary'"
      @click="setQuery({ level: undefined })">All levels</button>
    <button v-for="(n, l) in data.level_counts" :key="l" type="button" class="btn btn-sm"
      :class="query.level === String(l) ? 'btn-primary' : 'btn-outline-secondary'"
      @click="setQuery({ level: query.level === String(l) ? undefined : String(l) })">Level {{ l }} ({{ n }})</button>
  </div>

  <div v-if="error" class="alert alert-danger">{{ error }}</div>

  <div class="row summary-row mb-3" v-if="data">
    <div class="col-6 col-md-3" v-for="c in cards" :key="c.label">
      <div class="card h-100"><div class="card-body py-2 px-3">
        <div class="small text-muted">{{ c.label }}</div>
        <div class="fs-5 fw-semibold text-nowrap">{{ c.value }}</div>
      </div></div>
    </div>
  </div>
  <div v-if="data && data.unlisted_balance" class="small text-muted mb-2">
    Not in this list: {{ money(data.unlisted_balance) }} posted to account numbers that have no account record.
  </div>

  <div class="position-relative">
    <div v-if="loading" class="text-muted py-2">Loading…</div>

    <div class="row" v-if="layout === 'tiles' && data">
      <div class="col-md-4" v-for="row in data.rows" :key="row.id">
        <AccountCard :data="row"></AccountCard>
      </div>
    </div>

    <div v-if="layout === 'table' && data" class="table-responsive">
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" :class="[c.align === 'end' ? 'text-end' : '', c.sort ? 'sortable' : '']"
              @click="c.sort && sortBy(c.sort)">
              {{ c.heading }}<span v-if="c.sort && query.sort === c.sort">{{ query.dir === 'desc' ? ' ▼' : ' ▲' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data.rows" :key="row.id" class="clickable" @click="open(row)">
            <td v-for="c in columns" :key="c.key" :class="c.align === 'end' ? 'text-end text-nowrap' : ''">{{ c.format ? c.format(row[c.key], row) : row[c.key] }}</td>
          </tr>
          <tr v-if="data.rows.length === 0"><td :colspan="columns.length"><em>No accounts match these filters.</em></td></tr>
        </tbody>
        <tfoot>
          <tr class="fw-bold">
            <td :colspan="columns.length - 3">Totals ({{ data.totals.accounts }} accounts)</td>
            <td class="text-end text-nowrap">{{ money(data.totals.credits) }}</td>
            <td class="text-end text-nowrap">{{ money(data.totals.debits) }}</td>
            <td class="text-end text-nowrap">{{ money(data.totals.balance) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-2" v-if="data && pages > 1">
      <span class="small text-muted">
        {{ data.offset + 1 }}–{{ Math.min(data.offset + data.rows.length, data.totals.accounts) }} of {{ data.totals.accounts }}
      </span>
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-secondary" :disabled="page <= 1" @click="setQuery({ page: String(page - 1) }, false)">Previous</button>
        <button class="btn btn-outline-secondary" disabled>Page {{ page }} of {{ pages }}</button>
        <button class="btn btn-outline-secondary" :disabled="page >= pages" @click="setQuery({ page: String(page + 1) }, false)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStorage } from "@vueuse/core";
import _ from "lodash";
import { Request } from "@/helpers";
import { useAlertStore } from "@/store/alert";
import AccountCard from "@/Modules/Tokens2Wealth/components/AccountCard.vue";
import { amount, count, longDate, downloadCsv, errorMessage } from "@/Modules/Tokens2Wealth/helpers/reports";

// One request per view of the list (/t2w/api/accounts/list/{type}): the server filters, searches,
// sorts, pages and totals. The page used to download every account 50 at a time and filter in the browser.
const route = useRoute();
const router = useRouter();
const alertStore = useAlertStore();
const req = new Request();

const PAGE_SIZE = 50;
const layout = useSessionStorage("accounts-layout", "tiles");
const data = ref(null);
const loading = ref(false);
const error = ref("");
const exporting = ref(false);

const TITLES = {
  wallets: "E-Wallets", "thrift-savings": "Regular Thrift Savings", loans: "Loan Accounts",
  "term-deposits": "Term Deposit Accounts", shares: "Shares", "special-savings": "Special Savings Accounts",
};
const type = computed(() => (route.params.accountType in TITLES ? route.params.accountType : "wallets"));
const titleFallback = computed(() => TITLES[type.value]);

const query = computed(() => ({
  q: route.query.q ?? "",
  status: route.query.status ?? "",
  level: route.query.level ?? "",
  date: route.query.date ?? "",
  sort: route.query.sort ?? "ac_number",
  dir: route.query.dir ?? "asc",
}));
const page = computed(() => Math.max(1, parseInt(route.query.page ?? "1") || 1));
const pages = computed(() => (data.value ? Math.max(1, Math.ceil(data.value.totals.accounts / PAGE_SIZE)) : 1));

// changing a filter goes back to page 1
const setQuery = (q, resetPage = true) => router.replace({ query: { ...route.query, ...q, ...(resetPage ? { page: undefined } : {}) } });
const onSearch = _.debounce((v) => setQuery({ q: v || undefined }), 350);
const sortBy = (key) => setQuery({ sort: key, dir: query.value.sort === key && query.value.dir === "asc" ? "desc" : "asc" });

const params = (extra = {}) => {
  const p = { limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE, sort: query.value.sort, dir: query.value.dir, ...extra };
  ["q", "status", "level", "date"].forEach((k) => { if (query.value[k]) p[k] = query.value[k]; });
  return p;
};

let latest = 0;
const load = async () => {
  const ticket = ++latest;
  loading.value = true;
  error.value = "";
  try {
    const r = await req.get(`${req.root}/t2w/api/accounts/list/${type.value}`, params());
    if (ticket === latest && r) data.value = r.data;
  } catch (e) {
    if (ticket === latest) { data.value = null; error.value = String(errorMessage(e)); }
  } finally {
    if (ticket === latest) loading.value = false;
  }
};
watch(() => [type.value, route.query], load, { immediate: true, deep: true });

const unit = computed(() => data.value?.unit ?? "NGN");
const money = (v) => amount(v, unit.value);
const day = (v) => (v ? longDate(v) : "—");

const productColumns = computed(() => ({
  "thrift-savings": [{ key: "monthly_amount", heading: "Monthly", align: "end", format: money }],
  loans: [{ key: "principal", heading: "Principal", align: "end", format: money }, { key: "rate", heading: "Rate %", align: "end" }],
  "term-deposits": [{ key: "rate", heading: "Rate %", align: "end" }, { key: "maturity", heading: "Maturity", format: day }],
  wallets: [{ key: "level", heading: "Level", align: "end" }],
}[type.value] ?? []));

const columns = computed(() => [
  { key: "ac_number", heading: "Account", sort: "ac_number" },
  { key: "member", heading: "Member", sort: "member" },
  { key: "membership_id", heading: "Membership ID" },
  { key: "status", heading: "Status", sort: "status" },
  ...productColumns.value,
  { key: "last_activity", heading: "Last activity", sort: "last_activity", format: day },
  { key: "credits", heading: "Credits", align: "end", format: money },
  { key: "debits", heading: "Debits", align: "end", format: money },
  { key: "balance", heading: "Balance", align: "end", sort: "balance", format: money },
]);

const cards = computed(() => {
  const t = data.value?.totals ?? {};
  return [
    { label: "Accounts", value: count(t.accounts) },
    { label: "Credits", value: money(t.credits) },
    { label: "Debits", value: money(t.debits) },
    { label: "Balance", value: money(t.balance) },
  ];
});

const open = (row) => router.push(`/accounts/view/${row.ac_type}/${row.ac_number}`);

// every account matching the filters (not just this page)
const exportCsv = async () => {
  exporting.value = true;
  try {
    const r = await req.get(`${req.root}/t2w/api/accounts/list/${type.value}`, params({ limit: 0, offset: 0 }));
    const d = r.data;
    const cols = columns.value.map((c) => ({ key: c.key, heading: c.heading }));
    const filters = ["status", "level", "q"].filter((k) => query.value[k]).map((k) => `${k}: ${query.value[k]}`).join(", ");
    downloadCsv(`t2w_accounts_${type.value}_${String(d.as_at).slice(0, 10)}.csv`, cols, d.rows, {
      info: [d.title, d.is_trial ? `Balances as at ${d.as_at}` : `Current balances (${d.as_at})`, `Filters: ${filters || "none"}`],
      totals: { credits: d.totals.credits, debits: d.totals.debits, balance: d.totals.balance },
    });
  } catch (e) {
    alertStore.add(String(errorMessage(e)), "danger");
  } finally {
    exporting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.list-head, .list-actions, .filters, .chips { gap: 8px; }
.filters > div { min-width: 220px; }
.clickable { cursor: pointer; }
.sortable { cursor: pointer; user-select: none; white-space: nowrap; }
.summary-row { --bs-gutter-y: 0.6rem; }
</style>
