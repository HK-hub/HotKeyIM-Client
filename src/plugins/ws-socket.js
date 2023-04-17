class WsSocket {
    /**
     * Websocket 连接
     *
     * @var Websocket
     */
    connect = null

    /**
     * 配置信息
     *
     * @var Object
     */
    config = {
        heartbeat: {
            setInterval: null,
            // ping 间隔时间=20s
            pingInterval: 20000,
            // ping 超时时间=60
            pingTimeout: 60000,
        },
        reconnect: {
            lockReconnect: false,
            setTimeout: null, // 计时器对象
            time: 3000, // 重连间隔时间
            number: 10000000, // 重连次数
        },
    }

    // 最后心跳时间
    lastTime = 0

    /**
     * 自定义绑定消息事件
     *
     * @var Array
     */
    onCallBacks = []

    defaultEvent = {
        onError: evt => {},
        onOpen: evt => {},
        onClose: evt => {},
        onMessage: evt => {},
    }

    /**
     * 创建 WsSocket 的实例
     *
     * @param {Function} urlCallBack url闭包函数
     * @param {Object} events 原生 WebSocket 绑定事件
     */
    constructor(urlCallBack, events) {
        this.urlCallBack = urlCallBack

        // 定义 WebSocket 原生方法
        this.events = Object.assign({}, this.defaultEvent, events)

        this.on('connect', data => {
            this.config.heartbeat.pingInterval = data.ping_interval * 1000
            this.config.heartbeat.pingTimeout = data.ping_timeout * 1000
            this.heartbeat()
            this.connect.send('{"event":"heartbeat","data":"ping"}')
        })
    }

    /**
     * 事件绑定
     *
     * @param {String} event 事件名
     * @param {Function} callBack 回调方法
     */
    on(event, callBack) {
        this.onCallBacks[event] = callBack

        return this
    }

    /**
     * 加载 WebSocket
     */
    loadSocket() {
        const url = this.urlCallBack()
        console.log('this.urlCallBack()=' + url);
        const connect = new WebSocket(url)
        console.log('new WebSocket() end..');
        connect.onerror = this.onError.bind(this)
        connect.onopen = this.onOpen.bind(this)
        connect.onmessage = this.onMessage.bind(this)
        connect.onclose = this.onClose.bind(this)

        this.connect = connect
    }

    /**
     * 连接 Websocket
     */
    connection() {
        this.connect == null && this.loadSocket()
    }

    /**
     * 掉线重连 Websocket
     */
    reconnect() {
        // 没连接上会一直重连，设置延迟避免请求过多
        clearTimeout(this.config.reconnect.setTimeout)

        this.config.reconnect.setTimeout = setTimeout(() => {
            this.connection()

            console.log(`网络连接已断开，正在尝试重新连接...`)
        }, this.config.reconnect.time)
    }

    /**
     * 解析接受的消息
     *
     * @param {Object} evt Websocket 消息
     */
    onParse(evt) {
        const obj = JSON.parse(evt.data)
        console.log('解析接受的消息',evt.data)
        return {
            event: obj.event,
            data: obj.message,
            content: obj.content,
            originData: obj,
        }
    }

    /**
     * 打开连接
     *
     * @param {Object} evt Websocket 消息
     */
    onOpen(evt) {
        // 最后心跳时间
        this.lastTime = new Date().getTime()

        this.events.onOpen(evt)

        this.ping()
    }

    /**
     * 关闭连接
     *
     * @param {Object} evt Websocket 消息
     */
    onClose(evt) {
        this.events.onClose(evt)

        this.connect && this.connect.close()

        this.connect = null

        evt.code == 1006 && this.reconnect()
    }

    /**
     * 连接错误
     *
     * @param {Object} evt Websocket 消息
     */
    onError(evt) {
        this.events.onError(evt)
        this.connect.close()
        this.connect = null
        this.reconnect()
    }

    /**
     * 接收消息
     *
     * @param {Object} evt Websocket 消息
     */
    onMessage(evt) {
        this.lastTime = new Date().getTime()
        console.log('解析消息前:')
        let result = this.onParse(evt)
        // 消息接收后的确认消息回执等
        console.log('消息确认前:')
        this.events.onMessage(evt)
        console.log('onMessage 处理消息：进行消息回调处理', result)
        // 判断消息事件是否被绑定
        if (this.onCallBacks.hasOwnProperty(result.event)) {
            this.onCallBacks[result.event](result.data, result.originData)
        } else {
            console.warn(`WsSocket 消息事件[${result.event}]未绑定...`)
        }
    }

    /**
     * WebSocket 心跳检测
     */
    heartbeat() {
        this.config.heartbeat.setInterval = setInterval(() => {
            let t = new Date().getTime()

            // 当前时间 - 最后获取心跳时间 > 心跳最大超时时间
            if (t - this.lastTime > this.config.heartbeat.pingTimeout) {
                if (this.connect) {
                    this.connect.close()
                }

                this.reconnect()
            } else {
                this.ping()
            }
        }, this.config.heartbeat.pingInterval)
    }

    ping() {
        console.log('client websocket ping:', new Date())
        this.connect.send('{"event":"heartbeat","data":"ping"}')
    }

    /**
     * 聊天发送数据
     *
     * @param {Object} message
     */
    send(message) {
        this.connect.send(JSON.stringify(message))
    }

    /**
     * 关闭连接
     */
    close() {
        this.connect.close()
    }

    /**
     * 推送消息
     *
     * @param {String} event 事件名
     * @param {Object} data 数据
     */
    emit(event, data) {
        const content = JSON.stringify({ event, data })

        if (this.connect && this.connect.readyState === 1) {
            this.connect.send(content)
        } else {
            console.error('WebSocket 连接已关闭...', this.connect)
        }
    }
}

export default WsSocket