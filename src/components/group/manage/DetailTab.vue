<script setup>
import {ref, reactive, onMounted} from 'vue'
import {NForm, NFormItem, NInput, NDropdown} from 'naive-ui'
import AvatarCropper from '@/components/base/AvatarCropper.vue'
import {ServeGroupDetail, ServeEditGroup} from '@/api/group'

const userId = JSON.parse(localStorage.getItem('IM_USERID')).value

// 群聊分类
const groupCategoryOptions = [
    {
        label: "保密/未知",
        key: 0,
        disabled: false
    },
    {
        label: "兴趣爱好",
        key: 1,
        disabled: false
    },
    {
        label: "行业交流",
        key: 2,
        disabled: false
    },
    {
        label: "生活休闲",
        key: 3,
        disabled: false
    },
    {
        label: "学习考试",
        key: 4,
        disabled: false
    },
    {
        label: "娱乐游戏",
        key: 5,
        disabled: false
    },
    {
        label: "置业安家",
        key: 6,
        disabled: false
    },
    {
        label: "品牌产品",
        key: 7,
        disabled: false
    },
    {
        label: "粉丝",
        key: 8,
        disabled: false
    },
    {
        label: "同学同事",
        key: 9,
        disabled: false
    },
    {
        label: "家校师生",
        key: 10,
        disabled: false
    }
]

// 分类选择处理函数
function handleSelect (key) {
    console.log('selected options key:', key)
    modelDetail.category = groupCategoryOptions.filter(it => {
        return it.key === key
    })[0].label;

}

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
})

const cropper = ref(false)

const modelDetail = reactive({
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
            modelDetail.name = res.data.groupName
            modelDetail.qrcode = res.data.qrcode
            modelDetail.avatar = res.data.groupAvatar
            modelDetail.categoryKey = res.data.groupType
            modelDetail.profile = res.data.description
            modelDetail.createTime = res.data.createTime

            // 处理分类
            groupCategoryOptions.forEach(op => {
                if (op.key === modelDetail.categoryKey) {
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
                    <n-dropdown trigger="click" :options="groupCategoryOptions" @select="handleSelect" style="overflow: scroll">
                        <n-button>{{ modelDetail.category }}
                            <n-icon size="12" style="margin-left: 10px">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                     viewBox="0 0 1024 1024">
                                    <path
                                        d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2L227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
                                        fill="currentColor"></path>
                                </svg>
                            </n-icon>
                        </n-button>
                    </n-dropdown>
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
