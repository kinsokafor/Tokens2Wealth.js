import { defineStore } from 'pinia';
import { dbTable, storeGetter } from '@/helpers';
import _ from 'lodash';

export const usePDStore = defineStore('usePDStore', {
    state: () => {
        return {
            data: {"credit_account": {}, "debit_account": {}},
            debits: {},
            processing: false,
            fetching: false,
            limit: 100,
            offset: 0,
            dbtable: new dbTable,
            lastTimeOut: null
        }
    },
    actions: {
        async loadFromServer(params = {}, type = "credit_account") {
            for (var k in params) {
                //return when all data are not ready
                if (params[k] == undefined) return;
            }
            if(!(type in params)) return;
            this.fetching = true;
            this.processing = true;
            await this.dbtable.get('t2w_pending_debits', {
                limit: this.limit,
                offset: this.offset,
                order: 'desc',
                order_by: 'id',
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data, ...meta }
                    if(!(i[type] in this.data[type])) {
                        this.data[type][i[type]] = []
                    }
                    const index = this.data[type][i[type]].findIndex(j => j.id == i.id)
                    if (index == -1) {
                        this.data[type][i[type]] = [...this.data[type][i[type]], i]
                    } else {
                        if (!_.isEqual(this.data[type][i[type]][index], i)) {
                            this.data[type][i[type]][index] = i
                        }
                    }
                } else {
                    r.data.forEach(i => {
                        i = { ...i, ...(JSON.parse(i.meta)) }
                        delete i.meta
                        if(!(i[type] in this.data[type])) {
                            this.data[type][i[type]] = []
                        }
                        const index = this.data[type][i[type]].findIndex(j => j.id == i.id)
                        if (index == -1) {
                            this.data[type][i[type]] = [...this.data[type][i[type]], i]
                        } else {
                            if (!_.isEqual(this.data[type][i[type]][index], i)) {
                                this.data[type][i[type]][index] = i
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
            return (params = {}, type = "credit_account", ...exclude) => {
                if(!(type in params)) return []
                let datax = params[type] in data[type] ? data[type][params[type]] : []
                return storeGetter(state, datax, (tempParams) => {
                    state.loadFromServer(tempParams, type)
                }, params, exclude)
            }
        }
    }
})
