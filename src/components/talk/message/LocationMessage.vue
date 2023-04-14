<script setup>
import {ref, reactive, defineProps} from 'vue'
import {NCard, NTabs, NTabPane} from 'naive-ui'

const props = defineProps({
    address: {
        type: String,
        default: '',
    },
    position: {
        type: String,
        default: ''
    },
    location: {
        type: Object,
        default: {}
    },
    recordId: {
        type: String,
        default: '',
    },
})


</script>


<template>
    <n-card content-style="padding: 0;" hoverable embedded>
        <n-tabs
            type="line"
            size="large"
            :tabs-padding="20"
            pane-style="padding: 20px;"
        >
            <n-tab-pane name="位置">
                <p>{{location.country}} 经纬度:[{{location.longitude}},{{location.latitude}}]</p>
                <a href="https://gaode.com/" target="_blank">{{address}} {{location.number}}</a>
            </n-tab-pane>
            <n-tab-pane name="地图">
                ROCKLIFE
            </n-tab-pane>
        </n-tabs>
    </n-card>
</template>

<style scoped>
.n-card {
    max-width: 400px;
}
a:hover {
    color: #3a8ee6;
}
</style>