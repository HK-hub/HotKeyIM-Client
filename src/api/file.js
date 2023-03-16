import { post, get } from '@/utils/request'

// 下载聊天记录中的文件接口
export const ServeDownloadRecordFile = data => {
    return post('/admin/record/file/download', data)
}


// 预览聊天记录中的文件接口
export const ServePreviewRecordFile = data => {
    return post('/admin/record/file/preview', data)
}




