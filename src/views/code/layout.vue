<script setup>
import {ref, computed, watch, markRaw, reactive, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import IMLayout from '@/views/layout/IMLayout.vue'
import SubViewLayout from '@/components/base/SubViewLayout.vue'
import {NGrid, NGridItem, NButton, NResult, NCard} from 'naive-ui'
import {useUserStore} from '@/store/user'
import {useTalkStore} from '@/store/talk'
import {defAvatar} from '@/constant/default'
import {
    GitNetworkOutline,
    PersonAddOutline,
    BalloonOutline,
    PeopleOutline,
} from '@vicons/ionicons5'
</script>

<template>
    <IMLayout :index="4">
        <h1>Code</h1>
    </IMLayout>
</template>

<style lang="less" scoped>

</style>
