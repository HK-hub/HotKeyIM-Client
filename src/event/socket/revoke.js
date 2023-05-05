import Base from './base'
import { useDialogueStore } from '@/store/dialogue'

/**
 * 好友状态事件
 */
class Revoke extends Base {
    /**
     * @var resource 资源
     */
    resource

    /**
     * 发送者ID
     */
    sender_id = 0

    /**
     * 接收者ID
     */
    receiver_id = 0

    /**
     * 聊天类型[1:私聊;2:群聊;]
     */
    talk_type = 0

    /**
     * 初始化构造方法
     *
     * @param {Object} resource Socket消息
     */
    constructor(resource) {
        super()
        console.log('撤回消息处理器构造器：', resource)
        this.sender_id = resource.flow.senderId
        this.receiver_id = resource.flow.receiverId
        this.talk_type = resource.flow.chatType
        this.record_id = resource.flow.messageId

        this.handle()
    }

    /**
     * 判断消息发送者是否来自于我
     * @returns
     */
    isCurrSender() {
        return this.sender_id == this.getAccountId()
    }

    /**
     * 获取对话索引
     *
     * @return String
     */
    getIndexName() {
        if (this.talk_type == 2) {
            return `${this.talk_type}_${this.receiver_id}`
        }

        let receiver_id = this.isCurrSender() ? this.receiver_id : this.sender_id

        return `${this.talk_type}_${receiver_id}`
    }

    handle() {
        // 判断当前是否正在和好友对话
        if (!this.isTalk(this.talk_type, this.receiver_id, this.sender_id)) {
            return
        }

        useDialogueStore().updateDialogueRecord({
            id: this.record_id,
            revoke: true,
        })
    }
}

export default Revoke
