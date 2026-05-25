<template>
    <Restricted access="3,4">
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <label for="field1">Status</label>
                        <select class="form-control" id="field1" v-model="query.status">
                            <option v-for="s in status" :key="s.value" :value="s.value">
                                {{ s.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="field2">Role</label>
                        <select class="form-control" id="field2" v-model="query.role">
                            <option v-for="role in roles" :key="role" :value="role.value">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="fullname">Search</label>
                        <div class="name-search-filter">
                            <input type="search" class="form-control flex-2" id="fullname" placeholder="Search..."
                                v-model="query.search" />
                        </div>
                    </div>
                </div>
                <div class="accordion" id="accordionExample mt-4">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Add Columns
                            </button>
                        </h2>
                        <div id="collapseOne" class="accordion-collapse collapse"
                            data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <Picker :attrs="{ options: pickerFields, multiple: true }" v-model="selectedColumns" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Filter v-bind="filterProps" :loading="store.loading" @setPage="setPage" @setLimit="setLimit"
            v-slot="{ outputData }">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th></th>
                            <th>Name</th>
                            <th>Membership Number</th>
                            <th v-for="col in selectedColumns" :key="col">
                                {{ getColumnName(col) }}
                            </th>
                            <th>Date Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <user-tr v-for="(user, index) in outputData" :key="user.id" :data="user"
                            :sn="getSerialNumber(index)" :columns="selectedColumns" @action="handleAction"></user-tr>
                    </tbody>
                </table>
            </div>
        </Filter>
    </Restricted>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useUsersBDStore } from '@module/Main/store/usersBDS'
import { useStore, Users } from '@/helpers'
import { useConfigStore } from '@/store/config'
import Picker from '@form/Picker.vue'
import { useLocalStorage } from '@vueuse/core';
import userTr from './components/UserTr.vue';

const configStore = useConfigStore();
const auth = computed(() => configStore.get('Auth'));
const selectedColumns = ref([]);
const query = ref(useLocalStorage('usersPageQuery', {}))

const roles = computed(() => {
    if (auth.value.roles == undefined) return {}
    return Object.entries(auth.value.roles).map(role => {
        return {
            name: role[1].name,
            value: role[0],
            capacity: role[1].capacity,
        }
    })
})

const store = useUsersBDStore();

const config = computed(() => ({
    query: {
        order_by: "surname,middle_name,other_names",
        searchin: "surname,middle_name,other_names,email,username",
        ...query.value
    },
    orderBy: "surname,middle_name,other_names",
    order: "desc"
}))

const { Filter, setPage, setLimit, filterProps, updateInCache, getSerialNumber } = useStore(store, config)

const getTemp = (data) => {
    switch (data?.gender) {
        case "female":
        case "Female":
            return female
            break;
        default:
            return male
            break;
    }
}

const pickerFields = [
    // {
    //     name: "Fullname",
    //     value: "fullname"
    // },
    // {
    //     name: "Membership Number",
    //     value: "username"
    // },
    {
        name: "Phone Number",
        value: "phone"
    },
    {
        name: "Date of Registration",
        value: "date_created"
    },
    // {
    //     name: "Photo",
    //     value: "profile_display"
    // },
    {
        name: "Email",
        value: "email"
    },
    {
        name: "Referrer",
        value: "referral"
    },
    {
        name: "Gender",
        value: "gender"
    },
    {
        name: "Occupation",
        value: "occupation"
    },
    {
        name: "Address",
        value: "address"
    },
    {
        name: "City",
        value: "city"
    },
    {
        name: "L.G.A",
        value: "lga"
    },
    {
        name: "State",
        value: "state"
    },
    {
        name: "Country",
        value: "country"
    },
    {
        name: "Account Number",
        value: "ac_number"
    },
    {
        name: "Bank",
        value: "bank_name"
    },
    {
        name: "Account Name",
        value: "ac_name"
    }
]

const getColumnName = (colValue) => {
    const field = pickerFields.find(f => f.value === colValue)
    return field ? field.name : colValue
}

const columns = computed(() => {
    const cols = {}
    selectedColumns.value.forEach(col => {
        if (col in columnFilter) {
            cols[col] = columnFilter[col]
        } else {
            const index = pickerFields.findIndex(i => i.value == col)
            cols[col] = pickerFields[index]?.name ?? col
        }
    })
    return cols
})

const getLink = (id, role) => {
    if (role in auth.value.roles) {
        if ("profile" in auth.value.roles[role]) {
            return ("/" + auth.value.roles[role].profile + "/" + id).replace("//", "/").replace("//", "/");
        }
    }
    return ("/admin/#/profile/" + id).replace("//", "/").replace("//", "/")
}

const actions = [
    {
        name: "Disable",
        type: "action",
        callback: "disableUser",
        conditions: {
            status: "active"
        },
        access: "1,2"
    },
    {
        name: "Enable",
        type: "action",
        callback: "enableUser",
        conditions: {
            status: "inactive"
        },
        access: "1,2"
    },
    {
        name: "Delete",
        type: "action",
        callback: "deleteUser",
        conditions: {
            status: "inactive"
        },
        access: "1,2"
    }
]

const status = [
    { name: "Active", value: "active" },
    { name: "Inactive", value: "inactive" }
]

onMounted(() => {
    query.value.status = "active"
})

async function handleAction(options) {
    const users = new Users;
    let res = null;
    switch (options.action) {
        case "disableUser":
            res = await users.update(options.data.id, { status: "inactive" });
            if (res.status === 200) {
                updateInCache(res.data, options.data.id, "id");
            }
            break;

        case "enableUser":
            res = await users.update(options.data.id, { status: "active" });
            if (res.status === 200) {
                updateInCache(res.data, options.data.id, "id");
            }
            break;

        case "deleteUser":
            res = await users.update(options.data.id, { status: "deleted" });
            if (res.status === 200) {
                updateInCache(res.data, options.data.id, "id");
            }
            break;
    }
}
</script>

<style lang="scss" scoped></style>