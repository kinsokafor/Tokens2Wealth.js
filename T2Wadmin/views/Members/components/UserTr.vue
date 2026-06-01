<template>
    <tr @click="$router.push(profileLink.replace('/t2w/a/#', ''))" style="cursor: pointer;">
        <td>{{ sn }}</td>
        <td>
            <a :href="profileLink">
                <div class="img-container img-responsive">
                    <img :src="userImg" class="img" width="30px" />
                </div>
            </a>
        </td>
        <td>{{ fullname }}</td>
        <td>{{ user.username }}</td>
        <td v-for="col in columns" :key="col">
            {{ user[col] }}
        </td>
        <td>{{ dateCreated }}</td>
        <td @click.stop>
            <dropdown-actions :actions="actions" :data="data" @action="handleActions"></dropdown-actions>
        </td>
    </tr>
</template>

<script setup>
import { useUserProfile } from '@/helpers'
import { useDateFormat } from '@vueuse/core';
import DropdownActions from '@components/DropdownActions.vue';
import { computed } from 'vue'

const props = defineProps({
    sn: Number,
    data: Object,
    columns: {
        type: Array,
        default: []
    }
})

const emit = defineEmits(['action'])

const { fullname, user, roleName, userImg, profileLink } = useUserProfile(props.data)

const dateCreated = computed(() => {
    if (props.data.date_created) {
        if (props.data.date_created.toString().length == 10) {
            return useDateFormat((props.data.date_created * 1000), 'YYYY-MM-DD HH:mmA')
        } else {
            const [dateString, timeString] = props.data.date_created.split(' ');
            return useDateFormat(new Date(`${dateString.replace(':', '-')} ${timeString}`), 'YYYY-MM-DD HH:mmA')
        }
    }
    return null
})

const actions = computed(() => [
    {
        name: "Profile",
        type: "link",
        url: profileLink.value
    },
    {
        name: "Disable",
        type: "action",
        callback: "disableUser",
        conditions: {
            status: "active",
        },
    },
    {
        name: "Enable",
        type: "action",
        callback: "enableUser",
        conditions: {
            status: "inactive",
        },
    },
    {
        name: "Delete",
        type: "action",
        callback: "deleteUser",
        conditions: {
            status: "inactive",
        },
    },
]);

function handleActions(options) {
    emit("action", options)
}

</script>

<style lang="scss" scoped></style>