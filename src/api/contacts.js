import { post, get } from '@/utils/request'

// 获取好友列表服务接口
export const ServeGetContacts = data => {
    return get('/admin/friend/list/v2', data)
}

// 解除好友关系服务接口
export const ServeDeleteContact = data => {
    return post('/api/v1/contact/delete', data)
}

// 修改好友备注服务接口
export const ServeEditContactRemark = data => {
    return post('/api/v1/contact/edit-remark', data)
}

// 获取好友分组列表
export const ServeContactGroupList = data => {
    return get('/admin/friend/group/list', data)
}

// 移动好友分组
export const ServeContactMoveGroup = data => {
    return post('/admin/friend/modify/group', data)
}



// 搜索联系人
export const ServeSearchContact = data => {
    return post('/admin/find/friend/account', data)
}


// 发现好友
export const ServeFindContact = data => {
    return post('/admin/find/friend/search', data)
}

// 好友申请服务接口
export const ServeCreateContact = data => {
    return post('/admin/find/friend/apply', data)
}

// 查询好友申请服务接口
export const ServeGetContactApplyRecords = data => {
    return get('admin/apply/user/receive', data)
}

// 处理好友申请服务接口
export const ServeApplyAccept = data => {
    return post('/admin/apply/handle/receive', data)
}

export const ServeApplyDecline = data => {
    return post('/api/v1/contact/apply/decline', data)
}

// 查询好友申请未读数量服务接口
export const ServeFindFriendApplyNum = data => {
    return get('/admin/apply/user/receive?userId=' + data)
}

// 搜索用户信息服务接口
export const ServeSearchUser = data => {
    return get('/admin/user/id', data)
}



