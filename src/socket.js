import { h } from 'vue'
import { useTalkStore } from '@/store/talk'
import { useUserStore } from '@/store/user'
import { useDialogueStore } from '@/store/dialogue'
import { getAccessToken, isLoggedIn } from './utils/auth'
import WsSocket from './plugins/ws-socket'
import EventTalk from './event/socket/talk'
import EventKeyboard from './event/socket/keyboard'
import EventLogin from './event/socket/login'
import { NAvatar } from 'naive-ui'
import { notifyIcon } from '@/constant/default'

/**
 * Socket 连接实例
 *
 * 注释: 所有 WebSocket 消息接收处理在此实例中处理
 */
class Socket {
    /**
     * WsSocket 实例
     */
    socket

    /**
     * Socket 初始化实例
     */
    constructor() {
        let url = `${import.meta.env.VITE_SOCKET_API}`

        const urlCallback = () => {
            if (!isLoggedIn()) {
                window.location.reload()
            }
            return `${url}:${getAccessToken()}`
        }

        this.socket = new WsSocket(urlCallback, {
            onError: evt => {
                console.log('Websocket 连接失败回调方法')
            },
            // Websocket 连接成功回调方法
            onOpen: evt => {
                // 更新 WebSocket 连接状态
                useUserStore().updateSocketStatus(true)
                    // TODO
                    // useTalkStore().loadTalkList()
            },
            // Websocket 断开连接回调方法
            onClose: evt => {
                // 更新 WebSocket 连接状态
                useUserStore().updateSocketStatus(false)
            },
        })

        this.register()
    }

    // 连接 WebSocket 服务
    connect() {
        this.socket.connection()
    }

    // 连接 WebSocket 服务
    disconnect() {
        this.socket.close()
    }

    isConnect() {
        if (!this.socket.connect) {
            return false
        }

        return this.socket.connect.readyState === 1
    }

    /**
     * 注册回调消息处理事件
     */
    register() {
        this.socket.on('heartbeat', data => {
            if (data === 'ping') {
                this.emit('heartbeat', 'pong')
            }
        })

        // 对话消息事件
        this.socket.on('event_talk', data => new EventTalk(data))

        this.socket.on('event_talk_read', data => {
            const dialogueStore = useDialogueStore()

            if (dialogueStore.index_name == `1_${data.sender_id}`) {
                for (const msgid of data.ids) {
                    dialogueStore.updateDialogueRecord({ id: msgid, is_read: 1 })
                }
            }
        })

        // 好友在线状态事件
        this.socket.on('event_login', data => new EventLogin(data))

        // 好友键盘输入事件
        this.socket.on('event_talk_keyboard', data => new EventKeyboard(data))

        // 消息撤回事件
        this.socket.on('event_talk_revoke', data => {})

        // 好友申请事件
        this.socket.on('event_contact_apply', data => {
            $notification.create({
                title: '好友申请通知',
                content: data.remark,
                description: `申请人: ${data.friend.nickname}`,
                meta: data.friend.created_at,
                avatar: () =>
                    h(NAvatar, {
                        size: 'small',
                        round: true,
                        src: notifyIcon,
                        style: 'background-color:#fff;',
                    }),
                duration: 3000,
            })
            useUserStore().isContactApply = true
        })

        this.socket.on('event_error', data => {
            $message.error(JSON.stringify(data))
        })
    }

    /**
     * 聊天发送数据
     *
     * @param {Object} mesage
     */
    send(mesage) {
        if (this.isConnect()) {
            this.socket.send(mesage)
        } else {
            this.socket.close()
        }
    }

    /**
     * 推送消息
     *
     * @param {String} event 事件名
     * @param {Object} data 数据
     */
    emit(event, data) {
        this.socket.emit(event, data)
    }
}

export default new Socket()