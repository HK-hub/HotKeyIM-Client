import { defineStore } from 'pinia'
import { ServeGetTalkList } from '@/api/chat'
import { formatTalkItem } from '@/utils/talk'

const ttime = datetime => {
  if (datetime == undefined || datetime == '') {
    return new Date().getTime()
  }

  return new Date(datetime.replace(/-/g, '/')).getTime()
}

export const useTalkStore = defineStore('talk', {
  state: () => {
    return {
      // 加载状态[1:未加载;2:加载中;3:加载完成;4:加载失败;]
      loadStatus: 2,

      // 会话列表
      items: [],
    }
  },
  getters: {
    // 过滤所有置顶对话列表
    topItems: state => {
      return state.items.filter(item => item.top === 1 || item.top === true)
    },

    // 对话列表
    talkItems: state => {
      return state.items.sort((a, b) => {
        return ttime(b.updateTime) - ttime(a.updateTime)
      })
    },

    // 消息未读数总计
    talkUnreadNum: state => {
      return state.items.reduce((total, item) => {
        return total + parseInt(item.unread_num)
      }, 0)
    },
  },
  actions: {
    // 更新对话节点
    updateItem(params) {
      const item = this.items.find(
        item => item.index_name === params.index_name
      )
      // console.log('赛选出来的item=',item)
      item && Object.assign(item, params)
      item.draft = item.draft_text
      // console.log('赋值后：', item)
      console.log('更新对话节点: item=', item, params)

    },

    // 新增对话节点
    addItem(params) {
      this.items.push(params)
    },

    // 移除对话节点
    delItem(index_name) {
      const i = this.items.findIndex(item => item.index_name === index_name)

      if (i >= 0) {
        this.items.splice(i, 1)
      }
    },

    // 更新对话消息
    updateMessage(params) {
      const item = this.items.find(
        item => item.index_name === params.index_name
      )

      if (item) {
        item.unread_num++
        item.msg_text = params.msg_text
        item.updated_at = params.updated_at
      }
    },

    // 加载会话列表
    loadTalkList() {
      this.loadStatus = 2
      console.log('加载会话列表!')
      const response = ServeGetTalkList({
        userId: JSON.parse(localStorage.getItem('IM_USERID')).value
      })

      response.then(({ code, data }) => {
        console.log('serveGetTalkList:', data)

        if (code == 200) {
          console.log('serveGetTalkList success:', data)
          this.items = data.map(item => formatTalkItem(item))

          this.loadStatus = 3
        } else {
          this.loadStatus = 4
        }
      })

      response.catch(() => {
        this.loadStatus = 4
      })
    },
  },
})
