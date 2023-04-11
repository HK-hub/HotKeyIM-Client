<script setup>
import {ref, h, computed, watch, markRaw, reactive, onMounted} from 'vue'
import {useRouter,RouterLink} from 'vue-router'
import IMLayout from '@/views/layout/IMLayout.vue'
import SubViewLayout from '@/components/base/SubViewLayout.vue'
import {NGrid, NGridItem, NButton, NResult, NCard,NIcon,NMenu} from 'naive-ui'
import {useUserStore} from '@/store/user'
import {useTalkStore} from '@/store/talk'
import {defAvatar} from '@/constant/default'
import {
    BookOutline as BookIcon,
    PersonOutline as PersonIcon,
    WineOutline as WineIcon
} from "@vicons/ionicons5";

const activeKey = ref(null)

const menuOptions = [
    {
        label: () => h(
            RouterLink,
            {
                to: {
                    path: '/code/online'
                }
            },
            { default: () => 'WebIDE' }
        ),
        key: "online",
        icon: renderIcon(BookIcon)
    },
    {
        label: () => h(
            RouterLink,
            {
                to: {
                    path: '/code/openSumi'
                }
            },
            { default: () => 'OpenSumi' }
        ),
        key: "openSumi",
        icon: renderIcon(BookIcon)
    },
    {
        label: () => h(
            RouterLink,
            {
                to: {
                    path: '/code/editor'
                }
            },
            { default: () => 'Editor' }
        ),
        key: "editor",
        icon: renderIcon(BookIcon)
    },
    {
        label: "舞，舞，舞",
        key: "dance-dance-dance",
        icon: renderIcon(BookIcon),
        children: [
            {
                type: "group",
                label: "人物",
                key: "people",
                children: [
                    {
                        label: "叙事者",
                        key: "narrator",
                        icon: renderIcon(PersonIcon)
                    },
                    {
                        label: "羊男",
                        key: "sheep-man",
                        icon: renderIcon(PersonIcon)
                    }
                ]
            },
            {
                label: "饮品",
                key: "beverage",
                icon: renderIcon(WineIcon),
                children: [
                    {
                        label: "威士忌",
                        key: "whisky"
                    }
                ]
            },
            {
                label: "食物",
                key: "food",
                children: [
                    {
                        label: "三明治",
                        key: "sandwich"
                    }
                ]
            },
            {
                label: "过去增多，未来减少",
                key: "the-past-increases-the-future-recedes"
            }
        ]
    }
];
function renderIcon(icon) {
    return () => h(NIcon, null, { default: () => h(icon) });
}

</script>

<template>
    <IMLayout :index="4">
        <n-menu v-model:value="activeKey" mode="horizontal" :options="menuOptions" />
        <router-view></router-view>
    </IMLayout>
</template>

<style lang="less" scoped>

</style>
