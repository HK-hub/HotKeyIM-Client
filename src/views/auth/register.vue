<script setup>
import { reactive, ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { NForm, NFormItem, NInput } from "naive-ui";
import { ServeRegister } from "@/api/auth";
import { ServeSendVerifyCode } from "@/api/common";
import SmsLock from "@/plugins/sms-lock";
import { isEmail, isMobile } from "@/utils/validate";

const router = useRouter();
const formRef = ref(null);
const rules = {
  nickname: {
    required: true,
    trigger: ["blur", "input"],
    message: "昵称不能为空！",
  },
  username: {
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error("邮箱或手机号不能为空！");
      } else if (!isMobile(value) && !isEmail(value)) {
        return new Error("请正确填写邮箱或手机号！");
      }

      return true;
    },
    trigger: ["blur", "input"],
  },
  password: {
    required: true,
    trigger: ["blur", "input"],
    message: "密码不能为空！",
  },
  sms_code: {
    required: true,
    trigger: ["blur", "input"],
    message: "验证码不能为空！",
  },
};

// 短信按钮倒计时
const lockTime = ref(0);

// 初始化短信按钮锁
const lock = new SmsLock("REGISTER_SMS", 60, (time) => {
  lockTime.value = time;
});

const model = reactive({
  nickname: "",
  username: "",
  password: "",
  sms_code: "",
  loading: false,
});

const onRegister = () => {
  model.loading = true;

  const response = ServeRegister({
    // 验证码类型注册
    type: 1,
    account: model.username,
    password: model.password,
    nickname: model.nickname,
    phone: model.username,
    email: model.username,
    code: model.sms_code,
    platform: "web",
  });

  response.then((res) => {
    if (res.success) {
      $message.success("注册成功！");

      setTimeout(() => {
        router.push("/auth/login");
      }, 500);
    } else {
      $message.warning(res.data);
    }
  });

  response.finally(() => {
    model.loading = false;
  });
};

const onValidate = (e) => {
  e.preventDefault();

  formRef.value.validate((errors) => {
    !errors && onRegister();
  });
};

// 发送短信
const onSendSms = () => {
  if (!isMobile(model.username) && !isEmail(model.username)) {
    $message.warning("请正确填写邮箱或手机号！");
    return;
  }

  const response = ServeSendVerifyCode({
    // account
    account: model.username,
    // 登录注册用途
    type: "lr",
  });

  response.then((res) => {
    if (res.code == 200) {
      lock.start();
      $message.success("验证码发送成功！");

      if (res.data.is_debug) {
        model.sms_code = res.data.sms_code;
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
  <section class="el-container is-vertical login-box">
    <header class="el-header box-header">账号注册</header>

    <main class="el-main" style="padding: 3px">
      <n-form ref="formRef" size="large" :model="model" :rules="rules">
        <n-form-item path="username" :show-label="false">
          <n-input
            placeholder="请输入邮箱或手机号"
            v-model:value="model.username"
            :maxlength="32"
            @keydown.enter.native="onValidate"
          />
        </n-form-item>

        <n-form-item path="sms_code" :show-label="false">
          <n-input
            placeholder="验证码"
            v-model:value="model.sms_code"
            :maxlength="6"
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

        <n-form-item path="nickname" :show-label="false">
          <n-input
            placeholder="设置昵称"
            v-model:value="model.nickname"
            @keydown.enter.native="onValidate"
          />
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
          立即注册
        </n-button>
      </n-form>

      <div class="helper">
        <n-button text color="#409eff" @click="router.push('/auth/forget')">
          找回密码
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
