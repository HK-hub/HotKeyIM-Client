<script setup>
import {ref, onUnmounted, computed, onMounted} from 'vue'
import {NModal, NTooltip} from 'naive-ui'
import {MicOutline,VideocamOutline} from '@vicons/ionicons5'
import {MicrophoneOff, VideoOff, PhoneOff, Microphone,Video,PhoneVoice,Minimize} from '@vicons/carbon'
import {countDownTime} from '@/utils/functions'
import {UserSwitchOutlined} from '@vicons/antd'
import {Conversation} from '@/event/socket/conversation.js'

const emit = defineEmits(['close', 'on-submit'])
let lv = document.getElementById('local-video');
let rv = document.getElementById('remote-video');
let conversation;

const isShow = ref(true)
const status = ref(0) // 0 未开始 1呼叫中 2通话中 3通话结束
const animation = ref(false)
// 通话时长
const duration = ref(0)
const currentStream = 1;

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
    talk_type: {
        type: Number,
        default: 1
    },
})

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

// 页面元素挂载完成
onMounted(() => {
    lv = document.getElementById('local-video')
    rv = document.getElementById('remote-video')
    console.log('视频元素对象', lv,rv)

    conversation = new Conversation(lv, rv)
    animation.value = props.conversationType.type == 1
    // 修改为呼叫中
    status.value = 1
    conversation.clickCall()
})

onUnmounted(() => {
    onDestroy()
})
</script>

<template>

</template>

<style lang="less" scoped>

</style>
