<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue, Watch, Inject } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { Mutation, namespace, State } from 'vuex-class'
import api from '@/api'

const USER = namespace('user')

@Component
export default class Login extends Vue {
  @Inject('reload') reload!: Function
  @USER.Mutation updateToken
  @USER.Mutation updateUsername
  @USER.Mutation updateUserType

  @State dialogLoginVisible
  @State steamSwitch
  @State registerSwitch
  @State loginNoticeStatus

  @Mutation updateLoginNotice
  @Mutation updateLoginVisible
  @Mutation updateFreeDialogVisible
  @Mutation updateForgetDialogVisible
  /* 密码登录表单 */
  form1 = {
    username: localStorage.getItem('username') || '',
    password: ''
  }
  /* 手机号/邮箱登录表单 */
  form2 = {
    mobile_email: localStorage.getItem('mobile_email') || '',
    vcode: ''
  }

  rules1 = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  }

  rules2 = {
    mobile_email: [
      {
        required: true,
        validator: (rule, value, callback) => {
          if (this.regEmail.test(value) || this.regMobile.test(value)) {
            callback()
          } else {
            callback(new Error('请输入正确邮箱或手机号'))
          }
        },
        trigger: 'blur'
      }
    ],
    vcode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }

  isLogining: boolean = false

  getVcodeLoading: boolean = false

  isFastLogin: boolean = false

  regDemo: RegExp = /^(game_)/ // 试用账户正则校验
  regEmail: RegExp = /^([0-9A-Za-z-_.]+)@([0-9a-z]+.[a-z]{2,3}(.[a-z]{2})?)$/ // 邮箱正则校验
  regMobile: RegExp = /^0?1[3|4|5|7|8][0-9]\d{8}$/ // 手机号正则校验

  btnText: string = '获取验证码'
  disabledCodeBtn: boolean = false //获取验证码按钮可点击状态

  $refs!: {
    form1: Form
    form2: Form
  }

  mounted() {}

  tabToggle(tab, event) {
    this.isFastLogin = tab.index == '0' ? false : true
  }

  /* 倒计时 */
  countdown() {
    let self = this
    let time = 60
    this.disabledCodeBtn = true
    let interval = window.setInterval(function() {
      self.btnText = time + 's'
      if (time-- <= 0) {
        time = 60
        window.clearInterval(interval)
        self.disabledCodeBtn = false
        self.btnText = '获取验证码'
      }
    }, 1000)
  }
  /* 获取验证码 */
  getVcode() {
    if (this.regEmail.test(this.form2.mobile_email)) {
      this.getVcodeLoading = true
      let params = {
        email: this.form2.mobile_email
      }
      api
        .getVcodeEmail(params)
        .then((res: any) => {
          this.getVcodeLoading = false
          if (res.code == 0) {
            this.countdown()
            this.$message.success('邮箱验证码已发送')
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          this.getVcodeLoading = false
        })
    } else if (this.regMobile.test(this.form2.mobile_email)) {
      this.getVcodeLoading = true
      let params = {
        mobile: this.form2.mobile_email
      }
      api
        .getVcodeMobile(params)
        .then((res: any) => {
          this.getVcodeLoading = true
          if (res.code == 0) {
            this.countdown()
            this.$message.success('手机验证码已发送')
            this.getVcodeLoading = false
          } else {
            this.$message.error(res.msg)
            this.getVcodeLoading = false
          }
        })
        .catch(err => {
          this.getVcodeLoading = true
        })
    } else {
      this.$message.warning('请输入正确手机或邮箱号')
    }
  }

  /*
   * 存储登录数据
   */
  bindUser(data) {
    let user = {
      token: data.token,
      username: data.user.username
    }
    if (!this.isFastLogin) {
      /* 若试玩账号登录，更新UserType */
      if (/^(game_)/.test(this.form1.username)) {
        this.updateUserType('1')
      }
      user['userType'] = this.regDemo.test(this.form1.username) ? '1' : ''
    }
    this.updateToken(data.token)
    this.updateUsername(data.user.username)
    this.updateLoginNotice(true)
    localStorage.setItem('user', JSON.stringify(user))
    /* 最后关闭登录弹框 */
    this.updateLoginVisible(false)
  }

  // /** 请求登录 */
  requestLogin() {
    this.isLogining = true
    let params
    if (!this.isFastLogin) {
      // 密码登录
      params = {
        password: this.form1.password
      }
      if (this.regDemo.test(this.form1.username)) {
        params['demo'] = this.form1.username
      } else {
        params['username'] = this.form1.username
      }
      api
        .login(params)
        .then((res: any) => {
          this.isLogining = false
          if (res.code === 0) {
            this.$message.success('登录成功')
            this.bindUser(res.data)
            localStorage.setItem('username', this.form1.username)
            this.reloadPage()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(error => {
          this.isLogining = false
        })
    } else {
      // 手机号邮箱快捷登录
      params = {
        mobile: this.regMobile.test(this.form2.mobile_email) ? this.form2.mobile_email : '',
        email: this.regEmail.test(this.form2.mobile_email) ? this.form2.mobile_email : '',
        code: this.form2.vcode
      }
      api
        .loginByCode(params)
        .then((res: any) => {
          this.isLogining = false
          if (res.code === 0) {
            this.$message.success('登录成功')
            this.bindUser(res.data)
            localStorage.setItem('mobile_email', this.form2.mobile_email)
            this.reloadPage()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(error => {
          this.isLogining = false
        })
    }
  }

  /** 验证表单 */
  onLoginClick() {
    let formName = this.isFastLogin ? 'form2' : 'form1'
    this.$refs[formName].validate(valid => {
      if (valid) {
        this.requestLogin()
      } else {
        return false
      }
    })
  }

  /* 去注册 */
  gotoRegister() {
    this.updateLoginVisible(false)
    this.$router.push({ path: '/register' })
  }
  /* 去找回密码 */
  gotoForgetPwd() {
    this.updateLoginVisible(false)
    this.updateForgetDialogVisible(true)
  }
  /* 去免费试玩注册页 */
  gotoFreePlay() {
    this.updateLoginVisible(false)
    this.updateFreeDialogVisible(true)
  }

  /* 刷新当前页面 */
  reloadPage() {
    const needReloadPages = ['/activity']
    if (!needReloadPages.includes(this.$route.path)) return
    this.reload()
  }
}
</script>
