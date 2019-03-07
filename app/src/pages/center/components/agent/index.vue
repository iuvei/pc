<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import { namespace } from 'vuex-class'
import QrcodeVue from 'qrcode.vue'
const USER = namespace('user')

@Component({
  components: { QrcodeVue }
})
export default class extends Vue {
  @USER.State
  username

  /** 表格数据 */
  // [{ link: 'www.baidu.com' }]
  tableData: any[] = []
  /** 表格是否正在加载 */
  isLoading: boolean = false

  list: any = []
  /** 绑定代理的状态：unbind 未绑定，auditing 审核中，failed 未通过，passed 已通过 */
  hasBound = 'unbind'
  readonly bandStatus = {
    0: 'unbind',
    1: 'passed',
    2: 'auditing',
    3: 'failed'
  }

  isDialogVisible = false
  /** 等待用户点击刷新注册状态 */
  // awaitingRegisterVisible = false
  /** 正在提交数据 */
  isPosting = false

  $refs!: {
    form: Form
  }

  /** 表单和校验规则 */
  form = { agentName: '', password: '' }
  rules = { agentName: [{ required: true, message: '请输入代理名称' }], password: [{ required: true, message: '请输入密码' }] }

  /** 代理账户名称 */
  agentName = ''
  /** 推广码 */
  promotionCode = ''

  status: number = -1

  mounted() {
    this.agentBindingCheck()
  }

  /** 下载二维码 */
  saveQRCode(url: string) {
    const canvas = (document.getElementById(`download_large_${url}`) as HTMLElement).getElementsByTagName('canvas')[0]

    if (canvas) {
      const imgSrc = canvas.toDataURL('image/png')

      const elem = document.createElement('a')
      elem.setAttribute('href', imgSrc)
      elem.setAttribute('download', '')
      const event = new MouseEvent('click', { bubbles: false, cancelable: false })
      elem.dispatchEvent(event)
    }
  }

  /** 重置表单 */
  resetForm(formName: string) {
    this.$refs[formName].resetFields()
  }

  /** 取消绑定代理 */
  onCancel(formName: string) {
    this.isDialogVisible = false
    setTimeout(() => this.resetForm(formName), 50)
  }

  /** 检查用户是否绑定代理 */
  agentBindingCheck() {
    api.agentBindingCheck().then(res => {
      if (res.code > 0) {
        this.hasBound = this.bandStatus[0]
      } else if (res.code === 0 && res.data) {
        const { status, agentName, code, referralUrl } = res.data
        this.agentName = agentName || ''

        // status 0：绑定成功且停用，1绑定成功且启用，2:审核中，3：未通过
        if (status === 0 || status === 1) {
          this.promotionCode = code
          this.tableData = referralUrl ? referralUrl.map(link => ({ link })) : []
          this.status = status
        }
        this.hasBound = this.bandStatus[status === 0 ? 1 : status]
      }
    })
  }

  /** 验证通过后提交表单 */
  submitForm(formName) {
    this.$refs[formName].validate(valid => {
      if (valid) {
        this.postData()
      } else {
        return false
      }
    })
  }

  /** 提交数据 */
  postData() {
    if (this.isPosting) return
    const { agentName, password } = this.form
    const params = {
      agent_name: agentName,
      password
    }

    this.isPosting = true
    api.agentBinding(params).then(res => {
      this.isPosting = false
      if (res.code === 0) {
        this.isDialogVisible = false
        this.agentBindingCheck()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /** 代理后台注册成功，刷新注册状态 */
  // onRegisterSucceed() {
  //   this.awaitingRegisterVisible = false
  //   this.agentBindingCheck()
  // }

  /** 跳转代理后台不同页面 */
  toAgentAdmin(pageName?: string) {
    const agentAdminUrl = this.$generateAgentAdminUrl()
    switch (pageName) {
      // 代理后台注册页面
      case 'register':
        this.toAgentRegister(agentAdminUrl)
        break
      // 绑定代理后查看更多代理信息
      case 'background':
        this.goToAgentAdmin(agentAdminUrl)
        break

      // 代理后台首页
      default:
        window.open(agentAdminUrl, 'agentAdmin')
        break
    }
  }

  /** 打开代理后台 */
  goToAgentAdmin(url) {
    const blankWindow = window.open('about:blank', 'agentAdmin') as Window
    api
      .getAgentToken()
      .then(res => {
        if (res.code === 0 && res.data) {
          const href = url + '/validateToken' + `?onetimepad=${res.data.token}`
          blankWindow.location.href = href
        } else {
          this.$message.error(res.msg)
          blankWindow.close()
        }
      })
      .catch(_ => blankWindow.close())
  }

  /** 代理后台注册页面，绑定当前代理账号 */
  toAgentRegister(url) {
    const href = url + '/register' + `?bindMember=${this.username}`
    window.open(href, 'agentAdmin')
    // setTimeout(() => (this.awaitingRegisterVisible = true), 2000)

    // 解除绑定
    if (this.hasBound === this.bandStatus[3]) {
      api.unbindAgent().then(res => {
        if (res.code !== 0) {
          this.$message.error(res.msg)
        }
      })
    }
  }

  /** 绑定的代理状态为停用时，提示用户 */
  onAgentForbidden() {
    const msg = '代理账号已被禁用'
    this.$message.error(msg)
  }
}
</script>
