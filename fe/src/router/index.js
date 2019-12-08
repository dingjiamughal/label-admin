import Vue from 'vue';
import VueRouter from 'vue-router';

import Check from '@/views/Check';
import Upload from '@/views/Upload';
import Dataset from '@/views/Dataset';

Vue.use(VueRouter);

const routes = [
    {path: '/', redirect: '/check'},
    {path: '/check', name: 'check', component: Check},
    {path: '/dataset', name: 'dataset', component: Dataset},
    {path: '/upload', name: 'upload', component: Upload},
    {path: '/angle', name: 'angle', component: () => import('@/views/Angle')}
];

export default new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});
