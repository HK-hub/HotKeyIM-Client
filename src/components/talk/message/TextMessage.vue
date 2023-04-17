<script setup>
import {onMounted} from 'vue'
import {textReplaceEmoji} from '@/utils/emojis'
import {textReplaceLink} from '@/utils/strings'
import {modal} from '@/utils/common'
import UserCardModal from '@/components/user/UserCardModal.vue'
import LinkPreviewCard from '../LinkPreviewCard.vue'

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
    float: {
        type: String,
        default: 'right',
    },
    arrow: {
        type: Boolean,
        default: true,
    },
})

const lickColor = props.float == 'right' ? '#2196F3' : 'rgb(9 149 208)'

// 替换url链接为 a 标签
const textContent = textReplaceLink(props.content, lickColor)

// 生成 url 链接预览标签
const getContentUrlLinks = (content) => {
    // 提取所有的 url 链接
    let exp =
        /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
    const urls = content.match(exp);
    console.log('匹配的 url 链接',urls); // ["https://example.com", "https://google.com"]
    return urls;
}
const urlLinks = getContentUrlLinks(props.content)

onMounted(() => {
    document.querySelectorAll('.text-message .mention').forEach(el => {
        el.onclick = e => {
            if (e.target.dataset.atid > 0) {
                modal(UserCardModal, {
                    uid: parseInt(e.target.dataset.atid),
                })
            }
        }
    })
})
</script>
<template>
    <div
        class="text-message"
        :class="{
      left: float == 'left',
      right: float == 'right',
    }"
    >
        <pre v-html="textReplaceEmoji(textContent)"/>
        <LinkPreviewCard v-if="urlLinks && urlLinks.length > 0" v-for="(item, index) in urlLinks" :url="item"/>
    </div>
</template>
<style lang="less" scoped>
.text-message {
    position: relative;
    min-width: 30px;
    min-height: 30px;
    border-radius: 3px;
    padding: 3px;
    color: rgb(13, 26, 38);
    background: #eff0f1;

    &.right {
        color: rgb(13, 26, 38);
        background: #DAF3FDFF;
    }

    pre {
        white-space: pre-wrap;
        overflow: hidden;
        word-break: break-word;
        word-wrap: break-word;
        font-size: 14px;
        padding: 3px 10px;
        font-family: 'Microsoft YaHei';
        line-height: 25px;

        :deep(.emoji) {
            vertical-align: text-bottom;
            margin: 0 5px;
        }

        img {
            vertical-align: text-bottom;
        }
    }

    .link-preview {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #ddd;
    }

    .link-preview__image img {
        display: block;
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
    }

    .link-preview__info {
        flex: 1;
    }

    .link-preview__title {
        font-size: 1.2rem;
        margin: 0;
    }

    .link-preview__description {
        font-size: 1rem;
        color: #666;
        margin: 0;
    }


}
</style>
