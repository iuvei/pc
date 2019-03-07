<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation, State, Action, namespace } from 'vuex-class'
import { GameType, GamePath } from '@/enums'
import api from '@/api'
import _ from 'lodash'

/** 默认的菜单码，特殊处理，服务端定义 */
const DefaultMenuCodes = ['home', 'activity', 'mobile', 'user', 'agent']

const USER = namespace('user')
const WALLET = namespace('wallet')

@Component
export default class HomeMenu extends Vue {
  @State logo1
  @State logo2
  @Action gotoAPI

  @Mutation updateCenterDialogConfig
  @Mutation updateLoginVisible
  @WALLET.Mutation updateExchangeDialogConfig

  @USER.State token
  @USER.State userType

  menus = []

  esport: any = {
    game_code: 0,
    game_type: 4,
    partner_name: 'HC'
  }

  mounted() {
    this.requestMenu()
  }

  requestMenu() {
    api
      .homeMenu()
      .then((response: any) => {
        if (response.code === 0) {
          this.menus = response.data
        }
      })
      .catch(error => {})
  }

  onMenuClick(item) {
    if (_.includes(DefaultMenuCodes, item.code)) {
      switch (item.code) {
        case 'home':
          this.$router.push('/')
          break
        case 'activity':
          this.$router.push('/activity')
          break
        case 'mobile':
          this.$router.push('/mobile-betting')
          break
        case 'user':
          this.updateCenterDialogConfig({ visible: true, group: 0, menu: 0, tab: 'baseInfo' })
          break
        case 'agent':
          this.token.length > 0 ? this.updateCenterDialogConfig({ visible: true, group: 2, menu: 2 }) : window.open(this.$generateAgentAdminUrl(), 'agentAdmin')
          break
      }
    } else if (item.jump_switch) {
      if (item.jump_type === 1) {
        // 跳转大类页面
        this.$router.push(GamePath[item.game_type])
      } else if (item.jump_type === 2) {
        // 跳转API首页
        if (item.game_type === GameType.ESport) {
          this.esport = {
            game_code: item.game_code,
            game_type: item.game_type,
            partner_name: item.partner_name
          }
          // 电竞竞猜特殊处理，进入前需要登录
          if (this.token.length > 0) {
            if (this.userType === '1' && !item.support_demo) {
              this.$message.error('仅支持正式账号！')
              return
            } else if (this.userType === '1' && item.support_demo) {
              const { game_code, game_type, partner_name } = this.esport
              this.$router.push({
                path: GamePath[game_type],
                query: {
                  partner_name,
                  game_code
                }
              })
            } else {
              this.checkEsportsBalance()
            }
            // 判断是否需要额度转换
          } else {
            this.updateLoginVisible(true)
          }
        } else if (item.game_type === GameType.EGame) {
          // 新窗口打开对应第三方电子首页
          window.open(
            `/game/egame/${item.partner_name.toLocaleUpperCase()}`,
            'egame&card',
            'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=yes, location=no, status=no'
          )
        } else if (item.game_type === GameType.Card) {
          // 新窗口打开对应第三方棋牌首页
          window.open(
            `/game/card/${item.partner_name.toLocaleUpperCase()}`,
            'egame&card',
            'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=yes, location=no, status=no'
          )
        } else {
          this.gotoAPI({
            game_type: item.game_type,
            partner_id: item.partner_id,
            partner_name: item.partner_name,
            support_demo: item.support_demo
          })
        }
      }
    }
  }

  /** 获取子菜单列数 */
  getSubmenuCount(item) {
    if (item.children.length > 10) {
      return Math.ceil(item.children.length / 8)
    } else {
      return Math.ceil(item.children.length / 5)
    }
  }

  /** 子菜单默认一列显示 5 个，当子菜单总数超过 10 个，则一列显示 8 个 */
  getSubmenuList(item, i) {
    if (item.children.length > 10) {
      return item.children.slice(i * 8 - 8, i * 8)
    } else {
      return item.children.slice(i * 5 - 5, i * 5)
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
    const { game_code, game_type, partner_name } = this.esport
    this.$router.push({
      path: GamePath[game_type],
      query: {
        partner_name,
        game_code
      }
    })
  }
}
</script>
