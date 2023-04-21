import { storage } from './storage'

const AccessToken = 'AUTH_TOKEN'

/**
 * 验证是否登录
 *
 * @returns token
 */
export function isLoggedIn() {
    return getAccessToken() != ''
}

/**
 * 获取登录授权 Token
 *
 * @returns token
 */
export function getAccessToken() {
    return storage.get(AccessToken) || ''
}

/**
 * 设置登录授权 Token, 过期时间2小时
 * 
 * @returns token
 */
export function setAccessToken(token = '', expire = 60 * 60 * 2) {
    console.log('设置access Token:', expire)
    return storage.set(AccessToken, token, expire) || ''
}

/**
 * 删除登录授权 Token
 */
export function delAccessToken() {
    storage.remove(AccessToken)
}