import { post, get } from '@/utils/request'

// 修改密码服务接口
export const ServeUpdatePassword = data => {
    return post('/api/v1/users/change/password', data)
}

// 修改手机号服务接口
export const ServeUpdateMobile = data => {
    return post('/api/v1/users/change/mobile', data)
}

// 修改手机号服务接口
export const ServeUpdateEmail = data => {
    return post('/api/v1/users/change/email', data)
}

// 修改个人信息服务接口
export const ServeUpdateUserDetail = data => {
    return post('/admin/info/change/detail', data)
}

// 查询用户信息服务接口
export const ServeGetUserDetail = (data) => {
    return get('/admin/info/detail', data)
}

// 查询用户profile服务接口
export const ServeGetUserProfile = (data) => {
    return get('/admin/user/profile', data)
}

// 获取用户相关设置信息
export const ServeGetUserSetting = userId => {
    return get('/admin/user/' + userId)
}


// 绑定github
export const ServeBindUserGithub = () => {

}

// 绑定gitee
export const ServeBindUserGitee = () => {

}


// 绑定QQ
export const ServeBindUserQQ = () => {

}

// 绑定微信
export const ServeBindUserWechat = () => {

}

// 绑定钉钉
export const ServeBindUserDingtalk = () => {

}


