<template>
    <div class="t2w-member-card">
        <img :src="userImg" alt="" class="t2w-member-card__img" />
        <div class="t2w-member-card__info">
            <router-link :to="profileLink" class="t2w-member-card__name">{{ fullname }}</router-link>
            <div class="t2w-member-card__meta">
                <span class="t2w-num">Membership number {{ user.username }}</span>
                <span class="t2w-member-card__extra" v-if="$slots.default"><slot></slot></span>
            </div>
        </div>
    </div>
</template>

<script setup>
    // A member's avatar, name (linking to their profile) and membership number.
    import { computed } from 'vue'
    import { useUserProfile } from '@/helpers'
    import './ui/tokens.scss'

    const props = defineProps({
        userId: Number
    })

    const { fullname, user, userImg } = useUserProfile(props.userId)

    const profileLink = computed(() => {
        if (user.value?.role === 'member') return `/member/profile/${user.value.id}`
        if (user.value?.role === 'pending') return `/pending/profile/${user.value.id}`
        return `/profile/${user.value?.id}`
    })
</script>

<style lang="scss" scoped>
    .t2w-member-card {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        min-width: 0;
    }

    .t2w-member-card__img {
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--t2w-primary);
        background: var(--t2w-neutral-soft);
    }

    .t2w-member-card__info { min-width: 0; }

    .t2w-member-card__name {
        display: block;
        font-weight: 600;
        font-size: var(--t2w-fs-table);
        color: var(--t2w-text);
        text-decoration: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &:hover { color: var(--t2w-primary); text-decoration: underline; }
    }

    .t2w-member-card__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0 var(--t2w-space-3);
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
    }
</style>
