<script setup>
import {ref, computed, watch,markRaw, reactive} from 'vue'
import IMLayout from '@/views/layout/IMLayout.vue'
import SubViewLayout from '@/components/base/SubViewLayout.vue'
import {useUserStore} from '@/store/user'
import {useTalkStore} from '@/store/talk'
import {defAvatar} from '@/constant/default'
import {
    GitNetworkOutline,
    PersonAddOutline,
    BalloonOutline,
    PeopleOutline,
} from '@vicons/ionicons5'
const userStore = useUserStore()

// 加入房间，创建房间，历史房间
const menus = reactive([
    {
        name: '媒体房间',
        path: '/multi/room',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
    {
        name: '加入房间',
        path: '/multi/join',
        icon: markRaw(PersonAddOutline),
        size: 18,
        tips: computed(() => (userStore.isContactApply ? 'New' : '')),
    },
    {
        name: '创建房间',
        path: '/multi/create',
        icon: markRaw(PeopleOutline),
        size: 20,
    },
    {
        name: '历史房间',
        path: '/multi/history',
        icon: markRaw(BalloonOutline),
        size: 18,
    },
])

</script>

<template>
    <IMLayout :index="3">
        <SubViewLayout title="多媒体" :menus="menus"/>
    </IMLayout>
</template>

<style lang="less" scoped></style>
