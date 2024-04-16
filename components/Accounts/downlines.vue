<template>
    <div>
        <member-card-2 v-for="account in accounts" :key="account.id" :data="account" class="cont">
            <span 
                class="level badge"
                :class="{
                    'bg-dark': (account?.level == undefined),
                    'bg-danger': (account?.level == 1),
                    'bg-light text-info': (account?.level == 2),
                    'bg-warning text-black': (account?.level == 3),
                    'bg-info': (account?.level == 4),
                    'bg-success': (account?.level == 5)
                }"
            >level {{ account?.level ?? 0 }}</span>
        </member-card-2>
    </div>
</template>

<script setup>
    import {ref, onMounted} from 'vue'
    import {Request} from '@/helpers'
    import MemberCard2 from '../MemberCard2.vue';
    import _ from 'lodash'

    const req = new Request();

    const accounts = ref([])

    const props = defineProps({
        account: String,
        level: Number
    })

    onMounted(() => {
        req.post(req.root+`/t2w/api/downlines/${props.account}/${props.level}`).then(r => {
            r.data.forEach(i => {
                i = { ...i, ...(JSON.parse(i.meta)) }
                delete i.meta
                const index = accounts.value.findIndex(j => j.id == i.id)
                if (index == -1) {
                    accounts.value = [...accounts.value, i]
                } else {
                    if (!_.isEqual(accounts.value[index], i)) {
                        accounts.value[index] = i
                    }
                }
            })
        })
    })

</script>

<style lang="scss" scoped>
    .cont {
        position: relative;
    }
    .level {
        position: absolute;
        top: -3px;
        right: 10px;
    }
</style>