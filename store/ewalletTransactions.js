import { defineStore } from 'pinia';
import { dbTable, dynamicSort, storeGetter } from '@/helpers';
import _ from 'lodash';
import { useSessionStorage } from '@vueuse/core'

export const useEWalletTxnsStore = defineStore('useEWalletTxnsStore', {
    state: () => {
        return {
            data: useSessionStorage("t2wEwalletTransactions", []),
            processing: false,
            fetching: false,
            limit: 100,
            offset: 0,
            dbtable: new dbTable,
            lastTimeOut: null
        }
    },
    actions: {
        async loadFromServer(params = {}) {
            for (var k in params) {
                //return when all data are not ready
                if (params[k] == undefined) return;
            }
            this.fetching = true;
            this.processing = true;
            await this.dbtable.get('t2w_ewallet_transactions', {
                limit: this.limit,
                offset: this.offset,
                order: 'ASC',
                order_by: 'id',
                joinuserat: 'last_altered_by',
                rightcolumns: ['surname', 'middle_name', 'other_names'],
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data, ...meta }
                    const index = this.data.findIndex(j => j.id == i.id)
                    if (index == -1) {
                        this.data = [...this.data, i]
                    } else {
                        if (!_.isEqual(this.data[index], i)) {
                            this.data[index] = i
                        }
                    }
                } else {
                    r.data.forEach(i => {
                        i = { ...i, ...(JSON.parse(i.meta)) }
                        delete i.meta
                        const index = this.data.findIndex(j => j.id == i.id)
                        if (index == -1) {
                            this.data = [...this.data, i];
                        } else {
                            if (!_.isEqual(this.data[index], i)) {
                                this.data[index] = i
                            }
                        }
                    })
                    if (r.data.length >= this.limit) {
                        this.offset = this.limit + this.offset
                        this.loadFromServer(params)
                    } else {
                        this.offset = 0
                        if(this.lastTimeOut != null) {
                            clearTimeout(this.lastTimeOut)
                        }
                        this.lastTimeOut = setTimeout(() => {
                            this.fetching = false
                        }, 3600000)
                    }
                }
                
            })
        },

        abort() {
            this.dbtable.abort()
            this.fetching = false;
        }
    },
    getters: {
        all: (state) => {
            if (!state.fetching) {
                state.loadFromServer()
            }
            return state.data;
        },
        get: (state) => {
            const data = state.data.sort(dynamicSort("-time_altered"))
            return (params = {}, ...exclude) => {
                return storeGetter(state, data, (tempParams) => {
                    state.loadFromServer(tempParams)
                }, params, exclude)
            }
        },
        getLedger: (state) => {
            const data = state.data.sort(dynamicSort("time_altered"))
            return (params = {}, ...exclude) => {
                return storeGetter(state, data, (tempParams) => {
                    state.loadFromServer(tempParams)
                }, params, exclude)
            }
        }
    }
})
