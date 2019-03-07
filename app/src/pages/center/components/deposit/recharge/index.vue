<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import Company from '../components/company/index.vue'
import OtherPay from '../components/other-pay/index.vue'
import OnlinePayment from '../components/online-payment/index.vue'
import { State } from 'vuex-class'

@Component({
  components: {
    Company,
    OtherPay,
    OnlinePayment
  }
})
export default class Recharge extends Vue {
  @State codeUrl
  activeName: number = 0

  // 线上充值
  onlineData: any = null

  // 线下(公司转账)
  offlineData: any = null

  // 线上充值的快速充值按键
  // moneyList: number[] = []

  // 页面loading
  isLoading: boolean = true

  // 是否显示在线充值相关组件
  get isOnlinePaymentVisiable() {
    const onlineData = this.onlineData
    return !!onlineData && !!onlineData.list && onlineData.list.length > 0
  }
  /** life */
  mounted() {
    // 请求充值的基本信息
    this.requestRechargeBaseInfo()
  }

  // 在线充值的头部点击
  tabsClick(index) {
    this.activeName = index
  }

  /** methods */
  // 请求充值的基本信息
  requestRechargeBaseInfo() {
    api
      .getBankWalletRecharge()
      .then((res: any) => {
        const { code, data } = res
        if (code === 0) {
          if (data && data.online_pay && data.online_pay.list && data.online_pay.list.length) {
            this.onlineData = (data && data.online_pay) || null
          }
          if (data && data.offline_pay && data.offline_pay.receive_bank && data.offline_pay.receive_bank.length) {
            this.offlineData = (data && data.offline_pay) || null
          }
        }
        this.isLoading = false
      })
      .catch(err => {
        this.isLoading = false
      })
  }
  goKefu() {
    window.open(this.codeUrl, 'newwindow', 'height=800, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
  }
}
</script>
