<script setup>
import {resolveDynamicComponent} from 'vue'
import {useScriptTag} from '@vueuse/core'

useScriptTag('../../utils/rtc/utils/adapter.js')
useScriptTag('../../utils/rtc/utils/DetectRTC.js')
useScriptTag('../../utils/rtc/utils/snackbar.js')
useScriptTag('../../utils/rtc/utils/autolink.js')
useScriptTag('../../utils/rtc/utils/utils.js')
useScriptTag('../../event/socket/rtc.js')
useScriptTag()


</script>


<template>

    <div>
        <h1>欢迎来到房间</h1>
    </div>
    <div class="loader-ball" id="loader-ball"></div>
    <p id="remote-video-text"></p>
    <video id="remote-video" autoplay playsinline></video>
    <div id="moveable">
        <p id="local-video-text">No webcam input</p>
        <video id="local-video" autoplay muted playsinline></video>
    </div>

    <div id="entire-chat">
        <div id="chat-zone">
            <div class="chat-messages" id="chat-messages"></div>
        </div>
        <form class="compose">
            <input type="text" placeholder="Type a message"/>
        </form>
    </div>

    <div class="multi-button">
        <div class="buttonContainer">
            <button class="hoverButton" onclick="{muteMicrophone()}">
                <i id="mic-icon" class="fas fa-microphone fa-xs"></i>
            </button>
            <div class="HoverState" id="mic-text">Mute</div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" onclick="{openFullscreen()}">
                <i class="fas fa-compress fa-xs"></i>
            </button>
            <div class="HoverState">Fullscreen</div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" onclick="{pauseVideo()}">
                <i class="fas fa-video fa-xs" id="video-icon"></i>
            </button>
            <div class="HoverState" id="video-text">Pause Video</div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" id="share-button" onclick="{swap()}">
                <i id="swap-icon" class="fas fa-desktop fa-xs"></i>
            </button>
            <div class="HoverState" id="swap-text">Share Screen</div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" onclick="{toggleChat()}">
                <i id="chat-icon" class="fas fa-comment fa-xs"></i>
            </button>
            <div class="HoverState" id="chat-text">Show Chat</div>
        </div>

        <div class="buttonContainer">
            <button
                class="hoverButton"
                id="pip-button"
                onclick="{togglePictureInPicture()}"
            >
                <i class="fas fa-external-link-alt fa-xs"></i>
            </button>
            <div class="HoverState" id="pip-text">Toggle Picture in Picture</div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" onclick="{requestToggleCaptions()}">
                <i class="fas fa-closed-captioning fa-xs"></i>
            </button>
            <div class="HoverState" id="caption-button-text">
                Start Live Caption
            </div>
        </div>

        <div class="buttonContainer">
            <button class="hoverButton" onclick="{toggleWhiteBoard()}">
                <i class="fas fa-chalkboard fa-xs"></i>
            </button>
            <div class="HoverState" id="whiteboard-text">Show Whiteboard</div>
        </div>

        <div class="buttonContainer">
            <button
                class="hoverButton"
                onclick="{window.location.href = '/newrtc'}"
            >
                <i class="fas fa-phone-slash fa-xs"></i>
            </button>
            <div class="HoverState">End Call</div>
        </div>
    </div>

    <input type="hidden" id="copy-input"/>

    <canvas
        id="whiteboard"
        class="whiteboard"
        style="display: none;"
        width="600"
        height="600"
    >
        抱歉，您的浏览器不支持canvas元素
    </canvas>
</template>


<style lang="css" scoped>
@import '../../assets/css/multi/rtc.css';
@import '../../assets/css/multi/loading-ball.css';
@import '../../assets/css/multi/snackbar.css';
@import '../../assets/css/fontawesome/css/free.min.css';
@import '../../assets/css/fontawesome/css/v4-shims.min.css';
@import '../../assets/css/fontawesome/css/font-face.min.css';


</style>