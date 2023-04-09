<script setup>
import {ref, computed, watch, markRaw, reactive, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import IMLayout from '@/views/layout/IMLayout.vue'
import SubViewLayout from '@/components/base/SubViewLayout.vue'
import {NGrid, NGridItem, NButton, NResult, NCard} from 'naive-ui'
import {useUserStore} from '@/store/user'
import {useTalkStore} from '@/store/talk'
import {defAvatar} from '@/constant/default'
import {
    GitNetworkOutline,
    PersonAddOutline,
    BalloonOutline,
    PeopleOutline,
} from '@vicons/ionicons5'

const router = useRouter()
// 加入房间，创建房间，历史房间
const menus = reactive([
    {
        name: '音视频通话',
        path: '/multi/room',
        card: '👨‍👩‍👧‍👦',
        title: '多人音视频通话',
        description: '一切尽在不言中',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
    {
        name: '直播互动',
        path: '/multi/live',
        card: '📡',
        title: '直播互动分享',
        description: '一切尽在不言中',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
    {
        name: '媒体房间',
        path: '/multi/disk',
        card: '🛫',
        title: '个人云盘空间',
        description: '一切尽在不言中',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
    {
        name: '音乐电影',
        path: '/multi/music',
        card: '🎵',
        title: '音乐/电影/视频探索',
        description: '一切尽在不言中',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
    {
        name: '探索更多',
        path: '/multi/other',
        card: '⚙',
        title: '发掘更多有趣玩法',
        description: '一切尽在不言中',
        icon: markRaw(PersonAddOutline),
        size: 18,
    },
])

// 点击频道
const onEnterFunBox = (path) => {
    console.log('进入function：',path)
    router.push(path)
}
</script>
<template>
    <div class="main-function">
        <div class="function-box">
            <n-grid :x-gap="12" :y-gap="8" :cols="3">
                <n-grid-item class="function-item" v-for="(item,index) in menus" :key="item.name">
                    <div class="light-green">
                        <n-card :title="item.card" class="item-card">
                            <n-result status="418" :title="item.title" :description=item.description>
                                <template #footer>
                                    <n-button @click="onEnterFunBox(item.path)">进入频道</n-button>
                                </template>
                            </n-result>
                        </n-card>
                    </div>
                </n-grid-item>
            </n-grid>
        </div>
    </div>
</template>
<style lang="less">

</style>