<template>
    <Restricted access="1,2,3,4,5,6,7,8,9,10">
        <loading :active="processing" :can-cancel="true" :is-full-page="false"></loading>
        <div v-if="goal">
            <Header :data="goal" :bg="bgMap" :img="wallet" :caption="goal.goal_name">
                <p>Special Savings goal started {{ formatDate(goal.start_date) }}</p>
                <template #status>
                    <span class="badge" :class="{
                        'bg-success': goal.status == 'active',
                        'bg-primary': goal.status == 'matured'
                    }">{{ goal.status }}</span>
                </template>
            </Header>
            <div class="row">
                <div class="col-md-4">
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">Progress</h5>
                            <div class="progress mb-2" style="height: 12px;">
                                <div class="progress-bar bg-success" role="progressbar" :style="{width: percent+'%'}"></div>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Saved so far</span>
                                <em>{{ toLocale(parseFloat(goal.total_contributed)) }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Target amount</span>
                                <em>{{ toLocale(parseFloat(goal.target_amount)) }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Percentage completed</span>
                                <em>{{ percent }}%</em>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">Particulars</h5>
                            <div class="justify-content-between d-flex">
                                <span>Contribution</span>
                                <em>{{ toLocale(parseFloat(goal.contribution_amount)) }} {{ goal.frequency }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Contributions made</span>
                                <em>{{ goal.periods_settled }} of {{ goal.total_periods }}</em>
                            </div>
                            <div class="justify-content-between d-flex" v-if="goal.status == 'active'">
                                <span>Next contribution date</span>
                                <em>{{ formatDate(goal.next_due_date) }}</em>
                            </div>
                            <div class="justify-content-between d-flex">
                                <span>Maturity date</span>
                                <em>{{ formatDate(goal.maturity_date) }}</em>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="!processing">
            <em>Goal not found</em>
        </div>
    </Restricted>
</template>

<script setup>
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Header from '../../../components/Accounts/Header.vue';
    import wallet from '../../../assets/img/wallet.png';
    import { Request } from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import Loading from 'vue3-loading-overlay';
    import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

    const route = useRoute()
    const r = new Request();
    const goal = ref(null)
    const processing = ref(false)

    const percent = ref(0)

    function formatDate(dateString) {
        if(!dateString) return "-"
        const d = new Date(dateString.replace(" ", "T"))
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }

    function fetchGoal() {
        processing.value = true
        r.get(r.root+`/t2w/api/special-savings/goal/${route.params.id}`).then(res => {
            goal.value = res.data
            const target = parseFloat(res.data.target_amount)
            const contributed = parseFloat(res.data.total_contributed)
            percent.value = (!target || target <= 0) ? 0 : Math.min(100, Math.round((contributed / target) * 100))
            processing.value = false
        }).catch(() => {
            processing.value = false
        })
    }

    onMounted(fetchGoal)
</script>

<style lang="scss" scoped>

</style>
