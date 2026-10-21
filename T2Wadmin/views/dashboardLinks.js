// Links on the admin dashboard, by group. access = the capacities that see the link (checked by QuickLinks).
// Moved here unchanged from Dashboard.vue.

export const accounts = [
    {
        label: "Members",
        link: "/members",
        isRouter: true,
        iconClass: "fa-users",
        access: "1,2,3,4"
    },
    {
        label: "All Accounts",
        link: "/accounts",
        isRouter: true,
        iconClass: "fa-regular fa-address-card",
        access: "1,2,3,4"
    },
    {
        label: "E-Wallets",
        link: "/accounts/wallets",
        isRouter: true,
        iconClass: "fa-wallet",
        access: "1,2,3,4"
    },
    {
        label: "Thrift savings",
        link: "/accounts/thrift-savings",
        isRouter: true,
        iconClass: "fa-solid fa-piggy-bank",
        access: "1,2,3,4"
    },
    {
        label: "Loans",
        link: "/accounts/loans",
        isRouter: true,
        iconClass: "fa-solid fa-user-tie",
        access: "1,2,3,4"
    },
    {
        label: "Term deposits",
        link: "/accounts/term-deposits",
        isRouter: true,
        iconClass: "fa-solid fa-business-time",
        access: "1,2,3,4"
    },
    {
        label: "Shares",
        link: "/accounts/shares",
        isRouter: true,
        iconClass: "fa-solid fa-share-nodes",
        access: "1,2,3,4"
    },
    {
        label: "Special savings",
        link: "/accounts/special-savings",
        isRouter: true,
        iconClass: "fa-solid fa-money-check-dollar",
        access: "1,2,3,4"
    }
]

export const transactions = [
    {
        label: "E-Wallet Credits",
        link: "/ewallet-credits",
        isRouter: true,
        iconClass: "fa-wallet",
        access: "1,2,3,4"
    },
    {
        label: "Payouts",
        link: "/ewallet-debits",
        isRouter: true,
        iconClass: "fa-wallet",
        access: "1,2,3,4"
    },
    {
        label: "Pending Shares: Buy",
        link: "/shares/pending/buy_share",
        isRouter: true,
        iconClass: "fa-share",
        access: "1,2,3,4"
    },
    {
        label: "Pending Shares: Sell",
        link: "/shares/pending/sell_share",
        isRouter: true,
        iconClass: "fa-share",
        access: "1,2,3,4"
    },
    {
        label: "Post Inflow",
        link: "/post-inflow",
        isRouter: true,
        iconClass: "fa-download",
        access: "1,2,3,4"
    },
    {
        label: "Post Outflow",
        link: "/post-outflow",
        isRouter: true,
        iconClass: "fa-upload",
        access: "1,2,3,4"
    },
    {
        label: "Inflow & Outflow",
        link: "/inflow-outflow",
        isRouter: true,
        iconClass: "fa-solid fa-arrows-turn-to-dots",
        access: "1,2,3,4"
    },
    {
        label: "Bulk Credit",
        link: "/bulk-credit",
        isRouter: true,
        iconClass: "fa-solid fa-envelopes-bulk",
        access: "1,2"
    },
    {
        label: "Bulk Debit",
        link: "/bulk-debit",
        isRouter: true,
        iconClass: "fa-solid fa-envelopes-bulk",
        access: "1,2"
    },
    {
        label: "Credit Single E-Wallet",
        link: "/credit-single",
        isRouter: true,
        iconClass: "fa-solid fa-coins",
        access: "1,2"
    },
    {
        label: "Debit Single E-Wallet",
        link: "/debit-single",
        isRouter: true,
        iconClass: "fa-solid fa-coins",
        access: "1,2"
    }
]

export const reports = [
    // server-side reports (Classes/Reports.php); the pages they replace are in previousReports
    {
        label: "Trial Balance",
        link: "/reports/statements/trial-balance",
        isRouter: true,
        iconClass: "fa-solid fa-scale-balanced",
        access: "1,2"
    },
    {
        label: "Account Statement",
        link: "/reports/statements/account",
        isRouter: true,
        iconClass: "fa-solid fa-file-invoice",
        access: "1,2"
    },
    {
        label: "Inflow & Outflow Ledger",
        link: "/reports/statements/ledger/inflow-outflow",
        isRouter: true,
        iconClass: "fa-list",
        access: "1,2"
    },
    {
        label: "Deposits & Payouts Ledger",
        link: "/reports/statements/ledger/deposits-payouts",
        isRouter: true,
        iconClass: "fa-list",
        access: "1,2"
    },
    {
        label: "Loan Arrears Ageing",
        link: "/reports/loan-arrears",
        isRouter: true,
        iconClass: "fa-solid fa-hourglass-half",
        access: "1,2,3,4"
    },
    {
        label: "Income Summary",
        link: "/reports/income",
        isRouter: true,
        iconClass: "fa-solid fa-sack-dollar",
        access: "1,2"
    },
    {
        label: "Member Portfolio",
        link: "/reports/portfolio/loan",
        isRouter: true,
        iconClass: "fa-solid fa-users-viewfinder",
        access: "1,2,3,4"
    },
    {
        label: "Approvals Queue",
        link: "/reports/approvals",
        isRouter: true,
        iconClass: "fa-solid fa-list-check",
        access: "1,2,3,4"
    },
    {
        label: "Back Duties Ageing",
        link: "/reports/back-duties",
        isRouter: true,
        iconClass: "fa-solid fa-clock-rotate-left",
        access: "1,2,3,4"
    },
    {
        label: "Guarantor Exposure",
        link: "/reports/guarantor-exposure",
        isRouter: true,
        iconClass: "fa-solid fa-user-shield",
        access: "1,2,3,4"
    },
    {
        label: "Term Deposit Maturity",
        link: "/reports/td-maturity",
        isRouter: true,
        iconClass: "fa-solid fa-calendar-check",
        access: "1,2"
    },
    {
        label: "Scheduled Jobs",
        link: "/reports/scheduled-jobs",
        isRouter: true,
        iconClass: "fa-solid fa-gears",
        access: "1,2"
    },
    {
        label: "Admin Actions Log",
        link: "/reports/admin-log",
        isRouter: true,
        iconClass: "fa-solid fa-book",
        access: "1,2"
    },
    {
        label: "Publish Learning Material",
        link: "/publish-learning-material",
        isRouter: true,
        iconClass: "fa-solid fa-book",
        access: "1,2,3,4"
    },
    {
        label: "Learning Materials",
        link: "/reports/learning-materials",
        isRouter: true,
        iconClass: "fa-solid fa-book",
        access: "1,2,3,4"
    }
]

// the pages the new reports replace; kept reachable until the new figures are signed off
export const previousReports = [
    {
        label: "Inflow & Outflow Ledger",
        link: "/reports/ledger/inflow-outflow",
        isRouter: true,
        iconClass: "fa-list",
        access: "1,2"
    },
    {
        label: "Deposits & Payouts Ledger",
        link: "/reports/ledger/deposits-payouts",
        isRouter: true,
        iconClass: "fa-list",
        access: "1,2"
    },
    {
        label: "Balances",
        link: "/reports/balances",
        isRouter: true,
        iconClass: "fa-regular fa-chart-bar",
        access: "1,2"
    },
    {
        label: "Members on Thrift",
        link: "/reports/members/thrift",
        isRouter: true,
        iconClass: "fa-solid fa-people-carry-box",
        access: "1,2,3,4"
    },
    {
        label: "Members on Loan",
        link: "/reports/members/loan",
        isRouter: true,
        iconClass: "fa-solid fa-building-user",
        access: "1,2,3,4"
    },
    {
        label: "Members on Term Deposit",
        link: "/reports/members/term-deposit",
        isRouter: true,
        iconClass: "fa-solid fa-user-shield",
        access: "1,2,3,4"
    },
    {
        label: "Members with Shares",
        link: "/reports/members/shares",
        isRouter: true,
        iconClass: "fa-solid fa-people-group",
        access: "1,2,3,4"
    },
    {
        label: "Members on Special Savings",
        link: "/reports/members/special-savings",
        isRouter: true,
        iconClass: "fa-solid fa-people-group",
        access: "1,2,3,4"
    }
]

export const settings = [
    {
        label: "General Settings",
        link: "/admin/#/options",
        isRouter: false,
        iconClass: "fa-gears",
        access: "1"
    },
    {
        label: "Admin Settings",
        link: "/settings",
        isRouter: true,
        iconClass: "fa-gear",
        access: "1,2"
    }
]
