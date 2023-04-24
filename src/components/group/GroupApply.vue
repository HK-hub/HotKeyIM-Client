<script setup>
import {ref, reactive, onMounted} from 'vue'
import {NModal, NForm, NFormItem, NInput} from 'naive-ui'
import {ServeCreateGroupApply, ServeGetGroupApplySetting} from '@/api/group'

const remark = ref('')
const props = defineProps({
    gid: {
        type: Number,
        default: 0,
    },
})
const groupSetting = reactive({})
const emit = defineEmits(['close'])

const isShow = ref(false)
const loading = ref(false)

const onMaskClick = () => {
    emit('close')
}

// 提交加群申请
const onSubmit = () => {
    loading.value = true

    let response = ServeCreateGroupApply({
        group_id: props.gid,
        remark: remark.value,
    })

    response.then(res => {
        if (res.code == 200) {
            $message.success('入群申请提交成功...')
            onMaskClick()
        } else {
            $message.warning(res.message)
        }
    })

    response.finally(() => {
        loading.value = false
    })
}

// 加载群聊设置
const onLoadData = () => {
    ServeGetGroupApplySetting({
        groupId: props.gid
    }).then(res => {
        if (res.success && res.data) {
            groupSetting.value = res.data
            console.log('群聊设置：', groupSetting.value.joinType, groupSetting.value.problem)
        }
    }).catch(err => {
        $message.info("获取群聊设置信息失败!")
    })
}

onLoadData()
</script>

<template>
    <n-modal
        v-model:show="isShow"
        preset="card"
        title="入群申请"
        size="huge"
        style="max-width: 450px;border-radius: 10px;"
        :on-after-leave="onMaskClick"
    >
        <n-form>
            <n-form-item v-if="groupSetting.joinType == 3" label="加群验证问题">
                <p>{{groupSetting.problem}}</p>
            </n-form-item>
            <n-form-item label="申请备注" required>
                <n-input
                    placeholder="请填写申请备注"
                    type="textarea"
                    v-model:value="remark"
                />
            </n-form-item>
        </n-form>

        <template #footer>
            <div style="width: 100%; text-align: right">
                <n-button type="tertiary" @click="onMaskClick"> 取消</n-button>
                <n-button
                    type="primary"
                    class="mt-l15"
                    :loading="loading"
                    :disabled="!remark"
                    @click="onSubmit"
                >
                    提交
                </n-button>
            </div>
        </template>
    </n-modal>
</template>

<style lang="less" scoped></style>
