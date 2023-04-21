<script setup>
import {ref, onUnmounted, computed, onMounted, reactive} from 'vue'
import {NModal, NTooltip, NSpace, NAvatar, NEllipsis, NIcon} from 'naive-ui'
import {MicOutline,VideocamOutline} from '@vicons/ionicons5'
import {MicrophoneOff, VideoOff, PhoneOff, Microphone,Video,PhoneVoice,Minimize} from '@vicons/carbon'
import {countDownTime} from '@/utils/functions'
import {UserSwitchOutlined} from '@vicons/antd'
import {ServeGetUserProfile} from '@/api/user'
import {
    SIGNALING_TYPE_JOIN, SIGNALING_TYPE_RESP_JOIN, SIGNALING_TYPE_NEW_PEER, SIGNALING_TYPE_OFFER
    , SIGNALING_TYPE_LEAVE, SIGNALING_TYPE_PEER_LEAVE, SIGNALING_TYPE_CANDIDATE, SIGNALING_TYPE_ANSWER
} from '@/event/socket/signaling'

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
    roomId: {
        type: String,
        default: ''
    },
    invite: {
        type: Object,
        default: null
    }
})
const model = reactive({
    roomId: {
        type: String,
        default: ''
    },
    remoteUserId: {
        type: String,
        default: ''
    },
    localUserId: {
        type: String,
        default: userId
    }
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
const accept =ref(false)
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
const onMuted = () => {
    console.log('关闭麦克风')
    openMicrophone.value = !openMicrophone.value
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

// 挂断电话
const onHangup = () => {
    console.log('挂断..')
    // status.value = 3
    onLeaveRoom()
    onDestroy()
}

// 最后销毁
const onDestroy = () => {
    // conversation.hangup()
    emit('close')
}

const onSubmit = () => {
    // onDestroy()
}


// 接听电话
const onStart = () => {
    animation.value = true
    // 修改为接听
    status.value = 1
    onJoinRoom()
    // doJoin()
}

const onVideoCall = () => {

    lv = document.getElementById('local-video')
    rv = document.getElementById('remote-video')
    console.log('视频元素对象', lv,rv)

    // 修改为呼叫中
    status.value = 1
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

    // 判断是否被邀请通话
    console.log('props 属性：', props.invite)
    if (props.invite != null) {
        console.log('房间号存在：', props.invite.roomId)
        // 设置房间号
        model.roomId = props.invite.roomId
        // 设置用户
        model.localUserId = props.invite.receiverId
        model.remoteUserId = props.invite.userId
        // 呼叫中：显示接听按钮
        status.value = 0

    } else {
        model.roomId = userId < props.receiver_id ? userId + '-' + props.receiver_id : props.receiver_id + '-' + userId;
        // 设置用户
        model.localUserId = userId;
        // 呼叫中
        status.value = 1
    }

}
// 房间号

// 当前模式
const activityModel = ref('camera')

// 菜单
const menuOptions = reactive([])


// 视频元素
let localVideo = null;
let remoteVideo = null;
// 流
let localStream = null;
let remoteStream = null;
// peerConnection
let peerConnection = null;

// RTC 引擎
let hRTCEngine
const HRTCEngine = function (wsUrl) {
    this.init(wsUrl)
    hRTCEngine = this;
    return this
};

HRTCEngine.prototype.init = function (wsUrl) {
    // 设置WebSocket, url
    this.wsUrl = wsUrl
    // websocket 对象
    this.signaling = null
}
// 创建WebSocket 连接
HRTCEngine.prototype.createWebSocket = function () {
    hRTCEngine = this;
    hRTCEngine.signaling = new WebSocket(this.wsUrl)

    // 绑定事件
    hRTCEngine.signaling.onopen = function () {
        hRTCEngine.onOpen()
    }
    hRTCEngine.signaling.onmessage = function (ev) {
        hRTCEngine.onMessage(ev)
    }
    hRTCEngine.signaling.onclose = function (ev) {
        hRTCEngine.onClose(ev)
    }
    hRTCEngine.signaling.onerror = function (err) {
        hRTCEngine.onError(err)
    }
}

// WebSocket 事件
HRTCEngine.prototype.onOpen = function () {
    console.log('WebSocket Open...')
}
HRTCEngine.prototype.onMessage = function (ev) {
    // console.log('WebSocket Message:', ev.data)
    let jsonMsg = null;
    try {
        jsonMsg = JSON.parse(ev.data)
    } catch (err) {
        console.warn('onMessage parse json failed:', err)
        return;
    }
    // 处理信令
    switch (jsonMsg.cmd) {
        case SIGNALING_TYPE_NEW_PEER:
            handleRemoteNewPeer(jsonMsg);
            break;
        case SIGNALING_TYPE_RESP_JOIN:
            handleResponseJoin(jsonMsg)
            break
        case SIGNALING_TYPE_PEER_LEAVE:
            handlePeerLeave(jsonMsg)
            break
        case SIGNALING_TYPE_OFFER:
            handleRemoteOffer(jsonMsg)
            break
        case SIGNALING_TYPE_ANSWER:
            handleRemoteAnswer(jsonMsg)
            break
        case SIGNALING_TYPE_CANDIDATE:
            handleRemoteCandidate(jsonMsg)
            break
    }
}
HRTCEngine.prototype.onClose = function (ev) {
    console.log('WebSocket Close...', ev)
}
HRTCEngine.prototype.onError = function (err) {
    console.log('WebSocket Error:', err)
}
// 发送消息
HRTCEngine.prototype.send = function (message) {
    this.signaling.send(message)
}

hRTCEngine = new HRTCEngine('ws://localhost:5000/')
hRTCEngine.createWebSocket();

// 加入房间
const onJoinRoom = () => {
    console.log('加入房间')
    initLocalStream()
}
// 离开房间
const onLeaveRoom = () => {
    console.log('离开房间')
    const stream = localVideo.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(function (track) {
        track.stop();
    });
    localVideo.srcObject = null;
    localStream = null

    const rs = remoteVideo.srcObject;
    const rt = rs.getTracks();
    rt.forEach(function (track) {
        track.stop();
    });
    remoteVideo.srcObject = null;
    remoteStream = null

    peerConnection = null
    // 离开房间
    doLeave();
    //
}


// 初始化本地流
const initLocalStream = () => {
    navigator.mediaDevices.getUserMedia({
        audio: {
            // 消除回音
            echoCancellation: true,
            // 消除噪音
            noiseSuppression: true
        },  // 是否捕获音频
        video: true,
    })
        .then(openLocalStream)
        .catch(function (e) {
            console.log('初始化本地流失败：', e)
        })
}

// 初始化本地流成功：打开本地媒体流
const openLocalStream = (stream) => {
    console.log('打开本地流:', stream)
    // 加入房间
    if (status.value == 1) {
        // 通话开始
        doJoin()
    }
    // 设置本地媒体流
    localVideo.srcObject = stream;
    localStream = stream;
}

// 创建offer
const doCreateOffer = () => {
    // 创建RTCPeerConnection
    if (peerConnection == null) {
        // pc 为空，可以考虑后续作为属性传入
        createPeerConnection();
    }
    // 创建 sdp
    peerConnection.createOffer().then(createOfferAndSendMessage).catch(handleCreateOfferError)
}
// 创建 answer
const doAnswer = () => {
    // 创建 answer
    peerConnection.createAnswer().then(createAnswerAndSendMessage).catch(handleCreateAnswerError)
}


// 接收offer事件
const handleRemoteOffer = (message) => {
    console.info('handleRemoteOffer: ', message)
    if (peerConnection == null) {
        createPeerConnection();
    }
    // 解析
    const description = JSON.parse(message.msg)
    peerConnection.setRemoteDescription(description)
    // 应答
    doAnswer()
}
// 接收answer事件
const handleRemoteAnswer = (message) => {
    console.info('handleRemoteAnswer: ', message)
    // 解析
    const description = JSON.parse(message.msg)
    peerConnection.setRemoteDescription(description)
}
// 接收candidate事件
const handleRemoteCandidate = (message) => {
    console.info('handleRemoteCandidate: ', message)
    const candidate = JSON.parse(message.msg)
    peerConnection.addIceCandidate(candidate).catch(
        (err) => {
            console.error('handleRemoteCandidate failed: ', err)
        }
    )
}

// 创建sdp 并且发送
const createOfferAndSendMessage = (session) => {
    peerConnection.setLocalDescription(session)
        .then(() => {
            // 发送 offer
            const jsonMsg = {
                cmd: SIGNALING_TYPE_OFFER,
                roomId: model.roomId,
                uid: model.localUserId,
                remoteUid: model.remoteUserId,
                msg: JSON.stringify(session)
            }
            console.log('发送offer：', JSON.stringify(jsonMsg))
            hRTCEngine.send(JSON.stringify(jsonMsg))
            console.info('create Offer And Send SDP: ', jsonMsg)
        })
        .catch((err) => {
            console.error('create Offer , Set Local Description Error:', err)
        })
}
// 处理创建answer，并且返送
const createAnswerAndSendMessage = (session) => {
    peerConnection.setLocalDescription(session)
        .then(() => {
            // 发送 offer
            const jsonMsg = {
                cmd: SIGNALING_TYPE_ANSWER,
                roomId: model.roomId,
                uid: model.localUserId,
                remoteUid: model.remoteUserId,
                msg: JSON.stringify(session)
            }
            hRTCEngine.send(JSON.stringify(jsonMsg))
            console.info('create answer And Send SDP: ', jsonMsg)
        })
        .catch((err) => {
            console.error('create answer , Set Local Description Error:', err)
        })
}

// 处理创建Offer失败
const handleCreateOfferError = (err) => {
    console.error('handle Create Offer Error:', err)
}
// 处理创建answer失败
const handleCreateAnswerError = (err) => {
    console.error('handle Create answer Error:', err)
}

// 创建对等连接
const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection({
        iceServers: [
            // 目前我在用的，免费STUN 服务器
            {
                urls: 'stun:stun.voipbuster.com ',
            },
            // TURN 服务器,这个对服务器压力太大了，目前没找到免费的，后续我在自己的服务器上弄一个
            {
                urls: 'turn:111.92.241.177:3478',
                username: 'test',
                credential: 'test123',
            },
            // 谷歌的好像都失效了，不过你们可以试试
            {
                urls: 'stun:stun.l.google.com:19301',
            },
        ]
    });
    // 绑定事件
    peerConnection.onicecandidate = handleIceCandidate;
    peerConnection.ontrack = handleRemoteTrackAdd;
    // 加入本地码流
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })
}

// 处理ICE网络协商
const handleIceCandidate = (ev) => {
    console.info('handleIceCandidate:', ev)
    if (ev.candidate != null) {
        const jsonMsg = {
            cmd: SIGNALING_TYPE_CANDIDATE,
            roomId: model.roomId,
            uid: model.localUserId,
            remoteUid: model.remoteUserId,
            msg: JSON.stringify(ev.candidate)
        }
        hRTCEngine.send(JSON.stringify(jsonMsg))
        console.info('handleIceCandidate message:', jsonMsg)
    } else {
        // 没有打洞
        console.warn('End of candidates')
    }

}

// 远端流加入
const handleRemoteTrackAdd = (ev) => {
    console.info('handleRemoteTrackAdd')
    remoteStream = ev.streams[0];
    remoteVideo.srcObject = remoteStream
}

// 处理加入房间
const doJoin = () => {
    console.log('处理用户加入房间：room=' + model.roomId + ', user=' + model.localUserId)
    if (model.roomId == null) {
        $message.warning('请输入正确的房间号!')
        return;
    }
    let jsonMsg = {
        cmd: SIGNALING_TYPE_JOIN,
        roomId: model.roomId,
        uid: model.localUserId,
    }
    hRTCEngine.send(JSON.stringify(jsonMsg))
}
// 处理离开房间
const doLeave = () => {
    const jsonMsg = {
        cmd: SIGNALING_TYPE_LEAVE,
        roomId: model.roomId,
        uid: model.localUserId
    }
    hRTCEngine.send(JSON.stringify(jsonMsg))
    console.info('doLeave message: ', JSON.stringify(jsonMsg))
}
// 处理加入peer
const handleRemoteNewPeer = (message) => {
    console.info('handleRemoteNewPeer, 新成员加入：', JSON.stringify(message))
    model.remoteUserId = message.remoteUid
    // 创建offer： doCreateOffer
    doCreateOffer()

}
// 处理响应加入房间
const handleResponseJoin = (message) => {
    console.info('handleResponseJoin, 加入房间：remoteUid=', message.remoteUid)
    model.remoteUserId = message.remoteUid
    // 创建offer： doCreateOffer
}
// 处理成员离开房间事件
const handlePeerLeave = (message) => {
    console.info('handlePeerLeave, remoteUid=' + message.remoteUid + ' , roomId=' + message.roomId)
    /*remoteVideo.srcObject = null
    remoteStream = null*/

    // 挂断电话
    onHangup()
}


// 页面元素挂载完成
onMounted(() => {
    lv = document.getElementById('local-video')
    rv = document.getElementById('remote-video')
    localVideo = lv
    remoteVideo = rv
    console.log('视频元素对象', lv,rv)

    animation.value = props.conversationType.type == 1

    // 加载数据
    onLoad()

    if (status.value == 0) {
        // 如果 存在有人邀请，则需要进行点击确认
        console.log('存在有人邀请，则需要进行点击确认')
        initLocalStream()
    } else {
        // 自己呼叫的，进入房间
        /*onJoinRoom()
        doJoin()*/
        onStart()
    }
})

onUnmounted(() => {
    // onDestroy()
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
                <n-button @click="onMuted">
                    <n-icon>
                        <MicOutline v-if="openMicrophone == true"/>
                    </n-icon>
                </n-button>
                <n-button v-show="status == 1" type="error" @click="onHangup">挂断</n-button>
                <n-button v-show="status == 0" type="primary" @click="onStart">接听</n-button>
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

video {
    max-width: 100%;
    max-height: 100%;
}

</style>
