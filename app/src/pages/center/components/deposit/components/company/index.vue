<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import { Form } from 'element-ui'
import copy from 'copy-to-clipboard'

@Component
export default class Company extends Vue {
  $refs!: {
    formAdd: Form
  }
  // 数据源
  @Prop(Object) data!: any

  // 提交表单对象
  formAdd = {
    type: '1', //1代表公司转账（线下） 3:线上  4：网银
    money: '', //充值金额
    pay_name: '', //收款人
    bank_id: this.data.receive_bank[0].bank_id, //收款类型
    receive_bank_id: 0, //收款账号,读的是bankCardInfo的下标
    remark: '', //存款说明
    // 默认是参与优惠活动
    active_id: this.data.active[1] ? this.data.active[1].id : this.data.active[0].id //优惠活动的id
  }

  // 充值金额的下限
  minDepositMoney: number = 0

  // 充值金额的上限
  maxDepositMoney: number = 0

  // 定时器
  decimalTimer: any = null

  // 获取入款随机数接口的小数
  decimal: number = 0

  // 优惠活动的钱
  reapProfit: number = 0

  // 是否显示回执页
  isNext: boolean = false

  // 充值按钮的禁用
  isSubmit: boolean = false
  // 充值按钮的定时器
  submitTimer: any = undefined
  // 去掉bank_id一样的银行卡
  get bankArr() {
    return _.uniqBy(this.data.receive_bank, 'bank_id')
  }

  // 根据同一个银行，让用户选具体的银行卡
  get bankCardInfo() {
    let list = this.data.receive_bank.filter((v: any) => v.bank_id === this.formAdd.bank_id)
    return list
  }

  // 表单验证
  rules = {
    money: [{ required: true, message: '请输入充值金额', trigger: ['blur', 'change'] }, { validator: this.validatorMoney, trigger: ['blur', 'change'] }],
    pay_name: [{ required: true, message: '请输入收款人' }, { validator: this.validatorPayname, trigger: ['blur', 'change'] }],
    remark: [{ validator: this.validatorRemark, trigger: ['blur', 'change'] }],
    receive_bank_id: [{ required: true, message: '请选择收款账号', trigger: ['blur', 'change'] }]
  }

  validatorMoney(rule, value, callback) {
    const tempMoney = Number(value)
    const { maxDepositMoney, minDepositMoney } = this
    if (/^([1-9]\d*|0)(\.\d{1,2})?$/.test(value)) {
      if (tempMoney > maxDepositMoney || tempMoney < minDepositMoney) {
        callback(new Error(`请输入大于${minDepositMoney}元，小于${maxDepositMoney}元`))
      } else {
        callback()
      }
    } else {
      callback(new Error('请输入整数或者两位小数的充值金额'))
    }
  }
  validatorPayname(rule, value, callback) {
    if (value.length > 20) {
      callback(new Error('请输入不大于20个字符'))
    } else {
      callback()
    }
  }
  validatorRemark(rule, value, callback) {
    if (value.length > 50) {
      callback(new Error('请输入不大于50个字符'))
    } else {
      callback()
    }
  }

  // 收款类型
  @Watch('formAdd.bank_id')
  onBankIdChanged(val, oldVal) {
    // 当收款的类型变化时，收款账号也需要置空
    this.$set(this.formAdd, 'receive_bank_id', 0)
    this.getMinAndMaxMoney(0)
  }

  // 收款账号
  @Watch('formAdd.receive_bank_id', { immediate: true, deep: true })
  onReceiveBankIdChanged(val, oldVal) {
    this.getMinAndMaxMoney(val)
  }

  // 优惠
  @Watch('formAdd.active_id')
  onActiveIdChanged() {
    this.requestCoupon()
  }

  /** life - methods */
  mounted() {
    this.$refs['formAdd'].resetFields()
  }

  beforeDestroy() {
    if (this.submitTimer) {
      clearInterval(this.submitTimer)
    }
  }

  /** 方法 */
  /** 根据用选择的银行卡，限制充值金额的上限和下限 */
  getMinAndMaxMoney(index) {
    const { once_min_limit, once_max_limit } = this.bankCardInfo[index]
    this.minDepositMoney = once_min_limit
    this.maxDepositMoney = once_max_limit
  }

  /** 复制银行卡信息 */
  copyBankInfo(val) {
    copy(val)
    this.$message({ type: 'success', message: '复制成功！' })
  }

  /** 充值金额变化时，调用 */
  inputMoneyFun() {
    // 充值金额
    // 如果是整数的话，就要获取入款随机数接口，最后在保存表单的接口时，把小数加入到money的值
    // 否则不用
    const { money, active_id } = this.formAdd
    if (!money) {
      this.reapProfit = 0
      this.decimal = 0
      return
    } else {
      // 如果是负数的话
      if (/\-/.test(money)) {
        return
      }
    }
    // 控制输入的长度
    const isDote = /\./.test(money)
    const tempLen = money.length
    this.$nextTick(() => {
      if (!isDote && tempLen > 9) {
        this.$set(this.formAdd, 'money', money.slice(0, 9))
      } else if (isDote && tempLen > 12) {
        this.$set(this.formAdd, 'money', money.slice(0, 9))
      }
    })

    clearTimeout(this.decimalTimer)
    if (money && /\./.test(money)) {
      // 有小数点
      this.$nextTick(() => {
        if (!/^([1-9]\d*|0)(\.\d{1,2})?$/.test(money)) {
          this.$set(this.formAdd, 'money', money.substring(0, money.indexOf('.') + 3))
        }
      })
      this.decimal = 0
    } else if (money && !/\./.test(money)) {
      // 无小数点
      this.decimalTimer = setTimeout(() => {
        api
          .getBankWalletOfflineMoney({ money })
          .then((res: any) => {
            const { code, data } = res
            if (code === 0) {
              this.decimal = Number(data)
            } else {
              this.decimal = 0
            }
            // 更新获得优惠
            /** 更新获得优惠 */
            this.requestCoupon()
          })
          .catch(error => {
            this.decimal = 0
          })
      }, 300)
    }
  }

  // 计算优惠金额
  requestCoupon() {
    const { active_id, money } = this.formAdd
    if (active_id != 0) {
      api
        .getBankWalletCoupon({
          type: 1,
          active_id,
          money: Number(money) + this.decimal
        })
        .then((res: any) => {
          if (res.code === 0) {
            this.reapProfit = res.data.coupon_amount
          } else {
            this.reapProfit = 0
          }
        })
    } else {
      this.reapProfit = 0
    }
  }

  /** 下一步 */
  next() {
    this.$refs['formAdd'].validate(valid => {
      if (valid) {
        this.isNext = true
        this.$refs['page'].scrollTop = 0
      }
    })
  }

  /** 提交 */
  submitForm() {
    let c = 0
    this.isSubmit = true
    this.submitTimer = setInterval(() => {
      c++
      if (c === 2) {
        this.isSubmit = false
        clearInterval(this.submitTimer)
      }
    }, 1000)
    const { formAdd, bankCardInfo } = this
    const { type, money, pay_name, receive_bank_id, remark, active_id } = this.formAdd
    api
      .putBankWalletRecharge({
        type,
        money: Number(money) + this.decimal,
        pay_name,
        receive_bank_id: this.bankCardInfo[receive_bank_id].id,
        remark,
        active_id,
        url_return: location.origin
      })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('充值成功')
          // 恢复初始化的状态
          this.$refs['formAdd'].resetFields()
          this.decimal = 0
          this.isNext = false
        } else {
          this.$message.error(msg)
        }
      })
  }
}
</script>
