<script setup>
import {ref, reactive} from 'vue'
import {NModal, NDatePicker} from 'naive-ui'
import Loading from '@/components/base/Loading.vue'
import {ServeFindTalkRecords} from '@/api/chat'
import {ChevronDownOutline, CalendarNumberOutline} from '@vicons/ionicons5'

const userId = JSON.parse(localStorage.getItem('IM_USERID')).value
const emit = defineEmits(['close'])
const props = defineProps({
    talkType: {
        type: Number,
        default: 0,
    },
    receiverId: {
        type: Number,
        default: 0,
    },
})

// 日期范围选择
const datetimeRange = ref(Date.now())
const model = reactive({
    sequence: 0,
    // 群聊指定消息发送者
    senderId: null,
    recordId: 0,
    limit: 30,
    msgType: [0],
    fromTime: null,
    loading: false,
    loadMore: false,
    isLoadMore: true,
})

const isShow = ref(true)
const records = ref([])
// 是否显示时间选择器
const isShowDatetimePicker = ref(false)
const onDatetimeBtnClick = e => {
    isShowDatetimePicker.value = true
    console.log('点击显示时间选择按钮', isShowDatetimePicker.value)
}
// 选择日期时间
const onUpdateDatetime = datetimeRange => {
    console.log('选择日期时间', datetimeRange)
    isShowDatetimePicker.value = false
    model.fromTime = datetimeRange
    loadChatRecord()
}

const tabType = [
    {name: '全部', type: [0], show: true},
    {name: '图片/视频/文件', type: [2, 6], show: true},
    {name: '会话记录', type: [3], show: true},
    {name: '代码块', type: [3], show: true},
    {name: '群投票', type: [5], show: props.talkType == 2},
]

const onMaskClick = () => {
    emit('close')
}

const loadChatRecord = () => {
    let data = {
        userId: userId,
        talkType: props.talkType,
        receiverId: props.receiverId,
        senderId: model.senderId,
        anchor: model.recordId,
        sequence: model.sequence,
        msgTypes: model.msgType,
        limit: model.limit,
        fromTime: model.fromTime,
    }

    if (model.recordId === 0 || model.sequence === 0) {
        model.loading = true
    } else {
        model.loadMore = true
    }

    // 获取聊天记录
    ServeFindTalkRecords(data).then(res => {
        console.log('获取聊天记录：', res)
        if (res.code != 200) return

        if (data.sequence === 0) {
            records.value = []
        }

        let items = res.data.messageVOList || []

        records.value.push(...items)

        if (items.length) {
            // 最小的id
            // model.recordId = items[items.length - 1].id
            model.sequence = res.data.sequence
        }

        model.loading = false
        model.loadMore = false
        model.isLoadMore = items.length >= model.limit
    })
}

const triggerType = type => {
    model.msgType = type
    model.sequence = 0
    loadChatRecord()
}

loadChatRecord()
</script>

<template>
    <n-modal
        v-model:show="isShow"
        preset="card"
        title="消息管理"
        size="huge"
        :bordered="false"
        style="max-width: 750px; border-radius: 10px"
        class=""
        :on-after-leave="onMaskClick"
        :segmented="{
      content: true,
    }"
        :header-style="{
      padding: '20px 15px',
    }"
        :content-style="{
      padding: 0,
    }"
        :hoverable="true"
    >
        <section class="main-box el-container is-vertical o-hidden">
            <header class="el-header bdr-b search" style="height: 50px">
                <div class="type-items">
          <span
              v-for="tab in tabType"
              class="pointer"
              :class="{ active: model.msgType == tab.type }"
              @click="triggerType(tab.type)"
              v-show="tab.show"
          >
            {{ tab.name }}
          </span>
                </div>
                <div style="display: flex; align-items: center">
                    <n-date-picker v-show="isShowDatetimePicker === true"
                                   v-model:value="datetimeRange"
                                   @update:formatted-value="onUpdateDatetime"
                                   type="date" clearable/>
                    <n-icon
                        :size="20"
                        v-show="isShowDatetimePicker === false"
                        class="pointer"
                        :component="CalendarNumberOutline"
                        @click="onDatetimeBtnClick"
                    />
                </div>
            </header>

            <main v-if="model.loading" class="el-main flex-center">
                <Loading/>
            </main>

            <main v-else-if="records.length === 0" class="el-main flex-center">
                <n-empty size="200" description="暂无相关数据">
                    <template #icon>
                        <img src="@/assets/image/no-data.svg" alt=""/>
                    </template>
                </n-empty>
            </main>

            <main v-else class="el-main me-scrollbar">
                <div v-for="item in records" :key="item.id" class="message-item">
                    <div class="left-box">
                        <n-avatar :size="30" :src="item.avatar"/>
                    </div>

                    <div class="right-box">
                        <div class="msg-header">
              <span class="name">
                {{ item.nickname_remarks || item.nickname }}
              </span>

                            <span class="time"> {{ item.created_at }}</span>
                        </div>

                        <!-- 文本消息 -->
                        <text-message
                            v-if="item.messageType == 1"
                            :content="item.content"
                            float="left"
                        />

                        <!-- 文件 - 图片消息 -->
                        <image-message
                            v-else-if="item.messageType == 2 && item.extra.fileSubType === 1"
                            :src="item.url || item.content"
                            float="left"
                        />

                        <!-- 文件 - 音频消息 -->
                        <audio-message
                            v-else-if="item.messageType == 6 && item.extra.fileSubType == 2"
                            :src="item.url || item.extra.url"
                        />

                        <!-- 文件 - 视频消息 -->
                        <video-message
                            v-else-if="item.messageType == 6 && item.extra.fileSubType == 2"
                            :src="item.url || item.extra.url"
                        />

                        <!-- 文件消息 -->
                        <file-message
                            v-else-if="item.messageType == 6 && (item.url || item.content)"
                            :file-name="item.extra.originalFileName"
                            :size="item.extra.size"
                            :ext="item.extra.extension"
                            :record-id="item.id"
                        />

                        <!-- 会话记录消息 -->
                        <forward-message
                            v-else-if="item.msg_type == 3"
                            :record-id="item.id"
                            :records="item.forward.list"
                            :num="item.forward.num"
                            @contextmenu.prevent="onContextMenu($event, item)"
                        />

                        <!-- 代码块消息 -->
                        <code-message
                            v-else-if="item.messageType == 3"
                            :code="item.content || item.extra.code"
                            :lang="item.extra.lang"
                            :name="item.extra.name"
                        />

                        <!-- 投票消息 -->
                        <vote-message
                            v-else-if="item.msg_type == 5"
                            :title="item.vote.detail.title"
                            :mode="item.vote.detail.answer_mode"
                            :options="item.vote.detail.answer_option"
                            :statistics="item.vote.statistics"
                            :answer_num="item.vote.detail.answer_num"
                            :answered_num="item.vote.detail.answered_num"
                            :vote_users="item.vote.vote_users"
                            :record_id="item.id"
                            :user_id="uid"
                        />

                        <div v-else class="other-message">未知消息类型</div>
                    </div>
                </div>

                <div
                    class="more pointer flex-center"
                    @click="loadChatRecord"
                    v-show="model.isLoadMore"
                >
                    <n-icon
                        v-show="!model.loadMore"
                        :size="20"
                        class="icon"
                        :component="ChevronDownOutline"
                    />
                    <span>
            &nbsp;{{ model.loadMore ? '数据加载中...' : '加载更多' }}
          </span>
                </div>
            </main>
        </section>
    </n-modal>
</template>

<style lang="less" scoped>
.main-box {
    height: 550px;

    .search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px 0 5px;

        .type-items {
            line-height: 40px;
            user-select: none;

            .active {
                color: #03a9f4;
                font-weight: 500;
            }

            span {
                height: 40px;
                width: 45px;
                margin: 0 10px;
                font-size: 13px;
                font-weight: 400;
            }
        }
    }
}

.message-item {
    min-height: 30px;
    display: flex;
    margin-bottom: 5px;
    flex-direction: row;
    padding: 5px 15px;

    &:first-child {
        margin-top: 10px;
    }

    .left-box {
        width: 30px;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        user-select: none;
        padding-top: 8px;
        margin-right: 10px;

        img {
            height: 30px;
            width: 30px;
            border-radius: 3px;
        }
    }

    .right-box {
        flex: auto;
        overflow-x: auto;
        padding: 0px 5px 15px 5px;

        .msg-header {
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #a09a9a;
            position: relative;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .name {
                color: #333;
            }
        }
    }
}

.more {
    margin: 10px auto 20px;
    width: 150px;
    height: 30px;
}
</style>
