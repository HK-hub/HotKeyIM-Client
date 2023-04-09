<script setup>
import {ref, computed, watch, markRaw, reactive} from 'vue'
import IMLayout from '@/views/layout/IMLayout.vue'
import Room from './room.vue'
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
])

</script>

<template>
    <IMLayout :index="2">
        <!--<SubViewLayout title="多媒体" :menus="menus"/>-->
        <Room></Room>
    </IMLayout>
</template>

<style lang="less" scoped>
@media screen and (max-height: 500px) {
    .copyright {
        display: none;
    }
}

.fly-box {
    .fly {
        pointer-events: none;
        position: fixed;
        z-index: 100;
    }

    .bg-fly-circle1 {
        left: 40px;
        top: 100px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(
            to right,
            rgba(100, 84, 239, 0.07) 0%,
            rgba(48, 33, 236, 0.04) 100%
        );
        animation: move 2.5s linear infinite;
    }

    .bg-fly-circle2 {
        left: 3%;
        top: 60%;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: linear-gradient(
            to right,
            rgba(100, 84, 239, 0.08) 0%,
            rgba(48, 33, 236, 0.04) 100%
        );
        animation: move 3s linear infinite;
    }

    .bg-fly-circle3 {
        right: 2%;
        top: 140px;
        width: 145px;
        height: 145px;
        border-radius: 50%;
        background: linear-gradient(
            to right,
            rgba(100, 84, 239, 0.1) 0%,
            rgba(48, 33, 236, 0.04) 100%
        );
        animation: move 2.5s linear infinite;
    }

    .bg-fly-circle4 {
        right: 5%;
        top: 60%;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: linear-gradient(
            to right,
            rgba(100, 84, 239, 0.02) 0%,
            rgba(48, 33, 236, 0.04) 100%
        );
        animation: move 3.5s linear infinite;
    }
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
