<script setup>
import {NDropdown} from 'naive-ui'
import {EllipsisHorizontal} from '@vicons/ionicons5'
import {MediaCast,Folder} from '@vicons/carbon'

defineProps({
    type: {
        type: Number,
        default: 1,
    },
    username: {
        type: String,
        default: '',
    },
    online: {
        type: Boolean,
        default: false,
    },
    keyboard: {
        type: Boolean,
        default: false,
    },
    num: {
        type: Number,
        default: 0,
    },
})

// 头部更多信息下拉框
const privateMediaHeaderOptions = [
    {
        label: '屏幕截图',
        key: 'capture',
        // icon: renderIcon(ScreenCut20Regular)
    },
    {
        label: '屏幕录制',
        key: 'record',
        // icon: renderIcon(EditIcon)
    },
    {
        label: '屏幕共享',
        key: 'share',
        // icon: renderIcon(LogoutIcon)
    },
    {
        label: '屏幕控制',
        key: 'control',
        // icon: renderIcon(LogoutIcon)
    },
    {
        label: '白板演示',
        key: 'whiteboard',
    }
]
const groupMediaHeaderOptions = []
const privateHeaderOptions = [
    {
        label: '好友信息',
        key: 'friend',
        // disabled: type == 2,
    },
    {
        label: '删除好友',
        key: 'delete',
        // disabled: type == 2,
    },
]
// 群聊头部
const groupHeaderOptions = [
    {
        label: '群信息',
        key: 'group',
        // disabled: type == 1,
    },
    {
        label: '群公告',
        key: 'notice',
        // disabled: type == 1,
    },
]


const emit = defineEmits(['evnet'])


// 多媒体消息选择事件
const onMediaMessageEvent = key => {
    console.log('多媒体消息事件触发：', key)

    if (key = 'record') {
        // 屏幕录制

    }

}

// 点击群聊文件夹
const onFolderEvent = e => {
    console.log('点击群聊文件夹事件：', e)
}

// 下拉框选择事件
const onEvent = key => {
    emit('evnet', key)
}
</script>

<template>
    <header class="el-header box-header bdr-b">
        <div class="module left-module">
      <span class="tag" :class="{ red: type == 1 }">
        {{ type == 1 ? '好友' : '群组' }}
      </span>
            <span class="nickname">{{ username }}</span>
            <span class="num" v-show="type == 2 && num">({{ num }})</span>
        </div>

        <div class="module center-module" v-if="type == 1">
            <p class="online">
                <span class="online-status" v-show="online"></span>
                <span>{{ online ? '在线' : '离线' }}</span>
            </p>
            <p class="keyboard-status" v-show="keyboard">对方正在输入 ...</p>
        </div>

        <div class="module right-module">
            <!-- 多媒体功能 -->
            <n-dropdown v-if="type == 1" trigger="hover" :options="privateMediaHeaderOptions" @select="onMediaMessageEvent">
                <n-icon :size="24" class="icon" :component="MediaCast"/>
            </n-dropdown>

            <!-- 群聊功能 -->
            <n-icon v-if="type == 2" :size="20" class="icon" :component="Folder" @click="onFolderEvent"/>

            <n-dropdown
                trigger="hover"
                :show-arrow="true"
                :options="type == 1 ? privateHeaderOptions : groupHeaderOptions"
                placement="bottom-end"
                @select="onEvent"
            >
                <n-icon :size="24" class="icon" :component="EllipsisHorizontal"/>
            </n-dropdown>
        </div>
    </header>
</template>

<style lang="less" scoped>
.box-header {
    height: 60px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;

    .module {
        height: 100%;
        display: flex;
        align-items: center;
    }

    .left-module {
        padding-right: 5px;
        width: 200px;

        .tag {
            background: rgb(81 139 254);
            height: 18px;
            line-height: 18px;
            padding: 1px 3px;
            font-size: 10px;
            color: white;
            border-radius: 3px;
            margin-right: 8px;
            flex-shrink: 0;

            &.red {
                background: #f97348;
            }
        }

        .nickname {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .center-module {
        flex-direction: column;
        justify-content: center;

        .online {
            color: #cccccc;
            font-weight: 300;
            font-size: 15px;
            width: 50px;
            text-align: center;

            &.color {
                color: #1890ff;
            }

            .online-status {
                position: relative;
                top: -1px;
                display: inline-block;
                width: 6px;
                height: 6px;
                vertical-align: middle;
                border-radius: 50%;
                position: relative;
                background-color: #1890ff;
                margin-right: 5px;

                &:after {
                    position: absolute;
                    top: -1px;
                    left: -1px;
                    width: 100%;
                    height: 100%;
                    border: 1px solid #1890ff;
                    border-radius: 50%;
                    -webkit-animation: antStatusProcessing 1.2s ease-in-out infinite;
                    animation: antStatusProcessing 1.2s ease-in-out infinite;
                    content: '';
                }
            }
        }

        .keyboard-status {
            height: 20px;
            line-height: 18px;
            font-size: 10px;
            animation: inputfade 600ms infinite;
            -webkit-animation: inputfade 600ms infinite;
        }
    }

    .right-module {
        width: 200px;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        p {
            cursor: pointer;
            margin: 0 8px;
            font-size: 20px;
            color: #828f95;

            &:active i {
                font-size: 26px;
                transform: scale(1.3);
                transition: ease 0.5s;
                color: red;
            }
        }

        .icon {
            cursor: pointer;
            margin: 0 8px;
        }
    }
}

/* css 动画 */
@keyframes inputfade {
    from {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }

    to {
        opacity: 1;
    }
}

@-webkit-keyframes inputfade {
    from {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }

    to {
        opacity: 1;
    }
}

@-webkit-keyframes antStatusProcessing {
    0% {
        -webkit-transform: scale(0.8);
        transform: scale(0.8);
        opacity: 0.5;
    }

    to {
        -webkit-transform: scale(2.4);
        transform: scale(2.4);
        opacity: 0;
    }
}

@keyframes antStatusProcessing {
    0% {
        -webkit-transform: scale(0.8);
        transform: scale(0.8);
        opacity: 0.5;
    }

    to {
        -webkit-transform: scale(2.4);
        transform: scale(2.4);
        opacity: 0;
    }
}

.tag {
    background: rgb(81 139 254);
    height: 18px;
    line-height: 18px;
    padding: 1px 3px;
    font-size: 10px;
    color: white;
    border-radius: 3px;
    margin-right: 8px;
    flex-shrink: 0;

    &.red-color {
        background: #f97348;
    }
}
</style>
