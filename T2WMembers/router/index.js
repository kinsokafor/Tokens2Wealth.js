import { createRouter, createWebHashHistory } from 'vue-router'
import NotFound from '@/components/NotFound.vue'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import Savings from '../views/Savings/Savings.vue'
import TermDeposit from '../views/Savings/TermDeposit.vue'
import ThriftSavings from '../views/Savings/ThriftSavings.vue'
import EWallet from '../views/Savings/EWallet.vue'
import SpecialSavings from '../views/Savings/SpecialSavings.vue'
import Statements from '../views/Savings/Statements.vue'
import NewTD from '../views/Forms/NewTD.vue'
import TopUpTD from '../views/Forms/TopUpTD.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFound,
            meta: { title: "404 Not Found" }
        },
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard,
            meta: { title: "Dashboard" }
        },
        {
            path: '/profile/:id',
            name: 'Profile',
            component: Profile,
            meta: { title: "Profile" }
        },
        {
            path: '/savings/term-deposit',
            name: 'Term Deposit',
            component: TermDeposit,
            meta: { title: "Savings - Term Deposit" }
        },
        {
            path: '/savings/term-deposit/new',
            name: 'NewTD',
            component: NewTD,
            meta: { title: "Savings - New Term Deposit" }
        },
        {
            path: '/savings/term-deposit/top-up',
            name: 'TopUpTD',
            component: TopUpTD,
            meta: { title: "Savings - Top Up Term Deposit" }
        },
        {
            path: '/savings/thrift',
            name: 'ThriftSavings',
            component: ThriftSavings,
            meta: { title: "Savings - Thrift Savings" }
        },
        {
            path: '/savings/e-wallet',
            name: 'EWallet',
            component: EWallet,
            meta: { title: "Savings - Ewallet" }
        },
        {
            path: '/savings',
            name: 'Savings',
            component: Savings,
            meta: { title: "Savings" }
        },
        {
            path: '/savings/special',
            name: 'SpecialSavings',
            component: SpecialSavings,
            meta: { title: "Savings - Special Savings" }
        },
        {
            path: '/:ac_type/statement',
            name: 'Statements',
            component: Statements,
            meta: { title: "Savings - Statements" }
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router;