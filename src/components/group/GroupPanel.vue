<script setup>
import {reactive, computed, watch, ref} from 'vue'
import {NEmpty, NPopover, NPopconfirm} from 'naive-ui'
import {useUserStore} from '@/store/user'
import GroupLaunch from './GroupLaunch.vue'
import GroupManage from './manage/index.vue'
import {
    ChatboxEllipsesOutline,
    CloseOutline,
    SearchOutline,
    AddOutline,
} from '@vicons/ionicons5'
import {
    ServeGroupDetail,
    ServeGetGroupMembers,
    ServeSecedeGroup,
    ServeUpdateGroupCard,
} from '@/api/group'
import {defAvatar} from '@/constant/default'
import UserCardModal from '@/components/user/UserCardModal.vue'
import {modal} from '@/utils/common'

const userStore = useUserStore()
const userId = JSON.parse(localStorage.getItem('IM_USERID')).value
const emit = defineEmits(['close', 'to-talk'])
const props = defineProps({
    gid: {
        type: Number,
        default: 0,
    },
})

watch(props, () => {
    loadDetail()
    loadMembers()
})

const editCardPopover = ref(false)
const isShowGroup = ref(false)
const isShowManage = ref(false)
const state = reactive({
    keywords: '',
    detail: {
        avatar: '',
        name: '',
        profile: '',
        visit_card: '',
        announcement: '',
    },
    members: [],
    remark: '',
})

const search = computed(() => {
    if (state.keywords) {
        return state.members.filter(item => {
            return (
                item.memberUsername.match(state.keywords) != null ||
                item.memberRemarkName.match(state.keywords) != null
            )
        })
    }

    return state.members
})

const isLeader = computed(() => {
    return state.members.some(item => {
        return item.memberId == userStore.uid && item.memberRole > 1
    })
})

const isAdmin = computed(() => {
    return state.members.some(item => {
        return item.memberId == userStore.uid && item.memberRole == 2
    })
})

const onGroupCallBack = () => {
}

const onToInfo = item => {
    modal(UserCardModal, {
        uid: item.memberId,
    })
}

/**
 * 加载群信息
 */
function loadDetail() {
    ServeGroupDetail({
        groupId: props.gid,
        userId: userId,
    }).then(res => {
        if (res.code == 200) {
            let result = res.data
            console.log('group detail=', res)
            state.detail.avatar = result.groupAvatar
            state.detail.name = result.groupName
            state.detail.profile = result.description
            state.detail.visit_card = result.visitCard
            state.remark = result.visitCard
            state.detail.announcement = result.notice

            if (result.notice) {
                state.detail.group_notice = result.notice
            }
        }
    })
}

/**
 * 加载成员列表
 */
function loadMembers() {
    ServeGetGroupMembers({
        groupId: props.gid,
    }).then(res => {
        if (res.code == 200) {
            state.members = res.data
        }
    })
}

const onClose = () => {
    emit('close')
}

const onSignOut = () => {
    ServeSecedeGroup({
        group_id: props.gid,
    }).then(res => {
        if (res.code == 200) {
            $message.success('已退出群组！')
            onClose()
        } else {
            $message.error(res.message)
        }
    })
}

const onChangeRemark = () => {
    ServeUpdateGroupCard({
        groupId: props.gid,
        memberId: userId,
        operatorId: userId,
        newRemarkName: state.remark
    }).then(({code, message}) => {
        if (code == 200) {
            editCardPopover.value.setShow(false)
            state.detail.visit_card = state.remark
            $message.success('已更新群名片！')
            loadMembers()
        } else {
            $message.error(message)
        }
    })
}

loadDetail()
loadMembers()
</script>
<template>
    <section class="el-container is-vertical section">
        <header class="el-header header bdr-b">
            <div class="left-icon" @click="emit('to-talk')">
                <n-icon size="21" :component="ChatboxEllipsesOutline"/>
            </div>
            <div class="center-text">
                <span>群信息</span>
            </div>
            <div class="right-icon">
                <n-icon size="24" :component="CloseOutline" @click="onClose"/>
            </div>
        </header>

        <main class="el-main main me-scrollbar">
            <div class="info-box">
                <div class="b-box">
                    <div class="block">
                        <div class="title">群名称：</div>
                    </div>
                    <div class="describe">{{ state.detail.name }}</div>
                </div>

                <div class="b-box">
                    <div class="block">
                        <div class="title">群名片：</div>
                        <div class="text">
                            <n-popover trigger="click" placement="left" ref="editCardPopover">
                                <template #trigger>
                                    <n-button type="info" text> 设置</n-button>
                                </template>

                                <template #header> 设置我的群名片</template>

                                <div style="display: flex">
                                    <n-input
                                        type="text"
                                        placeholder="设置我的群名片"
                                        :autofocus="true"
                                        maxlength="10"
                                        v-model:value="state.remark"
                                        @keydown.enter.native="onChangeRemark"
                                    />
                                    <n-button
                                        type="primary"
                                        class="mt-l5"
                                        @click="onChangeRemark"
                                    >
                                        确定
                                    </n-button>
                                </div>
                            </n-popover>
                        </div>
                    </div>
                    <div class="describe">{{ state.detail.visit_card || '未设置' }}</div>
                </div>

                <div class="b-box">
                    <div class="block">
                        <div class="title">群成员：</div>
                        <div class="text">{{ state.members.length }}人</div>
                    </div>
                    <div class="describe">群主已开启“新成员入群可查看所有聊天记录</div>
                </div>

                <div class="b-box">
                    <div class="block">
                        <div class="title">群简介：</div>
                    </div>
                    <div class="describe">
                        {{ state.detail.profile ? state.detail.profile : '暂无群简介' }}
                    </div>
                </div>

                <div class="b-box">
                    <div class="block">
                        <div class="title">群公告：</div>
                        <div class="text">
                            <n-button type="info" text> 更多</n-button>
                        </div>
                    </div>
                    <div class="describe">
                        {{ state.detail.announcement ? state.detail.announcement : '暂无群公告' }}
                    </div>
                </div>
            </div>

            <div class="member-box">
                <div class="flex">
                    <n-input
                        placeholder="搜索..."
                        v-model:value="state.keywords"
                        :clearable="true"
                        round
                    >
                        <template #prefix>
                            <n-icon :component="SearchOutline"/>
                        </template>
                    </n-input>

                    <n-button @click="isShowGroup = true" circle class="mt-l15">
                        <template #icon>
                            <n-icon :component="AddOutline"/>
                        </template>
                    </n-button>
                </div>

                <div class="table">
                    <div class="theader">
                        <div class="avatar"></div>
                        <div class="nickname">用户昵称</div>
                        <div class="card">群名片</div>
                    </div>

                    <div
                        class="row pointer"
                        v-for="item in search"
                        :key="item.memberId"
                        @click="onToInfo(item)"
                    >
                        <div class="avatar">
                            <n-avatar
                                round
                                :size="20"
                                :src="item.memberAvatar"
                                :fallback-src="defAvatar"
                            />
                        </div>
                        <div class="nickname text-ellipsis">
                            <span>{{ item.memberUsername ? item.memberUsername : '-' }}</span>
                            <span class="badge master" v-show="item.memberRole === 3">群主</span>
                            <span class="badge leader" v-show="item.memberRole === 2">管理员</span>
                        </div>
                        <div class="card text-ellipsis grey">
                            {{ item.memberRemarkName ? item.memberRemarkName : '-' }}
                        </div>
                    </div>

                    <div class="mt-t20 pd-t20" v-if="search.length == 0">
                        <n-empty size="200" description="暂无相关数据">
                            <template #icon>
                                <img src="@/assets/image/no-data.svg" alt=""/>
                            </template>
                        </n-empty>
                    </div>
                </div>
            </div>
        </main>

        <footer class="el-footer footer bdr-t">
            <template v-if="!isAdmin">
                <n-popconfirm
                    negative-text="取消"
                    positive-text="确定"
                    @positive-click="onSignOut"
                >
                    <template #trigger>
                        <n-button class="btn" type="error" ghost> 退出群组</n-button>
                    </template>
                    确定要退出群吗？ 退出后不在接收群消息！
                </n-popconfirm>
            </template>

            <n-button
                class="btn"
                type="primary"
                v-if="isLeader"
                @click="isShowManage = true"
            >
                群组管理
            </n-button>
        </footer>
    </section>

    <GroupLaunch
        v-if="isShowGroup"
        :gid="gid"
        @close="isShowGroup = false"
        @on-submit="onGroupCallBack"
    />

    <GroupManage v-if="isShowManage" :gid="gid" @close="isShowManage = false"/>
</template>
<style lang="less" scoped>
.section {
    width: 100%;
    height: 100%;

    .header {
        width: 100%;
        height: 60px;

        display: flex;
        align-items: center;
        justify-content: center;

        > div {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .center-text {
            flex: auto;
            font-weight: 500;
            font-size: 16px;
        }

        .left-icon,
        .right-icon {
            width: 50px;
            height: 100%;
            flex-shrink: 0;
            cursor: pointer;
        }
    }

    .main {
        padding: 15px;

        .info-box {
            .b-box {
                display: flex;
                align-items: center;
                min-height: 30px;
                margin: 12px 0;
                flex-direction: column;

                &:first-child {
                    margin-top: 0;
                }

                .block {
                    width: 100%;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .title {
                        height: 100%;
                        line-height: 30px;
                        flex: auto;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    .text {
                        height: 100%;
                        line-height: 30px;
                        width: 30%;
                        text-align: right;
                    }
                }

                .describe {
                    width: 100%;
                    min-height: 24px;
                    line-height: 24px;
                    font-size: 13px;
                    color: #b1b1b1;
                    font-weight: 300;
                    overflow: hidden;
                    word-break: break-word;
                }
            }
        }

        .member-box {
            min-height: 180px;
            padding: 20px 15px;
            margin-bottom: 20px;
            border: 1px solid #ecebeb;
            border-radius: 10px;

            .table {
                margin-top: 15px;

                .theader {
                    height: 30px;
                    border-bottom: 1px solid #ccc;
                    margin-bottom: 15px;
                }

                .row {
                    height: 30px;
                    margin: 3px 0;

                    &:hover {
                        .nickname {
                            color: #1890ff;
                        }
                    }
                }

                .theader,
                .row {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    > div {
                        height: 30px;
                        display: flex;
                        align-items: center;
                        font-size: 13px;
                    }

                    .avatar {
                        width: 30px;
                        justify-content: flex-start;
                    }

                    .nickname {
                        flex: auto;
                    }

                    .card {
                        width: 100px;
                        padding-right: 8px;
                        justify-content: flex-end;

                        &.grey {
                            color: #908989;
                            font-weight: 300;
                        }
                    }
                }
            }
        }
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 60px;
        padding: 15px;

        .btn {
            width: 48%;
        }
    }
}

.badge {
    margin-left: 3px;

    &.master {
        background-color: #ffe699;
        color: red;
    }

    &.leader {
        color: #3370ff;
        background-color: #e1eaff;
    }
}
</style>
