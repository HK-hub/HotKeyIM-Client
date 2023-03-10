import {defineStore} from 'pinia'
import SparkMD5 from 'spark-md5'
import {ServeFindFileSplitInfo, ServeFileSubareaUpload} from '@/api/upload'
import {ServeSendTalkFile} from '@/api/chat'

const message = window.$message

// 登录用户
const userId = JSON.parse(localStorage.getItem('IM_USERID')).value


// 计算大文件的md5值
import SparkMD5 from 'spark-md5';

/**
 * 计算文件Md5
 * 将文件分片逐步计算最终合并得出整个文件md5, 提升计算速度
 * @param {*} file
 */

function computeFileMD5(file) {
    return new Promise((resolve, reject) => {
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        let chunkSize = 2097152;  // 按照一片 2MB 分片
        let chunks = Math.ceil(file.size / chunkSize); // 片数
        let currentChunk = 0;
        let spark = new SparkMD5.ArrayBuffer();
        let fileReader = new FileReader();

        fileReader.onload = function (e) {
            console.log('read chunk nr', currentChunk + 1, 'of', chunks);
            spark.append(e.target.result);
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                console.log('finished loading');
                let md5 = spark.end(); //最终md5值
                spark.destroy(); //释放缓存
                resolve(md5);
            }
        };

        fileReader.onerror = function (e) {
            console.warn('oops, something went wrong.');
            reject(e);
        };

        function loadNext() {
            let start = currentChunk * chunkSize
            let end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();

    })
}


// 处理拆分上传文件
function fileSlice(file, uploadId, eachSize) {
    const splitNum = Math.ceil(file.size / eachSize) // 分片总数
    const items = []

    // 处理每个分片的上传操作
    for (let i = 0; i < splitNum; i++) {
        let start = i * eachSize
        let end = Math.min(file.size, start + eachSize)

        const form = new FormData()
        form.append('file', file.slice(start, end))
        form.append('upload_id', uploadId)
        form.append('split_index', i)
        form.append('split_num', splitNum)

        items.push(form)
    }

    return items
}

export const useUploadsStore = defineStore('uploads', {
    state: () => {
        return {
            isShow: false,
            items: [],
        }
    },
    getters: {
        successCount: (state) => {
            return state.items.filter(item => {
                return item.status === 2
            }).length
        },
    },
    actions: {
        close() {
            this.isShow = false
        },

        // 初始化上传
        async initUploadFile(file, talkType, receiverId, username) {
            let fileMD5 = await computeFileMD5(file)
            ServeFindFileSplitInfo({
                fileName: file.name,
                fileSize: file.size,
                md5: fileMD5,
                hash: fileMD5,
                uploaderId: userId
            }).then(res => {
                /*if (res.code == 200) {
                    // const {upload_id, split_size} = res.data
                    const upload_id = res.data.uploadId
                    const split_size = res.data.splitSize
                    const token = res.data.uploadToken
                    // 秒传
                    const enableTransferBySeconds = res.data.enableTransferBySeconds
                    if (enableTransferBySeconds === true) {
                        // 使用秒传替代
                        console.log('使用秒传功能: ')
                        ServeSendTalkFile({
                            uploadId: upload_id,
                            receiverId: receiverId,
                            talk_type: talkType,
                            originalFileName: file.name,
                        })
                    } else {
                        // 构建待上传分片
                        this.items.unshift({
                            file: file,
                            talk_type: talkType,
                            receiver_id: receiverId,
                            upload_id: upload_id,
                            uploadIndex: 0,
                            percentage: 0,
                            status: 0, // 文件上传状态 0:等待上传 1:上传中 2:上传完成 3:网络异常
                            files: fileSlice(file, upload_id, split_size),
                            avatar: '',
                            username: username,
                            userId: userId,
                            token: token,
                        })

                        this.triggerUpload(upload_id)
                        this.isShow = true
                    }
                } else {
                    message.error(res.message)
                }*/
            })
        },

        // 获取分片文件数组索引
        findItem(uploadId) {
            return this.items.find(item => item.upload_id === uploadId)
        },

        // 触发上传
        triggerUpload(uploadId) {
            const item = this.findItem(uploadId)

            let form = item.files[item.uploadIndex]

            item.status = 1

            ServeFileSubareaUpload(form)
                .then(res => {
                    if (res.code == 200) {
                        item.uploadIndex++

                        if (item.uploadIndex === item.files.length) {
                            item.status = 2
                            item.percentage = 100
                            this.sendUploadMessage(item)
                        } else {
                            let percentage = (item.uploadIndex / item.files.length) * 100
                            item.percentage = percentage.toFixed(1)
                            this.triggerUpload(uploadId)
                        }
                    } else {
                        item.status = 3
                    }
                })
                .catch(() => {
                    item.status = 3
                })
        },

        // 发送上传消息
        sendUploadMessage(item) {
            ServeSendTalkFile({
                upload_id: item.upload_id,
                receiver_id: item.receiver_id,
                talk_type: item.talk_type,
            })
        },
    },
})
