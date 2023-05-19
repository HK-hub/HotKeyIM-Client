import { post, get, upload } from '@/utils/request'

// 获取聊天列表服务接口
export const ServeGetTalkList = data => {
  return get('/admin/talk/list', data)
}

// 聊天列表创建服务接口
export const ServeCreateTalkList = data => {
  return post('/admin/talk/create', data)
}

// 删除聊天列表服务接口
export const ServeDeleteTalkList = data => {
  return post('/admin/talk/remove', data)
}

// 对话列表置顶服务接口
export const ServeTopTalkList = data => {
  return post('/admin/talk/topping', data)
}

// 清除聊天消息未读数服务接口
export const ServeClearTalkUnreadNum = data => {
  return post('/admin/talk/unread/clear', data)
}

// 获取聊天记录服务接口
export const ServeTalkRecords = data => {
  return get('/admin/message/records/latest', data)
}

// 获取转发会话记录详情列表服务接口
export const ServeGetForwardRecords = data => {
  return get('/api/v1/talk/records/forward', data)
}

// 对话列表置顶服务接口
export const ServeSetNotDisturb = data => {
  return post('/admin/talk/disturb', data)
}

// 查找用户聊天记录服务接口
export const ServeFindTalkRecords = data => {
  return post('/admin/message/records/history', data)
}

// 搜索用户聊天记录服务接口
export const ServeSearchTalkRecords = data => {
  return get('/api/v1/talk/search-chat-records', data)
}

export const ServeGetRecordsContext = data => {
  return get('/api/v1/talk/get-records-context', data)
}

// 发送普通文本消息服务接口
export const ServeSendTalkText = data => {
  return post('/admin/message/send/text', data)
}

// 发送代码块消息服务接口
export const ServeSendTalkCodeBlock = data => {
  return post('/admin/message/send/code', data)
}

// 发送聊天文件服务接口
export const ServeSendTalkFile = data => {
  return post('/admin/message/send/file', data)
}

// 秒传功能
export const ServerTransferBySeconds = data => {
  return post('/admin/upload/file/seconds', data)
}

// 发送聊天图片服务接口
export const ServeSendTalkImage = data => {
  return upload('/admin/message/send/image', data)
}

// 发送表情包服务接口
export const ServeSendEmoticon = data => {
  return post('/api/v1/talk/message/emoticon', data)
}

// 转发消息服务接口
export const ServeForwardRecords = data => {
  return post('/api/v1/talk/message/forward', data)
}

// 撤回消息服务接口
export const ServeRevokeRecords = data => {
  return post('/admin/message/revoke/message', data)
}

// 删除消息服务接口
export const ServeRemoveRecords = data => {
  return post('/api/v1/talk/message/delete', data)
}

// 收藏表情包服务接口
export const ServeCollectEmoticon = data => {
  return post('/admin/emoticon/collect', data)
}

// 投票消息
export const ServeSendVote = data => {
  return post('/api/v1/talk/message/vote', data)
}

// 发送位置消息
export const ServeSendLocation = data => {
  return post('/admin/message/send/location', data)
}

// 发起视频邀请
export const ServeSendVideoInvite = data => {
  return post('admin/message/send/video/call/invite', data)
}

export const ServeConfirmVoteHandle = data => {
  return post('/api/v1/talk/message/vote/handle', data)
}

// url 链接预览元数据
export const ServeUrlPreviewMetaData = data => {
  return get('/admin/preview/url', data)
}


// 发起视频通话
export const ServerInviteVideoCall = data => {
  return post("/admin/message/send/video", data)
}
