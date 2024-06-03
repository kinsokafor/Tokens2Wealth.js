<template>
    <restricted access="6,7,8,9">
        <template #message><span></span></template>
        <div v-if="!status && percentage != 0" class="mb-2">
            <p><em>Your profile is {{ percentage }}% complete</em></p>
            <div class="progress-bar"></div>
            <p class="text-danger"><small>Please complete your profile</small></p>
            <ul>
                <li v-if="'ac_number' in fields || 'ac_name' in fields || 'bank_name' in fields">
                    Update your bank details -- <router-link to="/profile/update-account-details">
                        <em>click here</em>
                    </router-link>
                </li>
                <li v-if="'n1_fullname' in fields || 'n1_phone' in fields">
                    Update your Next of Kin -- <router-link to="/profile/update-nok">
                        <em>click here</em>
                    </router-link>
                </li>
                <li v-if="'profile_picture' in fields">
                    Update your Profile picture -- <a href="/#/change-profile-picture">
                        <em>click here</em>
                    </a>
                </li>
                <li v-if="'birthday_month' in fields || 'birthday_day' in fields">
                    Update your Birthday -- <router-link to="/profile/update-birthday">
                        <em>click here</em>
                    </router-link>
                </li>
            </ul>
        </div>
    </restricted>
</template>

<script setup>
    import {Request} from '@/helpers'
    import { onMounted, ref, computed, watchEffect } from 'vue';

    const req = new Request()
    const percentage = ref(0)
    const fields = ref([])
    const status = computed(() => percentage.value >= 100)
    const percentageDisplay = computed(() => percentage.value + "%")

    const emit = defineEmits(["complete"]);

    onMounted(() => {
        req.post(req.root+"/t2w/api/m/profile-completeness").then(r => {
            percentage.value = r.data.percentage
            fields.value = r.data.fields
        })
    })

    watchEffect(() => {
        if(percentage.value >= 100) {
            emit("complete");
        }
    })
</script>

<style lang="scss" scoped>
    * {
        padding: 0;
        margin: 0;
        line-height: normal;
    }
    @keyframes shiny {
        0% {
            left: -10%;
        }

        100% {
            left: 110%;
        }
    }
    .progress-bar {
        width: 100%;
        position: relative;
        height: 10px;
        background: rgb(230, 230, 230);
        border-radius: 5px;
        overflow: clip;
    }
    .progress-bar::before {
        content: "";
        display: block;
        position: absolute;
        top: -5px;
        left: 0px;
        height: 20px;
        background: var(--color2);
        width: v-bind(percentageDisplay);
    }
    .progress-bar::after {
        content: "";
        display: block;
        position: absolute;
        top: -5px;
        height: 80px;
        background: white;
        width: 30px;
        filter: blur(8px);
        mix-blend-mode: overlay;
        transform: skewX(50%);
        opacity: 0.3;
        animation: shiny linear infinite 2s;
    }
    ul {
        border-left: 1.5px solid var(--color2);
        li {
            display: block;
            text-indent: 12px;
            font-size: smaller;
        }
    }
    
</style>