<template>
    <div class="n-item" :class="{ unread: item.status === 'unread', compact }" :data-id="item.id">
        <div class="n-icon" :style="{ '--c': style.color }">
            <FontAwesomeIcon :icon="style.icon" />
        </div>
        <div class="n-body">
            <div class="n-meta">
                <span class="n-cat">{{ item.category_label }}</span>
                <span class="n-time" :title="fullTime(item.sent_ts)">{{ relativeTime(item.sent_ts) }}</span>
                <span v-if="item.status === 'unread'" class="n-dot" aria-label="Unread"></span>
            </div>
            <div class="n-text" :class="{ clamp: compact }">{{ expanded ? item.content : item.preview }}</div>
            <div class="n-actions" v-if="!compact">
                <button v-if="item.long" type="button" class="btn btn-link btn-sm p-0" @click="toggle">
                    {{ expanded ? "Show less" : "Show more" }}
                </button>
                <a v-if="item.link" class="btn btn-link btn-sm p-0" :href="item.link">Open</a>
                <button type="button" class="btn btn-link btn-sm p-0 text-muted" @click="$emit('toggle-read', item)">
                    {{ item.status === 'unread' ? "Mark as read" : "Mark as unread" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { styleFor, relativeTime, fullTime } from './notifications'

    const props = defineProps({
        item: { type: Object, required: true },
        // compact: two-line preview, no actions (dashboard widget)
        compact: { type: Boolean, default: false }
    })
    const emit = defineEmits(['toggle-read', 'opened'])

    const expanded = ref(false)
    const style = computed(() => styleFor(props.item.category))

    // reading the full text counts as reading it
    const toggle = () => {
        expanded.value = !expanded.value
        if (expanded.value && props.item.status === 'unread') emit('opened', props.item)
    }
</script>

<style lang="scss" scoped>
    .n-item {
        display: flex;
        gap: 12px;
        padding: 12px 8px;
        border-bottom: 1px solid rgba(0, 0, 0, .07);
        &.unread { background: rgba(13, 110, 253, .04); }
        &.compact { padding: 9px 4px; }
    }
    .n-icon {
        flex: 0 0 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c);
        background: color-mix(in srgb, var(--c) 14%, transparent);
    }
    .n-body { flex: 1; min-width: 0; }
    .n-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: .78rem;
        color: #6c757d;
        margin-bottom: 2px;
    }
    .n-cat { font-weight: 600; text-transform: uppercase; letter-spacing: .03em; }
    .n-dot { width: 8px; height: 8px; border-radius: 50%; background: #0d6efd; margin-left: auto; }
    .n-text {
        font-size: .92rem;
        line-height: 1.4;
        white-space: pre-line;
        overflow-wrap: anywhere;
        &.clamp {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    }
    .unread .n-text { font-weight: 500; }
    .n-actions { display: flex; gap: 14px; margin-top: 4px; }
</style>
