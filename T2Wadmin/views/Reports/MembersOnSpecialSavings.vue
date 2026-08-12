<template>
    <div>
        <Table
            :data="data"
            :columns="columns"
            :actions="actions"
            :processing="processing"
            :quick-filters="quickFilters"
            @force-mature="forceMature"
        >
        <template #before>
            <div class="row">
                <div class="col-md-12">
                    <h3 class="page-title">Members on Special Savings</h3>
                </div>
            </div>
        </template>
    </Table>
    </div>
</template>

<script setup>
    import Table from '@/components/Table.vue'
    import { onMounted, ref } from 'vue'
    import { Request, getFullname } from '@/helpers'
    import { toLocale } from '@module/Tokens2Wealth/helpers'
    import { useAlertStore } from '@/store/alert'
    import { useDateFormat } from '@vueuse/core'

    const r = new Request();
    const alertStore = useAlertStore();
    const data = ref([]);
    const processing = ref(false);

    const columns = {
        surname: {heading: "Fullname", processor: function() {return getFullname(this)}},
        goal_name: "Goal",
        target_amount: {heading: "Target", processor: function() {return toLocale(this.target_amount)}},
        contribution_amount: {heading: "Contribution", processor: function() {return `${toLocale(this.contribution_amount)} ${this.frequency}`}},
        total_contributed: {heading: "Saved so far", processor: function() {return toLocale(this.total_contributed)}},
        next_due_date: {
            heading: "Next Due",
            processor: function() {
                return this.status == 'active' ? (useDateFormat(this.next_due_date, 'MMM DD, YYYY')).value : "-"
            }
        },
        maturity_date: {
            heading: "Maturity",
            processor: function() {
                return (useDateFormat(this.maturity_date, 'MMM DD, YYYY')).value
            }
        },
        status: "Status"
    }

    const actions = [
        {
            name: "Force Mature",
            type: "action",
            callback: "force-mature",
            access: [1,2],
            conditions: {status: 'active'}
        }
    ]

    const quickFilters = [
        { label: "Active", key: "status", value: "active" },
        { label: "Matured", key: "status", value: "matured" }
    ]

    function fetchGoals() {
        processing.value = true
        r.get(r.root+"/t2w/api/special-savings/goals").then(res => {
            data.value = res.data.map(i => {
                i.link = `/t2w/a/#/special-savings/goal/${i.id}`
                return i
            })
            processing.value = false
        }).catch(() => {
            processing.value = false
        })
    }

    function forceMature(goal) {
        if(confirm(`Are you sure you want to force-mature the goal "${goal.goal_name}"? This will immediately pay out NGN ${toLocale(parseFloat(goal.total_contributed))} to the cooperator's e-wallet and cancel any pending debit for this goal.`)) {
            processing.value = true
            r.post(r.root+`/t2w/api/special-savings/goal/${goal.id}/force-mature`).then(() => {
                alertStore.success("Goal matured successfully")
                fetchGoals()
            }).catch(e => {
                alertStore.error(e.response?.data ?? "Something went wrong")
                processing.value = false
            })
        }
    }

    onMounted(fetchGoals)
</script>

<style lang="scss" scoped>

</style>
