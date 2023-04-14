<script setup>
import {ref, onMounted} from 'vue'
import {useEditorStore} from '@/store/editor'
import {useTalkStore} from '@/store/talk'
import {useDialogueStore} from '@/store/dialogue'
import {useNotifyStore} from '@/store/notify'
import {useUploadsStore} from '@/store/uploads'
import socket from '@/socket'
import {
    ServeSendTalkText,
    ServeSendTalkImage,
    ServeSendVote,
    ServeSendLocation,
    ServeSendEmoticon,
    ServeSendTalkCodeBlock,
} from '@/api/chat'
import {throttle} from '@/utils/common'
import Editor from '@/components/editor/Editor.vue'
import MultiSelectFooter from './MultiSelectFooter.vue'
import HistoryRecord from '@/components/talk/HistoryRecord.vue'

const userId = JSON.parse(localStorage.getItem('IM_USERID')).value
const talkStore = useTalkStore()
const editorStore = useEditorStore()
const notifyStore = useNotifyStore()
const uploadsStore = useUploadsStore()
const dialogueStore = useDialogueStore()
const props = defineProps({
    uid: {
        type: String,
        default: 0,
    },
    talk_type: {
        type: Number,
        default: 0,
    },
    receiver_id: {
        type: Number,
        default: 0,
    },
    index_name: {
        type: String,
        default: '',
    },
    online: {
        type: Boolean,
        default: false,
    },
})

const isShowHistory = ref(false)

// 发送普通文本消息
const onSendTextEvent = throttle(value => {
    let {data, callBack} = value

    // 发送文本消息
    const res = ServeSendTalkText({
        senderId: userId,
        receiverId: props.receiver_id,
        talkType: props.talk_type,
        groupId: props.talk_type == 2 ? props.receiver_id : null,
        text: data,
    })
    console.log('发送文本消息：', res)
    res.then(({code, message}) => {
        if (code == 200) {
            console.log('更新聊天item: ', props)
            talkStore.updateItem({
                index_name: props.index_name,
                draft_text: '',
            })
            // 追加消息

            // 对话列表滚动条置顶
            document.getElementById('talk-session-list').scrollTop = 0

            callBack(true)
        } else {
            $message.warning(message)
        }
    })

    res.catch(() => {
        $message.warning('网络繁忙,请稍后重试！！！')
    })
}, 1000)

const onSendImageEvent = ({data, callBack}) => {
    let fileData = new FormData()

    fileData.append('talkType', props.talk_type)
    fileData.append('senderId', userId)
    fileData.append('receiverId', props.receiver_id)
    fileData.append('image', data)

    const resp = ServeSendTalkImage(fileData)

    resp.then(res => {
        if (res.code == 200) {
            callBack(true)
        } else {
            $message.info(res.message)
        }
    })
    resp.finally(() => callBack(false))
}

// 发送代码消息
const onSendCodeEvent = ({data, callBack}) => {
    ServeSendTalkCodeBlock({
        senderId: userId,
        receiverId: props.receiver_id,
        talkType: props.talk_type,
        code: data.code,
        language: data.lang,
        name: data.name,
    }).then(res => {
        if (res.code == 200 && res.success) {
            callBack(true)
        } else {
            $message.warning(message)
        }
    })
}

// 发送文件消息
const onSendFileEvent = ({data}) => {
    let maxsize = 100 * 1024 * 1024
    if (data.size > maxsize) {
        return $message.info('上传文件不能超过100M！！！')
    }

    console.log('会话talk 属性：',dialogueStore.talk )

    // 初始化分片上传
    uploadsStore.initUploadFile(
        data,
        props.talk_type,
        props.receiver_id,
        dialogueStore.talk.username
    )
}


// 发送位置消息
const onSendLocationEvent = ({data, callBack}) => {
    // data: 经纬度：latitude，longitude
    console.log('onSendLocationEvent: 发送位置消息：', data)

    // 发送文本消息
    ServeSendLocation({
        senderId: userId,
        receiverId: props.receiver_id,
        talkType: props.talk_type,
        groupId: props.talk_type == 2 ? props.receiver_id : null,
        location: {
            latitude: data.latitude,
            longitude: data.longitude,
        },
    }).then((res) => {
        if (res.success && res.code == 200) {
            // 发送地址消息成功
            callBack(true)
        } else {
            $message.warning(res.data)
        }

    }).catch(res => {
        $message.warning("发送位置消息失败!")
    })

}

// 发送语音消息
const onSendVoiceEvent = ({data}) => {
    let maxsize = 100 * 1024 * 1024
    if (data.size > maxsize) {
        return $message.info('语音通话！！！')
    }

    console.log('会话talk 属性：',dialogueStore.talk )

    // 初始化分片上传
    uploadsStore.initUploadFile(
        data,
        props.talk_type,
        props.receiver_id,
        dialogueStore.talk.username
    )
}

// 发送投票消息
const onSendVoteEvent = ({data, callBack}) => {
    let response = ServeSendVote({
        receiver_id: props.receiver_id,
        mode: data.mode,
        anonymous: data.anonymous,
        title: data.title,
        options: data.options,
    })

    response.then(res => {
        callBack(true)
    })

    response.catch(() => {
        callBack(false)
    })
}

const onSendEmoticonEvent = ({data, callBack}) => {
    ServeSendEmoticon({
        receiver_id: props.receiver_id,
        talk_type: props.talk_type,
        emoticon_id: data,
    })

    callBack(true)
}

const onKeyboardPush = throttle(() => {
    socket.emit('event_talk_keyboard', {
        sender_id: props.uid,
        receiver_id: props.receiver_id,
    })
}, 3000)

const onInputEvent = ({data}) => {
    talkStore.updateItem({
        index_name: props.index_name,
        draft_text: data,
    })

    // 判断对方是否在线和是否需要推送
    if (notifyStore.isKeyboard && props.online) {
        onKeyboardPush()
    }
}

// 注册事件
const evnets = {
    text_event: onSendTextEvent,
    image_event: onSendImageEvent,
    code_event: onSendCodeEvent,
    file_event: onSendFileEvent,
    location_event: onSendLocationEvent,
    voice_event: onSendVoiceEvent,
    input_event: onInputEvent,
    vote_event: onSendVoteEvent,
    emoticon_event: onSendEmoticonEvent,
    history_event: () => {
        isShowHistory.value = true
    },
}

// 编辑器事件
const onEditorEvent = msg => {
    evnets[msg.event] && evnets[msg.event](msg)
}

onMounted(() => {
    editorStore.loadUserEmoticon()
})
</script>

<template>
    <footer
        v-show="!dialogueStore.isOpenMultiSelect"
        class="el-footer"
        style="height: 200px"
    >
        <Editor @editor-event="onEditorEvent"
                :receiver_id="receiver_id"
                :uid="uid"
                :talk_type="talk_type"
                :show_vote="talk_type == 2"/>
    </footer>

    <footer
        v-if="dialogueStore.isOpenMultiSelect"
        class="el-footer"
        style="height: 200px"
    >
        <MultiSelectFooter/>
    </footer>

    <HistoryRecord
        v-if="isShowHistory"
        :talk-type="talk_type"
        :receiver-id="receiver_id"
        @close="isShowHistory = false"
    />
</template>
