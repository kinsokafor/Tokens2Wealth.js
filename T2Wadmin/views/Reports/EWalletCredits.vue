<template>
    <div>
        <data-filter 
            :data="store.get()" 
            v-slot="{outputData}" 
            :quick-filters="quickFilters" 
            :search-columns="['amount', 'narration', 'classification', 'time_altered', 'status']">
            <list-item v-for="data in outputData" :key="data.id">
                <!-- {{ data }} -->
                <h3>{{ toLocale(data.amount) }} <sub style="font-weight: 300"><small>{{ data.classification }}</small></sub></h3>
                <p>{{ data.narration }}</p>
                <hr class="mt-4"/>
                <div class="links">
                    <a href="javaScript:void(0)" @click="openModal(PaymentInvoicePopUp, {img: data.pop, title: 'Payment Invoice'})"><small>Attachment</small></a>
                    <router-link :to="`/ewallet-credits/${data.id}`" class="link-primary ml-4"><small>View</small></router-link>
                </div>
                
                <template #right>
                    <small>{{ data.time_altered }}</small><br>
                    <span class="badge" 
                        :class="{
                            'bg-info': (data.status == 'unconfirmed'),
                            'bg-success': (data.status == 'confirmed'),
                            'bg-danger': (data.status == 'declined')
                            }"
                    >{{ data.status }}</span>
                </template>
            </list-item>
        </data-filter>
        <container/>
    </div>
</template>

<script setup>
    import {computed, ref, onUnmounted} from 'vue'
    import {useEWalletTxnsStore} from '@/Modules/Tokens2Wealth/store/ewalletTransactions'
    import ListItem from '@/components/theme/ListItem.vue'
    import DataFilter from '@/components/filters/DataFilter.vue'
    import {container} from "jenesius-vue-modal";
    import {openModal} from "jenesius-vue-modal";
    import PaymentInvoicePopUp from '@/Modules/Tokens2Wealth/components/PaymentInvoicePopUp.vue';
    import { toLocale } from '@module/Tokens2Wealth/helpers'

    const store = useEWalletTxnsStore()

    const quickFilters = ref([
        {
            label: "Confirmed",
            key: "status",
            value: "confirmed"
        },
        {
            label: "Unconfirmed",
            key: "status",
            value: "unconfirmed"
        },
        {
            label: "Declined",
            key: "status",
            value: "declined"
        }
    ])

    onUnmounted(() => {
        store.abort()
    })
</script>

<style lang="scss" scoped>
    * {
        padding: 0;
        margin: 0;
    }
    .badge {
        padding: 3px 6px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: 400;
        line-height: 0.6rem;
    }
    sub small {
        font-size: 0.9rem;
        color: var(--blue);
    }
    .links {
        display: flex;
        gap: 8px;
        small {
            word-break:break-all;
        }
    }
</style>