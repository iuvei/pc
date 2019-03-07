<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Table, Loading } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import CountUp from './../../../../js/count-up.js'
import { Mutation, namespace, Action, State } from 'vuex-class'

const wallet = namespace('wallet')

@Component
export default class BaseInfo extends Vue {
  @Mutation updateCenterDialogConfig
  @wallet.State totalBalance
  @wallet.State mainWallet
  @wallet.State freezeWithdraw
  @wallet.State totalChildrenBalance
  @wallet.State childLenCount
  @wallet.State childWalletArr
  @wallet.State loadingCWallet
  @wallet.State isOneRecycle
  @wallet.State isLoadingOneRecycle
  @wallet.State timer
  @wallet.State isLoading
  @wallet.Action oneRecycle
  @wallet.Action allRefresh
  @wallet.Action reflreshChildWallet
  @wallet.Mutation updateTimer

  /*************data***********/
  // 有效投注的数组
  validBetArr: object[][] = []

  // 用户信息
  user: any = {}

  // 有效投注总额
  all_betting: number = 0
  loadingBetting: boolean = true

  // countup的配置项
  options = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.'
  }

  // 数字变化的对象
  // 总资产
  demo: any = undefined
  // 子钱包总余额
  demo1: any = undefined

  // 子钱包的数组
  childListArr: any = []

  // 是否可以刷新
  get isRefresh() {
    return this.childWalletArr.length !== this.childLenCount
  }

  // 页面按钮能否点击
  get btnAble() {
    // isOneRecycle:一键回收2s内不能点击
    // isRefresh：子钱包没有请求完成，按钮不能点击
    // isLoading：一键回收请求或者是额度转换请求没有完成不能点击
    return this.isOneRecycle || this.isRefresh || this.isLoading
  }

  @Watch('totalBalance')
  onAllBalanceChanged(val) {
    this.demo && this.demo.update(val)
  }

  @Watch('childWalletArr', { deep: true })
  onChildWalletArrChanged(val) {
    const len = val && val.length
    this.childListArr = val && val.length ? _.chunk(val, 3) : [[], [], []]
  }

  @Watch('totalChildrenBalance')
  onallChildrenBalanceChanged(val) {
    this.demo1 && this.demo1.update(val)
  }
  /*************life-cycle***********/

  mounted() {
    this.createdCountUp()
    this.allRefresh()
    this.userAccount()
  }

  beforeDestroy() {
    if (this.timer) {
      this.updateTimer({ timer: this.timer, type: 'clear' })
    }
  }
  /*************methods***********/
  // new CountUp
  createdCountUp() {
    this.$nextTick(() => {
      this.demo = new CountUp('myTargetElement', 0, 0, 2, 0.08, this.options)
      this.demo.start()
      this.demo1 = new CountUp('myTargetElement1', 0, 0, 2, 0.08, this.options)
      this.demo1.start()
    })
  }

  oneRecycleFun() {
    this.demo = undefined
    this.demo1 = undefined
    this.createdCountUp()
    this.oneRecycle()
  }

  allRefreshFun() {
    this.demo = undefined
    this.demo1 = undefined
    this.createdCountUp()
    this.allRefresh()
  }
  // 有效投注
  userAccount() {
    api
      .userAccount()
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          let { bettingMoney, last_login_time, realname, username } = data
          bettingMoney &&
            bettingMoney.map((obj: any) => {
              this.all_betting += Number(obj.bet_amount)
            })
          this.all_betting = Number(this.all_betting.toFixed(2))
          this.validBetArr = this.assemblyForValidBetArr(bettingMoney)
          this.user = { last_login_time, realname, username }
          this.loadingBetting = false
        }
      })
      .catch((error: any) => {})
  }

  // 组装有效投注的数据
  assemblyForValidBetArr(arr) {
    let tempArr: any = [[], [], [], []]
    const len = arr.length
    let count = 0
    while (len && count < len) {
      tempArr[count % 4].push(arr[count])
      count++
    }
    return tempArr
  }
}
interface ChildIndexState {
  x: number
  y: number
}
interface ChildState {
  balance: string
  isShowValue: boolean
  name: string
  partner_id: number
}
</script>
