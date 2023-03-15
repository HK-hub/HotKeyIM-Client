<script setup>
import {reactive, ref} from "vue";
import {useRouter, useRoute} from "vue-router";
import {QqOutlined, GithubFilled, WechatFilled, DingtalkOutlined} from '@vicons/antd'
import {NDivider, NForm, NFormItem, NButton} from "naive-ui";
import {ServeLogin} from "@/api/auth";
import {setAccessToken} from "@/utils/auth";
import {palyMusic} from "@/utils/talk";
import socket from "@/socket";
import {useUserStore} from "@/store/user";


const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const rules = {
    username: {
        required: true,
        trigger: ["blur", "input"],
        message: "账号不能为空",
    },
    password: {
        required: true,
        trigger: ["blur", "input"],
        message: "密码不能为空",
    },
};

const model = reactive({
    username: "",
    password: "",
    loading: false,
});

const onLogin = () => {
    model.loading = true;

    const response = ServeLogin({
        // 账号密码体系
        type: 0,
        account: model.username,
        password: model.password,
        nickname: null,
        phone: model.username,
        email: model.username,
        code: null,
        platform: "web",
    });

    response.then((res) => {
        if (res.success) {
            $message.success("登录成功！");
            console.log(res);
            // 设置token
            setAccessToken(res.data.accessToken, res.data.expiresIn);
            // 连接websocket
            socket.connect();
            // 获取用户信息
            console.log(res.data.id);
            userStore.loadSetting('' + res.data.id);
            router.push(route.query.redirect || "/");
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

    // 谷歌浏览器提示音需要用户主动交互才能播放，登录入口主动交互一次，后面消息提示音就能正常播放了
    palyMusic(true);

    formRef.value.validate((errors) => {
        !errors && onLogin();
    });
};

const onClickAccount = (type) => {
    if (type == 1) {
        model.username = "3161880795@qq.com";
        model.password = "123456";
    } else {
        model.username = "p.ohbkyke@qq.com";
        model.password = "123456hh";
    }

    onLogin();
};
</script>

<template>
    <section class="el-container is-vertical login-box">
        <header class="el-header box-header">快捷登录</header>

        <main class="el-main" style="padding: 3px">
            <n-form ref="formRef" size="large" :model="model" :rules="rules">
                <n-form-item path="username" :show-label="false">
                    <n-input
                        placeholder="账号或邮箱或手机号"
                        v-model:value="model.username"
                        :maxlength="32"
                        @keydown.enter.native="onValidate"
                    />
                </n-form-item>

                <n-form-item path="password" :show-label="false">
                    <n-input
                        placeholder="请输入密码"
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
                    立即登录
                </n-button>
            </n-form>

            <div class="helper">
                <n-button text color="#409eff" @click="router.push('/auth/forget')">
                    找回密码
                </n-button>
                <n-button text color="#409eff" @click="router.push('/auth/register')">
                    还没有账号？立即注册
                </n-button>
            </div>
        </main>

        <footer class="el-footer" style="height: 90px">
            <n-divider style="height: 30px; margin: 0">
                <span style="color: #ccc; font-weight: 300"> 第三方登录</span>
            </n-divider>
            <div class="other-login">
                <n-button class="other-login-button" strong secondary circle type="tertiary" size="large">
                    <n-icon size="24">
                        <GithubFilled/>
                    </n-icon>
                </n-button>
                <n-button strong secondary circle type="success" size="large">
                    <n-icon size="24">
                        <QqOutlined/>
                    </n-icon>
                </n-button>
                <n-button strong secondary circle type="warning" size="large">
                    <n-icon size="24">
                        <WechatFilled/>
                    </n-icon>
                </n-button>
                <n-button strong secondary circle type="info" size="large">
                    <n-icon size="24">
                        <DingtalkOutlined/>
                    </n-icon>
                </n-button>
            </div>
        </footer>
        <footer class="el-footer" style="height: 90px">
            <n-divider style="height: 30px; margin: 0">
                <span style="color: #ccc; font-weight: 300"> 预览账号</span>
            </n-divider>
            <div class="preview-account">
                <p @click="onClickAccount(1)">预览账号:3161880795@qq.com / 密码: 123456</p>
                <p @click="onClickAccount(2)">预览账号:p.ohbkyke@qq.com / 密码: 123456</p>
            </div>
        </footer>
    </section>
</template>

<style lang="less" scoped>
@import "@/assets/css/login.less";

.other-login {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

</style>
