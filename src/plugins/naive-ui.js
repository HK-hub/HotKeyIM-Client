import {
  // create naive ui
  create,
  // component
  NButton,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NAvatar,
  NIcon,
  NInput,
  NConfigProvider,
  NSpin,
  NEmpty,
} from 'naive-ui'

// 按需全局安装组件
const naive = create({
  components: [
    NButton,
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NAvatar,
    NIcon,
    NInput,
    NConfigProvider,
    NSpin,
    NEmpty,
  ],
})

export function setupNaive(app) {
  app.use(naive)
}
