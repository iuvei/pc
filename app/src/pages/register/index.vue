<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { Mutation, namespace, Action, State } from 'vuex-class'
import api from '@/api'
import WithdrawPassword from '@/components/withdraw-password/index.vue'
import { GameType } from '@/enums'

const USER = namespace('user')

@Component({
  components: {
    WithdrawPassword
  }
})
export default class Register extends Vue {
  @USER.Mutation updateToken
  @USER.Mutation updateUsername
  @USER.Mutation updateUserType
  @Mutation updateLoginNotice
  @State loginNoticeStatus
  @USER.State userType
  @Action gotoAPI

  $refs!: {
    loginForm: Form
  }

  registerLoading: boolean = false
  submitLoading: boolean = false
  msgLoading: boolean = false

  registerForms: any = []
  registerForm1: any = []
  registerForm2: any = []

  loginForm: any = {
    username: '', //用户名
    password: '', //密码
    psd_confirm: '', //确认密码
    birth: '', //出生日期
    sex: '', //性别
    email: '', //邮箱
    email_code: '', //邮箱验证码
    mobile: '', //手机号码
    mobile_code: '', //手机验证码
    invite_code: '', //邀请码
    qq: '', //QQ
    wechat: '', //微信
    skype: '',
    realname: '', //真实姓名
    withdraw_password: '', //提现密码
    vcode: '' //图片验证码
  }

  loginRules: any = {}

  agree: boolean = false

  showTit2: boolean = false

  list: any = []

  optionSex = [
    {
      label: '男',
      value: '1'
    },
    {
      label: '女',
      value: '2'
    },
    {
      label: '保密',
      value: '3'
    }
  ]

  mounted() {
    this.getRegisterForms()
    this.setInvitCode()
    this.requestHotGames()
  }

  /* 获取热门游戏 */
  requestHotGames() {
    api
      .getTagHot()
      .then((response: any) => {
        if (response.code === 0) {
          this.list = response.data
        }
      })
      .catch(error => {})
  }
  /* 获取图标 */
  getAPILogoPath(item) {
    let name = item.partner_name.toLowerCase()
    let src
    try {
      src = require(`./img/logo/${name}_1.png`)
    } catch (err) {
      src = require(`./img/logo/default.png`)
    }
    return src
  }

  /* 点击某个游戏 */
  onGameClick(item) {
    // 如果是试玩账号登录
    if (this.userType === '1') {
      // is_trial 1-支持试玩   0-不支持！
      if (item.is_trial === 1) {
        this.gotoContent(item)
      } else {
        this.$message.error('仅支持正式账号')
      }
    } else {
      // 正式账号登录
      // this.requestChildWallet(item, this.gotoContent)
      this.gotoContent(item)
    }
  }

  gotoContent(item) {
    if (item.game_type === GameType.EGame) {
      window.open(
        `/game/egame/${item.partner_name.toLocaleUpperCase()}`,
        'egame&card',
        'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
      )
    } else if (item.game_type === GameType.Card) {
      window.open(
        `/game/card/${item.partner_name.toLocaleUpperCase()}`,
        'egame&card',
        'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
      )
    } else {
      this.gotoAPI({
        game_type: item.game_type,
        partner_name: item.partner_name,
        game_code: item.game_code,
        partner_id: item.partner_id,
        return_url: item.game_url || ''
      })
    }
  }

  /*
   * 获取-注册邀请码
   */
  setInvitCode() {
    const { code } = this.$route.query
    if (code) {
      sessionStorage.setItem('invite_code', code)
    }
  }

  /*
   * 获取-注册字段信息
   */
  getRegisterForms() {
    this.registerLoading = true
    api
      .getRegister()
      .then((res: any) => {
        this.registerLoading = false
        if (res.code == 0) {
          this.changeRegisterData(res.data)
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {
        this.registerLoading = false
      })
  }
  /*
   * 更改-获取到的注册字段信息
   * 1.新增用户名、密码、确认密码三项
   * 2.为其他项增加数据
   */
  changeRegisterData(resData) {
    this.registerForms = [
      {
        item: 'username',
        name: '用户名',
        required: true,
        show: true,
        type: 'text',
        reg: '^(?![0-9]+$)[0-9a-zA-Z]{6,16}$',
        placeholder: '请输入6-16位数字和字母结合',
        position: 'top'
      },
      {
        item: 'password',
        name: '密码',
        required: true,
        show: true,
        type: 'password',
        reg: '^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$',
        placeholder: '请输入6-16位字符组合',
        position: 'top'
      },
      {
        item: 'psd_confirm',
        name: '确认密码',
        show: true,
        required: true,
        type: 'password',
        placeholder: '请再次输入密码',
        position: 'top'
      }
    ].concat(
      resData.map(items => {
        items.type = 'text'
        items.placeholder = '请输入正确' + items.name
        if (items.item === 'email') {
          items.reg = '^([0-9A-Za-z-_.]+)@([0-9a-z]+.[a-z]{2,3}(.[a-z]{2})?)$'
          if (items.valid) {
            items.vcode = ''
            items.disabled = false
            items.time = 60
            items.btnText = '获取验证码'
          }
        } else if (items.item === 'mobile') {
          items.reg = '^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$'
          if (items.valid) {
            items.vcode = ''
            items.disabled = false
            items.time = 60
            items.btnText = '获取验证码'
          }
        } else if (items.item === 'birth') {
          items.type = 'date'
          items.placeholder = '请选择' + items.name
        } else if (items.item === 'sex') {
          items.placeholder = '请选择' + items.name
        } else if (items.item === 'realname') {
          items.reg = '^[\u4E00-\u9FA5]{2,10}$'
        } else if (items.item === 'withdraw_password') {
          items.type = 'widthdrawPassword'
          items.reg = '^[0-9]{4}$'
          items.position = 'top'
          items.placeholder = '请输入4位数的密码'
        } else if (items.item === 'vcode') {
          items.img = ''
          this.getPicCode(items)
        } else if (items.item === 'invite_code') {
          this.loginForm['invite_code'] = sessionStorage.getItem('invite_code') || ''
        } else if (items.item === 'wechat') {
          items.reg = '^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$'
        } else if (items.item === 'qq') {
          items.reg = '[1-9][0-9]{4,14}'
        } else if (items.item === 'skype') {
          items.reg = '^.{1,50}$'
        }
        return items
      })
    )
    this.registerForm1 = this.registerForms.filter(item => item.position === 'top')
    this.registerForm2 = this.registerForms.filter(item => item.position !== 'top')
    this.showTit2 = this.registerForm2.some(item => item.show == true)
    this.loginRules = [{}, ...this.registerForms].reduce((pre, cur) => {
      return {
        ...pre,
        [cur.item]: [
          {
            required: cur.required,
            validator: (rule, value, callback) => {
              if (rule.required) {
                if (value !== '' && new RegExp(cur.reg).test(value)) {
                  callback()
                } else {
                  callback(new Error(cur.placeholder))
                }
              } else {
                if (value !== '') {
                  if (new RegExp(cur.reg).test(value)) {
                    callback()
                  } else {
                    callback(new Error(cur.placeholder))
                  }
                } else {
                  callback()
                }
              }
            },
            trigger: cur.item === 'sex' || cur.item === 'birth' || cur.item === 'withdraw_password' ? 'change' : 'blur'
          }
        ]
      }
    })
  }
  /*
   * 点击-倒计时
   */
  countdown(items) {
    let interval = window.setInterval(() => {
      items.disabled = true
      items.btnText = items.time + 's后重新获取'
      if (items.time-- <= 0) {
        items.time = 10
        window.clearInterval(interval)
        items.disabled = false
        items.btnText = '获取验证码'
      }
    }, 1000)
  }
  /*
   * 点击-获取验证码
   */
  getMsgCode(items) {
    if (!new RegExp(items.reg).test(this.loginForm[items.item])) {
      this.$message.success('请输入正确的' + items.name)
      return false
    }
    let params: object = {}
    params[items.item] = this.loginForm[items.item]
    if (items.item === 'email') {
      this.msgLoading = true
      api
        .getVcodeEmail(params)
        .then((res: any) => {
          this.msgLoading = false
          if (res.code == 0) {
            this.countdown(items)
            this.$message.success('邮箱验证码已发送')
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          this.msgLoading = false
        })
    } else if (items.item === 'mobile') {
      this.msgLoading = true
      api
        .getVcodeMobile(params)
        .then((res: any) => {
          this.msgLoading = false
          if (res.code == 0) {
            this.countdown(items)
            this.$message.success('短信验证码已发送')
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          this.msgLoading = false
        })
    }
  }

  /* 获取图片验证码 */
  getPicCode(items) {
    api
      .vcode()
      .then((res: any) => {
        if (res.code == 0) {
          items.img = res.data.img
          this.loginForm['hash'] = res.data.hash
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(err => {})
  }

  /*
   * 存储-注册数据
   */
  bindUser(data) {
    this.updateToken(data.token)
    this.updateUsername(data.user.username)
    this.updateLoginNotice(true)
    let user = {
      token: data.token,
      username: data.user.username
    }
    localStorage.setItem('user', JSON.stringify(user))
  }

  /* 确认注册 */
  submitForm(formName) {
    this.$refs[formName].validate(valid => {
      if (valid) {
        if (this.loginForm.password !== this.loginForm.psd_confirm) {
          this.$message.error('两次密码不一致')
          return false
        }

        let stop = false
        this.registerForms.forEach(items => {
          if (items.item === 'email' || items.item === 'mobile') {
            if (items.valid && items.vcode === '') {
              this.$message.error(items.placeholder + '验证码')
              stop = true
            }
          }
        })
        if (stop) {
          return false
        }

        if (!this.agree) {
          this.$message.warning('请先阅读并同意服务条款')
          return false
        }
        this.submitLoading = true
        let params = {}

        /* 邮箱验证码与手机验证码 */
        this.registerForms.forEach(items => {
          if (items.item === 'email' && items.valid) {
            this.loginForm['email_code'] = items.vcode
          } else if (items.item === 'mobile' && items.valid) {
            this.loginForm['mobile_code'] = items.vcode
          }
        })

        /* 更改日期的格式 */
        if (this.loginForm.birth && this.loginForm.birth.constructor === Date) {
          this.loginForm.birth = this.loginForm.birth.format('yyyy-MM-dd')
        }

        /* 去掉value为空的字段与确认密码字段 */
        let form = this.loginForm
        for (var key in form) {
          if (form.hasOwnProperty(key) && (form[key] == null || form[key] == undefined || form[key] == '')) {
            delete form[key]
          }
        }
        delete form['psd_confirm']

        params = Object.assign(params, form)
        api
          .register(params)
          .then((res: any) => {
            this.submitLoading = false
            if (res.code == 0) {
              this.$message.success('注册成功！')
              this.bindUser(res.data)
              this.$router.push('/')
            } else {
              this.$message.error(res.msg)
              if (form.vcode) {
                this.registerForm2.forEach(items => {
                  if (items.item === 'vcode') {
                    this.getPicCode(items)
                  }
                })
              }
            }
          })
          .catch(error => {
            this.submitLoading = false
          })
      }
    })
  }
  /* 重置 */
  resetForm(formName) {
    this.$refs[formName].resetFields()
  }
}
</script>
