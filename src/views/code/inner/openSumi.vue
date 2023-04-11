<script setup>
import { defineComponent, h, ref } from "vue";
import { NIcon,NMenu } from "naive-ui";
import {
    BookOutline as BookIcon,
    PersonOutline as PersonIcon,
    WineOutline as WineIcon
} from "@vicons/ionicons5";

// 部署参考：https://opensumi.com/
const url = ref('http://47.120.6.12:7070/')
</script>

<template>
    <div style="min-height: 500px;width: 100%;" class="iframe-body-sty">
        <iframe width="1920px" height="920px"
                id="iframeId" :src="url" class="pc iframe">
        </iframe>
    </div>

</template>

<style lang="less" scoped>
#iframeId {
    height: 100%;
    width: 100%;
}

.iframe-body-sty{
    position: relative;
    overflow: hidden;
    height:100%;
    width: 100%;
    background-color: #daf3fd;}
.iframe-body-sty>#iframe-shrink{position: absolute;transform:scale(0.55);left: -400px;top: -170px;}
</style>


