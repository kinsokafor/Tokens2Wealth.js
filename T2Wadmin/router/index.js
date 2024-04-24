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
import EWalletCredits from '../views/Reports/EWalletCredits.vue'
import EWalletCreditView from '../views/Reports/EWalletCreditView.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFound,
            meta: { title: "404 Not Found" }
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
            path: '/ewallet-credits/:id',
            name: 'EWalletCreditView',
            component: EWalletCreditView,
            meta: { title: "E-Wallet Credit" }
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router;