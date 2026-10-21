<template>
    <restricted access="6,7,8,9">
        <template #message><span></span></template>
        <Panel v-if="loaded && !complete" title="Complete your profile">
            <div class="t2w-profile-progress">
                <div class="t2w-profile-progress__bar" role="progressbar" :aria-valuenow="percentage"
                    aria-valuemin="0" aria-valuemax="100" aria-label="Profile completeness">
                    <span :style="{ width: percentage + '%' }"></span>
                </div>
                <span class="t2w-profile-progress__value t2w-num">{{ percentage }}%</span>
            </div>
            <ul class="t2w-profile-todo" v-if="todo.length">
                <li v-for="t in todo" :key="t.label">
                    <router-link v-if="t.to" :to="t.to">{{ t.label }}</router-link>
                    <a v-else :href="t.href">{{ t.label }}</a>
                </li>
            </ul>
        </Panel>
    </restricted>
</template>

<script setup>
    // Profile completeness from /t2w/api/m/profile-completeness: a progress bar and the missing items.
    // Hidden once the profile is complete (as before).
    import { Request } from '@/helpers'
    import { onMounted, ref, computed, watch } from 'vue'
    import Panel from '../../../components/ui/Panel.vue'

    const emit = defineEmits(["complete"])

    const percentage = ref(0)
    const fields = ref({})
    const loaded = ref(false)
    const complete = computed(() => percentage.value >= 100)

    onMounted(async () => {
        const req = new Request()
        try {
            const r = await req.post(req.root + "/t2w/api/m/profile-completeness")
            percentage.value = Math.max(0, Math.min(100, Math.round(Number(r?.data?.percentage) || 0)))
            fields.value = r?.data?.fields ?? {}
            loaded.value = true
        } catch (e) {
            // leave the panel hidden: it is a reminder, not something the dashboard depends on
        }
    })

    watch(complete, c => { if (c) emit("complete") })

    const missing = (...keys) => keys.some(k => k in (fields.value ?? {}))

    const todo = computed(() => [
        missing('ac_number', 'ac_name', 'bank_name') && { label: "Add your bank details", to: "/profile/update-account-details" },
        missing('n1_fullname', 'n1_phone') && { label: "Add your next of kin", to: "/profile/update-nok" },
        missing('profile_picture') && { label: "Upload a profile picture", href: "/#/change-profile-picture" },
        missing('birthday_month', 'birthday_day') && { label: "Add your birthday", to: "/profile/update-birthday" },
    ].filter(Boolean))
</script>

<style lang="scss" scoped>
    .t2w-profile-progress {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-3);
    }

    .t2w-profile-progress__bar {
        flex: 1 1 auto;
        height: 8px;
        border-radius: var(--t2w-radius-pill);
        background: var(--t2w-neutral-soft);
        overflow: hidden;
        span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: var(--t2w-primary);
            transition: width 0.4s ease;
        }
    }

    .t2w-profile-progress__value {
        font-size: var(--t2w-fs-label);
        font-weight: 600;
        color: var(--t2w-text);
    }

    .t2w-profile-todo {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--t2w-space-1);
        font-size: var(--t2w-fs-table);
        li::before {
            content: "○";
            color: var(--t2w-muted);
            margin-right: var(--t2w-space-2);
        }
        a { color: var(--t2w-primary); text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
    }
</style>
