<template>
    <header class="t2w-ac-head">
        <div class="t2w-ac-head__top">
            <img v-if="img" :src="img" alt="" class="t2w-ac-head__img" />
            <div class="t2w-ac-head__main">
                <h1 class="t2w-ac-head__title">{{ caption }}</h1>
                <div class="t2w-ac-head__number t2w-num" v-if="data?.ac_number">Account {{ data.ac_number }}</div>
                <div class="t2w-ac-head__body"><slot></slot></div>
            </div>
            <div class="t2w-ac-head__status" v-if="$slots.status"><slot name="status"></slot></div>
        </div>
        <div class="t2w-ac-head__member" v-if="data?.user_id != undefined">
            <MemberCard :userId="parseInt(data.user_id)">{{ caption }} ID: {{ data?.ac_number }}</MemberCard>
        </div>
    </header>
</template>

<script setup>
    // Header of every account page (admin panels and member pages): product picture, name in the brand
    // gradient, account number, the page's own lines (default slot), its status badge, and the member.
    // Loading it also loads account.scss, which brings the rest of these pages in line with the UI kit.
    import MemberCard from '../MemberCard.vue'
    import '../ui/tokens.scss'
    import './account.scss'

    defineProps({
        data: Object,
        caption: String,
        // bg (the old map background) is still accepted from the pages but no longer drawn
        bg: String,
        img: String
    })
</script>

<style lang="scss" scoped>
    .t2w-ac-head {
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        box-shadow: var(--t2w-shadow);
        margin-bottom: var(--t2w-space-4);
        overflow: hidden;
        // the brand gradient as a thin band along the top
        &::before {
            content: "";
            display: block;
            height: 4px;
            background: var(--t2w-gradient);
        }
    }

    .t2w-ac-head__top {
        display: flex;
        align-items: flex-start;
        gap: var(--t2w-space-4);
        padding: var(--t2w-space-4);
    }

    .t2w-ac-head__img {
        flex: none;
        width: 72px;
        height: 72px;
        object-fit: contain;
    }

    .t2w-ac-head__main { flex: 1 1 auto; min-width: 0; }

    .t2w-ac-head__title {
        margin: 0;
        font-family: var(--t2w-font-heading);
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1.2;
        background-image: var(--t2w-gradient);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .t2w-ac-head__number {
        font-size: var(--t2w-fs-label);
        color: var(--t2w-muted);
        margin-top: 2px;
    }

    .t2w-ac-head__body {
        margin-top: var(--t2w-space-2);
        font-size: var(--t2w-fs-table);
        color: var(--t2w-text);
        :deep(p) { margin: 0 0 var(--t2w-space-1); }
        :deep(p:empty) { display: none; }
        :deep(.alert) { margin: var(--t2w-space-2) 0 0; padding: var(--t2w-space-2) var(--t2w-space-3); font-size: var(--t2w-fs-label); border-radius: var(--t2w-radius-sm); }
    }

    .t2w-ac-head__status {
        flex: none;
        :deep(.badge) {
            border-radius: var(--t2w-radius-pill);
            padding: 4px 10px;
            font-size: var(--t2w-fs-small);
            font-weight: 600;
            text-transform: capitalize;
        }
    }

    .t2w-ac-head__member {
        border-top: 1px solid var(--t2w-border);
        padding: var(--t2w-space-2) var(--t2w-space-4);
        background: var(--t2w-neutral-soft);
    }

    @media (max-width: 575.98px) {
        .t2w-ac-head__top { flex-wrap: wrap; gap: var(--t2w-space-3); }
        .t2w-ac-head__img { width: 52px; height: 52px; }
        .t2w-ac-head__title { font-size: 1.3rem; }
        .t2w-ac-head__status { order: -1; flex-basis: 100%; }
    }
</style>
