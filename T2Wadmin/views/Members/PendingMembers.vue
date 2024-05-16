<template>
    <DataFilter :data="data" v-slot="{outputData}" :search-columns="['surname', 'other_names', 'middle_name']">
        <div class="row">
            <div class="col-md-4" v-for="d in outputData" :key="d.id">
                <user-card :data="d">
                    <span v-if="d?.payment_status == 'paid'" class="badge bg-success">Paid</span>
                </user-card>
            </div>
        </div>
        
    </DataFilter>
</template>

<script setup>
    import { useUsersStore } from '@/Modules/Main/store/users'
    import {computed} from 'vue'
    import DataFilter from '@/components/filters/DataFilter.vue'
    import UserCard from '@/components/theme/UserCard.vue'

    const store = useUsersStore()
    const data = computed(() => store.get({role: 'pending', payment_status: 'paid'}))
</script>

<style lang="scss" scoped>

</style>