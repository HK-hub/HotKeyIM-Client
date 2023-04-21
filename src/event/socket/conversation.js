import Base from './base'
import {useNotifyStore} from "@/store/notify";
import {findTalkIndex, formatTalkItem, palyMusic} from "@/utils/talk";
import {WebNotify} from "@/utils/notification";
import {ServeCreateTalkList} from "@/api/chat";
import {useTalkStore} from "@/store/talk";
import {toTalk} from '@/utils/talk'
import {parseTime} from "@/utils/datetime";
import {modal} from '@/utils/common'
import MeVideoCaller from '@/components/editor/MeVideoCaller.vue'

/**
 * 好友状态事件
 */
class Conversation extends Base {

    /**
     * 命令：start, end
     */
    cmd;

    /**
     *接收者id
     */
    receiverId;

    /**
     * 房间号
     */
    roomId;

    /**
     * 视频通话类型：1.私聊，2.群聊
     */
    type;

    /**
     * 视频发起者
     */
    userId;

    resource;

    /**
     * 初始化构造方法
     *
     * @param {Object} resource Socket消息
     */
    constructor(resource) {
        super()
        console.log('构造conversation 消息：', resource)

        this.cmd = resource.cmd
        this.type = resource.type
        this.userId = resource.userId
        this.receiverId = resource.receiverId
        this.roomId = resource.roomId
        this.resource = resource

        console.log('构造 conversation 完毕消息：',this.resource)
        this.handle()
    }

    /**
     * 判断消息发送者是否来自于我
     * @returns
     */
    isCurrSender() {
        return this.userId === this.getAccountId()
    }

    /**
     * 获取对话索引
     *
     * @return String
     */
    getIndexName() {
        if (this.type === 2) {
            return `${this.type}_${this.userId}`
        }

        let receiver_id = this.isCurrSender() ? this.receiverId : this.userId

        return `${this.type}_${receiver_id}`
    }

    // 播放提示音
    play() {
        // 客户端有消息提示
        if (window.electron) {
            return
        }

        useNotifyStore().isPromptTone && palyMusic()
    }


    handle() {
        console.log('conversation.handle():', this.resource)
        // TODO 需要做消息去重处理
        if (!this.isCurrSender()) {
            // 判断消息是否来自于我自己，不是来源于自己就会提示消息通知
            this.showMessageNotice()
        }

        // 判断会话列表是否存在，不存在则创建
        var indexName = this.getIndexName();
        console.log('获取当前会话名称：', indexName)
        if (findTalkIndex(this.getIndexName()) === -1) {

            console.log('判断会话是否存在：不存在，-> 创建')
            return this.addTalkItem()
        }

        // 判断当前是否正在和好友对话
        if (this.isTalk(this.type, this.receiverId, this.userId)) {
            // 插入会话记录
            // 正在和当前用户会话
            this.updateTalkItem()
        } else {
            // TODO 目前没有和该好友对话: 跳转到和当前好友界面
            toTalk(this.type, this.userId)
        }

        // 跳出音视频通话界面
        modal(MeVideoCaller, {
            conversationType: this.type,
            // 接收者id
            receiver_id: this.userId,
            // 私聊群聊
            talk_type: this.type,
            // 房间号
            roomId: this.roomId,
            invite: {
                cmd: this.cmd,
                roomId: this.roomId,
                userId: this.userId,
                receiverId: this.receiverId,
                type: this.type,
            }
        })

    }

    /**
     * 显示消息提示
     * @returns
     */
    showMessageNotice() {
        if (useNotifyStore().isLeaveWeb) {
            if (useNotifyStore().isWebNotify) {
                WebNotify('HotKeyIM 在线聊天', {
                    dir: 'auto',
                    lang: 'zh-CN',
                    body: '您有新的消息请注意查收!!!',
                })
            }
        } else {
            $notification.create({
                title: '消息通知',
                content: '您有新的视频通话请注意查收！！！',
                duration: 2000,
            })
        }
    }

    /**
     * 加载对接节点
     */
    addTalkItem() {
        console.log('加载对接节点')
        let receiver_id = this.userId
        let talk_type = this.type

        if (talk_type === 1 && this.userId != this.getAccountId()) {
            receiver_id = this.userId
        } else if (talk_type == 2) {
            receiver_id = this.userId
        }

        ServeCreateTalkList({
            talk_type,
            receiver_id,
        }).then(({code, data}) => {
            console.log('加载对接节点,成功：', data)
            if (code == 200) {
                useTalkStore().addItem(formatTalkItem(data))
                this.play()
            }
        })
    }

    /**
     * 更新对话列表记录
     */
    updateTalkItem() {
        useTalkStore().updateMessage({
            index_name: this.getIndexName(),
            msg_text: '音视频通话中...',
            updated_at: parseTime(new Date()),
        })
    }

}

export default Conversation