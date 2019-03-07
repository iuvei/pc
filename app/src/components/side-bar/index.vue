<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation, namespace, State } from 'vuex-class'
import api from '@/api'
import copy from 'copy-to-clipboard'

const USER = namespace('user')

@Component
export default class SideBar extends Vue {
  @Mutation updateCenterDialogConfig
  @Mutation updateLoginVisible
  @Mutation updateCodeUrl

  @USER.State token
  @USER.State userType

  // 客服的数据源
  serviceList: any = []

  labelNameObj: any = {
    qq: '客服QQ',
    wx: '客服微信',
    code: '在线客服'
  }

  defaultArr: ServiceState[] = [
    {
      key: 'recharge',
      label: '充值中心',
      class: 'five-three'
    },
    {
      key: 'top',
      label: '回到顶部',
      class: 'five-three'
    }
  ]

  // 是否显示侧边栏
  isShow: boolean = false

  // 侧边栏显示的方式 false是收起，true是展开
  showWay: boolean = true

  // 用来自适应侧边栏高度用的，qq和wx的高度高点
  countHeight: number = 0
  count: number = 0

  mounted() {
    api
      .service3th()
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          let tempArr: ServiceState[] = []
          this.updateCodeUrl(data['code'])
          for (const key in data) {
            let tempObj: ServiceState = {}
            if (data[key] && key !== 'm_base_id') {
              tempObj = { key, label: this.labelNameObj[key], content: data[key] }
              if (key === 'qq' || key === 'wx') {
                if (data[key].length > 12) {
                  this.countHeight += 78
                  tempObj['class'] = 'seven-eight'
                } else {
                  this.countHeight += 63
                  tempObj['class'] = 'six-three'
                }
                this.count++
              } else {
                tempObj['class'] = 'five-three'
              }
              tempArr.push(tempObj)
            }
          }
          this.serviceList = [...tempArr, ...this.defaultArr]
          this.isShow = true
        }
      })
      .catch((error: any) => {})
  }

  // 点击事件处理
  clickItem(item) {
    const { key, content } = item
    switch (key) {
      case 'code':
        window.open(content, 'newwindow', 'height=800, width=800, top=40, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
        break
      case 'recharge':
        this.updateCenterDialogConfig({ visible: true, group: 0, menu: 2, tab: 'recharge' })
        break
      case 'qq':
        window.open(
          `http://wpa.qq.com/msgrd?v=3&uin=${content}&site=qq&menu=yes`,
          'newwindow',
          'height=800, width=800, top=40, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no'
        )
        break
      case 'top':
        if (document.documentElement && document.documentElement.scrollTop) {
          document.documentElement.scrollTop = 0
        } else {
          document.body.scrollTop = 0
        }

        break
      case 'wx':
        this.onCopy(content)
        break
    }
  }

  // 复制成功
  onCopy(val) {
    copy(val)
    this.$message.success('客服微信复制成功')
  }
  // 侧边栏显示的方式，一个是收起，一个是展开
  showWayFun() {
    this.showWay = !this.showWay
  }
}
interface ServiceState {
  key?: string
  label?: string
  content?: string
  show?: number //1:不显示，2显示
  class?: string
}
</script>
