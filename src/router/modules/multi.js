export default {
    path: '/multi',
    name: 'multi',
    redirect: '/multi/join',
    component: () => import('@/views/multi/layout.vue'),
    children: [
        {
            path: '/multi/join',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/join.vue'),
        },
        {
            path: '/multi/create',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/create.vue'),
        },
        {
            path: '/multi/history',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/history.vue'),
        },
        {
            path: '/multi/room',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/room.vue'),
        },
    ],
}
