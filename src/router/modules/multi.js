export default {
    path: '/multi',
    name: 'multi',
    redirect: '/multi/room',
    component: () => import('@/views/multi/layout.vue'),
    children: [
        {
            path: '/multi/room',
            meta: { requiresAuth: true },
            component: () => import('@/views/multi/room.vue'),
        },
    ],
}
