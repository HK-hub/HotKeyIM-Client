<script setup>
import { defineComponent, shallowRef, defineProps} from 'vue'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'


const props = defineProps({
    src: {
        type: String,
        default: 'https://vjs.zencdn.net/v/oceans.mp4',
    }
})

const player = shallowRef()
const handleMounted = (payload) => {
    player.value = payload.player
}

// 处理事件
const handleEvent = (evt) => {

}

// 数据加载完成：计算封面
const handleLoadeddata = (event) => {
    let video = event.target;
    // video.height = video.clientHeight;
    let canvas = document.createElement("canvas"); // 创建 canvas
    const ctx = canvas.getContext("2d");
    video.currentTime = 1; // 第一帧
    video.oncanplay = () => {
        canvas.width = video.clientWidth; // 获取视频宽度
        canvas.height = video.clientHeight; //获取视频高度
        const img = new Image(); // 这里使用img是为了解决视频跨域 canvas.toDataURL会提示错误的问题
        img.onload = function () {
            // canvas绘图
            ctx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
            // 转换成base64形式并设置封面
            video.poster = canvas.toDataURL("image/jpeg", 1); // 截取后的视频封面
        }
    }
}

</script>


<template>
    <VideoPlayer
        class="video-player vjs-big-play-centered"
        crossorigin="anonymous"
        playsinline
        controls
        v-model:src="props.src"
        :autoplay="false"
        :volume="0.6"
        :fluid="false"
        :muted="true"
        :playback-rates="[0.5, 0.75, 1.0,1.5, 2.0]"
        @mounted="handleMounted"
        @ready="handleEvent($event)"
        @play="handleEvent($event)"
        @pause="handleEvent($event)"
        @ended="handleEvent($event)"
        @loadeddata="handleLoadeddata($event)"
        @waiting="handleEvent($event)"
        @playing="handleEvent($event)"
        @canplay="handleEvent($event)"
        @canplaythrough="handleEvent($event)"
        @timeupdate="handleEvent(player?.currentTime())"
    />
</template>


<style lang="less" scoped>

.video-player {
    background-color: black;
    width: 340px;
    height: 220px;
    border-radius: 5px;
}
</style>