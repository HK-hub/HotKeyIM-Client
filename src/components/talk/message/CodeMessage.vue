<script setup>
import {ref} from 'vue'
import {CloseCircleSharp} from '@vicons/ionicons5'

defineProps({
    code: {
        type: String,
        default: '',
    },
    lang: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    }
})

const isFullCat = ref(false)
</script>
<template>
    <div class="code-message">
        <div class="more pointer flex-center" @click="isFullCat = true">
            <div class="code-message-title">
                <span class="code-name">{{name}}</span>
                <span class="text">详情</span>
            </div>
        </div>

        <highlightjs :language="lang" :code="code"/>

        <div v-if="isFullCat" class="full-code">
            <div class="close pointer" @click="isFullCat = false">
                <n-icon
                    :size="50"
                    color="rgb(173 168 168)"
                    :component="CloseCircleSharp"
                />
            </div>

            <highlightjs :language="lang" :code="code" @contextmenu.stop/>
        </div>
    </div>
</template>
<style lang="less" scoped>
.code-message {
    border-radius: 10px;
    overflow: hidden;
    overflow-x: auto;
    min-width: 20px;
    background-color: #f5f5f5;
    position: relative;

    .more {
        position: relative;
        height: 35px;
        font-size: 14px;
        color: #ffffff;
        display: flex;
        justify-content: space-around;
        padding: 0 15px;
        background: #3d3d3e;

        .code-message-title{
            //transform: translateY(-50%);
            display: flex;
            align-items: center;
            .text {
                position: absolute;
                right: 0;
                transform: translate(-50%);
                display: none;
            }
        }

        &:hover {
            .text {
                display: inline-block;
            }
        }

        &:before {
            position: absolute;
            left: 12px;
            z-index: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fc625d;
            box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
            content: ' ';
        }
    }

  :deep(pre code.hljs) {
    padding: 10px;
    max-height: 500px;
    min-height: 80px;
    min-width: 100px;
    overflow-y: hidden;
    box-sizing: border-box;
  }
}

.full-code {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 3;
    width: 100vw;
    height: 100vh;

    .close {
        position: fixed;
        right: 30px;
        top: 30px;
        height: 50px;
        width: 50px;
        z-index: 9999999;
    }

    :deep(pre) {
        width: 100%;
        height: 100vh;

        overflow: auto;
        padding: 0;
        box-sizing: border-box;

        .hljs {
            overflow-y: auto !important;
            max-height: unset !important;
        }

        code {
            height: 100%;
        }
    }
}
</style>
