<script setup>
import {NImage} from 'naive-ui'
import {getImageInfo} from '@/utils/functions'

defineProps({
    src: {
        type: String,
        default: '',
    },
    float: {
        type: String,
        default: 'right',
    },
})

/**
 * 通过图片Url获取图片等比例缩放的宽度和高度信息
 *
 * @param {String} src
 * @param {Number} width
 */
const img = (src, width = 200) => {
    console.log(src, width)
    const info = getImageInfo(src)

    if (info.width < width) {
        return {
            width: `${info.width}px`,
            height: `${info.height}px`,
        }
    }

    return {
        width: width + 'px',
        height: parseInt(info.height / (info.width / width)) + 'px',
    }
}
</script>
<template>
    <section
        class="image-message"
        :class="{ left: float === 'left' }"
        :style="img(src, 200)"
    >
        <n-image :src="src"/>
    </section>
</template>
<style lang="less" scoped>
.image-message {
    overflow: hidden;
    padding: 5px;
    border-radius: 5px;
    background: #DAF3FDFF;
    min-width: 30px;
    min-height: 30px;

    &.left {
        background-color: #eff0f1;
    }

    :deep(.n-image img) {
        width: 100%;
        height: 100%;
        border-radius: 2px;
        // background: #ffffff;
    }
}
</style>
