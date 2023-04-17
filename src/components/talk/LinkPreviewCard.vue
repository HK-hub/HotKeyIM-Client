<script setup>
import {ref, defineProps, reactive, onMounted} from 'vue'
import {ServeUrlPreviewMetaData}from '@/api/chat'

const props = defineProps({
    url: {
        type: String,
        default: ''
    }
})

/*const loading = ref(true)
let error = ref(false)
const metaData = reactive({
    url: '',
    title: '',
    description: '',
    imageUrl: '',
    domain: '',
})*/


onMounted(() => {

    /*// 获取元数据
    ServeUrlPreviewMetaData({
        url: props.url
    }).then(res => {
        if (res.code == 200 && res.success) {
            metaData.value = res.data
            loading.value = false
        } else {
            loading.value = false
            error.value = true
        }
    }).catch(res => {
        error.value = true
    })*/

})
</script>

<template>
<!--    <div>
        <h2>URL 预览信息</h2>
        <h3>{{ metaData.title }}</h3>
        <p>{{ metaData.description }}</p>
        <p>{{ metaData.domain }}</p>
        <img :src="metaData.imageUrl" />
    </div>-->
</template>

<style lang="less" scoped>
.link-preview {
    width: 90%;
    height: 30px;
}

</style>

