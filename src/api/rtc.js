import { post, get } from '@/utils/request'

// 创建一个房间
export const ServeCreateRoom = (data) => {
    return get('/admin/group/list', data)
}


