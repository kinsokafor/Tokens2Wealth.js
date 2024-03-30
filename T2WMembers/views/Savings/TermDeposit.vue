<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <AccountIntro></AccountIntro>
        <Menu :items="fields" class="mt-4"></Menu>
    </Restricted>
</template>

<script setup>
    import AccountIntro from '../../components/TermDepositIntro.vue';
    import { ref, computed } from 'vue';
    import { useAccountsStore } from '../../../store/accounts'
    import { useAuthStore } from '@/store/auth'
    import Menu from '@/components/menu/Menu.vue'

    const store = useAccountsStore()
    const auth = useAuthStore()

    const u = computed(() => auth.getUser)

    const account = computed(() => {
        const myAcc = store.get({ac_type: 'term_deposit', user_id: u.value.id})
        if(myAcc.length > 0) return myAcc[0]
        return {}
    })

    const fields = computed(() => [
        {
            link: `/savings/term-deposit/new`,
            label: 'New/Modify',
            iconClass: 'fa-list',
            access: '5,6,7,8,9',
            isRouter: true
        },
        {
            link: `/term_deposit/statement`,
            label: 'Statement',
            iconClass: 'fa-list',
            access: '5,6,7,8,9',
            isRouter: true
        }
    ])
</script>

<style lang="scss" scoped>

</style>