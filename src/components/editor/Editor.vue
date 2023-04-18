<script setup>
import {reactive, ref, markRaw, computed, onMounted} from 'vue'
import {useDialogueStore} from '@/store/dialogue'
import {useEditorStore} from '@/store/editor'

import {NPopover, NDialog} from 'naive-ui'
import {
    HappyOutline,
    LocationOutline,
    ImageOutline,
    MicOutline,
    VideocamOutline,
    DocumentAttachOutline,
    CodeSlashOutline,
    PodiumOutline,
    TimeOutline,
} from '@vicons/ionicons5'
import {PhoneVoice, MediaCast, ChevronSortDown} from '@vicons/carbon'
import {emitCall} from '@/utils/common'
import MeEditorImage from './MeEditorImage.vue'
import MeEditorVote from './MeEditorVote.vue'
import MeEditorEmoticon from './MeEditorEmoticon.vue'
import MeEditorCode from './MeEditorCode.vue'
import MeEditorRecorder from './MeEditorRecorder.vue'
import MeMapContainer from './MeMapContainer.vue'
import MeMention from './MeMention.vue'
import MeVideoCaller from './MeVideoCaller.vue'


const emit = defineEmits(['editor-event'])
const dialogueStore = useDialogueStore()
const editorStore = useEditorStore()
const props = defineProps({
    show_vote: {
        type: Boolean,
        default: false,
    },
    uid: {
        type: String,
        default: 0,
    },
    talk_type: {
        type: Number,
        default: 0,
    },
    receiver_id: {
        type: Number,
        default: 0,
    },
})

let lastSelection = null
let lastEditRange = null

onMounted(() => {
    const fn = function () {
        // 设置最后光标对象
        // lastEditRange = window.getSelection().getRangeAt(0)

        let selection = window.getSelection
            ? window.getSelection()
            : document.selection
        let range = selection.createRange
            ? selection.createRange()
            : selection.getRangeAt(0)

        lastSelection = selection
        lastEditRange = range
    }

    let editor = document.getElementById('me-editor')
    editor.onclick = fn // 编辑框点击事件
    editor.onkeyup = fn // 编辑框按键弹起事件

    // 粘贴事件
    editor.addEventListener('paste', e => {

        console.log('粘贴事件e:', e)
        e.stopPropagation();
        e.preventDefault();

        const cbd = e.clipboardData;
        const ua = window.navigator.userAgent;
        // 如果剪切板没有数据直接返回
        if (!(e.clipboardData && e.clipboardData.items)) {
            return;
        }

        // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
        if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" &&
            cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" &&
            ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
            return;
        }

        // 粘贴数据类型判断
        const item = cbd.items[cbd.items.length - 1];
        if (item.kind == 'file') {
            // 判断是否是图片类型
            if (!item.type.match('^image/')) {
                // 不是图片
                $message.warning('不支持粘贴该类型:' + item.type)
                return;
            }
            const blob = item.getAsFile();
            if (blob.size === 0) {
                return;
            }
            // blob 就是从剪切板获得的文件 可以进行上传或其他操作
            /*-----------------------与后台进行交互 start-----------------------*/
            /*var data = new FormData();
            data.append('discoverPics', blob);
            $.ajax({
                url: '/discover/addDiscoverPicjson.htm',
                type: 'POST',
                cache: false,
                data: data,
                processData: false,
                contentType: false,
                success:function(res){
                    var obj = JSON.parse(res);
                    var wrap = $('#editDiv');
                    var file = obj.data.toString();
                    var img = document.createElement("img");
                    img.src = file;
                    wrap.appendChild(img);
                },error:function(){

                }
            })*/
            /*-----------------------与后台进行交互 end-----------------------*/
            /*-----------------------不与后台进行交互 直接预览start-----------------------*/
            const reader = new FileReader();

            const image = document.createElement('img')
            image.className = 'editor-paste-image'
            image.style.maxWidth = '50%'
            image.style.maxHeight = '50%'
            reader.onload = (function (aImg) {
                return function (e) {
                    aImg.src = e.target.result;
                };
            })(image);
            reader.readAsDataURL(blob);

            lastEditRange.insertNode(image)
            lastEditRange.collapse(false)
            lastSelection.removeAllRanges()
            lastSelection.addRange(lastEditRange)
        } else if (item.kind == 'string') {
            // 文本内容
            var text = '', event = (e.originalEvent || e);
            if (event.clipboardData && event.clipboardData.getData) {
                text = event.clipboardData.getData('text/plain');
            } else if (window.clipboardData && window.clipboardData.getData) {
                text = window.clipboardData.getData('Text');
            }
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, text);
            } else {
                document.execCommand('paste', false, text);
            }
        } else {
            $message.warning('不支持粘贴该类型')
        }
    })
})

const isShowEditorVote = ref(false)
const isShowEditorCode = ref(false)
const isShowEditorRecorder = ref(false)
// 语音通话
// const isShowEditorVoice = ref(false)
// 视频通话
const isShowEditorVideo = ref(false)
const isShowEditorLocation = ref(false)
// 多媒体：截图，视频录制，白板演示，屏幕控制
const isShowEditorMultimedia = ref(false)
const fileImageRef = ref(null)
const uploadFileRef = ref(null)
const emoticonRef = ref(null)

// 谈话类型
const conversationType = reactive({
    type: 1 // 默认类型
})
const imagePreview = reactive({
    show: false,
    file: null,
})

// 键盘监听事件
const onKeydownEvent = e => {
    let text = e.target.innerHTML.toString().replace(/<br>/g, '/n')

    // 更新草稿
    dialogueStore.updateEditorText(text)

    // 空信息禁止换行
    if (e.keyCode == 13 && !text) {
        return e.preventDefault()
    }

    // @群成员
    // 这里需要判断是否是群聊，非群聊不需要@功能
    if (e.shiftKey && e.keyCode == 50 && dialogueStore.isGroupTalk) {
        lastEditRange = window.getSelection().getRangeAt(0)

        editorStore.updateMentionStatus(true)

        return e.preventDefault()
    }

    // 回车发送消息
    if (e.keyCode == 13 && e.shiftKey == false && text) {
        if (text.length > 1024) {
            return $message.info('发送内容超长，请分条发送')
        }

        emit(
            'editor-event',
            emitCall('text_event', text, isBool => {
                if (isBool) {
                    e.target.innerHTML = ''
                }
            })
        )

        return e.preventDefault()
    }
}

// 输入事件监听
const onInputEvent = e => {
    emit('editor-event', emitCall('input_event', e.target.innerHTML.toString()))
}

// 推送图片事件
const onImageEvent = ({callBack}) => {
    const msg = emitCall('image_event', imagePreview.file, isBool => {
        callBack(isBool)
    })

    emit('editor-event', msg)
}

const onVoteEvent = data => {
    const msg = emitCall('vote_event', data, isBool => {
        if (isBool) {
            isShowEditorVote.value = false
        }
    })

    emit('editor-event', msg)
}

const editorInsertText = text => {
    // 获取编辑框对象
    var edit = document.getElementById('me-editor')
    // 编辑框设置焦点
    edit.focus()
    // 获取选定对象
    var selection = getSelection()
    // 判断是否有最后光标对象存在
    if (lastEditRange) {
        // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
        selection.removeAllRanges()
        selection.addRange(lastEditRange)
    }

    // 判断选定对象范围是编辑框还是文本节点
    if (selection.anchorNode.nodeName != '#text') {
        // 如果是编辑框范围。则创建表情文本节点进行插入
        var emojiText = document.createTextNode(text)

        if (edit.childNodes.length > 0) {
            // 如果文本框的子元素大于0，则表示有其他元素，则按照位置插入表情节点
            for (var i = 0; i < edit.childNodes.length; i++) {
                if (i == selection.anchorOffset) {
                    edit.insertBefore(emojiText, edit.childNodes[i])
                }
            }
        } else {
            // 否则直接插入一个表情元素
            edit.appendChild(emojiText)
        }
        // 创建新的光标对象
        var range = document.createRange()
        // 光标对象的范围界定为新建的表情节点
        range.selectNodeContents(emojiText)
        // 光标位置定位在表情节点的最大长度
        range.setStart(emojiText, emojiText.length)
        // 使光标开始和光标结束重叠
        range.collapse(true)
        // 清除选定对象的所有光标对象
        selection.removeAllRanges()
        // 插入新的光标对象
        selection.addRange(range)
    } else {
        // 如果是文本节点则先获取光标对象
        var range = selection.getRangeAt(0)
        // 获取光标对象的范围界定对象，一般就是textNode对象
        var textNode = range.startContainer
        // 获取光标位置
        var rangeStartOffset = range.startOffset
        // 文本节点在光标位置处插入新的表情内容
        textNode.insertData(rangeStartOffset, text)
        // 光标移动到到原来的位置加上新内容的长度
        range.setStart(textNode, rangeStartOffset + text.length)
        // 光标开始和光标结束重叠
        range.collapse(true)
        // 清除选定对象的所有光标对象
        selection.removeAllRanges()
        // 插入新的光标对象
        selection.addRange(range)
    }

    // 无论如何都要记录最后光标对象
    lastEditRange = selection.getRangeAt(0)
}

// 编辑器插入表情
const editorInsertMention = (atid, atname) => {
    let node = document.createElement('span')
    node.className = 'mention'
    node.contentEditable = false
    node.textContent = `@${atname}`
    node.dataset['atid'] = atid
    node.dataset['atname'] = `@${atname}`
    lastEditRange.insertNode(node)

    window.getSelection().collapseToEnd()
}

const onEmoticonEvent = data => {
    if (data.type == 1) {
        editorInsertText(data.value)
    } else {
        emit('editor-event', emitCall('emoticon_event', data.value))
    }

    emoticonRef.value.setShow(false)
}

// 发送代码消息事件
const onCodeEvent = data => {
    const msg = emitCall('code_event', data, isBool => {
        isShowEditorCode.value = false
    })

    emit('editor-event', msg)
}


function uploadImageChange(e) {
    openImagePreview(e.target.files[0])
}

function openImagePreview(file) {
    imagePreview.file = file
    imagePreview.show = true
}

function closeImagePreview() {
    imagePreview.file = null
    imagePreview.show = false
}

const onUploadFile = e => {
    let file = e.target.files[0]
    if (/\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name)) {
        return openImagePreview(file)
    }

    emit('editor-event', emitCall('file_event', file))
}

const onRecorderEvent = file => {
    emit('editor-event', emitCall('file_event', file))
    isShowEditorRecorder.value = false
}

// 坐标：经纬度
const onMapLocationEvent = data => {
    const msg = emitCall('location_event', data, isBool => {
        isShowEditorLocation.value = false
    })
    emit('editor-event', msg)
    isShowEditorLocation.value = false
}

//

const navs = reactive([
    {
        title: '图片',
        icon: markRaw(ImageOutline),
        show: true,
        click: () => {
            fileImageRef.value.click()
        },
    },
    {
        title: '附件',
        icon: markRaw(DocumentAttachOutline),
        show: true,
        click: () => {
            uploadFileRef.value.click()
        },
    },
    {
        title: '代码',
        icon: markRaw(CodeSlashOutline),
        show: true,
        click: () => {
            isShowEditorCode.value = true
        },
    },
    {
        title: '语音消息',
        icon: markRaw(MicOutline),
        show: true,
        click: () => {
            isShowEditorRecorder.value = true
        },
    },
    {
        title: '语音通话',
        icon: markRaw(PhoneVoice),
        show: true,
        click: () => {
            // isShowEditorVoice.value = true
            // 语音通话
            conversationType.type = 1
            isShowEditorVideo.value = true
        },
    },
    {
        title: '视频通话',
        icon: markRaw(VideocamOutline),
        show: true,
        click: () => {
            console.log('视频通话点击：', isShowEditorVideo)
            conversationType.type = 2
            isShowEditorVideo.value = true
        },
    },
   /* {
        title: '多媒体',
        icon: markRaw(MediaCast),
        show: true,
        click: () => {
            isShowEditorMultimedia.value = true
        },
    },*/
    {
        title: '地理位置',
        icon: markRaw(LocationOutline),
        show: true,
        click: () => {
            isShowEditorLocation.value = true
        },
    },
    {
        title: '群投票',
        icon: markRaw(PodiumOutline),
        show: computed(() => props.show_vote),
        click: () => {
            isShowEditorVote.value = true
        },
    },
    {
        title: '历史记录',
        icon: markRaw(TimeOutline),
        show: true,
        click: () => {
            emit('editor-event', emitCall('history_event'))
        },
    },
])

const onMention = (id, name) => {
    editorInsertMention(id, name)
    editorStore.updateMentionStatus(false)
}
</script>

<template>
    <section class="el-container editor">
        <aside class="el-aside" v-show="editorStore.mention.isShow">
            <MeMention
                @on-select="onMention"
                @on-close="editorStore.updateMentionStatus(false)"
            />
        </aside>

        <section class="el-container is-vertical">

            <header class="el-header toolbar bdr-t bdr-b">
                <div class="tools">
                    <n-popover
                        placement="top-start"
                        trigger="click"
                        raw
                        :show-arrow="false"
                        :width="300"
                        ref="emoticonRef"
                        style="
              margin-bottom: 12px;
              margin-left: -10px;
              width: 500px;
              height: 250px;
              border-radius: 5px;
              overflow: hidden;
            "
                    >
                        <template #trigger>
                            <div class="item pointer">
                                <n-icon size="18" class="icon" :component="HappyOutline"/>
                                <p class="tip-title">表情符号</p>
                            </div>
                        </template>

                        <MeEditorEmoticon @on-select="onEmoticonEvent"/>
                    </n-popover>

                    <!--消息类型选择-->
                    <div
                        class="item pointer"
                        v-for="nav in navs"
                        :key="nav.title"
                        v-show="nav.show"
                        @click="nav.click"
                    >
                        <n-icon size="18" class="icon" :component="nav.icon"/>
                        <p class="tip-title">{{ nav.title }}</p>
                    </div>
                </div>
                <div class="tips">按Enter发送 / Shift+Enter 换行</div>
            </header>

            <!-- 文本输入框 -->
            <main class="el-main o-hidden height100">
                <div
                    id="me-editor"
                    contenteditable="true"
                    @keydown="onKeydownEvent($event)"
                    @input="onInputEvent($event)"
                    placeholder="你想要说点什么呢..."
                />
            </main>
        </section>
    </section>

    <form enctype="multipart/form-data" style="display: none">
        <input
            type="file"
            ref="fileImageRef"
            accept="image/*"
            @change="uploadImageChange"
        />
        <input type="file" ref="uploadFileRef" @change="onUploadFile"/>
    </form>

    <MeEditorImage
        v-if="imagePreview.show"
        :file="imagePreview.file"
        @close="closeImagePreview"
        @submit="onImageEvent"
    />

    <MeEditorVote
        v-if="isShowEditorVote"
        @close="isShowEditorVote = false"
        @submit="onVoteEvent"
    />

    <MeEditorCode
        v-if="isShowEditorCode"
        @on-submit="onCodeEvent"
        @close="isShowEditorCode = false"
    />

    <MeEditorRecorder
        v-if="isShowEditorRecorder"
        @on-submit="onRecorderEvent"
        @close="isShowEditorRecorder = false"
    />

    <!-- 地图组件 -->
    <MeMapContainer
        v-if="isShowEditorLocation"
        @on-submit="onMapLocationEvent"
        @close="isShowEditorLocation = false"
    />

    <!-- 音视频通话 -->
    <MeVideoCaller
        v-if="isShowEditorVideo"
        :conversationType="conversationType.type"
        :receiver_id="receiver_id"
        :talk_type="talk_type"
        @on-submit="onRecorderEvent"
        @close="isShowEditorVideo = false"/>


</template>
<style lang="less" scoped>
.editor {
    height: 100%;

    .toolbar {
        height: 38px;
        display: flex;

        .tools {
            height: 100%;
            flex: auto;
            display: flex;

            .item {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 35px;
                margin: 0 2px;
                position: relative;
                user-select: none;

                .tip-title {
                    display: none;
                    position: absolute;
                    top: 40px;
                    left: 0px;
                    line-height: 26px;
                    background-color: rgb(241 241 241 / 90%);
                    color: #484848;
                    min-width: 20px;
                    font-size: 12px;
                    padding: 0 5px;
                    border-radius: 2px;
                    white-space: pre;
                    user-select: none;
                }

                &:hover {
                    background-color: #f5f5f5;

                    .tip-title {
                        display: block;
                    }
                }
            }
        }

        .tips {
            width: 200px;
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #ccc;
            justify-content: flex-end;
            padding-right: 20px;
            user-select: none;
        }
    }
}

#me-editor {
    width: 100%;
    height: inherit;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    overflow-y: auto;
    color: #464545;

    padding: 8px;
    box-sizing: border-box;
    white-space: pre-wrap;
    word-break: break-word;
    word-wrap: break-word;
    -webkit-user-select: text;
    cursor: text;
    outline: none;

    .editor-paste-image {

    }
}

#me-editor[contenteditable]:empty:before {
    content: attr(placeholder);
    color: #464545;
    font-size: 12px;
    font-weight: 400;
}

#me-editor[contenteditable]:focus {
    content: none;
}

</style>
