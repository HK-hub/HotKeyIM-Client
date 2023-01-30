<script setup>
import { reactive, ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { NForm, NFormItem, NInput } from "naive-ui";
import { ServeForgetPassword } from "@/api/auth";
import { ServeSendVerifyCode } from "@/api/common";
import SmsLock from "@/plugins/sms-lock";
import { isEmail, isMobile } from "@/utils/validate";

const router = useRouter();
const formRef = ref(null);
const rules = {
  sms_code: {
    required: true,
    trigger: ["blur", "input"],
    message: "验证码不能为空！",
  },
  username: {
    required: true,
    trigger: ["blur", "input"],
    validator(rule, value) {
      if (!value) {
        return new Error("邮箱或手机号不能为空！");
      } else if (!isMobile(value) && !isEmail(value)) {
        return new Error("请正确填写邮箱/手机号！");
      }

      return true;
    },
  },
  password: {
    required: true,
    trigger: ["blur", "input"],
    message: "密码不能为空！",
  },
};

// 短信按钮倒计时
const lockTime = ref(0);

// 初始化短信按钮锁
const lock = new SmsLock("FORGET_PSW_SMS", 120, (time) => {
  lockTime.value = time;
});

const model = reactive({
  username: "",
  password: "",
  sms_code: "",
  loading: false,
});

const onForget = () => {
  model.loading = true;

  const response = ServeForgetPassword({
    type: 0,
    account: model.username,
    newPassword: model.password,
    code: model.sms_code,
  });

  response.then((res) => {
    if (res.success) {
      $message.success("密码修改成功！");

      setTimeout(() => {
        router.push("/auth/login");
      }, 500);
    } else {
      $message.warning(res.message);
    }
  });

  response.finally(() => {
    model.loading = false;
  });
};

const onValidate = (e) => {
  e.preventDefault();

  formRef.value.validate((errors) => {
    !errors && onForget();
  });
};

// 发送短信
const onSendSms = () => {
  if (!isMobile(model.username) && !isEmail(model.username)) {
    $message.warning("请正确填写邮箱/手机号！");
    return;
  }

  const response = ServeSendVerifyCode({
    account: model.username,
    type: "fp",
  });

  response.then((res) => {
    if (res.code == 200) {
      lock.start();
      $message.success("短信发送成功！");
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
  <section class="el-container is-vertical login-box">
    <header class="el-header box-header">找回密码</header>

    <main class="el-main" style="padding: 3px">
      <n-form ref="formRef" size="large" :model="model" :rules="rules">
        <n-form-item path="username" :show-label="false">
          <n-input
            placeholder="登录账号/手机号"
            v-model:value="model.username"
            :maxlength="32"
            @keydown.enter.native="onValidate"
          />
        </n-form-item>

        <n-form-item path="sms_code" :show-label="false">
          <n-input
            placeholder="验证码"
            :maxlength="8"
            v-model:value="model.sms_code"
            @keydown.enter.native="onValidate"
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

        <n-form-item path="password" :show-label="false">
          <n-input
            placeholder="设置密码"
            type="password"
            show-password-on="click"
            v-model:value="model.password"
            @keydown.enter.native="onValidate"
          />
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          block
          class="mt-t20"
          @click="onValidate"
          :loading="model.loading"
          round
        >
          立即找回
        </n-button>
      </n-form>

      <div class="helper">
        <n-button text color="#409eff" @click="router.push('/auth/register')">
          注册账号
        </n-button>
        <n-button text color="#409eff" @click="router.push('/auth/login')">
          已有账号，立即登录?
        </n-button>
      </div>
    </main>
  </section>
</template>

<style lang="less" scoped>
@import "@/assets/css/login.less";
</style>
