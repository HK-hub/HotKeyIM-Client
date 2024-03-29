<script setup>
import { ref, reactive } from 'vue'
import { NAlert } from 'naive-ui'
import { ServeGroupOvertList } from '@/api/group'
import GroupApply from '@/components/group/GroupApply.vue'
import GroupCard from './inner/GroupCard.vue'
import { SearchOutline, AddCircleOutline } from '@vicons/ionicons5'
import { debounce } from '@/utils/common'
import { toTalk } from '@/utils/talk'

const apply = reactive({
  isShow: false,
  groupId: 0,
})

const search = reactive({
  page: 1,
  next: false,
  name: '',
  loading: false,
})

const items = ref([])

const onLoadData = () => {
  if (search.loading) return

  search.loading = true

  ServeGroupOvertList({
    page: search.page,
    name: search.name,
  })
    .then(res => {
      if (res.code == 200) {
        let list = res.data.rows || []

        if (search.page == 1) {
          items.value = list
        } else {
          items.value.push(...list)
        }

        search.next = res.data.next
      }
    })
    .finally(() => {
      search.loading = false
    })
}

const onLoadMore = () => {
  search.page++
  onLoadData()
}

const onSearchInput = debounce(value => {
  search.page = 1
  search.name = value

  onLoadData()
}, 300)


// 查看信息
const onInfo = item => {
    // 查看信息
    $message.warning('功能等待开发!')
}

const onToTalk = item => {
    console.log('去群聊发消息:', item.id)
  toTalk(2, item.id)
}

const onJoin = item => {
  apply.groupId = item.id
  apply.isShow = true
}

onLoadData()
</script>

<template>
  <section class="el-container height100">
    <main class="el-main">
      <section class="el-container is-vertical height100">
        <header class="el-header from-header bdr-b">
          <div>公开群列表({{ items.length }})</div>
          <div>
            <n-input
              placeholder="搜索"
              clearable
              style="width: 200px"
              :on-input="onSearchInput"
              round
            >
              <template #prefix>
                <n-icon :component="SearchOutline" />
              </template>
            </n-input>
          </div>
        </header>

        <main class="el-main flex-center" v-if="items.length == 0">
          <n-empty size="200" description="暂无相关数据">
            <template #icon>
              <img src="@/assets/image/no-data.svg" alt="" />
            </template>
          </n-empty>
        </main>

        <main class="el-main me-scrollbar pd-10" v-else>
          <n-alert type="info" :bordered="false" closable class="mt-b10">
            公开群组可自行添加入群申请，待群主（管理员）同意后方可入群！
          </n-alert>

          <div class="cards">
            <GroupCard
              v-for="item in items"
              :avatar="item.groupAvatar"
              :username="item.groupName"
              :gender="item.gender"
              :motto="item.description"
              :flag="item.memberCount + '/' + item.groupSetting.memberCapacity"
              :is-member="false"
              @click="onInfo(item)"
              @talk="onToTalk(item)"
              @join="onJoin(item)"
            />

            <div
              v-show="search.next"
              class="flex-center more"
              @click="onLoadMore"
            >
              <n-icon
                :component="AddCircleOutline"
                @click.stop="emit('join')"
              />

              &nbsp;加载更多
            </div>
          </div>
        </main>
      </section>
    </main>
  </section>

  <GroupApply
    v-if="apply.isShow"
    :gid="apply.groupId"
    @close="apply.isShow = false"
  />
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

  .more {
    border: 1px solid #cccccc;
    border-radius: 10px;
    cursor: pointer;
    min-height: 97px;
    &:hover {
      border-color: rgb(80 138 254);
    }
  }
}
</style>
