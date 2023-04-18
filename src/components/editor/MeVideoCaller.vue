<script setup>
import {ref, onUnmounted, computed, onMounted, reactive} from 'vue'
import {NModal, NTooltip, NSpace, NAvatar, NEllipsis} from 'naive-ui'
import {MicOutline,VideocamOutline} from '@vicons/ionicons5'
import {MicrophoneOff, VideoOff, PhoneOff, Microphone,Video,PhoneVoice,Minimize} from '@vicons/carbon'
import {countDownTime} from '@/utils/functions'
import {UserSwitchOutlined} from '@vicons/antd'
import {Conversation} from '@/event/socket/conversation.js'
import {ServeGetUserProfile} from '@/api/user'

const emit = defineEmits(['close', 'on-submit'])
const userId = JSON.parse(localStorage.getItem('IM_USERID')).value


const props = defineProps({
    conversationType: {
        type: Number,
        default: 1, // 1. 语音通话，2.视频通话
    },
    // 接收者id
    receiver_id: {
        type: String,
        default: ''
    },
    // 私聊群聊
    talk_type: {
        type: Number,
        default: 1
    },
})
const friendProfile = reactive({})
const myProfile = reactive({})

let lv = document.getElementById('local-video');
let rv = document.getElementById('remote-video');
let conversation;
// 是否展示
const isShow = ref(true)
// 是否最小化
const mini = ref(false)

// 0 未开始 1呼叫中 2通话中 3通话结束
const status = ref(0)
const animation = ref(false)
// 通话时长
const duration = ref(0)
const currentStream = 1;

const dialogTitle = computed(() => {
    if (props.conversationType === 1) {
        return '语音通话'
    } else if (props.conversationType == 2) {
        return '视频通话'
    } else {
        return '未知'
    }
})

// 最小化
const onMinimize = () => {
    console.log('最小化')
}

// 是否打开麦克风
const openMicrophone = ref(true)
// 是否打开摄像头
const openCamera = ref(props.conversationType == 2 ? true : false)

// 打开麦克风
const onOpenMicrophone = () => {
    console.log('打开麦克风')
    openMicrophone.value = true
}

// 关闭麦克风
const onCloseMicrophone = () => {
    console.log('关闭麦克风')
    openMicrophone.value = false
}

// 打开摄像头
const onOpenCamera = () => {
    console.log('打开摄像头')
    // 判断当前是视频通话
    if (props.conversationType != 1) {
        openCamera.value = true
    }
}

// 关闭摄像头
const onCloseCamera = () => {
    console.log('关闭摄像头')
    openCamera.value = false
}

// 切换显示的摄像头画面
const switchShowVideo = () => {
    console.log('切换显示画面')
}


const onMaskClick = () => {
    onDestroy()
    emit('close')
}

// 挂断电话
const onHangup = () => {
    console.log('挂断..')
    status.value = 3
    onDestroy()
}

// 最后销毁
const onDestroy = () => {
    isShow.value = false
}

const onSubmit = () => {

    onDestroy()
}


const onStart = () => {
    animation.value = true
    // 修改为呼叫中
    status.value = 1
}

const onVideoCall = () => {

    /**lv = document.getElementById('local-video')
    rv = document.getElementById('remote-video')
    console.log('视频元素对象', lv,rv)

    conversation = new Conversation(lv, rv)
    animation.value = true
    // 修改为呼叫中
    status.value = 1
    conversation.clicCall()**/
}

const onStop = () => {

}

// 加载数据
const onLoad = () => {
    ServeGetUserProfile({
        userId: props.receiver_id
    }).then(res => {
        if (res.code == 200 && res.success) {
            friendProfile.value = res.data
        }
    })
    ServeGetUserProfile({
        userId: userId
    }).then(res => {
        if (res.code == 200 && res.success) {
            myProfile.value = res.data
        }
    })
}

// 页面元素挂载完成
onMounted(() => {
    // 加载数据
    onLoad()

    lv = document.getElementById('local-video')
    rv = document.getElementById('remote-video')
    console.log('视频元素对象', lv,rv)

    conversation = new Conversation(lv, rv)
    animation.value = props.conversationType.type == 1
    // 修改为呼叫中
    status.value = 1
    // conversation.clickCall()
})

onUnmounted(() => {
    onDestroy()
})
</script>

<template>

    <n-modal
        v-model:show="isShow"
        preset="card"
        :title="dialogTitle"
        size="huge"
        :bordered="false"
        style="max-width: 800px; border-radius: 10px"
        :on-after-leave="onMaskClick"
        :mask-closable="false"
        :closable="false"
    >
        <template #header-extra>
            <!--最小化-->
            <n-button class="minimize-btn" size="small" secondary  type="success" strong @click="onMinimize">
                <n-icon :component="Minimize"/>
            </n-button>
        </template>
        <main class="main-box">
            <div class="video-wrapper">
                <n-space justify="center">
                    <div id="local-video-box">
                        <video id="local-video" autoplay muted playsinline controls></video>
                    </div>
                    <div id="remote-video-box">
                        <video id="remote-video" autoplay playsinline controls></video>
                    </div>
                </n-space>
            </div>
        </main>
        <template #footer>
            <n-space justify="center">
                <n-button>静音</n-button>
                <n-button type="error" @click="onHangup">挂断</n-button>
                <n-button>视频</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<style lang="less" scoped>
h1,
h4 {
    text-align: center;
}

.video-wrapper {
    width: 95%;
    margin: 0 auto;
}

.video-wrapper h4 {
    width: 300px;
    display: inline-block;
    position: relative;
}
#remote-video-box, #local-video-box {
    width: 300px;
    // height: 270px;
    display: inline-block;
    position: relative;
}

.video-wrapper video {
    height: auto;
}
</style>
