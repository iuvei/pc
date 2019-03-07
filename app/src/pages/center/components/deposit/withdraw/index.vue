<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { namespace, Mutation } from 'vuex-class'
import { Form } from 'element-ui'

const USER = namespace('user')
const wallet = namespace('wallet')

@Component
export default class WithDraw extends Vue {
  @Mutation updateCenterDialogConfig
  @Mutation updateWithdrawDialogVisible
  @USER.State username

  @wallet.Action allRefresh
  @wallet.State totalBalance
  @wallet.State mainWallet

  nextStepShow: boolean = false

  bank: string = '' //提现银行
  amount: any = null //输入的提现金额
  withdrawPwd: string = '' //提现密码

  bankId: number = 0 //提现银行ID
  bankColumns: any = [] //所有提现银行
  minAmount: number = 0 //最小可提现余额
  maxAmount: number = 0 //最大可提现余额

  freezeWithdraw: number = 0 //冻结的金额
  noFeeTimes: number = 0 //剩余免手续费次数
  realname: string = '' //真实姓名

  administrativeFee: number = 5 // 行政费
  procedureFee: number = 8 //手续费
  couponFee: number = 10 // 扣除存款优惠
  result: number = 0 // 稽核结果
  applyTime: any = '' //预申请时间

  withdrawTableData: any = []
  auditListTableData: any = []

  /* loading */
  loading: boolean = false
  preAppLoading: boolean = false
  confirmLoading: boolean = false

  betList: any[] = []

  confirmTimer: any = undefined

  // 控制显示忘记密码的弹框
  isShowWithdraw: boolean = false

  mounted() {
    this.getWithdrawData()
    this.allRefresh()
  }
  beforeDestroy() {
    if (this.confirmTimer) {
      clearInterval(this.confirmTimer)
    }
  }

  /*
   * 获取-提现的数据
   */
  getWithdrawData() {
    this.loading = true
    api
      .getBankWalletWithdraw()
      .then((res: any) => {
        this.loading = false
        if (res.code == 0) {
          if (res.data && res.data.bank_list && res.data.bank_list.length == 0) {
            this.$alert('当前账号未绑定银行卡，将跳转银行卡绑定页···')
              .then(_ => {
                this.updateCenterDialogConfig({ visible: true, group: 0, menu: 0, tab: 'bankManage' })
              })
              .catch(_ => {
                // this.$router.go(-1)
                this.updateCenterDialogConfig({ visible: true, group: 0, menu: 0, tab: 'bankManage' })
              })
          } else if (res.data && res.data.bank_list && !res.data.check_withdraw) {
            this.$alert('当前帐号未绑定手机/邮箱或不在提现时间范围，将跳转手机/邮箱绑定页···')
              .then(() => {
                this.updateCenterDialogConfig({ visible: true, group: 2, menu: 1 })
              })
              .catch(_ => {
                // this.$router.go(-1)
                this.updateCenterDialogConfig({ visible: true, group: 2, menu: 1 })
              })
          } else {
            this.realname = res.data.real_name
            this.minAmount = Number(res.data.min)
            this.maxAmount = Number(res.data.max)
            this.noFeeTimes = res.data.no_fee_time
            this.bankColumns = res.data.bank_list.map(item => {
              item.name2 = item.name + '(' + item.card_number + ')'
              return item
            })
            this.bank = res.data.bank_list[0].name + '(' + res.data.bank_list[0].card_number + ')'
            this.bankId = res.data.bank_list[0].id
          }
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {
        this.loading = false
      })
  }

  /*
   * 校验-预申请
   */
  checkPreApplication() {
    if (this.amount == null) {
      this.$message.error('请输入提现金额')
      return true
    } else if (this.amount > this.maxAmount || this.amount < this.minAmount) {
      this.$message.error('提现范围为' + this.minAmount + '~' + this.maxAmount + '元')
      return true
    } else if (!/^\d+$/.test(this.amount)) {
      this.$message.error('提现金额只支持正整数')
      return true
    } else if (this.amount > this.mainWallet) {
      this.$message.error('可提现余额不足')
      return true
    } else if (this.withdrawPwd == '') {
      this.$message.error('请输入提现密码')
      return true
    }
  }
  /* 预申请 */
  preApplication() {
    if (this.checkPreApplication()) {
      return false
    }
    this.preAppLoading = true
    let params = {
      money: this.amount,
      password: this.withdrawPwd
    }
    api
      .getPreApplication(params)
      .then((res: any) => {
        this.preAppLoading = false
        if (res.code == 0) {
          this.administrativeFee = Number(res.data.admin_fee) // 行政费
          this.procedureFee = Number(res.data.fee) //手续费
          this.couponFee = Number(res.data.coupon_fee) //优惠扣除
          this.result = res.data.result // 1-稽核通过 0 -不通过
          this.auditListTableData = res.data.list // 稽核详情列表
          this.applyTime = res.data.apply_time // 预申请时间
          this.nextStepShow = true
          this.betList = res.data.list.length && res.data.list[0].betdetail.map((item, index) => ({ name: item.name, index }))
          this.withdrawTableData = [
            {
              money: Number(res.data.money),
              administrativeFee: Number(res.data.admin_fee),
              procedureFee: Number(res.data.fee),
              couponFee: Number(res.data.coupon_fee),
              realMoney: Number(res.data.money) - Number(res.data.admin_fee) - Number(res.data.fee) - Number(res.data.coupon_fee),
              applyTime: res.data.apply_time
            }
          ]
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {
        this.preAppLoading = false
      })
  }

  /* 返回第一步 */
  goBackFirstStep() {
    this.nextStepShow = false
  }

  /*
   * 点击-确认提现
   */
  confirmWithdradal() {
    let c = 0
    this.confirmLoading = true
    this.confirmTimer = setInterval(() => {
      c++
      if (c === 2) {
        this.confirmLoading = false
        clearInterval(this.confirmTimer)
      }
    }, 1000)
    let params = {
      withdraw_money: this.amount,
      withdraw_pwd: this.withdrawPwd,
      withdraw_card: this.bankId,
      remark: ''
    }
    api
      .confirmWithdrawal(params)
      .then((res: any) => {
        if (res.code == 0) {
          this.$message.success('您的提款申请已提交审核，有疑问请联系客服。')
          this.nextStepShow = false
          this.amount = null
          this.withdrawPwd = ''
          this.getWithdrawData()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {})
  }

  /* 银行选中值发生变化时触发 */
  changeBankSelect(bankID) {
    this.bankId = bankID
  }

  // 显示忘记提款密码的弹框
  showWithdrawDialog(show) {
    this.isShowWithdraw = show
  }
}
</script>
