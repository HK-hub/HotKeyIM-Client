<script setup>
import {reactive, ref, h} from 'vue'
import {useRouter} from 'vue-router'
import {NForm, NFormItem, NInput, NSelect, NDatePicker, NTag, NDynamicTags} from 'naive-ui'
import {ServeUpdateUserDetail, ServeGetUserDetail, ServeGetPersonalTag,
    ServeCreatePersonalTag, ServeRemovePersonalTag} from '@/api/user'
import {GenderOptions} from '@/constant/default'
import AvatarCropper from '@/components/base/AvatarCropper.vue'
import {hidePhone} from '@/utils/strings'

const router = useRouter()
const cropper = ref(false)
const userId = JSON.parse(localStorage.getItem('IM_USERID')).value
const myTags = ref([
    {
        label: '教师',
        value: '1'
    },
    {
        label: '程序员',
        value: '2'
    },
    {
        label: '程序员',
        value: '3'
    },
    {
        label: '程序员',
        value: '4'
    },
    {
        label: '计算机编程',
        value: '5'
    },
]);

const detail = reactive({
    account: '',
    avatar: '',
    nickname: '',
    mobile: '',
    email: '',
    gender: '2',
    motto: '0',
    birthday: ref(null),
    loading: false,
})

// 加载用户信息
ServeGetUserDetail({userId: userId}).then(res => {
    console.log(res)
    detail.account = res.data.account
    detail.avatar = res.data.bigAvatar
    detail.nickname = res.data.username.toString()
    detail.mobile = res.data.phone ? res.data.phone.toString() : ''
    detail.email = res.data.email ? res.data.email.toString() : ''
    detail.gender = res.data.gender ? res.data.gender.toString() : '2'
    detail.motto = res.data.signature.toString()
    if (res.data.birthday) {
        detail.birthday = ref(res.data.birthday)
    }
    console.log('用户详细信息：',detail)
})

// 加载个人标签
ServeGetPersonalTag().then(res => {
    if (res.code == 200 && res.success) {
        myTags.value = res.data.map(tag => {
            return {
                label: tag.name,
                value: tag.id
            }
        });
    }
})

// 修改用户信息
const onChangeDetail = () => {
    if (!detail.nickname) {
        return $message.warning('昵称不能为空！')
    }

    detail.loading = true

    const response = ServeUpdateUserDetail({
        nickname: detail.nickname,
        avatar: detail.avatar,
        motto: detail.motto,
        gender: parseInt(detail.gender),
        birthday: detail.birthday,
    })

    response.then(() => {
        $message.success('信息保存成功！')
    })

    response.catch(() => {
        $message.warning('信息保存失败！')
    })

    response.finally(() => {
        detail.loading = false
    })
}

const onUploadAvatar = avatar => {
    cropper.value = false
    console.log('上传头像成功,新的头像为：', avatar)
    detail.avatar = avatar + '?t=' + Date.now()
    console.log('detail 详细信息：',detail)
}

const renderTag = (tag, index) => {
    console.log('读取的tag:', tag, index)

    if (tag instanceof Promise) {
        return;
    }
    return h(
        NTag,
        {
            type: ["success", "error", "warning", "info"][Math.floor(Math.random() * 4)],
            closable: true,
            onClose: () => {
                ServeRemovePersonalTag({
                    id: tag.value,
                    name: tag.label
                }).then(res => {
                    if (res.code == 200 && res.success) {
                        myTags.value.splice(index, 1);
                    } else {
                        $message.warning(result.message);
                    }
                })
            }
        },
        {
            default: () => tag.label
        }
    );
}

// 创建标签
const handleCreate = async (label) => {

    // 创建
    let result = await ServeCreatePersonalTag({
        name: label,
        description: label,
    })
    console.log(result)
    if (result.code == 200 && result.success) {
        // 添加成功
        console.log('添加成功：', label, result)
        if(myTags.value.slice(-1)[0] instanceof Promise){
            myTags.value.pop()
        }
        myTags.value.push({
            label: label,
            value: result.data.id
        })
    } else {
        $message.warning(result.message);
    }
}
</script>

<template>
    <h3 class="title">个人信息</h3>

    <section class="el-container">
        <aside class="el-aside el-aside-left">
            <n-avatar
                :size="200"
                :src="detail.avatar"
                @click="cropper = true"
                class="avatar-box pointer"
            />

            <n-button text @click="cropper = true"> 点击修改头像</n-button>
        </aside>

        <main class="el-main" style="padding-right: 20px">
            <n-form
                ref="formRef"
                label-placement="left"
                label-width="auto"
                require-mark-placement="right-hanging"
                size="medium"
                style="max-width: 500px; margin-top: 25px"
            >
                <n-form-item label="登录账号：">
                    {{ detail.account }}
                    <n-button
                        class="mt-l15"
                        type="info"
                        text
                    >
                    </n-button>
                </n-form-item>
                <n-form-item label="手机号码：">
                    {{ hidePhone(detail.mobile) }}
                    <n-button
                        class="mt-l15"
                        type="info"
                        text
                        @click="router.push('/settings/security')"
                    >
                        修改
                    </n-button>
                </n-form-item>
                <n-form-item label="电子邮箱：">
                    {{ detail.email }}
                    <n-button
                        class="mt-l15"
                        type="info"
                        text
                        @click="router.push('/settings/security')"
                    >
                        修改
                    </n-button>
                </n-form-item>
                <n-form-item label="我的昵称：">
                    <n-input
                        placeholder="我的昵称"
                        v-model:value="detail.nickname"
                        maxlength="20"
                        show-count
                    />
                </n-form-item>
                <n-form-item label="我的性别：">
                    <n-select
                        v-model:value="detail.gender"
                        placeholder="设置你的性别"
                        :options="GenderOptions"
                        style="max-width: 192px"
                    />
                </n-form-item>
                <n-form-item label="我的生日：">
                    <n-date-picker
                        v-model:formatted-value="detail.birthday"
                        type="date"
                        value-format="yyyy-MM-dd"
                    />
                </n-form-item>
                <n-form-item label="个人标签：">
                    <n-dynamic-tags v-model:value="myTags" :render-tag="renderTag" :max="8" @create="handleCreate"/>
                </n-form-item>
                <n-form-item label="个性签名：">
                    <n-input
                        placeholder="关于我的"
                        type="textarea"
                        maxlength="500"
                        show-count
                        v-model:value="detail.motto"
                        :autosize="{
              minRows: 3,
              maxRows: 5,
            }"
                    />
                </n-form-item>
                <n-form-item>
                    <n-button
                        type="primary"
                        @click="onChangeDetail"
                        :loading="detail.loading"
                        style="margin-left: 94px"
                    >
                        保存信息
                    </n-button>
                </n-form-item>
            </n-form>
        </main>
    </section>

    <!-- 头像裁剪组件 -->
    <AvatarCropper
        v-if="cropper"
        :type="1"
        :gid="userId"
        @close="cropper = false"
        @success="onUploadAvatar"
    />
</template>

<style lang="less" scoped>
@import '@/assets/css/settting.less';

.el-aside-left {
    width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 25px;
    margin-right: 25px;
    border-right: 1px solid #f7f5f5;
}

.avatar-box {
    background-color: #f5f5f5;
    border-radius: 10px;
    margin-bottom: 20px;
}
</style>
