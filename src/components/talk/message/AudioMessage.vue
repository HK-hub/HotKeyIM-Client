<script setup>
import {ref, computed, reactive} from 'vue'
import {NProgress} from 'naive-ui'
import {
    PauseCircleOutline,
    CaretForwardCircleOutline,
    HeadsetOutline,
    Sync,
    LanguageOutline,
} from '@vicons/ionicons5'
import {ServeAudioToText, ServePreviewRecordFile} from '@/api/file'

defineProps({
    src: {
        type: String,
        default: '',
    },
    recordId: {
        type: String,
        default: '',
    },
})

const audioText = reactive({
    text: '',
})

const audioRef = ref(null)
// 语音转文本
const textRef = ref(false)
const state = reactive({
    isAudioPlay: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
    loading: true,
})

const onPlay = () => {
    if (state.isAudioPlay) {
        audioRef.value.pause()
    } else {
        audioRef.value.play()
    }

    state.isAudioPlay = !state.isAudioPlay
}

const onPlayEnd = () => {
    state.isAudioPlay = false
    state.progress = 0
}

const onCanplay = () => {
    state.duration = audioRef.value.duration
    state.loading = false
}

const onError = () => {
}

const onTimeUpdate = () => {
    let audio = audioRef.value
    if (audio.duration == 0) {
        state.progress = 0
    } else {
        state.currentTime = audio.currentTime
        state.progress = (audio.currentTime / audio.duration) * 100
    }
}

// 文本转语音
const onVoiceToText = (record_id) => {
    textRef.value = !textRef.value
    audioText.text = ''
    console.log('开启文本转语音: ', record_id)

    // 获取语音转文本后的内容
    if (textRef.value === true) {
        ServeAudioToText({
            recordId: record_id,
            token: 'token'
        }).then(res => {
            if (res.code == 200 && res.success === true) {
                // 语音识别成功
                console.log('语音识别成功：', res.data)
                audioText.text = res.data
            } else {
                $message.warning(res.data || res.message)
                audioText.text = '语音识别失败!'
            }
        })
    }
}


const getCurrDuration = computed(() => formatSeconds(state.currentTime))

const getTotalDuration = computed(() => formatSeconds(state.duration))

function formatSeconds(value) {
    var theTime = parseInt(value) // 秒
    var theTime1 = 0 // 分
    var theTime2 = 0 // 小时
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60)
        theTime = parseInt(theTime % 60)
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60)
            theTime1 = parseInt(theTime1 % 60)
        }
    }

    var result = '' + parseInt(theTime) //秒
    if (10 > theTime > 0) {
        result = '0' + parseInt(theTime) //秒
    } else {
        result = '' + parseInt(theTime) //秒
    }

    if (10 > theTime1 > 0) {
        result = '0' + parseInt(theTime1) + ':' + result //分，不足两位数，首位补充0，
    } else {
        result = '' + parseInt(theTime1) + ':' + result //分
    }
    if (theTime2 > 0) {
        result = '' + parseInt(theTime2) + ':' + result //时
    }
    return result
}
</script>
<template>
    <div class="audio-message">
        <audio
            ref="audioRef"
            preload="auto"
            type="audio/mp3,audio/wav"
            :src="src"
            @timeupdate="onTimeUpdate"
            @ended="onPlayEnd"
            @canplay="onCanplay"
            @error="onError"
        />
        <div class="videodisc">
            <div
                v-if="state.loading"
                class="disc"
                :class="{ play: state.isAudioPlay }"
            >
                <n-icon size="24" :component="Sync"/>
            </div>

            <div
                v-else
                class="disc"
                :class="{ play: state.isAudioPlay }"
                @click.stop="onPlay"
            >
                <n-icon
                    size="24"
                    v-if="state.isAudioPlay"
                    :component="PauseCircleOutline"
                />
                <n-icon size="24" v-else :component="CaretForwardCircleOutline"/>
            </div>
        </div>
        <div class="detail">
            <div class="text">
                <n-icon size="12" :component="HeadsetOutline"/>
                <span>{{ getCurrDuration }} / {{ getTotalDuration }}</span>
                <n-button text secondary size="tiny" ghost color="blue" @click="onVoiceToText(recordId)">
                    <n-icon size="15" :component="LanguageOutline"/>
                </n-button>
            </div>
            <div class="process">
                <n-progress
                    :percentage="parseInt(state.progress)"
                    :height="5"
                    :show-indicator="false"
                />
            </div>
        </div>
    </div>
    <div class="audio-text-content" v-if="textRef">
       <span>{{ audioText.text }}</span>
    </div>
</template>
<style lang="less" scoped>
.audio-message {
    width: 200px;
    height: 60px;
    border-radius: 5px;
    background: #ffffff;
    display: flex;
    align-items: center;
    border: 1px solid #ff5722;
    overflow: hidden;

    > div {
        height: 100%;
    }

    .videodisc {
        flex-basis: 60px;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        .disc {
            width: 42px;
            height: 42px;
            background: #ff5722;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;

            &.play {
                background: #ff5722;
                animation: spin 3s linear infinite;
            }

            i {
                font-size: 24px;
            }

            &:active i {
                transform: scale(1.2);
            }
        }
    }

    .detail {
        flex: 1 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 10px;

        .text {

            display: flex;
            justify-content: space-between;

            align-items: center;

            width: 90%;
            font-size: 12px;

            i {
                margin-right: 5px;
            }
        }

        .process {
            padding-top: 10px;
            height: 20px;
            width: 90%;
        }
    }
}

.audio-text-content {
    width: 200px;
    height: 60px;
    border-radius: 5px;
    background: #ffffff;
    display: flex;
    align-items: center;
    border: 1px solid #ff5722;
    overflow: hidden;
}


@-webkit-keyframes spin {
    from {
        -webkit-transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(360deg);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
