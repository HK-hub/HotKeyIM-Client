import { defineStore } from 'pinia'
import { ServeGetUserSetting } from '@/api/user'
import { ServeFindFriendApplyNum } from '@/api/contacts'
import { delAccessToken } from '@/utils/auth'
import { storage } from '@/utils/storage'
import { defAvatar, defBanner } from '@/constant/default'

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            uid: 0, // 用户ID
            nickname: '', // 用户昵称
            gender: 0, // 性别
            motto: '', // 个性签名
            avatar: defAvatar,
            bigAvatar: '',
            banner: defBanner, // 名片背景
            online: false, // 在线状态
            isQiye: false,
            isContactApply: false,
            accessToken: null,
            account: '',
            age: 0,
            birthday: '',
            campus: '',
            city: '',
            constellation: '',
            dingtalk: '',
            email: '',
            github: '',
            id: '',
            interest: '',
            job: '',
            major: '',
            miniAvatar: '',
            phone: '',
            qq: '',
            qrcode: '',
            signature: '',
            status: '',
            tag: '',
            username: "西门大官人",
            wallet: 0,
            wechat: '',
        }
    },
    getters: {},
    actions: {
        // 设置用户登录状态
        updateSocketStatus(status) {
            this.online = status
            this.status = status
        },

        // 退出登录
        logoutLogin() {
            storage.remove('user_info')
            delAccessToken()
            location.reload()
        },

        // 加载用户信息
        loadSetting(userId) {
            ServeGetUserSetting(userId).then(({ code, data }) => {
                console.log("loadSetting uid=:" + data.id);
                if (code == 200) {
                    this.account = data.account
                    this.nickname = data.nickname
                    this.username = data.nickname
                    this.uid = data.id
                    this.avatar = data.miniAvatar
                    this.bigAvatar = data.bigAvatar
                    this.miniAvatar = data.miniAvatar
                    this.gender = data.gender
                    this.mobile = data.phone || ''
                    this.email = data.email || ''
                    this.signature = data.signature
                    this.motto = data.signature
                    this.age = data.age
                    this.birthday = data.birthday
                    this.campus = data.campus
                    this.city = data.city
                    this.constellation = data.constellation
                    this.dingtalk = data.dingtalk
                    this.github = data.github
                    this.interest = data.interest
                    this.job = data.job
                    this.major = data.major
                    this.qq = data.qq
                    this.qrcode = data.qrcode
                    this.status = data.status
                    this.tag = data.tag
                    this.wechat = data.wechat
                    this.wallet = data.wallet
                    this.isQiye = data.is_qiye || false
                    storage.set('user_info', data)
                    storage.set('userId', data.id)
                }
            })

            ServeFindFriendApplyNum(userId).then(({ code, data }) => {
                if (code == 200) {
                    this.isContactApply = data.length > 0
                }
            })
        },
    },
})