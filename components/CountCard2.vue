<template>
    <a :href="link ? link : '#'" class="display-card-link">
        <div class="card mb-2">
            <div class="card-body">
                <div class="card-title d-flex justify-content-between">
                    <h4>{{title}}</h4>
                    <div>
                        <span class="badge" :class="{'bg-danger blink': (count > 0), 'bg-info': (count <= 0)}">{{count}}</span>
                    </div>
                </div>
            </div>
        </div>
    </a>
</template>

<script setup>
    const props = defineProps({
        count: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            default: ""
        },
        link: {
            type: [String, Boolean],
            default: false
        },
        surfix: {
            type: String,
            default: ""
        },
        prefix: {
            type: String,
            default: ""
        }
    });
</script>

<style lang="scss" scoped>
    @keyframes blink {
        80%, 20% {
            opacity: 1;
        }
        75%, 25% {
            opacity: 0.5;
        }
        50% {
            opacity: 0;
        }
    }
    .card {
        h4 {
            font-size: smaller;
        }
    }
    .blink {
        animation: blink 3s linear infinite;
    }
</style>