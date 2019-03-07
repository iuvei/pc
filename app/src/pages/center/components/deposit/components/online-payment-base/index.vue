<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import api from '@/api'
import { Form } from 'element-ui'
import copy from 'copy-to-clipboard'
import { State } from 'vuex-class'

@Component
export default class OnlinePaymentBase extends Vue {
  @State codeUrl

  $refs!: {
    form: Form
    customerClick: any
  }

  @Prop(Object) data!: any

  // 第几个线上支付方式
  @Prop(Number) number!: number

  // 线上充值支付方式列表下标
  listIndex: number = 0

  // 表单对象
  formAdd: FormState = {
    money: '', //充值金额
    active_id: 0, //优惠活动id
    scene: '', //线上充值的方式
    type: '', //充值类型1：公司转账，3:线上 4：网银
    bank_code: '' //网银的时候需要加上银行卡这个参数
  }

  // 优惠金额
  reapProfit: number = 0

  // 充值金额上限
  minDepositMoney: number = 0

  // 充值金额下限
  maxDepositMoney: number = 0

  // 成功率
  minSuccessMoney: number = 0
  maxSuccessMoney: number = 0

  // 扫码支付弹框
  showDialog: boolean = false

  // 扫码支付的弹框对象
  qrcodeInfo: any = { url: '', money: '', reapProfit: '', orderNum: '', deposit_id: '' }

  // 判断是否支付完成的状态码,为1时是支付完成
  payStatus: number = 0

  // 隔多久请求支付完成的状态
  timer: any = null

  // 是否完成了一次支付请求状态
  timerLoading: boolean = false

  // 用户如果点击了已支付的按钮，设置为true
  isOkClick: boolean = false

  // 充值按钮的禁用
  isSubmit: boolean = false
  // 充值按钮的定时器
  submitTimer: any = undefined
  // 校验规则
  rules = {
    money: [{ required: true, message: '请输入充值金额', trigger: ['blur', 'change'] }, { validator: this.validatorMoney, trigger: ['blur', 'change'] }],
    active_id: [{ required: true, message: '请输入收款人' }],
    bank_code: [{ required: this.data.list[this.dataListIndex].type == 4 ? true : false, message: '请选择银行卡' }]
  }

  get dataListIndex() {
    return this.number !== undefined ? this.number : this.listIndex
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

  @Watch('formAdd.active_id')
  onActiveIdChanged(val) {
    this.inputMoneyFun()
  }

  created() {
    this.dataInit()
  }
  /** life  */
  mounted() {
    this.$refs['form'] && this.$refs['form'].resetFields()
  }

  beforeDestroy() {
    if (this.submitTimer) {
      clearInterval(this.submitTimer)
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
  /** methods */
  // 初始化数据
  dataInit() {
    const { once_max_limit, once_min_limit, type, scene, high_once_max_limit, high_once_min_limit } = this.data.list[this.dataListIndex]
    this.maxDepositMoney = once_max_limit
    this.minDepositMoney = once_min_limit
    this.minSuccessMoney = high_once_min_limit
    this.maxSuccessMoney = high_once_max_limit
    // 默认是参与优惠活动
    this.formAdd.active_id = this.data.active[1] ? this.data.active[1].id : this.data.active[0].id
    this.formAdd.scene = scene
    this.formAdd.type = type
  }
  // 充值金额变化时，触发的
  inputMoneyFun() {
    // 计算优惠金额
    let tempMoney = this.formAdd.money
    // 控制输入的长度
    const isDote = /\./.test(tempMoney)
    const tempLen = tempMoney.length
    this.$nextTick(() => {
      if (!isDote && tempLen > 9) {
        this.$set(this.formAdd, 'money', tempMoney.slice(0, 9))
      } else if (isDote && tempLen > 12) {
        this.$set(this.formAdd, 'money', tempMoney.slice(0, 9))
      }
    })

    if (/^([1-9]\d*|0)(\.\d{1,})?$/.test(tempMoney)) {
      this.$nextTick(() => {
        if (!/^([1-9]\d*|0)(\.\d{1,2})?$/.test(tempMoney)) {
          this.$set(this.formAdd, 'money', tempMoney.substring(0, tempMoney.indexOf('.') + 3))
        }
        const { money, active_id, type } = this.formAdd
        if (active_id != 0) {
          api
            .getBankWalletCoupon({
              type,
              active_id,
              money
            })
            .then((res: any) => {
              const { code, data } = res
              if (code === 0) {
                this.reapProfit = data.coupon_amount
              } else {
                this.reapProfit = 0
              }
            })
            .catch(err => {
              this.reapProfit = 0
            })
        } else {
          this.reapProfit = 0
        }
      })
    } else {
      this.reapProfit = 0
    }
  }
  // 关闭扫码支付的弹框
  cancel() {
    this.showDialog = false
    this.timerLoading = false
    clearTimeout(this.timer)
  }

  /** 提交 */
  submitForm() {
    this.$refs['form'].validate(valid => {
      if (valid) {
        let c = 0
        this.isSubmit = true
        this.submitTimer = setInterval(() => {
          c++
          if (c === 2) {
            this.isSubmit = false
            clearInterval(this.submitTimer)
          }
        }, 1000)

        const { money, active_id, scene, type, bank_code } = this.formAdd
        let params = this.generateParams()
        if (type == 4) {
          params['bank_code'] = bank_code
        }
        api.putBankWalletRecharge({ ...params, url_return: location.origin }).then((res: any) => {
          const { code, data, msg } = res
          if (code === 0) {
            const { url_type, url } = data
            switch (url_type) {
              case 'jump_page':
                this.$refs['customerClick'].click(
                  window.open(
                    url,
                    'newwindow',
                    'height=800, width=800, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no'
                  )
                )
                break
              case 'jump_img':
                // 扫码支付
                this.showDialog = true
                const { order_number, deposit_id } = data
                this.qrcodeInfo = {
                  url,
                  money: String(money),
                  reapProfit: this.reapProfit,
                  orderNum: order_number,
                  deposit_id
                }
                this.pollingStart()
            }
          } else {
            this.$message.error(msg)
          }
        })
      }
    })
  }

  /** 生成提交参数 */
  generateParams(): Record<string, any> {
    const { money, active_id, scene, type } = this.formAdd
    return { money, active_id, scene, type }
  }

  // 我已支付的事件
  paySuccess() {
    if (this.payStatus === 1) {
      this.success()
    } else {
      this.isOkClick = true
      this.requestPayStatus()
    }
  }

  // 循环请求是否支付完成了
  pollingStart() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.requestPayStatus()
    }, 3000)
  }
  // 支付状态的请求
  requestPayStatus() {
    if (this.timerLoading) return false
    this.timerLoading = true
    api
      .getBankWalletPayStatus({ deposit_id: this.qrcodeInfo.deposit_id })
      .then((res: any) => {
        if (res.code === 0) this.payStatus = res.data
        this.timerLoading = false
        this.$nextTick(() => {
          if (this.isOkClick) {
            this.isOkClick = false
            if (this.payStatus !== 1) {
              // this.$message.error(this.payStatus === 0 ? '提交成功，等待后台审核' : '充值失败')
              if (this.payStatus === 0) {
                this.$message.success('提交成功，等待后台审核')
              } else {
                this.$message.error('充值失败')
              }
              this.pollingStart()
            } else {
              this.success()
            }
          } else if (this.payStatus === 1) {
            this.success()
          } else {
            this.pollingStart()
          }
        })
      })
      .catch(err => {
        this.timerLoading = false
        this.$nextTick(() => this.payStatus !== 1 && this.pollingStart())
      })
  }
  success() {
    this.$message.success('充值成功')
    const timer = setTimeout(() => {
      this.showDialog = false
      clearTimeout(timer)
    }, 3100)
  }

  /** 复制银行卡信息 */
  copyBankInfo(val) {
    copy(val)
    this.$message({ type: 'success', message: '复制成功！' })
  }
  goKefu() {
    window.open(this.codeUrl, 'newwindow', 'height=800, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
  }
}
interface FormState {
  money: any //充值金额
  active_id: any //优惠活动id
  scene: any //线上充值的方式
  type: any //充值类型1：公司转账，3:线上 4：网银
  bank_code?: any //网银的时候需要加上银行卡这个参数
}
</script>
