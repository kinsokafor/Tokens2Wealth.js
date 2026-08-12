<template>
    <div class="card mb-2">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title mb-0">{{ data.goal_name }}</h5>
                <span class="badge" :class="{
                    'bg-success': data.status == 'active',
                    'bg-primary': data.status == 'matured'
                }">{{ data.status }}</span>
            </div>
            <div class="progress mt-2 mb-2" style="height: 10px;">
                <div class="progress-bar bg-success" role="progressbar" :style="{width: percent+'%'}"></div>
            </div>
            <div class="justify-content-between d-flex">
                <span>Saved so far</span>
                <em>{{ toLocale(parseFloat(data.total_contributed)) }}</em>
            </div>
            <div class="justify-content-between d-flex">
                <span>Target</span>
                <em>{{ toLocale(parseFloat(data.target_amount)) }}</em>
            </div>
            <div class="justify-content-between d-flex">
                <span>Contribution</span>
                <em>{{ toLocale(parseFloat(data.contribution_amount)) }} {{ data.frequency }}</em>
            </div>
            <hr/>
            <router-link :to="`/savings/special/goal/${data.id}`" class="btn btn-primary2">View Goal</router-link>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const props = defineProps({
        data: Object
    })

    const percent = computed(() => {
        const target = parseFloat(props.data.target_amount)
        const contributed = parseFloat(props.data.total_contributed)
        if(!target || target <= 0) return 0
        return Math.min(100, Math.round((contributed / target) * 100))
    })
</script>

<style lang="scss" scoped>

</style>
