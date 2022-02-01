import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import Purgatorio from '../views/Purgatorio.vue';
Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            authRequired: false,
        },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () =>
            import(/* webpackChunkName: "profile" */ '../views/Profile.vue'),
        meta: {
                authRequired: false,
        },
    
    },

    {
        path: '/purgatorio',
        name: 'Purgatorio',
        component: Purgatorio,        
        meta: {
            authRequired: false,
        },
    
    },
    {
        path: '/hell',
        name: 'Hell',
        component: () =>
            import(
                /* webpackChunkName: "dashboard" */ '../views/Hell.vue'
            ),
        meta: {
            authRequired: false,
        },
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});


export default router;
