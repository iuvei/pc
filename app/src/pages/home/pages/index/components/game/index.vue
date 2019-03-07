<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action, namespace } from 'vuex-class'
import { GameType } from '@/enums'
import api from '@/api'

const USER = namespace('user')

@Component
export default class Game extends Vue {
  @USER.State userType

  @Action gotoAPI

  /** 控制该组件是否显示，默认显示，当接口返回数据为空时再设置为隐藏，这样首屏初始化时默认占位，有数据渲染不会出现闪现和滑动条变动，优化首次加载体验 */
  isVisible: boolean = true

  list = []

  activeItem = {}

  activeJackpot = 0

  menuTop: number = 0

  /** 超级彩金 */
  jackpotTotal = 0

  get jackpotTotalLabel() {
    return this.formatMoney(this.jackpotTotal)
  }

  mounted() {
    this.requestHotGames()
  }

  requestHotGames() {
    api
      .homeHotGames()
      .then((response: any) => {
        if (response.code === 0) {
          this.jackpotTotal = response.data.jackpot_sum
          this.list = response.data.partners
          this.activeItem = response.data.partners[0]
        }
        this.isVisible = this.list.length != 0
      })
      .catch(error => {})
  }

  onMenuUpClick() {
    if (this.list.length <= 5) return
    if (this.menuTop === 0) {
      this.menuTop = -90 * (this.list.length - 1)
    } else {
      this.menuTop += 90
    }
  }

  onMenuDownClick() {
    if (this.list.length <= 5) return
    if (this.menuTop === -90 * (this.list.length - 1)) {
      this.menuTop = 0
    } else {
      this.menuTop -= 90
    }
  }

  onMenuClick(item) {
    this.activeItem = item
  }

  isActiveMenu(item) {
    return item == this.activeItem
  }

  getAPIName(item) {
    let name = item.partner_name.toLocaleUpperCase()
    return `${name}电子`
  }

  getAPILogoPath(item) {
    let name = item.partner_name.toLowerCase()
    return require(`./img/logo/${name}.png`)
  }

  /** 金额转换 分 -> 元 保留 2 位小数 并每隔 3 位用逗号分开 1,234.56 */
  formatMoney(val) {
    var str = Number(val).toFixed(2) + ''
    var intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',') // 取到整数部分
    var dot = str.substring(str.length, str.indexOf('.')) // 取到小数部分搜索
    var ret = intSum + dot
    return ret
  }

  onPlayClick(item) {
    this.gotoAPI({
      game_type: GameType.EGame,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      game_code: item.game_code,
      return_url: item.game_url,
      support_demo: item.support_demo
    })
  }

  /**@note [特殊] 正式账号登录时，点击试玩每次都是新的试玩账号 */
  onTryClick(item) {
    this.gotoAPI({
      game_type: GameType.EGame,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      game_code: item.game_code,
      return_url: item.game_url,
      is_trial: 1
    })
  }
}
</script>
