<template>
    <div class="row">
        <div class="col-md-12">
            <h3 class="page-title">Learning Materials</h3>
        </div>
    </div>
    <div>
        <data-filter :data="store.get({})" v-slot="{outputData}" search-columns="['description', 'time_altered']">
            <list-item v-for="data in outputData" :key="data.id">
                <h4>{{ data.title }}</h4>
                <div v-html="data.description"></div>
                <template #right>
                    <small>{{ data.time_altered }}</small>
                    <br>
                    <a :href="getLink(data.file)" download>Download</a>
                </template>
            </list-item>
        </data-filter>
    </div>
</template>

<script setup>
    import {useLMStore} from '@module/Tokens2Wealth/store/learningMaterials'
    import ListItem from '@theme/ListItem.vue'
    import DataFilter from '@filter/DataFilter.vue'

    const store = useLMStore()

    const getLink = (link) => {
        return link.charAt(0) == "/" ?  link : (String(link).search("http") == -1 ? "/"+link : link);
    }
</script>

<style lang="scss" scoped>

</style>