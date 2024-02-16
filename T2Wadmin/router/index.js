import { createRouter, createWebHashHistory } from 'vue-router'
import NotFound from '@/components/NotFound.vue'
import Dashboard from '../views/Dashboard.vue'
import Accounts from '../views/Accounts/Accounts.vue'
import AccountsList from '../views/Accounts/AccountsList.vue'

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
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router;