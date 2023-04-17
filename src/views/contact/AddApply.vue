<script setup>
import { defineComponent, ref, defineProps,reactive } from "vue";
import {NModal, NButton, NSpace, NLayout, NAvatar,NSelect,NInput,
    NLayoutSider,NLayoutHeader,NLayoutContent} from "naive-ui";
import {ServeCreateContact} from "@/api/contacts";

const props = defineProps({
    type: {
        type: Number,
        default: 1
    },
    target: {
        type: Object,
        default: {},
    }
})

const showModal = ref(true)
const onShowUpdate = () => {
    showModal.value =false;
};

// 好友分组
const options = reactive([
    {
        label: 'Drive My Car',
        value: 'song1'
    },
    {
        label: 'Norwegian Wood',
        value: 'song2'
    },
    {
        label: "You Won't See",
        value: 'song3',
        disabled: true
    },
])
// 申请信息
const applyInfo = ref('')
// 备注
const remark = ref('')

// 发送好友申请
const onSubmit = () => {

    ServeCreateContact({
        // 1.加好友，2.群
        type: props.type,
        fromUserId: JSON.parse(localStorage.getItem('IM_USERID')).value,
        toUserId: props.target.id,
        answer: applyInfo.value,
        applyInfo: applyInfo.value
    }).then((res) => {
        if (res.success) {
            showModal.value =false;
            $message.success("申请发送成功！");
        } else {
            $message.error(res.data || res.message);
        }
    });

}


</script>


<template>
    <n-modal
        v-model:show="showModal"
        class="custom-card"
        preset="card"
        style="max-width: 500px; border-radius: 10px"
        :title="props.type == 1 ? '添加好友' : '添加群聊'"
        size="huge"
        :bordered="false"
    >
        <n-layout has-sider>
            <n-layout-sider content-style="padding: 20px;">
                <n-space vertical>
                    <n-select v-model:value="value" :options="options" placeholder="好友分组"/>
                    <n-input
                        v-model:value="applyInfo"
                        type="textarea"
                        placeholder="申请验证信息"
                    />
                </n-space>
            </n-layout-sider>
            <n-layout-content content-style="">
                <n-avatar
                    round
                    :size="48"
                    :src='props.target.miniAvatar'
                />
                <p>{{props.target.username}}</p>
            </n-layout-content>
        </n-layout>
        <template #footer>
            <div style="width: 100%; text-align: right;">
                <n-space justify="end">
                    <n-button
                        type="primary"
                        @click="onSubmit"
                        class="mt-l15"
                        :disabled="isCanSubmit"
                    >
                        发送申请
                    </n-button>
                    <n-button type="tertiary" @click="onShowUpdate">关闭</n-button>
                </n-space>
            </div>
        </template>
    </n-modal>
</template>

<style lang="less">
</style>
