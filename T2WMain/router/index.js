import { createRouter, createWebHashHistory } from 'vue-router'
import NotFound from '@/components/NotFound.vue'
import Registration from '../views/Registration.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: NotFound,
            meta: { title: "404 Not Found" }
        },
        {
            path: '/registration/:referrer?',
            name: 'Dashboard',
            component: Registration,
            meta: { title: "Registration" }
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    var e = document.querySelectorAll(".mobile-nav-toggle.bi-x");
    e.forEach(i => {
        i.click()
    })
    next();
});

export default router;