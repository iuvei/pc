<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace } from 'vuex-class'

const USER = namespace('user')

@Component
export default class Guide extends Vue {
  @State isFree
  @State codeUrl
  @State registerSwitch

  @Mutation updateCenterDialogConfig
  @Mutation updateFreeDialogVisible

  @USER.State token

  list = [
    {
      label: '免费试玩',
      desc: 'Free Trial'
    },
    {
      label: '免费注册',
      desc: 'Sign Up'
    },
    {
      label: '快速存款',
      desc: 'Fast Deposit'
    },
    {
      label: '申请提现',
      desc: 'Withdrawal'
    },
    {
      label: '加盟代理',
      desc: 'Agent'
    },
    {
      label: '在线客服',
      desc: 'Service'
    },
    {
      label: '额度转换',
      desc: 'Exchange'
    }
  ]

  // unLoginIndex = [0, 1, 2, 3, 4]
  loginIndex = [6, 2, 3, 5, 4]

  get unLoginIndex() {
    if (this.isFree === 'true' && this.registerSwitch) {
      return [0, 1, 2, 3, 4]
    } else if (this.isFree === 'true' && !this.registerSwitch) {
      return [0, 2, 3, 4, 5]
    } else if (this.isFree === 'false' && this.registerSwitch) {
      return [1, 2, 3, 4, 5]
    } else {
      return [2, 3, 4, 5, 6]
    }
  }

  created() {
    // this.unLoginIndex = this.isFree === 'true' ? [0, 1, 2, 3, 4] : [1, 2, 3, 5, 4]
  }

  onItemClick(index) {
    switch (index) {
      case 0:
        this.updateFreeDialogVisible(true)
        break
      case 1:
        this.$router.push('/register')
        break
      case 2:
        this.updateCenterDialogConfig({ visible: true, group: 0, menu: 2, tab: 'recharge' })
        break
      case 3:
        this.updateCenterDialogConfig({ visible: true, group: 0, menu: 2, tab: 'withdraw' })
        break
      case 4:
        this.updateCenterDialogConfig({ visible: true, group: 2, menu: 2 })
        break
      case 5:
        window.open(this.codeUrl, 'newwindow', 'height=800, width=800, top=40, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
        break
      case 6:
        this.updateCenterDialogConfig({ visible: true, group: 0, menu: 1 })
        break
    }
  }
}
</script>
