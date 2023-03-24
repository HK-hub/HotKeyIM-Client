<script setup>
import {onMounted} from 'vue'
import { useRouter } from "vue-router";

const router = useRouter()

// 加入房间
const joinRoom = () => {
    console.log('加入房间：')
    const room = document.getElementById("room").value;
    const password = document.getElementById("password").value;
    if (password) {
        sessionStorage.setItem("fastrtc", password);
        // window.location.href = "/authrtc/" + room;
        router.push('/multi/room')
    } else {
        router.push('/multi/room')
    }
}

onMounted(() => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://xujiangtao.icu:81/xjtfile/lizi.js';
    document.body.appendChild(script);
})

</script>


<template>
<div class="join-room-page">
    <div class="segment gradientText">
        <h1>加入房间</h1>
    </div>
    <form>
        <label>
            <input id="room" type="text" placeholder="请输入房间号" />
        </label>
        <label>
            <input id="password" type="text" placeholder="请输入房间密码（选填）" />
        </label>
        <!-- <label>
          <input type="password" placeholder="房间人数上限,默认是2" />
        </label> -->
        <button class="red" type="button" @click="joinRoom">
            <i class="icon ion-md-lock"></i> 进入房间
        </button>
    </form>
</div>
</template>


<style lang="css" scoped>

.join-room-page {

    height: 100%;
}

p,
input,
select,
textarea,
button {
    font-family: "Montserrat", sans-serif;
    letter-spacing: -0.2px;
    font-size: 16px;
}

form {
    padding: 16px;
    width: 320px;
    margin: 0 auto;
}

.segment {
    padding: 32px 0;
    text-align: center;
}

button,
input {
    border: 0;
    outline: 0;
    font-size: 16px;
    border-radius: 320px;
    padding: 16px;
    background-color: #16171a;
    color: #fff;
}

button,
input::placeholder {
    color: #fff;
}

label {
    display: block;
    margin-bottom: 32px;
    width: 100%;
}

input {
    margin-right: 8px;
    -webkit-box-shadow: inset 2px 2px 5px #000000, inset -5px -5px 10px #000000;
    box-shadow: inset 2px 2px 5px #000000, inset -5px -5px 10px #000000;
    width: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition: all 0.2s ease-in-out;
    transition: all 0.2s ease-in-out;
    -moz-appearance: none;
    appearance: none;
    -webkit-appearance: none;
}

input:focus {
    -webkit-box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #fff;
    box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #fff;
}

button {
    color: #61677c;
    font-weight: bold;
    -webkit-box-shadow: -5px -5px 20px #fff, 5px 5px 20px #babecc;
    box-shadow: -5px -5px 20px #fff, 5px 5px 20px #babecc;
    -webkit-transition: all 0.2s ease-in-out;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    font-weight: 600;
}

button:hover {
    -webkit-box-shadow: -2px -2px 5px #fff, 2px 2px 5px #babecc;
    box-shadow: -2px -2px 5px #fff, 2px 2px 5px #babecc;
}

button:active {
    -webkit-box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #fff;
    box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #fff;
}

button .icon {
    margin-right: 8px;
}

button.unit {
    border-radius: 8px;
    line-height: 0;
    width: 48px;
    height: 48px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 8px;
    font-size: 19.2px;
}

button.unit .icon {
    margin-right: 0;
}

button.red {
    display: block;
    width: 100%;
    color: #ae1100;
}

.input-group {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
}

.input-group label {
    margin: 0;
    flex: 1;
}

.gradientText {
    background-image: linear-gradient(90deg, #f66, #f90);
    background-clip: text;
    -webkit-background-clip: text;
    animation: hue 5s linear infinite;
    -webkit-text-fill-color: transparent;
    text-align: center;
    margin-top: 0;
    font-size: 2em;
}

@keyframes hue {
    from {
        filter: hue-rotate(0);
    }
    to {
        filter: hue-rotate(-1turn);
    }
}

</style>