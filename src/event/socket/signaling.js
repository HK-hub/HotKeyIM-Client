
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


export {
    SIGNALING_TYPE,
    SIGNALING_TYPE_JOIN,
    SIGNALING_TYPE_RESP_JOIN,
    SIGNALING_TYPE_LEAVE,
    SIGNALING_TYPE_NEW_PEER,
    SIGNALING_TYPE_PEER_LEAVE,
    SIGNALING_TYPE_OFFER,
    SIGNALING_TYPE_ANSWER,
    SIGNALING_TYPE_CANDIDATE
}
