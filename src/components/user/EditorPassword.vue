<script setup>
import {onUnmounted, reactive, ref} from 'vue'
import {NModal, NForm, NFormItem, NInput, NButton} from 'naive-ui'
import {ServeUpdatePassword} from '@/api/user'
import SmsLock from "@/plugins/sms-lock";
import {isEmail, isMobile} from "@/utils/validate";
import {ServeSendVerifyCode} from "@/api/common";

const formRef = ref(null)
// 用户邮箱
const email = JSON.parse(localStorage.getItem('IM_USER_INFO')).value.email
const props = defineProps({
    remove: {
        type: Function, //传入移除节点方法,这里是createApp中的方法
        default: null,
    },
})

const model = reactive({
    oldPassword: '',
    newPassword: '',
    newPassword2: '',
    code: '',
})

const rules = {
    oldPassword: {
        required: true,
        trigger: ['blur', 'input'],
        message: '登录密码不能为空！',
    },
    newPassword: {
        required: true,
        trigger: ['blur', 'input'],
        message: '新密码不能为空！',
    },
    newPassword2: {
        required: true,
        trigger: ['blur', 'change'],
        validator(rule, value) {
            if (!value) {
                return new Error('确认密码不能为空！')
            } else if (model.newPassword != model.newPassword2) {
                return new Error('两次密码输入不一致！')
            }

            return true
        },
    },
    code: {
        required: true,
        trigger: ['blur', 'input'],
        message: '验证码不能为空！',
    },
}

const emit = defineEmits(['close'])

const isShow = ref(true)
const loading = ref(false)

const onMaskClick = () => {
    emit('close')
    props.remove()
}

// 短信按钮倒计时
const lockTime = ref(0);

// 初始化短信按钮锁
const lock = new SmsLock("REGISTER_SMS", 60, (time) => {
    lockTime.value = time;
});

const onSubmit = () => {
    loading.value = true

    // 获取公钥
    let response = ServeUpdatePassword({
        oldPassword: model.oldPassword,
        newPassword: model.newPassword,
        code: model.code,
        account: email,
    })

    response.then(res => {
        if (res.code == 200) {
            $message.success('密码修改成功...')
        } else {
            $message.warning(res.message)
        }
    })

    response.finally(() => {
        loading.value = false
    })
}

const onValidate = e => {
    e.preventDefault()

    formRef.value.validate(errors => {
        !errors && onSubmit()
    })
}

// 发送短信
const onSendSms = () => {

    // 校验
    if (!isEmail(email)) {
        // 邮箱校验失败
        $message.warning('邮箱不存在或格式错误!');
        return
    }

    const response = ServeSendVerifyCode({
        // account
        account: email,
        // 登录注册用途
        type: "cp",
    });

    response.then((res) => {
        if (res.code == 200) {
            lock.start();
            $message.success("验证码发送成功！");

            if (res.data.is_debug) {
                model.code = res.data;
                setTimeout(() => {
                    $message.success("已开启验证码自动填充！");
                }, 1000);
            }
        } else {
            $message.warning(res.message);
        }
    });

    response.finally(() => {
        model.loading = false;
    });
};

onUnmounted(() => {
    lock.clear();
});

</script>

<template>
    <n-modal
        v-model:show="isShow"
        preset="card"
        title="修改密码"
        size="huge"
        style="max-width: 450px; border-radius: 10px"
        :on-after-leave="onMaskClick"
    >
        <n-form ref="formRef" :model="model" :rules="rules">
            <n-form-item label="登录密码" path="oldPassword">
                <n-input
                    placeholder="请填写当前账号密码"
                    type="password"
                    v-model:value="model.oldPassword"
                />
            </n-form-item>

            <n-form-item label="设置新密码" path="newPassword">
                <n-input
                    placeholder="请设置新密码"
                    type="password"
                    v-model:value="model.newPassword"
                />
            </n-form-item>

            <n-form-item label="确认新密码" path="newPassword2">
                <n-input
                    placeholder="请重复输入新密码"
                    type="password"
                    v-model:value="model.newPassword2"
                />
            </n-form-item>
            <n-form-item label="验证码" path="code">
                <n-input
                    placeholder="请填写邮箱/手机验证码"
                    type="text"
                    :maxlength="8"
                    v-model:value="model.code"
                />
                <n-button
                    tertiary
                    class="mt-l5"
                    @click="onSendSms"
                    :disabled="lockTime > 0"
                >
                    获取验证码 <span v-show="lockTime > 0">({{ lockTime }}s)</span>
                </n-button>
            </n-form-item>


        </n-form>

        <template #footer>
            <div style="width: 100%; text-align: right">
                <n-button type="tertiary" @click="onMaskClick"> 取消</n-button>
                <n-button
                    type="primary"
                    class="mt-l15"
                    :loading="loading"
                    @click="onValidate"
                >
                    立即修改
                </n-button>
            </div>
        </template>
    </n-modal>
</template>

<style lang="less" scoped></style>
