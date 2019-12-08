import Vue from 'vue';
import Vuex from 'vuex';

import upload from './upload';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        tasks: [],
        dataset: [],
        pageSize: 10,
        currentPage: 1,
        labels: [],
        labelsAll: [],
        total: 0,
        count: 0
    },
    mutations: {
        setTasks(state, payload) {
            state.tasks = payload;
        },
        setDataset(state, payload) {
            state.dataset = payload;
        },
        setLabels(state, payload) {
            state.labels = payload;
        },
        setAllLabels(state, payload) {
            state.labelsAll = payload;
        },
        setPageSize(state, payload) {
            state.pageSize = payload;
        },
        setPageNo(state, payload) {
            state.currentPage = payload;
        },
        initPagination(state) {
            state.pageSize = 10;
            state.currentPage = 1;
        }
    },
    actions: {
        async getTask({commit}, data) {
            const result = await this.http.get('/task');
            commit('setTasks', result.data.data);
        },
        async getDataset({commit, state}, data) {
            const result = await this.http.get('/label');
            commit('setDataset', result.data.data);
            // state.count = result.data.data.count;
        },
        async getLabelList({commit, state}, datasetId) {
            const url = `/dataset/${datasetId}?pageSize=${state.pageSize}&pageNum=${state.currentPage}`;
            const data = await this.http.get(url);
            const labels = data.data.data.items.map(item => ({
                ...item,
                quality: item.quality === 9999 ? '-' : item.quality,
                angle: item.angle === 9999 ? '-' : item.angle
            }));

            commit('setLabels', labels);
            state.total = data.data.data.total;
        },
        async getLabelListAll({commit}, datasetId) {
            const result = await this.http.get(`/dataset/${datasetId}`);
            commit('setAllLabels', result.data.data);
        }
    },
    modules: {
        upload
    }
});
