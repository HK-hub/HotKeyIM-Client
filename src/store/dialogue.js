import { defineStore } from 'pinia'
import {
  ServeRemoveRecords,
  ServeRevokeRecords,
  ServeForwardRecords,
} from '@/api/chat'

// 键盘消息事件定时器
let keyboardTimeout = null

export const useDialogueStore = defineStore('dialogue', {
  state: () => {
    return {
      // 对话索引（聊天对话的唯一索引）
      index_name: null,

      // 对话节点
      talk: {
        username: '',
        talk_type: 0, // 对话来源[1:私聊;2:群聊]
        receiver_id: 0,
      },

      // 好友是否正在输入文字
      keyboard: false,

      // 对话输入框信息
      editorText: '',

      // 对方是否在线
      online: false,

      // 聊天记录
      records: [],

      // 新消息提示
      unreadBubble: 0,

      // 是否开启多选操作模式
      isOpenMultiSelect: false,

      // 当前对话群成员呢列表
      groupMembers: [],
    }
  },
  getters: {
    // 多选列表
    selectItems: state => {
      return state.records.filter(item => item.isCheck)
    },
    isGroupTalk: state => {
      return state.talk.talk_type == 2
    },
  },
  actions: {
    // 更新在线状态
    setOnlineStatus(status) {
      this.online = status
    },

    // 更新对话信息
    setDialogue(data = {}) {
      this.online = data.online || false
      this.talk = {
        username: data.username || '',
        talk_type: data.talk_type || 0,
        receiver_id: data.receiver_id || 0,
      }

      this.index_name = this.talk.talk_type + '_' + this.talk.receiver_id
      this.records = []
      this.unreadBubble = 0
    },

    // 清空对话记录
    clearDialogueRecord() {
      this.records = []
    },

    // 数组头部压入对话记录
    unshiftDialogueRecord(records) {
      this.records.unshift(...records)
    },

    // 推送对话记录
    addDialogueRecord(record) {

      console.log('推送对话记录:', record)
      //  TODO 需要通过 sequence 排序，保证消息一致性
      // this.records.splice(index, 0, record)

      this.records.push(record)
    },

    // 更新对话记录
    updateDialogueRecord(params) {
      const item = this.records.find(item => item.id === params.id)

      item && Object.assign(item, params)
    },

    // 批量删除对话记录
    batchDelDialogueRecord(ids) {
      ids.forEach(id => {
        const index = this.records.findIndex(item => item.id === id)

        if (index >= 0) this.records.splice(index, 1)
      })
    },

    // 自增好友键盘输入事件
    triggerKeyboard() {
      this.keyboard = true

      clearTimeout(keyboardTimeout)

      keyboardTimeout = setTimeout(() => (this.keyboard = false), 2000)
    },

    // 自增好友键盘输入事件
    updateEditorText(text) {
      this.editorText = text
    },

    setUnreadBubble(value) {
      if (value === 0) {
        this.unreadBubble = 0
      } else {
        this.unreadBubble++
      }
    },

    // 关闭多选模式
    closeMultiSelect() {
      this.isOpenMultiSelect = false

      for (const item of this.selectItems) {
        if (item.isCheck) {
          item.isCheck = false
        }
      }
    },

    // 删除聊天记录
    ApiDeleteRecord(ids = []) {
      ServeRemoveRecords({
        talk_type: this.talk.talk_type,
        receiver_id: this.talk.receiver_id,
        record_id: ids.join(','),
      }).then(res => {
        if (res.code == 200) {
          this.batchDelDialogueRecord(ids)
        } else {
          $message.warning(res.message)
        }
      })
    },

    // 撤销聊天记录
    ApiRevokeRecord(record_id) {
      ServeRevokeRecords({
        messageId: record_id,
      }).then(res => {
        if (res.code == 200 && res.success) {
          this.updateDialogueRecord({ id: record_id, revoke: true })
        } else {
          $message.warning(res.message || res.data)
        }
      })
    },

    // 转发聊天记录
    ApiForwardRecord(options) {
      let data = Object.assign(
        {
          talk_type: this.talk.talk_type,
          receiver_id: this.talk.receiver_id,
        },
        options
      )

      ServeForwardRecords(data).then(res => {
        if (res.code == 200) {
          this.closeMultiSelect()
        }
      })
    },
  },
})
