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

const state = reactive({
    path: [],
    current_position: [],
});

const emit = defineEmits(['close', 'on-submit'])
// show
const isShow = ref(true)

// 地图数据结构
let map = shallowRef(null);

// 初始化地图
const initMap = () => {
    console.log('初始化地图开始：')
    // await getCurrentPosition();
    // 获取当前经纬度坐标
    AMapLoader.load({
        key: "17e971cb5d0cb7768c5c2e6b8f8fa893",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.Geolocation','AMap.Scale', 'AMap.ToolBar', 'AMap.Driving', 'AMap.Geocoder'],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    }).then((AMap) => {
        map = new AMap.Map("container", {  //设置地图容器id
            resizeEnable: true,
            viewMode: "3D",    //是否为3D地图模式
            zoom: 15,           //初始化地图级别
            // center: [props.latitude, props.longitude], //初始化地图中心点位置
        });

        //添加插件
        AMap.plugin(["AMap.ToolBar", "AMap.Scale", "AMap.HawkEye", "AMap.ControlBar", "AMap.Driving", 'AMap.Geolocation'], function () {
            //异步同时加载多个插件
            map.addControl(new AMap.HawkEye()); //显示缩略图
            map.addControl(new AMap.Scale()); //显示当前地图中心的比例尺
            map.addControl(new AMap.ToolBar())
            map.addControl(new AMap.ControlBar())
            map.addControl(new AMap.Geolocation())
            // map.addControl(new AMap.Driving())
        });

        // 单击
        map.on("click", (e) => {
            // console.log(e);
            props.current_position.value = [e.lnglat.KL, e.lnglat.kT];
            props.latitude = e.lnglat.KL
            props.longitude = e.lnglat.kT
            props.path.push([e.lnglat.KL, e.lnglat.kT]);
            addMarker();

            // addPolyLine();
            // 地图按照适合展示图层内数据的缩放等级展示
            map.setFitView();
        });

        // 地图加载完成
        map.on("complete", function(){
            console.log("地图加载完成！");
            // map.setCenter([props.latitude, props.longitude])
            console.log('加载定位插件：')
            AMap.plugin('AMap.Geolocation', function() {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true, // 是否使用高精度定位，默认：true
                    timeout: 100000, // 设置定位超时时间，默认：无穷大
                    offset: [10, 20],  // 定位按钮的停靠位置的偏移量
                    zoomToAccuracy: true,  //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    position: 'RB' //  定位按钮的排放位置,  RB表示右下
                })
                console.log('定位插件加载完成，获取当前位置：')
                geolocation.getCurrentPosition(function(status,result){
                    if(status=='complete'){
                        console.log('获取当前位置complete：')
                        onComplete(result)
                    }else{
                        onError(result)
                    }
                });

                function onComplete (data) {
                    // data是具体的定位信息
                    console.log('data是具体的定位信息:', data)
                }
                function onError (data) {
                    //
                    console.log('定位出错:', data)
                }
            })
        });

        // 实例化点标记
        function addMarker() {
            const marker = new AMap.Marker({
                icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
                position: props.current_position,
                offset: new AMap.Pixel(-26, -54),
            });
            marker.setMap(map);
        }
        // 折线
        function addPolyLine() {
            const polyline = new AMap.Polyline({
                path: props.path,
                isOutline: true,
                outlineColor: "#ffeeff",
                borderWeight: 1,
                strokeColor: "#3366FF",
                strokeOpacity: 0.6,
                strokeWeight: 5,
                // 折线样式还支持 'dashed'
                strokeStyle: "solid",
                // strokeStyle是dashed时有效
                // strokeDasharray: [10, 5],
                lineJoin: "round",
                lineCap: "round",
                zIndex: 50,
            });
            map.add([polyline]);
        }

        // 获取当前行政区域
        console.log('地图初始化成功:', map)
    }).catch(e => {
        console.log('地图初始化错误', e);
    })
}


// 获取当前经纬度
const getCurrentPosition = async () => {

    console.log('获取当前位置前：', props.latitude, props.longitude)
    if (navigator.geolocation) {
        console.log('navigator.geolocation.getCurrentPosition(): ')
        await navigator.geolocation.getCurrentPosition(() => {
            props.latitude = position.coords.latitude
            props.longitude = position.coords.longitude
            console.log('获取当前经纬度后:', props.latitude, props.longitude)
        }, () => {
            console.log('抱歉，您未允许获取定义!')
            $message.warning('抱歉，您未允许获取定义!')
        })
    }
}

const getPosition = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let latitude = position.coords.latitude
                let longitude = position.coords.longitude
                let data = {
                    latitude: latitude,
                    longitude: longitude
                }
                resolve(data)
            }, function () {
                reject(arguments)
            })
        } else {
            reject('你的浏览器不支持当前地理位置信息获取')
        }
    })
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
    emit('on-submit', map)
    onDestroy()
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
        title="获取定位🛰"
        size="huge"
        :bordered="false"
        :on-after-leave="onMaskClick"
        :mask-closable="false"
    >
        <main class="main-box">
            <div class="music">
                <div id="container"></div>
            </div>
        </main>
        <template #footer>
            <div class="footer">
                <n-button type="primary" round @click="onSubmit">
                    定位位置
                </n-button>
            </div>
        </template>
    </n-modal>
</template>


<style lang="less" scoped>

#container{
    width: 100%;
    height: 400px;
    border-radius: 10px;
}

.footer {
    width: 100%;
    text-align: center;
}

</style>
