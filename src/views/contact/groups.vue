<script setup>
import {ref, computed, reactive, onMounted, watch} from 'vue'
import {NSpace, NDivider, NDrawer} from 'naive-ui'
import {ServeGetGroups} from '@/api/group'
import {SearchOutline, AddOutline} from '@vicons/ionicons5'
import GroupPanel from '@/components/group/GroupPanel.vue'
import GroupLaunch from '@/components/group/GroupLaunch.vue'
import GroupCard from './inner/GroupCard.vue'
import {toTalk} from '@/utils/talk'

const isShowCreateGroupBox = ref(false)
const keywords = ref('')
let selected = ref(0)
const items = ref([])
const myCreatedGroups = ref([])
const myJoinedGroups = ref([])
const masterId = JSON.parse(localStorage.getItem('IM_USERID')).value

const params = reactive({
    isShow: false,
    id: 0,
})

let filter = computed(() => {
    return items.value.filter(it => {
        return it.groupName.match(keywords.value) != null
    })
})

// 选择群组类别：0.全部，1.创建的，2.加入的
const onSelectGroup = (type) => {
    selected = type;
    console.log('选择：',selected)
}

const onLoadData = () => {
    ServeGetGroups({
        userId: JSON.parse(localStorage.getItem('IM_USERID')).value
    }).then(res => {
        if (res.code == 200) {
            console.log('群聊列表：', res)
            items.value = res.data || []
            let masterId = JSON.parse(localStorage.getItem('IM_USERID')).value
            // 我创建的群聊
            myCreatedGroups.value = items.value.filter(it => {
                return it.groupMaster === masterId
            })
            // 我加入的
            myJoinedGroups.value = items.value.filter(it => {
                return it.groupMaster !== masterId
            })
        }
    })
}

const onShowGroup = item => {
    params.isShow = true
    params.id = item.id
}

const onToTalk = item => {
    toTalk(2, item.id)
}

const onGroupCallBack = data => {
    isShowCreateGroupBox.value = false
    onLoadData()
}

onMounted(() => {
    onLoadData()
})
</script>

<template>
    <section id="drawer-target" class="el-container is-vertical height100">
        <header class="el-header from-header bdr-b">
            <div>
                <n-space>
                    <n-button text se @click="onSelectGroup(0)"> 全部群组({{ items.length }})</n-button>
                    <n-divider vertical/>
                    <n-button text @click="onSelectGroup(1)"> 我创建的({{ myCreatedGroups.length }})</n-button>
                    <n-divider vertical/>
                    <n-button text @click="onSelectGroup(2)"> 我加入的({{ myJoinedGroups.length }})</n-button>
                </n-space>
            </div>

            <div>
                <n-space>
                    <n-input
                        v-model:value.trim="keywords"
                        placeholder="搜索"
                        clearable
                        style="width: 200px"
                        round
                    >
                        <template #prefix>
                            <n-icon :component="SearchOutline"/>
                        </template>
                    </n-input>

                    <n-button circle @click="isShowCreateGroupBox = true">
                        <template #icon>
                            <n-icon :component="AddOutline"/>
                        </template>
                    </n-button>
                </n-space>
            </div>
        </header>

        <main v-if="filter.length == 0" class="el-main flex-center">
            <n-empty size="200" description="暂无相关数据">
                <template #icon>
                    <img src="@/assets/image/no-data.svg" alt=""/>
                </template>
            </n-empty>
        </main>

        <main v-else class="el-main me-scrollbar pd-10">
            <div class="cards">
                <GroupCard
                    v-for="item in filter"
                    :avatar="item.groupAvatar"
                    :username="item.groupName"
                    :gender="item.gender"
                    :motto="item.description"
                    flag="查看"
                    :is-member="true"
                    @click="onShowGroup(item)"
                    @talk="onToTalk(item)"
                />
            </div>
        </main>
    </section>

    <GroupLaunch
        v-model:show="isShowCreateGroupBox"
        @close="isShowCreateGroupBox = false"
        @on-submit="onGroupCallBack"
    />

    <n-drawer
        v-model:show="params.isShow"
        :width="400"
        placement="right"
        :trap-focus="false"
        :block-scroll="false"
        to="#drawer-target"
    >
        <GroupPanel
            :gid="params.id"
            @close="params.isShow = false"
            @to-talk="
        () => {
          toTalk(2, params.id)
        }
      "
        />
    </n-drawer>
</template>

<style lang="less" scoped>
.from-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    justify-content: space-between;
}

.cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    grid-gap: 12px;
    gap: 12px;
}
</style>
