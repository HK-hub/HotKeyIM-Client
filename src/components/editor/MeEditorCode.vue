<script setup>
import {ref, reactive, computed} from 'vue'
import {NModal, NInput, NPopselect} from 'naive-ui'
import {options} from '@/constant/highlight.js'

const emit = defineEmits(['close', 'on-submit'])

const isShowBox = ref(true)

const model = reactive({
    lang: '',
    name: '',
    code: '',
})

const langText = computed(() => {
    let data = options.find(item => {
        return item.value == model.lang
    })

    if (data) {
        return data.label
    }

    return '请选择语言类型'
})

// 选择语言类型 并且 输入代码 才能允许提交
const isCanSubmit = computed(() => {
    return !(model.lang && model.code)
})

const onMaskClick = () => {
    emit('close')
}

const onSubmit = () => {
    emit('on-submit', {
        lang: model.lang,
        code: model.code,
        name: model.name,
    })
}
</script>

<template>
    <n-modal
        v-model:show="isShowBox"
        preset="card"
        title="代码消息"
        style="max-width: 800px; height: 600px;border-radius: 10px;"
        :on-after-leave="onMaskClick"
        :segmented="{
      content: true,
    }"
        :mask-closable="false"
    >
        <div class="preview" id="add-content">
            <div class="code-property">
                <div class="remark">
                    <span>代码块备注:</span>
                    <n-input class="block-name"
                             v-model:value="model.name"
                             placeholder="代码块名称..." maxlength="20"></n-input>
                </div>
                <div class="popselect">
                    <span>语言类型:</span>
                    <n-popselect
                        v-model:value="model.lang"
                        :options="options"
                        size="medium"
                        scrollable
                    >
                        <n-button text type="primary">
                            {{ langText }}
                        </n-button>
                    </n-popselect>
                </div>

            </div>

            <n-input
                type="textarea"
                :maxlength="65535"
                show-count
                style="height: 380px"
                placeholder="请输入..."
                v-model:value="model.code"
            >
                <template #count="{ value }">
                    {{ value.length }}
                </template>
            </n-input>
        </div>
        <template #footer>
            <div class="footer">
                <div>
                    <n-button type="tertiary" @click="isShowBox = false"> 取消</n-button>
                    <n-button
                        type="primary"
                        class="mt-l15"
                        @click="onSubmit"
                        :disabled="isCanSubmit"
                    >
                        发送
                    </n-button>
                </div>
            </div>
        </template>
    </n-modal>
</template>

<style lang="less" scoped>
.preview {
    width: 100%;
    padding: 5px;
    overflow: scroll;
    border-radius: 10px;
}

.code-property {
    display: flex;
}


.popselect {
    display: flex;
    height: 30px;
    width: 50%;
    line-height: 30px;
    margin-bottom: 10px;
    margin-right: 20px;

    span {
        margin-right: 10px;
    }
}

.remark {
    width: 70%;
    height: 30px;
    line-height: 30px;
    margin-bottom: 10px;
    margin-right: 10px;
    display: flex;

    span {
        margin-right: 10px;
    }

    .block-name {
        width: 70%;
    }
}

.footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
</style>
