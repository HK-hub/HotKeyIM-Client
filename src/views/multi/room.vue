<script setup>
import {onMounted, reactive, ref} from 'vue'
import {
    SIGNALING_TYPE_JOIN, SIGNALING_TYPE_RESP_JOIN, SIGNALING_TYPE_NEW_PEER,SIGNALING_TYPE_OFFER
    , SIGNALING_TYPE_LEAVE,SIGNALING_TYPE_PEER_LEAVE,SIGNALING_TYPE_CANDIDATE,SIGNALING_TYPE_ANSWER
} from '@/event/socket/signaling'
import 'webrtc-adapter'


// 当前用户
const localUserId = JSON.parse(localStorage.getItem('IM_USERID')).value
// 房间号
const model = reactive({
    roomId: null,
    localUserId: localUserId == null ? '0' : localUserId,
    remoteUserId: '0',
});

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
    // 离开房间
    doLeave();
}

// 初始化本地流
const initLocalStream = () => {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 420,
            height: 270
        }
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
    doJoin()
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
                uid: localUserId,
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
    remoteVideo.srcObject = null
    remoteStream = null
}

// 页面挂载完成
onMounted(() => {
    localVideo = document.getElementById("localVideo")
    remoteVideo = document.getElementById("remoteVideo")
    console.log('视频元素获取：', localVideo)
})
</script>

<template>
    <h1>WebRTC Demo</h1>
    <div class="roomSetting">
        <n-input v-model:value="model.roomId" maxlength="15" placeholder="输入房间号"></n-input>
        <n-button id="join" type="default" @click="onJoinRoom()">加入</n-button>
        <n-button id="leave" type="default" @click="onLeaveRoom()">离开</n-button>
    </div>
    <div id="videos">
        <video id="localVideo" playsinline autoplay muted></video>
        <div id="theirs-video">
            <video id="remoteVideo" playsinline autoplay></video>
        </div>
    </div>
</template>
<style lang="css" scoped>
.roomSetting {
    width: 60%;
    margin-bottom: 20px;
}

</style>