<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import copy from 'copy-to-clipboard'

@Component
export default class MobileBetting extends Vue {
  @State qrcode
  stepsArr: StepState[] = [
    {
      num: 1,
      title: '步骤1:扫描二维码下载APP'
    },
    {
      num: 2,
      title: '步骤2:手机安装详细教程'
    },
    {
      num: 3,
      title: '步骤3:畅享随时随地存取款'
    }
  ]

  // 记录第几个title的下标
  selectStep: number = 0

  // 点击title时， 节点pageX轴移动的距离，title的下划线移动的距离
  moveLen: number = 0

  // page2的数据源
  numArr: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '✔']
  contentArr: string[] = [
    '手机扫码彩票网站的二维码',
    '打开苹果手机浏览器 Safari',
    '点击【立即安装】',
    '点击【安装】确认',
    '安装完成后，点击苹果手机里的【设置】进入后，点击【通用】',
    '【通用】进入后，点击【设备管理】',
    '【设备管理】进入后，点击【BLUE WELL TECHNOLNOL LTD】',
    '进入后点击【BLUE WELL TECHNOLNOL LTD】',
    '安装完成'
  ]

  // page3的数据源
  saveMoneyArr: WayState[] = [
    {
      img: require('./img/way_1.png'),
      title: '扫码支付'
    },
    {
      img: require('./img/way_2.png'),
      title: '微信支付'
    },
    {
      img: require('./img/way_3.png'),
      title: '人工汇款'
    },
    {
      img: require('./img/way_4.png'),
      title: '支付宝支付'
    }
  ]

  h5_url: string = window.location.origin.replace('www', 'm')
  // 点击title
  clickTitle(index) {
    this.moveLen = -index * 1200
    this.selectStep = index
  }

  // 复制成功
  onCopy(val) {
    copy(val)
    this.$message.success('复制成功')
  }
}

interface StepState {
  num: number
  title: string
}
interface WayState {
  img: string
  title: string
}
</script>
