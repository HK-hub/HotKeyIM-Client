<script setup>
import { fileFormatSize } from '@/utils/strings'
import { download, preview } from '@/utils/functions'

defineProps({
  recordId: {
    type: Number,
    default: 0,
  },
  fileName: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 0,
  },
  ext: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="file-message">
    <div class="main">
      <div class="ext">{{ ext }}</div>
      <div class="file-box">
        <p class="info">
          <span class="name">{{ fileName }}</span>
          <span class="size">({{ fileFormatSize(size) }})</span>
        </p>
        <p class="notice">文件已成功发送, 文件助手永久保存</p>
      </div>
    </div>
    <div class="footer">
      <a @click="download(recordId)">下载</a>
      <a @click="preview(recordId)">在线预览</a>
    </div>
  </section>
</template>

<style lang="less" scoped>
.file-message {
  width: 250px;
  height: 85px;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #d6caca;

  .main {
    height: 45px;
    display: flex;
    flex-direction: row;
    margin-top: 5px;

    .ext {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 45px;
      height: 45px;
      flex-shrink: 0;
      color: #ffffff;
      background: #49a4ff;
      border-radius: 5px;
      font-size: 12px;
    }

    .file-box {
      flex: 1 1;
      height: 45px;
      margin-left: 10px;
      overflow: hidden;

      .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        height: 24px;
        color: rgb(76, 76, 76);
        font-size: 14px;

        .name {
          flex: 1 auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .size {
          font-size: 12px;
          color: #cac6c6;
        }
      }

      .notice {
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        color: #929191;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .footer {
    height: 30px;
    line-height: 37px;
    color: #409eff;
    text-align: right;
    font-size: 12px;
    border-top: 1px solid #eff7ef;
    margin-top: 10px;

    a {
      margin: 0 3px;
      user-select: none;
      cursor: pointer;

      &:hover {
        color: royalblue;
      }
    }
  }
}
</style>
