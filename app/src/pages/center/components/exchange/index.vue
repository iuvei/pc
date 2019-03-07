<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Button, Table, Row, Col, Select, Form, Dialog } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import state from '@/store/state'
import CountUp from './../../js/count-up.js'
import { Mutation, namespace, State, Action } from 'vuex-class'
const wallet = namespace('wallet')
@Component
export default class Exchange extends Vue {
  @wallet.Mutation updateCenterDialogConfig
  @wallet.Mutation updateExchangeDialogConfig
  @wallet.State totalBalance
  @wallet.State mainWallet
  @wallet.State freezeWithdraw
  @wallet.State totalChildrenBalance
  @wallet.State childLenCount
  @wallet.State childWalletArr
  @wallet.State loadingCWallet
  @wallet.State isOneRecycle
  @wallet.State isLoading
  @wallet.State isOkExchange
  @wallet.State timer
  @wallet.Action oneRecycle
  @wallet.Action allRefresh
  @wallet.Action reflreshChildWallet
  @wallet.Action moneyConversion
  @wallet.Mutation updateTimer

  /*************data***********/
  // 表单对象
  form: any = {
    transferWallet: '', // 转出钱包value
    transferToWallet: '', // 转入钱包value
    amount: '' // amount
  }

  // 下拉选择钱包类型列表
  selectWalletArr: any = []

  // 表单校验
  formRules: any = {
    transferWallet: [{ required: true, message: '请选择转出钱包', trigger: ['blur', 'change'] }],
    transferToWallet: [{ required: true, message: '请选择转入钱包', trigger: ['blur', 'change'] }],
    amount: [{ required: true, message: '请输入金额', trigger: ['blur'] }, { validator: this.validateAmount, trigger: ['blur', 'change'] }]
  }

  // countup的配置项
  options = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.'
  }
  // 数字变化的对象
  demo: any = undefined

  // 子钱包的数组
  childListArr: any = []

  // 是否可以刷新
  get isRefresh() {
    return this.childWalletArr.length !== this.childLenCount
  }

  // 页面按钮能否点击
  get btnAble() {
    // isOneRecycle:一键回收2s内不能点击
    // isConfirm：中间表单的确定转账的2s内不能点击
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
    this.childListArr = len ? _.chunk(val, Math.round(len / 2)) : [[], []]
    this.selectWalletArr = len ? [{ name: '主钱包' }, ...val] : [{ name: '主钱包' }]
  }

  @Watch('isOkExchange')
  onIsLoadingchanged(val) {
    if (val) {
      this.$refs['form'].resetFields()
    }
  }

  validateAmount(rule, value, callback) {
    // 额度转换时，如果是主转子是不支持小数的，如果是子转主是可以支持小数
    // type:1 主转子，2 子转主
    const type = this.form.transferWallet === 0 ? 1 : 2
    switch (type) {
      case 1:
        if (this.mainWallet < Number(value)) {
          callback(new Error('转入子钱包，输入金额不能大于主钱包金额'))
        } else if (/^[1-9]\d*$/.test(value)) {
          callback()
        } else {
          callback(new Error('请填入正整数'))
        }
        break
      case 2:
        if (this.selectWalletArr[this.form.transferWallet].balance < Number(value)) {
          callback(new Error('转入主钱包，输入金额不能大于子钱包金额'))
        } else if (/^\d+(\.\d{0,2})?$/.test(value)) {
          callback()
        } else {
          callback(new Error('请填写整数或者保留两位小数的金额'))
        }
    }
  }

  $refs!: {
    form: Form
  }
  /*************life-cycle***********/
  mounted() {
    this.createdCountUp()
    this.allRefresh()
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
      this.demo = new CountUp('myTargetElement', 0, this.totalBalance, 2, 0.08, this.options)
      this.demo.start()
    })
  }

  // 将主钱包的钱转入到对应的子钱包
  // obj : 对象
  // x  ：一维
  // y :二维
  changeMoneyIntoChild(obj, x, y) {
    const { balance, partner_id, name } = obj
    const tempDialogObj = {
      balance: this.mainWallet,
      childName: name,
      childBalance: balance,
      partner_id,
      visible: true,
      dialogRefrash: this.allRefreshFun,
      apiParams: null
    }
    this.updateExchangeDialogConfig(tempDialogObj)
  }

  // 表格操作的那列的头渲染对应的节点
  renderHeader(h, { column, $index }) {
    return (
      <span>
        <span>操作</span>
        <el-popover placement="top-start" width="200" trigger="hover" content="可以将主钱包的所有余额一键转入到任意子钱包中">
          <i class="el-icon-question" slot="reference" />
        </el-popover>
      </span>
    )
  }

  // 转出帐户
  transferWalletFun(value, obj) {
    this.isSelectMainWallet(value, 'transferWallet', 'transferToWallet')
  }

  // 转入帐户
  transfeTorWalletFun(value) {
    this.isSelectMainWallet(value, 'transferToWallet', 'transferWallet')
  }

  // 判断转出帐户和转入帐户是否都选了主钱包
  // value：当前修改的值
  // key: 当前的key
  // key1: 相对应的另外的key 例如：如果 key 是 'transferWallet',则 key1 是 'transferToWallet'
  isSelectMainWallet(value, key, key1) {
    // 三种情况
    // 1.主 主
    // 2.主 子
    // 3.子 主
    if (value == 0) {
      switch (key) {
        case 'transferWallet':
          if (this.form.transferToWallet == 0) {
            this.form.transferToWallet = ''
          }
          break
        case 'transferToWallet':
          if (this.form.transferWallet == 0) {
            this.form.transferWallet = ''
          }
          break
      }
    } else {
      this.form[key1] = 0
    }
  }

  // 确定转账
  confirmTransferWallet() {
    this.$refs['form'].validate(valid => {
      if (valid) {
        const { transferWallet, transferToWallet, amount } = this.form
        // 组装数据
        const list = this.selectWalletArr
        // 1-主转子2-子转主
        const type = transferWallet === 0 ? 1 : 2
        let param: ParamState = {
          type,
          cid: type === 1 ? list[transferToWallet].partner_id : list[transferWallet].partner_id,
          amount
        }
        this.childListArr.map((child: any, i: number) => {
          child.map((obj: any, index: number) => {
            if (obj.partner_id === param.cid) {
              this.moneyConversion({ param, index: i ? this.childListArr[0].length + index : index })
            }
          })
        })
      }
    })
  }

  // 全部刷新
  allRefreshFun() {
    this.demo = undefined
    this.$refs['form'].resetFields()
    this.createdCountUp()
    this.allRefresh()
  }

  // 一键回收
  oneRecycleFun() {
    this.$refs['form'].resetFields()
    this.oneRecycle()
  }
}
interface ParamState {
  type: number
  cid: string
  amount: Number
}
</script>
