import { createRouter, createWebHashHistory } from 'vue-router'
import NotFound from '@/components/NotFound.vue'
import Dashboard from '../views/Dashboard.vue'
import Accounts from '../views/Accounts/Accounts.vue'
import AccountsList from '../views/Accounts/AccountsList.vue'
import AccountStatement from '../views/Accounts/AccountStatement.vue'
import AccountView from '../views/Accounts/AccountView.vue'
import Settings from '../views/Settings.vue'
import EditThrift from '../views/Forms/EditThrift.vue'
import ModifyTD from '../views/Forms/ModifyTD.vue'
import CreditWallet from '../views/Forms/CreditWallet.vue'
import DebitWallet from '../views/Forms/DebitWallet.vue'
import UploadPop from '../views/Forms/UploadPop.vue'
import PostInflow from '../views/Forms/PostInflow.vue'
import PostOutflow from '../views/Forms/PostOutflow.vue'
import BulkCredit from '../views/Forms/BulkCredit.vue'
import BulkDebit from '../views/Forms/BulkDebit.vue'
import EWalletCredits from '../views/Reports/EWalletCredits.vue'
import InflowOutflow from '../views/Reports/InflowOutflow.vue'
import InflowOutflowLedger from '../views/Reports/InflowOutflowLedger.vue'
import DepositsPayoutsLedger from '../views/Reports/DepositsPayoutsLedger.vue'
import Balances from '../views/Reports/Balances.vue'
import InflowView from '../views/Reports/InflowView.vue'
import OutflowView from '../views/Reports/OutflowView.vue'
import EWalletCreditView from '../views/Reports/EWalletCreditView.vue'
import EWalletDebitView from '../views/Reports/EWalletDebitView.vue'
import MembersOnLoan from '../views/Reports/MembersOnLoan.vue'
import MembersOnThrift from '../views/Reports/MembersOnThrift.vue'
import MembersOnTD from '../views/Reports/MembersOnTD.vue'
import MembersWithShares from '../views/Reports/MembersWithShares.vue'
import AdminLog from '../views/Reports/AdminLog.vue'
import Members from '../views/Members/Members.vue'
import PendingMembers from '../views/Members/PendingMembers.vue'
import MemberProfile from '../views/Members/Profile.vue'
import PendingProfile from '../views/Members/PendingProfile.vue'
import PendingShares from '../views/PendingShares.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFound,
            meta: { title: "404 Not Found" }
        },
        {
            path: '/member/profile/:id',
            name: 'MemberProfile',
            component: MemberProfile,
            meta: { title: "Member Profile" }
        },
        {
            path: '/pending/profile/:id',
            name: 'PendingProfile',
            component: PendingProfile,
            meta: { title: "Member Profile" }
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
            meta: { title: "Settings" }
        },
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard,
            meta: { title: "Dashboard" }
        },
        {
            path: '/accounts',
            name: 'Accounts',
            component: Accounts,
            meta: { title: "Accounts" }
        },
        {
            path: '/accounts/:accountType',
            name: 'AccountsList',
            component: AccountsList,
            meta: { title: "Accounts list" }
        },
        {
            path: '/accounts/statement/:accountNumber',
            name: 'AccountStatement',
            component: AccountStatement,
            meta: { title: "Account Statement" }
        },
        {
            path: '/accounts/view/:accountType/:accountNumber',
            name: 'AccountView',
            component: AccountView,
            meta: { title: "Account View" }
        },
        {
            path: '/accounts/thrift/:accountNumber/edit',
            name: 'EditThrift',
            component: EditThrift,
            meta: { title: "Edit Thrift" }
        },
        {
            path: '/accounts/term-deposit/:accountNumber/modify',
            name: 'ModifyTD',
            component: ModifyTD,
            meta: { title: "Modify Term Deposit" }
        },
        {
            path: '/accounts/post/credit/:accountNumber',
            name: 'CreditWallet',
            component: CreditWallet,
            meta: { title: "Credit E-Wallet" }
        },
        {
            path: '/accounts/post/debit/:accountNumber',
            name: 'DebitWallet',
            component: DebitWallet,
            meta: { title: "Debit E-Wallet" }
        },
        {
            path: '/ewallet-credits',
            name: 'EWalletCredits',
            component: EWalletCredits,
            meta: { title: "E-Wallet Credits" }
        },
        {
            path: '/inflow-outflow',
            name: 'InflowOutflow',
            component: InflowOutflow,
            meta: { title: "Inflow & Outflow" }
        },
        {
            path: '/inflow/:id',
            name: 'InflowView',
            component: InflowView,
            meta: { title: "Inflow" }
        },
        {
            path: '/outflow/:id',
            name: 'OutflowView',
            component: OutflowView,
            meta: { title: "Outflow" }
        },
        {
            path: '/ewallet-credits/:id',
            name: 'EWalletCreditView',
            component: EWalletCreditView,
            meta: { title: "E-Wallet Credit" }
        },
        {
            path: '/ewallet-debits/:id',
            name: 'EWalletDebitView',
            component: EWalletDebitView,
            meta: { title: "Payout" }
        },
        {
            path: '/upload-pop/:id',
            name: 'UploadPop',
            component: UploadPop,
            meta: { title: "Upload Payment Receipt" }
        },
        {
            path: '/members',
            name: 'Members',
            component: Members,
            meta: { title: "Members" }
        },
        {
            path: '/members/pending',
            name: 'PendingMembers',
            component: PendingMembers,
            meta: { title: "Pending Members" }
        },
        {
            path: '/shares/pending/:ledger',
            name: 'PendingShares',
            component: PendingShares,
            meta: { title: "Pending Shares" }
        },
        {
            path: '/post-inflow',
            name: 'PostInflow',
            component: PostInflow,
            meta: { title: "Post Inflow" }
        },
        {
            path: '/post-outflow',
            name: 'PostOutflow',
            component: PostOutflow,
            meta: { title: "Post Outflow" }
        },
        {
            path: '/bulk-credit',
            name: 'BulkCredit',
            component: BulkCredit,
            meta: { title: "Bulk Credit" }
        },
        {
            path: '/bulk-debit',
            name: 'BulkDebit',
            component: BulkDebit,
            meta: { title: "Bulk Debit" }
        },
        {
            path: '/reports/ledger/inflow-outflow',
            name: 'InflowOutflowLedger',
            component: InflowOutflowLedger,
            meta: { title: "Inflow & Outflow Ledger" }
        },
        {
            path: '/reports/ledger/deposits-payouts',
            name: 'DepositsPayoutsLedger',
            component: DepositsPayoutsLedger,
            meta: { title: "Deposits & Payouts Ledger" }
        },
        {
            path: '/reports/balances',
            name: 'Balances',
            component: Balances,
            meta: { title: "Balances" }
        },
        {
            path: '/reports/members/thrift',
            name: 'MembersOnThrift',
            component: MembersOnThrift,
            meta: { title: "Members on Thrift Savings" }
        },
        {
            path: '/reports/members/loan',
            name: 'MembersOnLoan',
            component: MembersOnLoan,
            meta: { title: "Members on Loan" }
        },
        {
            path: '/reports/members/term-deposit',
            name: 'MembersOnTD',
            component: MembersOnTD,
            meta: { title: "Members on Term Deposit" }
        },
        {
            path: '/reports/members/shares',
            name: 'MembersWithShares',
            component: MembersWithShares,
            meta: { title: "Members with Shares" }
        },
        {
            path: '/reports/admin-log',
            name: 'AdminLog',
            component: AdminLog,
            meta: { title: "Admin Actions Log" }
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router;