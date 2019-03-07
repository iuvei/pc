<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { GameType } from '@/enums'
import api from '@/api'

@Component
export default class Live extends Vue {
  @Action gotoAPI

  /** 默认的轮播图数据 */
  defaultBanners = [
    {
      img_pc: require('./img/banner/1.png')
    },
    {
      img_pc: require('./img/banner/2.png')
    },
    {
      img_pc: require('./img/banner/3.png')
    }
  ]

  list = []

  banners: any = []

  mounted() {
    this.requestLive()
    this.requestBanners()
  }

  requestLive() {
    let params = {
      game_type: GameType.Live
    }

    api
      .live(params)
      .then((response: any) => {
        if (response.code === 0) {
          this.list = response.data
        }
      })
      .catch(error => {})
  }

  requestBanners() {
    let params = {
      type: 4 // 活动类型：1: PC 首页 2: 电子游艺banner 3: 电子游戏API 4: 真人视讯banner 5: 体育竞技banner 6: 棋牌对战banner 7: 棋牌对战API 8: 彩票游戏banner
    }

    api
      .gameBanners(params)
      .then((response: any) => {
        if (response.code === 0 && response.data.length > 0) {
          this.banners = response.data
        } else {
          this.banners = this.defaultBanners
        }
      })
      .catch(error => {})
  }

  getAPIName(item) {
    return item.partner_name.toLowerCase()
  }

  getLogoImagePath(item) {
    let name = this.getAPIName(item)
    return require(`./img/logo/${name}.png`)
  }

  getLargeImagePath(item) {
    let name = this.getAPIName(item)
    return require(`./img/large/${name}.png`)
  }

  getSmallImagePath(item) {
    let name = this.getAPIName(item)
    return require(`./img/small/${name}.png`)
  }

  onEnterClick(item) {
    this.gotoAPI({
      game_type: GameType.Live,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      support_demo: item.support_demo
    })
  }

  onTingClick(item, params) {
    this.gotoAPI({
      game_type: GameType.Live,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      support_demo: item.support_demo,
      extra: params
    })
  }
}
</script>
