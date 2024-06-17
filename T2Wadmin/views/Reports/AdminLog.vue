<template>
    <div>
        <data-filter :data="store.get({})" v-slot="{outputData}" search-columns="['narration', 'time_altered']">
            <list-item v-for="data in outputData" :key="data.id">
                <h4><admin-name :id="data.last_altered_by"></admin-name></h4>
                <div v-html="data.narration"></div>
                <template #right>
                    <small>{{ data.time_altered }}</small>
                </template>
            </list-item>
        </data-filter>
    </div>
</template>

<script setup>
    import {useAdminLogStore} from '../../../store/adminLog'
    import ListItem from '@theme/ListItem.vue'
    import DataFilter from '@filter/DataFilter.vue'
    import AdminName from '@module/Tokens2Wealth/components/AdminName.vue'

    const store = useAdminLogStore()

</script>

<style lang="scss" scoped>

</style>