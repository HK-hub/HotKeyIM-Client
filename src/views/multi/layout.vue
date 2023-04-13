<script setup>
import {ref, computed, watch, markRaw, reactive, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import IMLayout from '@/views/layout/IMLayout.vue'
import Room from './room.vue'
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
const userStore = useUserStore()
const showFunctionMenus = ref(true)

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
    showFunctionMenus.value = false
    router.push(path)
}
</script>

<template>
    <IMLayout :index="2">
        <main class="el-main router-view">
            <router-view style="height: 95%"> </router-view>
        </main>
    </IMLayout>
</template>

<style lang="less" scoped>
.main-function {
    width: 100%;
    display: flex;
    margin-top: 20px;
    justify-content: center;
    justify-items: center;
}
.function-box {
    width: 90%;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
}

.light-green {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 128, 0, 0.12);
}
.green {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 128, 0, 0.24);
}

.function-box {

}

.item-card:hover {
    border:2px solid #4caf50;
}

@keyframes move {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(25px);
    }

    100% {
        transform: translateY(0px);
    }
}
</style>
