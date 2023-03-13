import { post, get, upload } from '@/utils/request'

// 上传头像裁剪图片服务接口
export const ServeUploadAvatar = data => {
  return post('/admin/minio/upload/avatar', data)
}

// 查询大文件拆分信息服务接口
export const ServeFindFileSplitInfo = (data = {}) => {
  return post('/admin/upload/file/initialize', data)
}

// 文件拆分上传服务接口
export const ServeFileSubareaUpload = (data = {}, options = {}) => {
  return upload('/api/v1/upload/multipart', data, options)
}