<script setup>
import {onMounted, reactive, ref,markRaw, defineComponent} from 'vue'
import {
    SIGNALING_TYPE_JOIN, SIGNALING_TYPE_RESP_JOIN, SIGNALING_TYPE_NEW_PEER, SIGNALING_TYPE_OFFER
    , SIGNALING_TYPE_LEAVE, SIGNALING_TYPE_PEER_LEAVE, SIGNALING_TYPE_CANDIDATE, SIGNALING_TYPE_ANSWER
} from '@/event/socket/signaling'
import 'webrtc-adapter'
import { NButton,NLayout,NLayoutHeader,NLayoutContent, NLayoutSider, NMenu} from 'naive-ui'
import { FlashOutline } from '@vicons/ionicons5'

const count = ref(0)
let blobMedia = reactive([])
let screenStream = null
let mediaRecord = null
let logList = reactive([])

// 当前用户
const localUserId = JSON.parse(localStorage.getItem('IM_USERID')).value
// 房间号
const model = reactive({
    roomId: null,
    localUserId: localUserId == null ? '0' : localUserId,
    remoteUserId: '0',
});
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
    // 离开房间
    doLeave();
}
// 分享屏幕
const onShareScreen = async () => {
    // 切换本地码流为：DisplayMedia
    blobMedia = []
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true
        })
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            $message.warning('用户中断了屏幕共享')
            // 切换回视频码流
            onChangeToVideo()
        })
        /*mediaRecord = new MediaRecorder(screenStream, { mimeType: 'video/webm' });

        mediaRecord.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                blobMedia.push(e.data);
            }
        };
        mediaRecord.start(500)*/
        // 设置流
        let videoTrack = screenStream.getVideoTracks()[0]
        const sender = peerConnection.getSenders().find(function (s) {
            // make sure tack types match
            return s.track.kind === videoTrack.kind;
        });
        sender.replaceTrack(videoTrack)
        localVideo.srcObject = screenStream;
        console.log('切换为屏幕共享')
    } catch (e) {
        $message.warning('屏幕共享失败!')
    }
}
// 从屏幕共享切换回视频通话
const onChangeToVideo = async () => {

    // 结束录制
    mediaRecord.stop();
    screenStream.getTracks().forEach(track => track.stop());

    // 获取本地视频码流
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 1000,
                height: 700
            }
        })
        let videoTrack = localStream.getVideoTracks()[0]
        const sender = peerConnection.getSenders().find(function (s) {
            // make sure tack types match
            return s.track.kind === videoTrack.kind;
        });
        sender.replaceTrack(videoTrack)
        localVideo.srcObject = localStream
        console.log('切换回视频通话')
    } catch (e) {

    }

}
// 屏幕录制
const startLocalRecord = async () => {
    blobMedia = []
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia();
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            $message.warning('用户中断了屏幕共享')
            endLocalRecord()
        })
        mediaRecord = new MediaRecorder(screenStream, { mimeType: 'video/webm' });

        mediaRecord.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                blobMedia.push(e.data);
            }
        };
        mediaRecord.start(500)
        // 设置流
        const scVideo = document.querySelector('#screenVideo');
        scVideo.srcObject = screenStream;
    } catch (e) {
        $message.warning('屏幕录制失败!')
    }
}
// 结束录制
const endLocalRecord = async () => {
    if(!mediaRecord || mediaRecord.state !== 'recording') {
        $message.warning('录制还未开始');
        return;
    }
    mediaRecord.stop();
    screenStream.getTracks().forEach(track => track.stop());
}
// 回放视频
const replayLocalRecord = async () => {
    if (blobMedia.length) {
        const scVideo = document.querySelector('#screenVideo');
        const blob = new Blob(blobMedia, { type:'video/webm' })
        if(scVideo) {
            scVideo.srcObject = null;
            scVideo.src = URL.createObjectURL(blob);
        }
    } else {
       $message.warning('没有录制文件');
    }
}
// 下载视频
const downloadLocalRecord = async () => {
    if (!blobMedia.length) {
        $message.warning('没有录制文件');
        return;
    }
    const blob = new Blob(blobMedia, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '录屏_' + Date.now() + '.webm';
    a.click();
}


// 初始化本地流
const initLocalStream = () => {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: 1000,
            height: 700
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
    remoteVideo.poster = null
}

// 页面挂载完成
onMounted(() => {
    localVideo = document.getElementById("localVideo")
    remoteVideo = document.getElementById("remoteVideo")
    console.log('视频元素获取：', localVideo)
})
</script>

<template>
    <n-layout content-style="height: 100%">
        <n-layout-header bordered>
            <div class="roomSetting">
                <n-input v-model:value="model.roomId" maxlength="15" placeholder="输入房间号"/>
                <n-button id="join" type="info" @click="onJoinRoom()">加入</n-button>
                <n-button id="leave" type="error" @click="onLeaveRoom()">离开</n-button>
                <n-button id="leave" type="success" @click="onLeaveRoom()">分享屏幕</n-button>
                <n-button id="leave" type="success" @click="startLocalRecord()">屏幕录制</n-button>
                <n-button id="leave" type="success" @click="endLocalRecord()">结束录制</n-button>
                <n-button id="leave" type="success" @click="replayLocalRecord()">回放视频</n-button>
                <n-button id="leave" type="success" @click="downloadLocalRecord()">下载视频</n-button>
                <n-button id="leave" type="primary" @click="onShareScreen()">分享屏幕</n-button>
                <n-button id="leave" type="info" @click="onChangeToVideo()">切换视频</n-button>

            </div>
        </n-layout-header>
        <n-layout has-sider>
            <n-layout-sider :width="80" content-style="padding: 2px;">
                <n-menu
                    :collapsed="false"
                    :collapsed-width="64"
                    :collapsed-icon-size="22"
                    :options="menuOptions"
                />
            </n-layout-sider>
            <n-layout>
                <n-layout-content content-style="">
<!--                    <div class="multi-content">
                        <div id="videos">
                            <div id="theirs-video">
                            </div>
                            <div id="my-video">

                            </div>
                        </div>
                        <div class="chatMessage">
                        </div>
                    </div>-->
                    <n-layout has-sider>
                        <n-layout-content content-style="width: 92%">
                            <video id="remoteVideo" playsinline autoplay poster=""></video>
                            <div id="screen">
                                <video id='screenVideo' autoplay muted v-show="activityModel == 'screen'"></video>
                            </div>
                        </n-layout-content>
                        <n-layout-sider class="content-sider" content-style="max-width: 375px;width: 370px">
                            <video id="localVideo" playsinline autoplay muted></video>
                            <div class="chat-content" style=""></div>
                            <n-input class="chat-input" placeholder="聊点什么...">
                                <template #prefix>
                                    <n-icon :component="FlashOutline" />
                                </template>
                            </n-input>
                        </n-layout-sider>
                    </n-layout>
                </n-layout-content>
            </n-layout>
        </n-layout>
    </n-layout>


</template>

<style lang="less" scoped>
.roomSetting {
     width: 100%;
     margin-bottom: 20px;
     display: flex;
     align-content: center;
     justify-items: center;
 }

.multi-content {
    display: flex;
    align-content: center;
    justify-content: center;
}

#videos {
    display: flex;
    align-content: center;
    justify-items: center;
    justify-content: center;
    width: 100%;
}

#localVideo {
    width: 97%;
    // height: 250px;
    margin-left: 6px;
    margin-bottom: 6px;
    border-radius: 2%;
}

#remoteVideo {
    width: 100%;
    height: 97%;
    border-radius: 2%;

}

#screenVideo {
    height: 100%;
    width: 100%;
}

#theirs-video {
    display: inline;
    width: 120%;
    margin-left: 10px;
    border-radius: 20%;
}

.content-sider {

    display: flex;
    justify-content: center;

}

.video {
}
.chat-content {
    width: 95%;
    height: 56%;
    margin-top: 3px;
    margin-left: 6px;
    margin-bottom: 10px;
    border-block: solid;
    border-color: #27c8f8;
    border-radius: 3px;
}

.chat-input {
    width: 80%;
}
</style>