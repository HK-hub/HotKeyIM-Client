import {useTalkStore} from '@/store/talk'
import router from '@/router'
import {parseTime} from '@/utils/datetime'
import {ServeCreateTalkList} from '@/api/chat'

const KEY_INDEX_NAME = 'send_message_index_name'

export function formatTalkRecord(login_uid, data) {
    console.log('消息记录格式化：', data)
    data.layout = 'center'
    let senderId = parseInt(data.senderId)
    login_uid = parseInt(login_uid)
    console.log('参数类型：login_uid,senderId',typeof login_uid, typeof senderId)
    if (senderId > 0) {
        // 如果是自己发送的，消息就处于右边，不是自己发送的就处于左边

        data.layout = senderId === login_uid ? 'right' : 'left'
        console.log('消息布局：',senderId,login_uid,data.layout)
    }

    data.isCheck = false

    return data
}

// 播放消息提示
export function palyMusic(muted = false) {
    let audio = document.getElementById('audio')
    audio.currentTime = 0
    audio.muted = muted
    audio.play()
}

/**
 * 通过对话索引查找对话列表下标
 *
 * @param {String} index_name
 */
export function findTalkIndex(index_name) {
    return useTalkStore().items.findIndex(item => item.index_name === index_name)
}

/**
 * 通过对话索引查找对话列表
 *
 * @param {String} index_name
 */
export function findTalk(index_name) {
    return useTalkStore().items.find(item => item.index_name === index_name)
}

/**
 * 格式化聊天对话列表数据
 *
 * @param {Object} params
 */
export function formatTalkItem(params) {
    let options = {
        id: params.id,
        talk_type: params.sessionType,
        receiver_id: params.receiverId,
        name: params.receiverName,
        remark_name: params.receiverName,
        avatar: params.avatar ? params.avatar : '',
        disturb: params.disturb,
        top: params.top,
        online: params.online,
        robot: params.robot,
        unread_num: params.unreadCount,
        content: '......',
        draft: params.draft,
        msg_text: '',
        index_name: '',
        // created_at: params.createTime ? parseTime(params.createTime) :parseTime(new Date()),
        created_at: params.createTime ? params.createTime : parseTime(new Date()),

    }

    //Object.assign(options, params)

    // 设置索引
    options.index_name = `${options.talk_type}_${options.receiver_id}`

    return options
}

/**
 * 打开指定对话窗口
 *
 * @param {Integer} talk_type 对话类型[1:私聊;2:群聊;]
 * @param {Integer} receiver_id 接收者ID
 */
export function toTalk(talk_type, receiver_id) {
    console.log('toTalk.receiver_id=', receiver_id)
    if (findTalkIndex(`${talk_type}_${receiver_id}`) >= 0) {
        sessionStorage.setItem(KEY_INDEX_NAME, `${talk_type}_${receiver_id}`)
        return router.push({
            path: '/message',
            query: {
                v: new Date().getTime(),
            },
        })
    }

    // 创建会话
    ServeCreateTalkList({
        type: parseInt(talk_type),
        receiverId: receiver_id,
        userId: JSON.parse(localStorage.getItem('IM_USERID')).value
    }).then(({code, data, message}) => {
        if (code == 200) {
            console.log('ServeCreateTalkList=', data)
            sessionStorage.setItem(KEY_INDEX_NAME, `${talk_type}_${receiver_id}`)

            if (findTalkIndex(`${talk_type}_${receiver_id}`) === -1) {
                useTalkStore().addItem(formatTalkItem(data))
            }

            router.push({
                path: '/message',
                query: {
                    v: new Date().getTime(),
                },
            })
        } else {
            $message.info(message)
        }
    })
}

/**
 * 获取需要打开的对话索引值
 *
 * @returns
 */
export function getCacheIndexName() {
    let index_name = sessionStorage.getItem(KEY_INDEX_NAME)

    if (index_name) {
        sessionStorage.removeItem(KEY_INDEX_NAME)
    }

    return index_name
}
