export default {
    path: '/multi',
    name: 'multi',
    redirect: '/multi/function',
    component: () => import('@/views/multi/layout.vue'),
    children: [
        {
            path: '/multi/room',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/room.vue'),
        },
        {
            path: '/multi/live',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/inner/live.vue'),
        },
        {
            path: '/multi/disk',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/inner/disk.vue'),
        },
        {
            path: '/multi/music',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/inner/music.vue'),
        },
        {
            path: '/multi/function',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/inner/function.vue'),
        },
    ],
}
