export default {
    path: '/code',
    name: 'code',
    redirect: '/code/online',
    component: () => import('@/views/code/layout.vue'),

    children: [
        {
            path: '/code/editor',
            meta: { requiresAuth: true },
            component: () => import('@/views/code/inner/editor.vue'),
        },
        {
            path: '/code/openSumi',
            meta: { requiresAuth: true },
            component: () => import('@/views/code/inner/openSumi.vue'),
        },
        {
            path: '/code/online',
            meta: { requiresAuth: true },
            component: () => import('@/views/code/inner/online.vue'),
        },
    ],
}
