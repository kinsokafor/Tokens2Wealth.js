<template>
    <router-link :to="`/accounts/view/${data.ac_type}/${data.ac_number}`" class="t2w-ac-card">
        <img :src="userImg" alt="" class="t2w-ac-card__img" />
        <span class="t2w-ac-card__main">
            <span class="t2w-ac-card__name">{{ data.surname }} {{ data.other_names }}</span>
            <span class="t2w-ac-card__meta t2w-num">{{ product }} · {{ data.ac_number }}</span>
        </span>
        <span class="t2w-ac-card__side">
            <span class="t2w-ac-card__balance t2w-num">{{ balance }}</span>
            <StatusBadge v-if="data.status" :status="data.status" />
        </span>
    </router-link>
</template>

<script setup>
    // One account as a tile: member, product, account number, balance and status.
    // Share accounts hold units, so their balance is shown in units (it was shown as naira).
    import { computed, ref, watchEffect } from 'vue'
    import { getProfilePicture, titleCase } from '@/helpers'
    import StatusBadge from './ui/StatusBadge.vue'
    import { money, count } from '../helpers/format'
    import './ui/tokens.scss'

    const props = defineProps({
        data: Object
    })

    const userImg = ref("")
    watchEffect(() => {
        getProfilePicture(props.data).then(r => { userImg.value = r })
    })

    const product = computed(() => {
        const t = props.data?.ac_type
        return t === 'contribution' ? 'E-wallet' : t === 'special' ? 'Special savings' : titleCase(String(t ?? '').replace(/_/g, ' '))
    })

    const balance = computed(() => props.data?.balance === undefined || props.data?.balance === null ? ""
        : props.data.ac_type === 'share' ? `${count(props.data.balance)} units` : money(props.data.balance))
</script>

<style lang="scss" scoped>
    .t2w-ac-card {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-3);
        padding: var(--t2w-space-3);
        margin-bottom: var(--t2w-space-3);
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        box-shadow: var(--t2w-shadow);
        color: var(--t2w-text);
        text-decoration: none;
        min-width: 0;
        transition: border-color 0.15s ease;
        &:hover { border-color: var(--t2w-primary); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: 2px; }
    }

    .t2w-ac-card__img {
        flex: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--t2w-primary);
        background: var(--t2w-neutral-soft);
    }

    .t2w-ac-card__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .t2w-ac-card__name {
        font-weight: 600;
        font-size: var(--t2w-fs-table);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .t2w-ac-card__meta {
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
    }

    .t2w-ac-card__side {
        flex: none;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .t2w-ac-card__balance {
        font-weight: 600;
        font-size: var(--t2w-fs-table);
    }
</style>
