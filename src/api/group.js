import { post, get } from '@/utils/request'

// 查询用户群聊服务接口
export const ServeGetGroups = (data) => {
  return get('/admin/group/list', data)
}

export const ServeGroupOvertList = (data) => {
  return get('/api/v1/group/overt/list',data)
}

// 获取群信息服务接口
export const ServeGroupDetail = data => {
  return get('/admin/group/detail', data)
}

// 创建群聊服务接口
export const ServeCreateGroup = data => {
  return post('/admin/group/create', data)
}

//  修改群信息
export const ServeEditGroup = data => {
  return post('/api/v1/group/setting', data)
}

// 邀请好友加入群聊服务接口
export const ServeInviteGroup = data => {
  return post('/admin/member/invite', data)
}

// 移除群聊成员服务接口
export const ServeRemoveMembersGroup = data => {
  return post('/api/v1/group/member/remove', data)
}

// 管理员解散群聊服务接口
export const ServeDismissGroup = data => {
  return post('/api/v1/group/dismiss', data)
}

// 用户退出群聊服务接口
export const ServeSecedeGroup = data => {
  return post('/api/v1/group/secede', data)
}

// 修改群聊名片服务接口
export const ServeUpdateGroupCard = data => {
  return post('/admin/member/remark', data)
}

// 获取用户可邀请加入群组的好友列表
export const ServeGetInviteFriends = data => {
  return get('/admin/member/enable/invite', data)
}

//  获取群组成员列表
export const ServeGetGroupMembers = data => {
  return get('/admin/member/group/list', data)
}

//  获取群组公告列表
export const ServeGetGroupNotices = data => {
  return get('/api/v1/group/notice/list', data)
}

//  编辑群公告
export const ServeEditGroupNotice = data => {
  return post('/api/v1/group/notice/edit', data)
}


export const ServeGetGroupApplyList = data => {
  return get('/api/v1/group/apply/list', data)
}

export const ServeDeleteGroupApply = data => {
  return post('/api/v1/group/apply/delete', data)
}

export const ServeAgreeGroupApply = data => {
  return post('/api/v1/group/apply/agree', data)
}

export const ServeCreateGroupApply = data => {
  return post('/api/v1/group/apply/create', data)
}

// 转让群主
export const ServeGroupHandover = data => {
  return post('/api/v1/group/handover', data)
}

// 分配管理员
export const ServeGroupAssignAdmin = data => {
  return post('/api/v1/group/assign-admin', data)
}

export const ServeGroupNoSpeak = data => {
  return post('/api/v1/group/no-speak', data)
}

