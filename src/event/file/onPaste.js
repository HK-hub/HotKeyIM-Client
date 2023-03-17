// onPaste.js
// 定义粘贴函数
const onPaste = (event) => {
    // 剪贴板没数据，则直接返回
    if (!event.clipboardData || !event.clipboardData.items) {
        return;
    }
    // 封装Promise
    return new Promise((resovle, reject) => {
        // 遍历剪贴板
        for (let i = 0, len = event.clipboardData.items.length; i < len; i++) {
            const item = event.clipboardData.items[i];
            if (item.kind === 'string') {
                // 方式一，直接返回粘贴的文本数据
                let str = event.clipboardData.getData('text');
                resovle({
                    data: str
                });
            } else {
                reject(new Error('不支持粘贴该类型'));
            }
        }
    })
}
export default onPaste; // 默认导出方法