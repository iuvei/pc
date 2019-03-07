<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation, namespace, State } from 'vuex-class'
import { Action } from 'vuex-class'
import { GameType } from '@/enums'
import api from '@/api'

const USER = namespace('user')

@Component({
  components: {}
})
export default class egameSideBar extends Vue {
  @Action gotoAPI
  @Action getWebInfo
  @State logo1
  @State hcgame
  @USER.State token
  @USER.State userType

  // seiper配置
  swiperOption = {
    autoplay: false,
    slidesPerView: 'auto',
    allowTouchMove: false,
    navigation: {
      nextEl: '.el-icon-arrow-right',
      prevEl: '.el-icon-arrow-left'
    }
  }

  // 侧边栏显示的方式
  showBar: boolean = false

  // 游戏类型
  games: any = []

  activeType: number = 0

  mounted() {
    this.getSidebar()
    this.getWebInfo()
  }

  /* 获取侧边栏数据 */
  getSidebar() {
    api
      .egameSidebar()
      .then((res: any) => {
        if (res.code === 0) {
          this.games = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {})
  }

  /* 获取游戏图标 */
  getImgUrl(item) {
    let url = ''
    try {
      if (item.game_type === 4) {
        const hcgame = this.hcgame.find(v => v.game_id == item.game_id)
        url = require(`./img/logo/${item.game_id ? hcgame.iconkey : 'hc'}_1.png`)
      } else {
        url = require('./img/logo/' + item.iconkey + '_1.png')
      }
    } catch (err) {
      url = require('./img/logo/default.png')
    }
    return url
  }

  /* 切换游戏类型 */
  onTypeClick(index) {
    this.activeType = index
  }
  /* 点击某个游戏 */
  onGameClick(item) {
    // 如果是试玩账号登录
    if (this.userType === '1') {
      // is_trial 1-支持试玩   0-不支持！
      if (item.is_trial === 1) {
        this.gotoContent(item)
      } else {
        this.$message.error('仅支持正式账号')
      }
    } else {
      // 正式账号登录
      // this.requestChildWallet(item, this.gotoContent)
      this.gotoContent(item)
    }
  }

  gotoContent(item) {
    if (item.game_type === GameType.EGame) {
      window.open(
        `/game/egame/${item.iconkey.toLocaleUpperCase()}`,
        'egame&card',
        'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
      )
    } else if (item.game_type === GameType.Card) {
      window.open(
        `/game/card/${item.iconkey.toLocaleUpperCase()}`,
        'egame&card',
        'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
      )
    } else {
      this.gotoAPI({
        game_type: item.game_type,
        partner_name: item.iconkey,
        game_code: item.game_code,
        partner_id: item.partner_id,
        return_url: item.game_url || ''
      })
    }
  }
}
</script>
