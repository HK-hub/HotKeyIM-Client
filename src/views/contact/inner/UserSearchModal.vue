<script setup>
import {computed, ref} from "vue";
import {NModal, NForm, NFormItem, NInput} from "naive-ui";
import {ServeSearchContact} from "@/api/contacts";
import UserCardModal from "@/components/user/UserCardModal.vue";
import {modal} from "@/utils/common";

const emit = defineEmits(["update:show"]);

const isShow = ref(true);
const keyword = ref("");
const isShowError = ref(false);

const onShowError = (isBool) => {
    isShowError.value = isBool;

    if (isBool) {
        setTimeout(() => {
            isShowError.value = false;
        }, 2000);
    }
};

const onSubmit = () => {
    if (!keyword.value.length) {
        return;
    }
    /*modal(UserCardModal, {
        // TODO 好友发现列表
        uid: '1122233',
        // uidList: res.data,
    });*/
    ServeSearchContact({
        requestType: 0,
        searchKey: keyword.value,
        username: keyword.value,
        interest: keyword.value,
        job: keyword.value,
        campus: keyword.value,
        groupType: keyword.value,
        operatorId: JSON.parse(localStorage.getItem('IM_USERID')).value,
        currentPage: 0,
        pageSize: 10
        //mobile: keyword.value,
    }).then(res => {
        // 发现好友成功
        console.log("好友发现：" + JSON.stringify(res));
        if (res.success) {
            modal(UserCardModal, {
                // TODO 好友发现列表
                userResult: res.data,
                // uidList: res.data,
                uid: res.data.user.id
            })
        } else {
            onShowError(true)
        }
    })
};

// 是否可提交
const isCanSubmit = computed(() => {
    return keyword.value.trim().length == 0;
});

const onShowUpdate = () => {
    emit("update:show", false);
};
</script>

<template>
    <n-modal
        v-model:show="isShow"
        preset="card"
        title="好友搜索"
        size="huge"
        :bordered="false"
        style="max-width: 450px; border-radius: 10px"
        :mask-closable="false"
        :on-after-leave="onShowUpdate"
        :on-update:show="onShowUpdate"
        transform-origin="center"
    >
        <n-form>
            <n-form-item label="请输入昵称/账号/邮箱/电话等" :required="true">
                <n-input
                    placeholder="关键字(必填)"
                    :maxlength="32"
                    v-model:value="keyword"
                    @keydown.enter.native="onSubmit"
                />
            </n-form-item>
            <p v-show="isShowError" style="color: red">
                没有找到符合搜索条件的用户或对方设置了账号搜索限制!
            </p>
        </n-form>

        <template #footer>
            <div style="width: 100%; text-align: right">
                <n-button type="tertiary" @click="onShowUpdate"> 取消</n-button>
                <n-button
                    type="primary"
                    @click="onSubmit"
                    class="mt-l15"
                    :disabled="isCanSubmit"
                >
                    查询
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

        .btn {
            width: 30px;
            height: 30px;
            margin-left: 3px;

            &:hover {
                color: red;
            }
        }
    }
}
</style>
