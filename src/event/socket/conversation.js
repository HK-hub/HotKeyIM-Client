// 语音通话，视频通话
import Base from './base'
import socket from '@/socket'

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
export class Conversation extends Base {
    /**
     * 本地码流
     */
    localStream;


    /**
     * 当前码流
     */
    currentSteam;

    /**
     * 远端码流
     */
    remoteStream;

    /**
     * 本地Video元素
     */
    localVideo;

    /**
     * 远程Video
     */
    remoteVideo;

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
     * 发送者ID
     */
    sender_id = 0;

    /**
     * 接收者ID
     */
    receiver_id = 0;

    /**
     * 聊天类型[1:私聊;2:群聊;]
     */
    talk_type = 0;

    /**
     * 初始化构造方法
     * @param lv 本地video元素
     * @param rv 远端video元素
     */
    constructor(lv, rv) {
        super()
        console.log('构造conversation对象', lv,rv)
        this.localVideo = lv
        this.remoteVideo = rv
        // 初始化对象
        this.initProperties()
        console.log('初始化conversation对象属性：', this)
    };


    // 初始化对象属性
    initProperties() {
        this.sender_id = super.getAccountId();
        // this.localVideo = document.getElementById('local-video')
        // this.remoteVideo = document.getElementById('remote-video')
        console.log('this.localVideo,this.remoteVideo:', this.localVideo, this.remoteVideo)
    };

    // 初始化本地视频码流
    initLocalSteam() {
        navigator.mediaDevices.getUserMedia({
            audio: {
                // 消除回音
                echoCancellation: true,
                // 消除噪音
                noiseSuppression: true
            },  // 是否捕获音频
            video: {  // 视频相关设置
                width: {
                    min: 381, // 当前视频的最小宽度
                    max: 640,
                },
                height: {
                    min: 200, // 最小高度
                    max: 480
                },
            }
        })
            .then( (stream) => {
                // 打开本地Stream成功
                this.openLocalStream(stream)
            })
            .catch(this.initLocalStreamError);

    };


    // 获取本地媒体信息成功，打开本地码流
    openLocalStream(stream) {
        console.log('local stream, video:', stream, this.localVideo);
        // 加入房间

        this.localVideo.srcObject = stream;
        this.localStream = stream;
    };

    // 初始化媒体数据失败
    initLocalStreamError(err) {
        console.log('getUserMedia() error: ', err);
        $message.warning('抱歉您的设备不支持音视频通话!');
    };


    // 点击呼叫
    clickCall() {
        // 点击加入按钮
        console.log('点击点入按钮');
        // 初始化本地码流
        this.initLocalSteam();
        // 向服务器发送消息请求
    };


    // 点击加入按钮
    doJoin(roomId) {
        const joinMessage = {
            cmd: SIGNALING_TYPE_JOIN,
            roomId: roomId,
            userId: this.sender_id,
            receiverId: this.receiver_id
        };
        this.sendSignalingMessage()
    }


    // 发送信令消息
    sendSignalingMessage (data) {
        // 发送数据到webSocket 协议的信令服务器
        socket.send({
            event: SIGNALING_TYPE,
            dataString: JSON.stringify(data)
        })

    }


}
