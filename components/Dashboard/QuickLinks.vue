<template>
    <div class="t2w-links" role="region" aria-labelledby="t2w-links-title">
        <div class="t2w-section-head">
            <h2 class="t2w-section-title" id="t2w-links-title">Go to</h2>
            <input type="search" class="form-control form-control-sm t2w-links__search" v-model="query"
                placeholder="Find a page…" aria-label="Find a page" />
        </div>

        <details v-for="g in visibleGroups" :key="g.title" class="t2w-links__group"
            :open="!!query || !g.collapsed" @toggle="onToggle(g, $event)">
            <summary>
                <span class="t2w-links__group-title">{{ g.title }}</span>
                <span class="t2w-links__group-count t2w-num">{{ g.items.length }}</span>
            </summary>
            <ul class="t2w-links__grid">
                <li v-for="item in g.items" :key="item.link">
                    <router-link v-if="item.isRouter" :to="item.link" class="t2w-links__item">
                        <FontAwesomeIcon :icon="item.iconClass" class="t2w-links__icon" aria-hidden="true" />
                        <span>{{ item.label }}</span>
                    </router-link>
                    <a v-else :href="item.link" class="t2w-links__item">
                        <FontAwesomeIcon :icon="item.iconClass" class="t2w-links__icon" aria-hidden="true" />
                        <span>{{ item.label }}</span>
                    </a>
                </li>
            </ul>
        </details>

        <p v-if="query && !visibleGroups.length" class="t2w-links__none">No page matches “{{ query }}”.</p>
    </div>
</template>

<script setup>
    // Searchable, grouped page links for the dashboards. Each item keeps the shape the old Menu tiles used:
    // { label, link, isRouter, iconClass, access: "1,2,3,4" }. Items the user can't access are hidden.
    // groups: [{ title, items, collapsed? }]; a collapsed group opens while searching or when clicked.
    import { computed, ref, reactive } from 'vue'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { fas } from '@fortawesome/free-solid-svg-icons'
    import { far } from '@fortawesome/free-regular-svg-icons'
    import { useAuthStore } from '@/store/auth'
    import '../ui/tokens.scss'

    // the link lists name icons as strings ("fa-users", "fa-regular fa-address-card"), as MenuButton did
    library.add(fas, far)

    const props = defineProps({
        groups: { type: Array, required: true }
    })

    const auth = useAuthStore()
    const query = ref("")
    // groups the user opened or closed by hand
    const opened = reactive({})

    const visibleGroups = computed(() => {
        const q = query.value.trim().toLowerCase()
        return props.groups
            .map(g => ({
                ...g,
                collapsed: opened[g.title] === undefined ? !!g.collapsed : !opened[g.title],
                items: g.items.filter(i =>
                    (i.condition === undefined || i.condition) &&
                    auth.testAccess(i.access ?? "") &&
                    (!q || i.label.toLowerCase().includes(q)))
            }))
            .filter(g => g.items.length)
    })

    const onToggle = (g, e) => {
        if (query.value) return
        opened[g.title] = e.target.open
    }
</script>

<style lang="scss" scoped>
    .t2w-links { margin-bottom: var(--t2w-space-5); }

    // the theme gives .form-control 11px padding and square corners
    .t2w-links__search { max-width: 240px; padding: 4px 10px; border-radius: var(--t2w-radius-sm); }

    .t2w-links__group {
        background: var(--t2w-surface);
        border: 1px solid var(--t2w-border);
        border-radius: var(--t2w-radius);
        margin-bottom: var(--t2w-space-2);

        summary {
            display: flex;
            align-items: center;
            gap: var(--t2w-space-2);
            padding: var(--t2w-space-2) var(--t2w-space-3);
            cursor: pointer;
            list-style: none;
            user-select: none;
            &::-webkit-details-marker { display: none; }
            &::before {
                content: "▸";
                color: var(--t2w-muted);
                font-size: 0.8em;
                transition: transform 0.15s ease;
            }
            &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: -2px; border-radius: var(--t2w-radius); }
        }
        &[open] summary::before { transform: rotate(90deg); }
    }

    .t2w-links__group-title {
        font-size: var(--t2w-fs-label);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--t2w-muted);
    }

    .t2w-links__group-count {
        font-size: var(--t2w-fs-small);
        color: var(--t2w-muted);
        background: var(--t2w-neutral-soft);
        border-radius: var(--t2w-radius-pill);
        padding: 0 7px;
    }

    .t2w-links__grid {
        list-style: none;
        margin: 0;
        padding: 0 var(--t2w-space-2) var(--t2w-space-2);
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 2px var(--t2w-space-2);
    }

    .t2w-links__item {
        display: flex;
        align-items: center;
        gap: var(--t2w-space-2);
        min-height: 40px;
        padding: 6px var(--t2w-space-2);
        border-radius: var(--t2w-radius-sm);
        color: var(--t2w-text);
        font-size: var(--t2w-fs-table);
        text-decoration: none;
        &:hover { background: var(--t2w-hover); color: var(--t2w-primary); }
        &:focus-visible { outline: 2px solid var(--t2w-primary); outline-offset: -2px; }
    }

    .t2w-links__icon {
        flex: none;
        width: 1.1em;
        color: var(--t2w-primary);
    }

    .t2w-links__none {
        color: var(--t2w-muted);
        font-size: var(--t2w-fs-table);
    }

    @media (max-width: 575.98px) {
        .t2w-links__search { max-width: none; flex: 1 1 100%; }
        .t2w-links__grid { grid-template-columns: 1fr 1fr; }
    }
</style>
