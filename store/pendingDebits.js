import { defineStore, storeToRefs } from 'pinia';
import { dbTable, Request, storeGetter } from '@/helpers';
import _ from 'lodash';
import { useLocalStorage } from '@vueuse/core'

export const usePDStore = defineStore('usePDStore', {
    state: () => {
        return {
            data: useLocalStorage("t2wPendingDebits", {}),
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
            if(!("credit_account" in params)) return;
            this.fetching = true;
            this.processing = true;
            this.dbtable.get('t2w_pending_debits', {
                limit: this.limit,
                offset: this.offset,
                order: 'asc',
                order_by: 'id',
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data, ...meta }
                    if(!(i.credit_account in this.data)) {
                        this.data[i.credit_account] = []
                    }
                    const index = this.data[i.credit_account].findIndex(j => j.id == i.id)
                    if (index == -1) {
                        this.data[i.credit_account] = [...this.data[i.credit_account], i]
                    } else {
                        if (!_.isEqual(this.data[i.credit_account][index], i)) {
                            this.data[i.credit_account][index] = i
                        }
                    }
                } else {
                    r.data.forEach(i => {
                        i = { ...i, ...(JSON.parse(i.meta)) }
                        delete i.meta
                        if(!(i.credit_account in this.data)) {
                            this.data[i.credit_account] = []
                        }
                        const index = this.data[i.credit_account].findIndex(j => j.id == i.id)
                        if (index == -1) {
                            this.data[i.credit_account] = [...this.data[i.credit_account], i]
                        } else {
                            if (!_.isEqual(this.data[i.credit_account][index], i)) {
                                this.data[i.credit_account][index] = i
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
                    }, 60000)
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
                if(!("credit_account" in params)) return []
                let datax = params.credit_account in data ? data[params.credit_account] : []
                return storeGetter(state, datax, (tempParams) => {
                    state.loadFromServer(tempParams)
                }, params, exclude)
            }
        }
    }
})
