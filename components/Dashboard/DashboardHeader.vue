<template>
    <header class="t2w-dash-head">
        <img class="t2w-dash-head__avatar" :src="avatar" alt="" />
        <div class="t2w-dash-head__text">
            <h1 class="t2w-page-title">{{ greeting }}<template v-if="name">, {{ name }}</template></h1>
            <div class="t2w-dash-head__meta">
                <time :datetime="todayIso">{{ today }}</time>
                <template v-if="data?.username"><span aria-hidden="true"> · </span>{{ data.username }}</template>
            </div>
        </div>
        <div class="t2w-dash-head__actions" v-if="$slots.default"><slot></slot></div>
    </header>
</template>

<script setup>
    // Compact greeting for the dashboards: avatar, name, today's date.
    import { computed, ref, watchEffect } from 'vue'
    import { getFullname, getProfilePicture } from '@/helpers'
    import '../ui/tokens.scss'

    const props = defineProps({
        data: { type: Object, default: () => ({}) }
    })

    const avatar = ref("")
    watchEffect(() => {
        if (!props.data) return
        getProfilePicture(props.data).then(r => { avatar.value = r })
    })

    const name = computed(() => props.data ? getFullname(props.data).trim() : "")

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    const today = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    const todayIso = now.toISOString().slice(0, 10)
</script>

<style lang="scss" scoped>
    .t2w-dash-head {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-4);
    }

    .t2w-dash-head__avatar {
        flex: none;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--t2w-primary);
        background: var(--t2w-neutral-soft);
    }

    .t2w-dash-head__text {
        flex: 1 1 auto;
        min-width: 0;
        .t2w-page-title {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .t2w-dash-head__meta {
        font-size: var(--t2w-fs-label);
        color: var(--t2w-muted);
    }

    .t2w-dash-head__actions {
        flex: none;
        display: flex;
        gap: var(--t2w-space-2);
    }

    @media (max-width: 575.98px) {
        .t2w-dash-head { flex-wrap: wrap; }
        .t2w-dash-head__avatar { width: 44px; height: 44px; }
        .t2w-dash-head .t2w-page-title { font-size: 1.2rem; white-space: normal; }
        .t2w-dash-head__actions { flex-basis: 100%; }
    }
</style>
