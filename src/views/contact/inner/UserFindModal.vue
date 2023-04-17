<script setup>
import {computed, ref, reactive} from "vue";
import {NModal, NForm, NFormItem, NInput, NSelect, NDivider} from "naive-ui";
import {ServeSearchContact, ServeFindContact} from "@/api/contacts";
import UserCardModal from "@/components/user/UserCardModal.vue";
import MemberCard from './MemberCard.vue'
import GroupCard from './GroupCard.vue'
import AddApply from '../AddApply.vue'
import {modal} from "@/utils/common";

const emit = defineEmits(["update:show"]);

const isShow = ref(true);
const keyword = ref("");
// 搜索类型，1 好友，2.群聊
const type = ref(1);
const options = [
    {
        label: '好友',
        value: 1,
    },
    {
        label: '群聊',
        value: 2,
    },
]
const isShowError = ref(false);
const findResult = reactive([])
const currentResult = reactive({})
const onShowError = (isBool) => {
    isShowError.value = isBool;

    if (isBool) {
        setTimeout(() => {
            isShowError.value = false;
        }, 2000);
    }
};

const onSubmit = () => {
    findResult.value = []
    currentResult.value = {}
    if (!keyword.value.length) {
        return;
    }
    ServeFindContact({
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
            findResult.value = res.data.rows
        } else {
            onShowError(true)
        }
    })
};

// 添加好友
const toBeFriend = (data) => {
    currentResult.value = data
    console.log('添加好友：', type, currentResult)
    modal(AddApply, {
        type: type.value,
        target: currentResult.value,
    })
}

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
        title="好友发现"
        size="huge"
        :bordered="false"
        style="max-width: 720px; border-radius: 10px"
        :mask-closable="false"
        :on-after-leave="onShowUpdate"
        :on-update:show="onShowUpdate"
        transform-origin="center"
    >
        <n-form inline :label-width="100" :show-label="false">
            <n-form-item :required="true">
                <n-input
                    placeholder="请输入昵称/账号/邮箱/电话等"
                    :maxlength="32"
                    v-model:value="keyword"
                    @keydown.enter.native="onSubmit"
                />
            </n-form-item>
            <n-form-item :required="true">
                <n-select v-model:value="type" :options="options" />
            </n-form-item>
            <n-form-item :required="false">
                <n-button
                    type="primary"
                    @click="onSubmit"
                    class="mt-l15"
                    :disabled="isCanSubmit"
                >
                    查询
                </n-button>
            </n-form-item>
        </n-form>
        <n-divider title-placement="left">
            查找结果
        </n-divider>
        <p v-show="isShowError" style="color: red">
            没有找到符合搜索条件的用户或对方设置了账号搜索限制!
        </p>
        <div class="cards">
            <MemberCard
                v-if="type == 1"
                v-for="item in findResult.value"
                :avatar="item.miniAvatar"
                :username="item.username"
                :gender="item.gender"
                :motto="item.signature"
                flag="加好友"
                @click="toBeFriend(item)"
            />
            <GroupCard v-if="type == 2"/>
        </div>

    </n-modal>
</template>

<style lang="less" scoped>
.n-form {
    .n-form-item {
        width: 65%;
    }
}
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    grid-gap: 12px;
    gap: 12px;
}

</style>
