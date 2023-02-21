import axios from 'axios'
import { delAccessToken, getAccessToken } from '@/utils/auth'
import {v4 as uuidv4} from 'uuid';

// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: import.meta.env.VITE_BASE_API,

    // 请求超时时间
    timeout: 10000,
})

/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = error => {
    // 判断是否是响应错误信息
    if (error.response) {
        if (error.response.status == 401) {
            delAccessToken()
            location.reload()
        }
    }

    return Promise.reject(error)
}

// 请求拦截器
request.interceptors.request.use(config => {
    const token = getAccessToken()
    console.log('请求拦截：', token)
    if (token) {
        // token
        config.headers['Authorization'] = `${token}`
    }

    // traceId
    const traceId = uuidv4()
    config.headers['traceId'] = traceId;
    console.log('traceId=', traceId)
    return config
}, errorHandler)

// 响应拦截器
request.interceptors.response.use(response => {
    return response.data
}, errorHandler)

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url, data = {}, options = {}) => {
    return request({
        url,
        params: data,
        method: 'get',
        ...options,
    })
}

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url, data = {}, options = {}) => {
    return request({
        url,
        method: 'post',
        data: data,
        ...options,
    })
}

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url, data = {}, options = {}) => {
    return request({
        url,
        method: 'post',
        data: data,
        ...options,
    })
}