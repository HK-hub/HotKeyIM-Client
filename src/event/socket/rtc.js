// 语音通话，视频通话
import Base from './base'
import Talk from "@/event/socket/talk";

// 信令
const SIGNALING_TYPE = "signaling-event";

// 主动加入房间
const SIGNALING_TYPE_JOIN = "join-event";

// 告知加入者对方是谁
const SIGNALING_TYPE_RESP_JOIN = "join-resp-event";

// 主动离开房间
const SIGNALING_TYPE_LEAVE = "leave-event";

// 有人加入房间，通知已经在房间内的人
const SIGNALING_TYPE_NEW_PEER = "new-peer-event";

// 有人离开房间，通知房间内的人
const SIGNALING_TYPE_PEER_LEAVE = "leave-peer-event";

// offer：发送offer给对端peer
const SIGNALING_TYPE_OFFER = "offer-event";

// answer： 发送offer给对端peer
const SIGNALING_TYPE_ANSWER = "answer-event";

// 发送candidate给对端peer
const SIGNALING_TYPE_CANDIDATE = "candidate-event";

/**
 * 好友状态事件
 */
export class HRTCEngine extends Base {

    wsUrl = 'ws://localhost:5000/';

    signaling;

    hRTCEngine;

    localVideo;

    remoteVideo;

    currentVideo;

    localStream;

    remoteStream;

    currentStream;

    peerConnection;

    sender_id;

    ICE = {
        iceServers: [
            {
                url: 'turn:47.120.6.12:3478', // xxxxx 为域名
                credential: 'test', // 密码
                username: 'test123' // 账号
            },
            {
                url: 'turn:111.92.241.177:3478', // xxxxx 为域名
                credential: 'test', // 密码
                username: 'test123' // 账号
            },
        ],
        sdpSemantics: 'plan-b'
    };

    /**
     * 初始化构造方法
     * @param url
     */
    constructor(url) {
        super();
        if (url) {
            this.wsUrl = url;
        }
        this.initProperties()
        // 初始化本地流
        // this.initLocalSteam()
    };


    // 初始化对象属性
    initProperties() {
        this.sender_id = super.getAccountId();
        this.create()
    };


    // 创建WebSocket 连接
    create() {
        this.hRTCEngine = this;
        this.signaling = new WebSocket(this.wsUrl)

        // 绑定事件
        this.signaling.onopen = ()=> {
            this.onOpen()
        }
        this.signaling.onmessage = (ev) => {
            this.onMessage(ev)
        }
        this.signaling.onclose = (ev) => {
            this.onClose(ev)
        }
        this.signaling.onerror = (err) => {
            this.onError(err)
        }
    };

    // WebSocket 事件
    onOpen() {
        console.log('WebSocket Open...')
    }
    onMessage(ev) {
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
                this.handleRemoteNewPeer(jsonMsg);
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
    onClose(ev) {
        console.log('WebSocket Close...', ev)
    }
    onError(err) {
        console.log('WebSocket Error:', err)
    }
    // 发送消息
    send(message) {
        this.signaling.send(message)
    }


}

export default HRTCEngine
