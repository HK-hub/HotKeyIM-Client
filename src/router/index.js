import {
    createRouter,
    createWebHistory,
    createWebHashHistory,
} from 'vue-router'
import {isLoggedIn} from '@/utils/auth'
import SettingRouter from './modules/setting'
import ContactRouter from './modules/contact'
import MultiRouter from './modules/multi'
import AuthRouter from './modules/auth'
import CodeRouter from './modules/code'

const routes = [
    SettingRouter,
    ContactRouter,
    MultiRouter,
    CodeRouter,
    AuthRouter,
    {
        path: '/',
        name: 'Home',
        meta: {requiresAuth: true},
        component: () => import('@/views/index/index.vue'),
    },
    {
        path: '/message',
        name: 'Message',
        meta: {requiresAuth: true},
        component: () => import('@/views/index/index.vue'),
    },
    {
        path: '/note',
        name: 'Note',
        meta: {requiresAuth: true},
        component: () => import('@/views/note/index.vue'),
    },
    {
        path: '/code',
        name: 'Code',
        meta: {requiresAuth: true},
        component: () => import('@/views/code/layout.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404 NotFound',
        component: () => import('@/views/other/not-found.vue'),
    },
    {
        path: '/example/index',
        name: 'Example',
        component: () => import('@/views/example/example.vue'),
    },
]

const getHistoryMode = () => {
    return import.meta.env.VITE_ROUTER_MODE == 'hash'
        ? createWebHashHistory()
        : createWebHistory()
}

const router = createRouter({
    history: getHistoryMode(),
    routes,
})

// 设置中间件，权限验证
router.beforeEach((to, from) => {
    if (to.meta.requiresAuth && !isLoggedIn()) {
        return {
            path: '/auth/login',
            query: {redirect: to.fullPath},
        }
    }
})

export default router
