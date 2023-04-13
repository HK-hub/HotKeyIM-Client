<script setup>
import AMapLoader from '@amap/amap-jsapi-loader';
import {ref, shallowRef, onMounted, reactive, defineProps} from 'vue'
import {NModal, NButton} from 'naive-ui'

// 当前经纬度
const props = defineProps({
    latitude: {
        type: Number,
        // default: 106.53679002310419,
    },
    longitude: {
        type: Number,
        // default: 29.460045980355513,
    },
    current_position: {
        type: Array,
        default: []
    },
    path: {
        type: Array,
        default: [],
    }
})

const address = ref('')
const state = reactive({
    path: [],
    current_position: [],
    latitude: null,
    longitude: null,
    address: ''
});

const emit = defineEmits(['close', 'on-submit'])
// show
const isShow = ref(true)

// 地图数据结构
let map = shallowRef(null);
let geocoder = null;
let MyMap = null;

// 初始化地图
window._AMapSecurityConfig = {
    securityJsCode: '76bb78ca07b1f2992e1bef5d38f6162e',
}



const initMap = () => {
    console.log('初始化地图开始：')

    window._AMapSecurityConfig = {
        securityJsCode: '76bb78ca07b1f2992e1bef5d38f6162e',
    }
    AMapLoader.load({
        key: "17e971cb5d0cb7768c5c2e6b8f8fa893", // 申请好的Web端开发者Key
        "version": "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        "plugins": ['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geocoder'],           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    }).then((AMap) => {
        MyMap = AMap;//保存AMap
        init();
    }).catch(e => {
        console.log(e);
    })
}

const init = () => {
    //绘制MyMap实例地图
    map = new MyMap.Map('container', {
        zoom: 14, //初始地图级别
        center: [121.473432, 31.22919],
        resizeEnable: true
    })
    geocoder = new MyMap.Geocoder({
        city: "010", //城市设为北京，默认：“全国”
    });
    var auto = new MyMap.AutoComplete({
        input: "tipinput"
    });
}

// 关闭
const onMaskClick = () => {
    onDestroy()
    emit('close')
}
// 销毁地图
const onDestroy = () => {

}
// 定位位置
const onSubmit = () => {

    // 获取当前位置
    let cc = map.getCenter();
    state.longitude = cc.lng
    state.latitude = cc.lat
    console.log('发送经纬度：', cc)
    emit('on-submit', state)
    onDestroy()
}

const select = () => {
    //构造地点查询类
    const placeSearch = new MyMap.PlaceSearch({
        pageSize: 3, // 单页显示结果条数
        pageIndex: 1, // 页码
        // city: "010", // 兴趣点城市
        citylimit: false,  //是否强制限制在设置的城市内搜索
        map: map, // 展现结果的地图实例
        panel: "list", // 结果列表将在此容器中进行展示。
        autoFitView: false // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
    });
    //关键字查询
    console.log('搜索地方：', address.value)
    placeSearch.search(address.value);
}

onMounted(() => {
    initMap()
})

</script>


<template>
    <n-modal
        v-model:show="isShow"
        class="custom-card"
        preset="card"
        style="max-width: 700px; border-radius: 10px"
        title="获取定位:"
        size="huge"
        :bordered="false"
        :on-after-leave="onMaskClick"
        :mask-closable="false"
    >
        <main class="main-box">
            <div class="main-map">
                <div class="form">
                    <!--搜索框-->
                    <input type="text" class="input" placeholder="查询位置..." v-model="address" id="tipinput" @keyup.enter="select">
                </div>
                <!--查询列表,高德地图api绑定id-->
                <div class="list" id="list"></div>
                <!--地图,需要设置宽高-->
                <div id="container"></div>
            </div>
        </main>
        <template #footer>
            <div class="footer">
                <n-button type="primary" round @click="onSubmit">
                    发送位置
                </n-button>
            </div>
        </template>
    </n-modal>
</template>


<style lang="less" scoped>

#container {
    width: 100%;
    height: 400px;
    border-radius: 10px;
}

.footer {
    width: 100%;
    text-align: center;
}

.main-map {

    position: relative;

    .form {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 999;

        .input {
            width: 180px;
            line-height: 30px;
            padding-left: 5px;
            box-shadow: 0 2px 6px 0 rgb(114 124 245 / 50%);
            outline: none;
            border-radius: 5px;
            border: none;
        }
    }


    .list {
        position: absolute;
        top: 10px;
        right: 10px;
        height: 300px;
        width: 230px;
        z-index: 999;

        .li {
            line-height: 25px;

        }
    }

}

</style>
