<template>
    <div class="t2w-menu-item">
        <a :href="link" v-if="!isRouter">
            <div class="t2w-menu-icon">
                <FontAwesomeIcon :icon="iconClass"></FontAwesomeIcon>
            </div>
            <div class="t2w-menu-label"><h2>{{ label }}</h2></div>
        </a>
        <router-link :to="link" v-if="isRouter">
            <div class="t2w-menu-icon">
                <FontAwesomeIcon :icon="iconClass"/>
            </div>
            <div class="t2w-menu-label"><h2>{{ label }}</h2></div>
        </router-link>
    </div>

</template>

<script setup>
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import {fas} from '@fortawesome/free-solid-svg-icons'
    import { fab } from '@fortawesome/free-brands-svg-icons';
    import { far } from '@fortawesome/free-regular-svg-icons';
    import "/color-scheme.css";
    import { ref } from 'vue'

    library.add(fas, far, fab)

    const props = defineProps({
        label: String,
        iconClass: String,
        link: String,
        bgColor: {
            type: String,
            default: "var(--color2)"
        },
        textColor: {
            type: String,
            default: "var(--highlight1)"
        },
        isRouter: {
            type: Boolean,
            default: true
        }
    })

    const bgColor = ref(props.bgColor)
    const textColor = ref(props.textColor)
</script>

<style lang="scss" scoped>
    .t2w-menu-item > a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 158px;
        border-radius: 5px;
        .t2w-menu-label h2 {
            margin-top: 12px;
            font-size: 0.9rem;
            text-transform: uppercase;
            color: var(--shadow2);
            text-align: center;
            font-weight: 400;
        }
        .t2w-menu-icon {
            background: #b0e3c4;
            padding: 10px;
            border-radius: 52px;
            color: var(--color2);
            width: 65px;
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background linear 0.2s;
            svg {
                transition: transform linear 0.5s;
                font-size: 1.7rem;
            }
        }
        .t2w-menu-icon:hover {
            background: var(--color2);
            color: var(--highlight1);
            svg {
                transform: scale(0.9);
            }
        }
    }
</style>