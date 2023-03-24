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
    <div class="middle-conversation-box" style="width: 600px">
        <n-modal
            v-model:show="isShow"
            preset="card"
            :title="dialogTitle"
            size="huge"
            :bordered="false"
            style="max-width: 600px; border-radius: 10px"
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
                <div class="music audio-conversation" v-if="conversationType == 1">
                    <span class="line line1" :class="{ 'line-ani': animation }"></span>
                    <span class="line line2" :class="{ 'line-ani': animation }"></span>
                    <span class="line line3" :class="{ 'line-ani': animation }"></span>
                    <span class="line line4" :class="{ 'line-ani': animation }"></span>
                    <span class="line line5" :class="{ 'line-ani': animation }"></span>
                </div>
                <div class="video-conversation" v-if="conversationType == 2">
                    <n-button class="stream-switch-btn" strong secondary circle type="info" @click="switchShowVideo">
                        <n-icon :component="UserSwitchOutlined" size="large"/>
                    </n-button>
                    <video v-show="currentStream == 1" id="local-video" autoplay muted playsinline></video>
                    <video v-show="currentStream == 2" id="remote-video" autoplay playsinline></video>
                </div>

                <div class="tip">
                    <p>
          <span v-show="status">{{
                  status == 1 ? '呼叫中...' : '通话中'
              }}</span>
                        {{ countDownTime(duration) }}
                    </p>
                </div>
            </main>
            <template #footer>
                <div class="footer">

                    <!--呼叫-->
                    <n-button
                        v-show="status == 0 && conversationType == 1"
                        type="primary"
                        ghost
                        round
                        @click="onStart"
                    >
                        <n-icon :component="PhoneVoice"/>
                        &nbsp;语音呼叫
                    </n-button>
                    <n-button
                        v-show="status == 0 && conversationType == 2"
                        type="primary"
                        ghost
                        round
                        @click="onVideoCall"
                    >
                        <n-icon :component="VideocamOutline"/>
                        &nbsp;视频呼叫
                    </n-button>

                    <!--关闭麦克风-->
                    <n-button v-show="status != 0 && openMicrophone == true" type="primary" round
                              @click="onCloseMicrophone">
                        <!--关闭麦克风-->
                        <n-icon size="large" :component="Microphone"/>
                    </n-button>
                    <n-button v-show="status != 0 && openMicrophone == false" type="primary" round
                              @click="onOpenMicrophone">
                        <!--打开麦克风-->
                        <n-icon size="large" :component="MicrophoneOff"/>
                    </n-button>

                    <!--关闭摄像头-->
                    <n-button v-show="conversationType == 2 && (status == 2 || status == 1) && openCamera == true" type="warning"
                              ghost round @click="onCloseCamera">
                        <n-icon size="large" :component="Video"/>
                    </n-button>
                    <n-button v-show="conversationType == 2 && (status == 2 || status == 1) && openCamera == false" type="success"
                              ghost round @click="onOpenCamera">
                        <n-icon size="large" :component="VideoOff"/>
                    </n-button>

                    <!--挂断-->
                    <n-button v-show="status == 2 || status == 1" type="error" round @click="onHangup">
                        <n-icon size="large" :component="PhoneOff"/>
                    </n-button>
                </div>
            </template>
        </n-modal>
    </div>
</template>

<style lang="less" scoped>

.main-box {
    height: 350px;
    width: inherit;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tip {
        margin-top: 35px;
        color: rgb(103, 98, 98);
        font-weight: 300;
    }
}

.footer {
    width: 100%;
    text-align: center;

    :deep(.n-button) {
        margin: 0 3px;
    }
}

.music {
    position: relative;
    width: 180px;
    height: 160px;
    border: 8px solid #eae8e8;
    border-bottom: 0px;
    border-top-left-radius: 110px;
    border-top-right-radius: 110px;
}

.video-conversation {
    // max-width: 320px;
    width: 100%;
    max-height: 270px;
    display: flex;
    justify-content: center;
    align-items: flex-start;


    video {
        // 镜像反转
        transform: rotateY(180deg);
    }

    #local-video {
        width: 320px;
        height: 240px;
    }
}

.stream-switch-btn {
    //margin-right: 10px;
}


.music:before,
.music:after {
    content: '';
    position: absolute;
    bottom: -20px;
    width: 40px;
    height: 82px;
    background-color: #eae8e8;
    border-radius: 15px;
}

.music:before {
    right: -25px;
}

.music:after {
    left: -25px;
}

.line {
    position: absolute;
    width: 6px;
    min-height: 30px;
    transition: 0.5s;

    vertical-align: middle;
    bottom: 0 !important;
    box-shadow: inset 0px 0px 16px -2px rgba(0, 0, 0, 0.15);
}

.line-ani {
    animation: equalize 4s 0s infinite;
    animation-timing-function: linear;
}

.line1 {
    left: 30%;
    bottom: 0px;
    animation-delay: -1.9s;
    background-color: #ff5e50;
}

.line2 {
    left: 40%;
    height: 60px;
    bottom: -15px;
    animation-delay: -2.9s;
    background-color: #a64de6;
}

.line3 {
    left: 50%;
    height: 30px;
    bottom: -1.5px;
    animation-delay: -3.9s;
    background-color: #5968dc;
}

.line4 {
    left: 60%;
    height: 65px;
    bottom: -16px;
    animation-delay: -4.9s;
    background-color: #27c8f8;
}

.line5 {
    left: 70%;
    height: 60px;
    bottom: -12px;
    animation-delay: -5.9s;
    background-color: #cc60b5;
}

@keyframes equalize {
    0% {
        height: 48px;
    }

    4% {
        height: 42px;
    }

    8% {
        height: 40px;
    }

    12% {
        height: 30px;
    }

    16% {
        height: 20px;
    }

    20% {
        height: 30px;
    }

    24% {
        height: 40px;
    }

    28% {
        height: 10px;
    }

    32% {
        height: 40px;
    }

    36% {
        height: 48px;
    }

    40% {
        height: 20px;
    }

    44% {
        height: 40px;
    }

    48% {
        height: 48px;
    }

    52% {
        height: 30px;
    }

    56% {
        height: 10px;
    }

    60% {
        height: 30px;
    }

    64% {
        height: 48px;
    }

    68% {
        height: 30px;
    }

    72% {
        height: 48px;
    }

    76% {
        height: 20px;
    }

    80% {
        height: 48px;
    }

    84% {
        height: 38px;
    }

    88% {
        height: 48px;
    }

    92% {
        height: 20px;
    }

    96% {
        height: 48px;
    }

    100% {
        height: 48px;
    }
}
</style>
