<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State, Mutation, Action, namespace } from 'vuex-class'
import { GameType, GamePath } from '@/enums'
import api from '@/api'

const USER = namespace('user')
const WALLET = namespace('wallet')

@Component
export default class Type extends Vue {
  @USER.State token
  @USER.State userType

  @Mutation updateLoginVisible

  @WALLET.Mutation updateExchangeDialogConfig

  @Action gotoAPI

  /** 控制该组件是否显示，默认显示，当接口返回数据为空时再设置为隐藏，这样首屏初始化时默认占位，有数据渲染不会出现闪现和滑动条变动，优化首次加载体验 */
  isVisible: boolean = true

  list = []

  mounted() {
    this.requestType()
  }

  requestType() {
    api
      .homeType()
      .then((response: any) => {
        if (response.code === 0) {
          this.list = response.data
        }
        this.isVisible = this.list.length != 0
      })
      .catch(error => {})
  }

  getImagePath(type) {
    return require(`./img/${type}.png`)
  }

  onEnterClick(item) {
    if (item.gameType === GameType.ESport) {
      // 电竞竞猜特殊处理，进入前需要登录
      if (this.token.length > 0) {
        // 判断是否需要额度转换
        if (this.userType === '1') {
          this.toEsport()
        } else {
          this.checkEsportsBalance()
        }
      } else {
        this.updateLoginVisible(true)
      }
    } else {
      this.$router.push(GamePath[item.gameType])
    }
  }

  /** 查询电竞子钱包余额，根据余额判断是否显示额度转换弹窗 */

  checkEsportsBalance() {
    api
      .getChildWallet({ partner_id: 10 })
      .then(({ code, data, msg }: any) => {
        if (code === 0) {
          if (data.balance >= 10) {
            this.toEsport()
          } else {
            this.updateExchangeDialogConfig({
              visible: true,
              childName: data.name,
              childBalance: data.balance,
              partner_id: 10,
              apiParams: true,
              gotoAPIMethod: this.toEsport
            })
          }
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  toEsport() {
    this.$router.push({
      path: GamePath[GameType.ESport],
      query: {
        /** @todo 因为电竞没有主页，所以这里直接跳转 HC 电竞 */
        partner_name: 'HC',
        game_code: '0'
      }
    })
  }
}
</script>
