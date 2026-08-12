<template>
    <div class="row justify-content-around">
        <div class="col-md-7">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">New special savings goal</h5>

                    <CreateForm :fields="fields"
                        @submit="handleSubmit"
                        @values="v => values = v"
                        :processing="processing">
                        <div class="alert alert-info" v-if="schedule">
                            You will contribute {{ toLocale(schedule.contributionAmount) }} {{ values.frequency }} to reach your target of {{ toLocale(parseFloat(values.target_amount)) }} in {{ values.duration_months }} month(s).
                        </div>
                    </CreateForm>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import CreateForm from '@/components/form/CreateForm.vue'
    import * as yup from 'yup'
    import { Request } from '@/helpers'
    import { useAlertStore } from '@/store/alert'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const router = useRouter()
    const req = new Request();
    const processing = ref(false)
    const alertStore = useAlertStore()
    const values = ref({})

    const durationOptions = [
        { name: "6 months", value: 6 },
        { name: "12 months", value: 12 },
        { name: "24 months", value: 24 }
    ]

    const frequencyOptions = [
        { name: "Daily", value: "daily" },
        { name: "Weekly", value: "weekly" },
        { name: "Monthly", value: "monthly" }
    ]

    const fields = computed(() => [
        {
            label: "Goal name",
            name: "goal_name",
            rules: yup.string().required()
        },
        {
            label: "Target amount",
            name: "target_amount",
            rules: yup.number().required().min(1)
        },
        {
            label: "Contribution frequency",
            name: "frequency",
            rules: yup.string().required(),
            as: "select",
            options: frequencyOptions
        },
        {
            label: "Duration",
            name: "duration_months",
            rules: yup.number().required(),
            as: "select",
            options: durationOptions
        }
    ])

    // mirrors SpecialSavings::calculateSchedule() on the backend, purely for a live preview
    const schedule = computed(() => {
        const target = parseFloat(values.value.target_amount)
        const frequency = values.value.frequency
        const duration = parseInt(values.value.duration_months)
        if(!target || target <= 0 || !frequency || !duration) return null

        const totalDays = duration * 30
        let intervalDays, totalPeriods
        if(frequency === 'daily') {
            intervalDays = 1
            totalPeriods = totalDays
        } else if(frequency === 'weekly') {
            intervalDays = 7
            totalPeriods = Math.floor(totalDays / 7)
        } else {
            intervalDays = 30
            totalPeriods = duration
        }
        totalPeriods = Math.max(1, totalPeriods)

        return {
            intervalDays,
            totalPeriods,
            contributionAmount: Math.round((target / totalPeriods) * 100) / 100
        }
    })

    const handleSubmit = (data, actions) => {
        processing.value = true;
        req.post(req.root+"/t2w/api/new-special-savings", data).then(r => {
            processing.value = false
            router.push(`/savings/special/goal/${r.data.id}`)
        }).catch(e => {
            processing.value = false
            alertStore.add(e.response.data, "danger")
        })
    }
</script>

<style lang="scss" scoped>

</style>
