<script setup>
import {ref, computed} from 'vue'
import {NSpace, NDivider, NTag, NTabs, NTab, NDropdown} from 'naive-ui'
import {SearchOutline, AddOutline} from '@vicons/ionicons5'
import UserCardModal from '@/components/user/UserCardModal.vue'
import MemberCard from './inner/MemberCard.vue'
import ApplyListModal from './inner/ApplyListModal.vue'
import UserSearchModal from './inner/UserSearchModal.vue'
import UserFindModal from './inner/UserFindModal.vue'
import GroupManage from './inner/GroupManage.vue'
import {modal} from '@/utils/common'
import {toTalk} from '@/utils/talk'
import {useUserStore} from '@/store/user'
import {ServeGetContacts, ServeContactGroupList} from '@/api/contacts'

const userStore = useUserStore()
const isShowDrawer = ref(false)
const isShowUserSearch = ref(false)
const isShowUserFind = ref(false)
const isShowGroupModal = ref(false)

const keywords = ref('')
const index = ref(0)
const selectGroup = ref('')
const items = ref([])
const groups = ref([])
const filter = computed(() => {
    return items.value.filter(item => {
        console.log('select:', index, selectGroup)
        if (index.value === 0) {
            return item.friend.username.toLowerCase().indexOf(keywords.value.toLowerCase()) !== -1 &&
                index.value === item.groupId
        }
        return item.friend.username.toLowerCase().indexOf(keywords.value.toLowerCase()) !== -1 &&
            selectGroup.value === item.group
    })
})

const onLoadData = () => {
    ServeGetContacts({
        userId: JSON.parse(localStorage.getItem('IM_USERID')).value
    }).then(res => {
        if (res.success) {
            console.log('好友列表结果：', res)
            // 设置 全部好友items
            items.value = res.data.friendList.map(item => {
                item.groupId = 0
                return item
            }) || []
            console.log('items=', items.value)
            // 设置好友分组
            let groupArray = res.data.groupList.map(item => {
                // 构造对象
                return {
                    id: item.id,
                    name: item.name,
                    count: item.count
                }
            })
            groupArray.unshift({
                id: 0,
                name: '全部好友',
                count: res.data.friendList.length,
            })
            groups.value = groupArray
        }
    })

    ServeContactGroupList().then(res => {
        if (res.code == 200 && res.success) {
            groups.value = res.data || []
        }
    })

}

const onToTalk = item => {
    toTalk(1, item.friend.id)
}

const onInfo = item => {
    modal(UserCardModal, {
        uid: item.friend.id,
    })
}

const onShowApplyList = () => {
    isShowDrawer.value = true
}

const onToolsMenu = value => {
    switch (value) {
        case 'add':
            isShowUserSearch.value = true
            break
        case 'group':
            window.$message.info('待完善...')
            isShowGroupModal.value = true
            break
        case 'find':
            isShowUserFind.value = true
            break
    }
}

onLoadData()
</script>

<template>
    <section class="el-container is-vertical height100">
        <header class="el-header from-header bdr-b">
            <div>
                <n-space>
                    <n-button text color="#333"> 全部好友({{ filter.length }})</n-button>
                    <n-divider vertical/>
                    <p>
                        <n-button text @click="onShowApplyList" color="#333">
                            申请列表
                        </n-button>
                        <span v-show="userStore.isContactApply" class="badge new-apply">
              New
            </span>
                    </p>
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

                    <n-dropdown
                        :animated="true"
                        trigger="click"
                        :show-arrow="false"
                        @select="onToolsMenu"
                        :options="[
              {
                label: '添加好友',
                key: 'add',
              },
              {
                label: '发现好友',
                key: 'find',
              },
              {
                label: '分组管理',
                key: 'group',
              },
            ]"
                    >
                        <n-button circle>
                            <template #icon>
                                <n-icon :component="AddOutline"/>
                            </template>
                        </n-button>
                    </n-dropdown>
                </n-space>
            </div>
        </header>

        <header class="el-header pd-10">
            <n-tabs type="line" v-model:value="index">
                <n-tab v-for="tab in groups" :key="tab.id" :name="tab.id" @click="() => {
              index = tab.id
              selectGroup = tab.name
            }">
                    {{ tab.name }}({{ tab.count }})
                </n-tab>
            </n-tabs>
        </header>

        <main
            id="drawer-target"
            class="el-main pd-10 me-scrollbar"
            v-if="filter.length"
        >
            <div class="cards">
                <MemberCard
                    v-for="item in filter"
                    :avatar="item.friend.miniAvatar"
                    :username="item.remarkName || item.friend.username"
                    :gender="item.friend.gender"
                    :motto="item.friend.signature"
                    flag="查看"
                    @click="onInfo(item)"
                    @to-talk="onToTalk(item)"
                />
            </div>
        </main>

        <main class="el-main flex-center" v-else>
            <n-empty size="200" description="暂无相关数据">
                <template #icon>
                    <img src="@/assets/image/no-data.svg" alt=""/>
                </template>
            </n-empty>
        </main>
    </section>

    <!-- 好友申请模态框 -->
    <ApplyListModal v-if="isShowDrawer" @close="isShowDrawer = false"/>

    <!-- 用户查询模态框 -->
    <UserSearchModal v-model:show="isShowUserSearch"/>

    <!-- 用户查找 -->
    <UserFindModal v-model:show="isShowUserFind"/>

    <!-- 分组管理 -->
    <GroupManage v-if="isShowGroupModal" @close="isShowGroupModal = false" />

</template>

<style lang="less" scoped>
.from-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
}

#drawer-target {
    .tags {
        margin-bottom: 10px;

        .tag {
            margin-right: 8px;
            margin-bottom: 5px;
        }
    }

    .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        grid-gap: 12px;
        gap: 12px;
    }
}

.new-apply {
    background-color: red;
    color: #ffffff;
    margin-left: 5px;
    cursor: pointer;
}
</style>
