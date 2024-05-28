import { createRouter, createWebHashHistory } from 'vue-router'
import NotFound from '@/components/NotFound.vue'
import Dashboard from '../views/Dashboard.vue'
import Savings from '../views/Savings/Savings.vue'
import TermDeposit from '../views/Savings/TermDeposit.vue'
import Loan from '../views/Loan.vue'
import Profile from '../views/Profile.vue'
import Shares from '../views/Investments/Shares.vue'
import ThriftSavings from '../views/Savings/ThriftSavings.vue'
import EWallet from '../views/Savings/EWallet.vue'
import SpecialSavings from '../views/Savings/SpecialSavings.vue'
import Statements from '../views/Savings/Statements.vue'
import NewTD from '../views/Forms/NewTD.vue'
import TopUpTD from '../views/Forms/TopUpTD.vue'
import NewLoan from '../views/Forms/NewLoan.vue'
import BuyShares from '../views/Forms/BuyShares.vue'
import SellShares from '../views/Forms/SellShares.vue'
import NewThrift from '../views/Forms/NewThrift.vue'
import EditThrift from '../views/Forms/EditThrift.vue'
import ChangeGuarantor from '../views/Forms/ChangeGuarantor.vue'
import UpdateNOK from '../views/Forms/UpdateNOK.vue'
import UpdateAccountDetails from '../views/Forms/UpdateAccountDetails.vue'
import UpdateBusiness from '../views/Forms/UpdateBusiness.vue'

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
            path: '/loan',
            name: 'Loan',
            component: Loan,
            meta: { title: "Loan" }
        },
        {
            path: '/loan/new',
            name: 'NewLoan',
            component: NewLoan,
            meta: { title: "Loan - New Loan" }
        },
        {
            path: '/loan/change-guarantor',
            name: 'ChangeGuarantor',
            component: ChangeGuarantor,
            meta: { title: "Loan - Change Guarantor" }
        },
        {
            path: '/investments/shares',
            name: 'Shares',
            component: Shares,
            meta: { title: "Shares" }
        },
        {
            path: '/investments/shares/buy',
            name: 'BuyShares',
            component: BuyShares,
            meta: { title: "Buy Shares" }
        },
        {
            path: '/investments/shares/sell',
            name: 'SellShares',
            component: SellShares,
            meta: { title: "Sell Shares" }
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
            path: '/savings/thrift/edit',
            name: 'EditThrift',
            component: EditThrift,
            meta: { title: "Savings - Edit Thrift Savings" }
        },
        {
            path: '/savings/thrift/new',
            name: 'NewThrift',
            component: NewThrift,
            meta: { title: "Savings - New Thrift Savings" }
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
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile,
            meta: { title: "Profile" }
        },
        {
            path: '/profile/update-nok',
            name: 'UpdateNOK',
            component: UpdateNOK,
            meta: { title: "Profile - Update Next of Kin" }
        },
        {
            path: '/profile/update-account-details',
            name: 'UpdateAccountDetails',
            component: UpdateAccountDetails,
            meta: { title: "Profile - Update Account Details" }
        },
        {
            path: '/profile/update-business',
            name: 'UpdateBusiness',
            component: UpdateBusiness,
            meta: { title: "Profile - Update Business" }
        }
    ]
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    next();
});

export default router;