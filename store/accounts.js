import { defineStore, storeToRefs } from 'pinia';
import { dbTable, Request } from '@/helpers';
import _ from 'lodash';
import { useLocalStorage } from '@vueuse/core'

export const useAccountsStore = defineStore('useAccountsStore', {
    state: () => {
        return {
            data: useLocalStorage("t2wAccounts", []),
            processing: false,
            fetching: false,
            limit: 50,
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
            const r = new Request;
            r.post(r.root+"/t2w/api/get/accounts", {
                limit: this.limit,
                offset: this.offset,
                ...params
            }).then(r => {
                if ("id" in params) {
                    const meta = JSON.parse(r.data.meta)
                    delete r.data.meta
                    let i = { ...r.data }
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
                            this.data = [...this.data, i]
                        } else {
                            if (!_.isEqual(this.data[index], i)) {
                                this.data[index] = i
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
                    }, 300000)
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
                let tempParams = {...params};
                exclude.forEach(i => {
                    delete tempParams[i]
                })
                if (!state.fetching || !_.isEqual(tempParams, state.lastParams)) {
                    state.lastParams = tempParams;
                    state.loadFromServer(tempParams)
                }
                const r = data.filter(i => {
                    for (var k in params) {
                        if(typeof params[k] == "string") {
                            return new RegExp('^' + params[k].replace(/\%/g, '.*') + '$').test(i[k])
                        }
                        if (k in i && params[k] != i[k]) return false
                        return true
                    }
                    return true
                })
                return r
            }
        }
    }
})