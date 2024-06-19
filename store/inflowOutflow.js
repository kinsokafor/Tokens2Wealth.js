import { defineStore } from 'pinia';
import { dbTable, storeGetter, dynamicSort } from '@/helpers';
import _ from 'lodash';

export const useInflowOutflowStore = defineStore('useInflowOutflowStore', {
    state: () => {
        return {
            data: [],
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
            await this.dbtable.get('t2w_inflow_outflow', {
                limit: this.limit,
                offset: this.offset,
                order: 'DESC',
                order_by: 'id',
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data, ...meta }
                    const index = this.data.findIndex(j => j.id == i.id)
                    if (index == -1) {
                        this.data = [i, ...this.data]
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
                            this.data = [i, ...this.data]
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
                        }, 180000)
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
        }
    }
})
