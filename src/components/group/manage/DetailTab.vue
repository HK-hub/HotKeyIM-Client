<script setup>
import {ref, reactive, onMounted} from 'vue'
import {NForm, NFormItem, NInput, NDropdown, NSelect} from 'naive-ui'
import AvatarCropper from '@/components/base/AvatarCropper.vue'
import {ServeGroupDetail, ServeEditGroup} from '@/api/group'

const userId = JSON.parse(localStorage.getItem('IM_USERID')).value

// 群聊分类
const groupCategoryOptions = [
    {
        label: "保密/未知",
        value: 0,
        disabled: false
    },
    {
        label: "兴趣爱好",
        value: 1,
        disabled: false
    },
    {
        label: "行业交流",
        value: 2,
        disabled: false
    },
    {
        label: "生活休闲",
        value: 3,
        disabled: false
    },
    {
        label: "学习考试",
        value: 4,
        disabled: false
    },
    {
        label: "娱乐游戏",
        value: 5,
        disabled: false
    },
    {
        label: "置业安家",
        value: 6,
        disabled: false
    },
    {
        label: "品牌产品",
        value: 7,
        disabled: false
    },
    {
        label: "粉丝",
        value: 8,
        disabled: false
    },
    {
        label: "同学同事",
        value: 9,
        disabled: false
    },
    {
        label: "家校师生",
        value: 10,
        disabled: false
    }
]


const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
})

const cropper = ref(false)

const modelDetail = reactive({
    id: '',
    name: '',
    qrcode: '',
    avatar: '',
    category: '',
    categoryKey: 0,
    profile: '',
    createTime: ''
})

const onUploadAvatar = avatar => {
    cropper.value = false
    console.log('onUploadAvatar:',avatar)
    modelDetail.avatar = avatar
}

const onLoadData = () => {
    console.log(groupCategoryOptions)
    console.log('group tab detail request:')
    ServeGroupDetail({
        groupId: props.id,
        userId: userId
    }).then(res => {
        if (res.code == 200) {
            modelDetail.id = res.data.id
            modelDetail.name = res.data.groupName
            modelDetail.qrcode = res.data.qrcode
            modelDetail.avatar = res.data.groupAvatar
            modelDetail.categoryKey = res.data.groupType
            modelDetail.profile = res.data.description
            modelDetail.createTime = res.data.createTime

            // 处理分类
            groupCategoryOptions.forEach(op => {
                if (op.value === modelDetail.categoryKey) {
                    // op.disabled = true
                    modelDetail.category = op.label
                }
            })
        }
    })
}

function onSubmitBaseInfo() {
    if (modelDetail.name.trim() == '') {
        return $message.info('群名称不能为空！')
    }

    ServeEditGroup({
        group_id: props.id,
        group_name: modelDetail.name,
        avatar: modelDetail.avatar,
        profile: modelDetail.profile,
    }).then(res => {
        if (res.code == 200) {
            $message.success('群信息更新成功！')
        } else {
            $message.error(res.message)
        }
    })
}

onMounted(() => {
    onLoadData()
})
</script>
<template>
    <section class="section el-container is-vertical height100">
        <header class="el-header header bdr-b">
            <p>基础信息</p>
        </header>

        <main class="el-main main">
            <n-form
                ref="formRef"
                :style="{
          minWidth: '350px',
          maxWidth: '350px',
        }"
            >
                <n-form-item label="群头像" path="name">
                    <n-avatar
                        v-if="modelDetail.avatar"
                        :size="60"
                        :src="modelDetail.avatar"
                    />
                    <n-avatar
                        v-else
                        :size="60"
                        :style="{
              color: 'white',
              backgroundColor: '#508afe',
              fontSize: '18px',
            }"
                    >{{ modelDetail.name.substring(0, 1) }}
                    </n-avatar
                    >
                    <n-button
                        type="info"
                        size="tiny"
                        style="margin-left: 20px"
                        dashed
                        @click="cropper = true"
                    >
                        上传头像
                    </n-button>
                </n-form-item>


                <n-form-item label="群聊分类" required path="name">
                    <n-select v-model:value="modelDetail.category" :options="groupCategoryOptions" placeholder="{{modelDetail.category}}"/>
                </n-form-item>

                <n-form-item label="群名称" required path="name">
                    <n-input
                        placeholder="必填"
                        type="text"
                        v-model:value="modelDetail.name"
                    />
                </n-form-item>


                <n-form-item label="群简介" path="profile">
                    <n-input
                        placeholder="选填"
                        type="textarea"
                        v-model:value="modelDetail.profile"
                    />
                </n-form-item>
                <n-form-item label="">
                    <n-button type="primary" @click="onSubmitBaseInfo">
                        保存信息
                    </n-button>
                </n-form-item>
            </n-form>
        </main>
    </section>

    <!-- 头像裁剪组件 -->
    <AvatarCropper
        v-if="cropper"
        :type="2"
        :gid="modelDetail.id"
        @close="cropper = false"
        @success="onUploadAvatar"
    />
</template>
<style lang="less" scoped>
.header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
}

.main {
    padding: 15px;
}
</style>
