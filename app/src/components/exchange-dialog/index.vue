<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace, Action } from 'vuex-class'
import { Form } from 'element-ui'
import api from '@/api'

interface ParamState {
  type: number
  cid: string
  amount: string
}
const wallet = namespace('wallet')
@Component
export default class ExchangeDialog extends Vue {
  @wallet.State exchangeDialogConfig
  @wallet.State mainWallet
  @wallet.State isOneRecycle
  @wallet.State isLoading
  @wallet.State isOkExchange
  @wallet.State timer
  @wallet.Mutation updateExchangeDialogConfig
  @wallet.Mutation updateTimer
  @wallet.Action requestMainWallet
  @wallet.Action requestChildWallet
  @wallet.Action moneyConversion
  @wallet.Action oneRecycle

  $refs!: {
    dialogForm: Form
  }

  @Watch('exchangeDialogConfig', { deep: true })
  onExchangeDialogConfigChanged({ visible }) {
    if (visible) {
      this.requestMainWallet()
      this.$refs['dialogForm'].resetFields()
    } else {
      // 快速额度转换的弹框关闭时，恢复默认值
      this.dialogForm.amount = ''
      if (this.timer) {
        this.updateTimer({ timer: this.timer, type: 'clear' })
      }
    }
  }

  @Watch('isOkExchange')
  onisOkExchangechanged(val) {
    if (val && this.exchangeDialogConfig.visible) {
      this.$refs['dialogForm'].resetFields()
    }
  }

  // 金额的数组
  moneyArr: any = [50, 100, 200, 500, 1000, '全部']

  // 弹框的表单对象
  dialogForm: any = {
    amount: ''
  }

  // 表单校验
  formRules: any = {
    amount: [{ required: true, message: '请输入金额', trigger: ['blur', 'change'] }, { validator: this.validateAmount, trigger: ['blur', 'change'] }]
  }

  get btnAble() {
    return this.isLoading || this.isOneRecycle
  }

  validateAmount(rule, value, callback) {
    // 额度转换时，如果是主转子是不支持小数的，如果是子转主是可以支持小数
    // type:1 主转子，2 子转主
    if (this.mainWallet < Number(value)) {
      callback(new Error('转入子钱包，输入金额不能大于主钱包金额'))
    } else if (/^[1-9]\d*$/.test(value)) {
      callback()
    } else {
      callback(new Error('请填入正整数'))
    }
  }

  // close
  close() {
    if (!this.exchangeDialogConfig.apiParams) {
      this.exchangeDialogConfig.dialogRefrash()
    }
    this.updateExchangeDialogConfig({ visible: false })
  }

  // 弹框里的额度转换
  submitForm() {
    this.$refs['dialogForm'].validate(valid => {
      if (valid) {
        const param: ParamState = {
          type: 1,
          cid: this.exchangeDialogConfig.partner_id,
          amount: this.dialogForm.amount
        }
        this.moneyConversion({ param })
      }
    })
  }

  // 选择钱的方法
  selectMoney(money) {
    this.dialogForm.amount = money === '全部' ? parseInt(String(this.mainWallet)) : money
  }

  /** 关闭弹窗并且直接进入第三方游戏 */
  gotoAPI() {
    this.exchangeDialogConfig.gotoAPIMethod()
    this.updateExchangeDialogConfig({ visible: false })
  }
}
</script>
