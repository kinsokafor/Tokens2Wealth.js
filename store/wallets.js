import { defineStore, storeToRefs } from 'pinia';
import { dbTable, dynamicSort, storeGetter } from '@/helpers';
import _ from 'lodash';
import { useSessionStorage } from '@vueuse/core'

export const useWalletsStore = defineStore('useWalletsStore', {
    state: () => {
        return {
            data: useSessionStorage("t2wTransactions", {}),
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
            if(!("account" in params)) return;
            this.fetching = true;
            this.processing = true;
            await this.dbtable.get("t2w_transactions", {
                limit: this.limit,
                offset: this.offset,
                order: 'DESC',
                order_by: 'time_altered',
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data, ...meta }
                    if(!(i.account in this.data)) {
                        this.data[i.account] = []
                    }
                    const index = this.data[i.account].findIndex(j => j.id == i.id)
                    if (index == -1) {
                        this.data[i.account] = [...this.data[i.account], i]
                    } else {
                        if (!_.isEqual(this.data[i.account][index], i)) {
                            this.data[i.account][index] = i
                        }
                    }
                } else {
                    r.data.forEach(i => {
                        i = { ...i, ...(JSON.parse(i.meta)) }
                        delete i.meta
                        if(!(i.account in this.data)) {
                            this.data[i.account] = []
                        }
                        const index = this.data[i.account].findIndex(j => j.id == i.id)
                        if (index == -1) {
                            this.data[i.account] = [...this.data[i.account], i]
                        } else {
                            if (!_.isEqual(this.data[i.account][index], i)) {
                                this.data[i.account][index] = i
                            }
                        }
                    })
                }
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
            const data = state.data
            return (params = {}, ...exclude) => {
                if(!("account" in params)) return []
                let datax = params.account in data ? data[params.account].sort(dynamicSort("time_altered")) : []
                return storeGetter(state, datax, (tempParams) => {
                    state.loadFromServer(tempParams)
                }, params, exclude)
            }
        }
    }
})