<script setup>
import { reactive, computed, ref } from 'vue'
import {
    NModal,
    NForm,
    NFormItem,
    NInput,
    NTooltip,
} from 'naive-ui'
import { RemoveCircleOutline, ArrowDown, ArrowUp } from '@vicons/ionicons5'
import {ServeContactGroupList, ServeEditContactGroup} from '@/api/contacts'

const emit = defineEmits(['close', 'submit'])

const isShow = ref(true)
const model = reactive({
    mode: 0,
    anonymous: 0,
    title: '',
    options: [],
})

const onMaskClick = () => {
    emit('close')
}

const onSubmit = () => {
    let data = {
        // userId: userId,
        friendGroupList: model.options,
    }
    // 编辑分组
    ServeEditContactGroup(data).then(res => {
        if (res.code == 200 && res.success) {
            $message.success('操作成功!')
            onLoadData()
        }
    })
    // emit('submit', data)
}

const addOption = () => {
    model.options.push({
        count: 0,
        id: 0,
        name: '',
    })
}


// 删除分组
const delOption = index => {
    model.options.length > 1 && model.options.splice(index, 1)
}

// 是否可提交
const isCanSubmit = computed(() => {
    return model.options.some(item => item.name.trim().length === 0)
})

const onLoadData = () => {
    ServeContactGroupList().then(res => {
        if (res.code == 200 && res.success) {
            model.options = res.data || []
        }
    })

}

onLoadData()
</script>

<template>
    <n-modal
        v-model:show="isShow"
        preset="card"
        title="好友分组"
        size="huge"
        :bordered="false"
        style="max-width: 450px; border-radius: 10px"
        :on-after-leave="onMaskClick"
    >
        <n-form>
            <n-form-item label="分组选项" :required="true">
                <div class="options">
                    <div v-for="(option, i) in model.options" class="option">
                        <n-input placeholder="分组名必填" v-model:value="option.name">
                        </n-input>

                        <div class="btn flex-center">

                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    <n-icon
                                        size="20"
                                        class="pointer"
                                        :component="RemoveCircleOutline"
                                        @click="delOption(i)"
                                    />
                                </template>
                                删除: {{option.name}} 分组
                            </n-tooltip>
                            <n-icon class="pointer" size="20" :component="ArrowUp" />
                            <n-icon class="pointer" size="20" :component="ArrowDown" />
                        </div>
                    </div>

                    <n-button
                        text
                        type="primary"
                        @click="addOption"
                        v-if="model.options.length < 6"
                    >
                        +添加分组
                    </n-button>
                </div>
            </n-form-item>
        </n-form>

        <template #footer>
            <div style="width: 100%; text-align: right">
                <n-button type="tertiary" @click="isShow = false"> 取消 </n-button>
                <n-button
                    type="primary"
                    @click="onSubmit"
                    class="mt-l15"
                    :disabled="isCanSubmit"
                >
                    保存
                </n-button>
            </div>
        </template>
    </n-modal>
</template>

<style lang="less" scoped>
.options {
    width: 100%;

    .option {
        margin: 8px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;

        .btn {
            width: 90px;
            height: 30px;
            margin-left: 10px;
            display: none;
            justify-content: space-between;
            transition: all 1s;
            .pointer {
                &:hover {
                    color: red;
                }
            }
        }

        &:hover {
            .btn {
                display: inline-flex;
            }
        }
    }
}
</style>
