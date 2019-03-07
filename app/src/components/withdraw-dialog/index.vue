<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import api from '@/api'
import EditForm from '@/components/edit-form/index.vue'
import { State, Mutation } from 'vuex-class'
@Component({
  components: {
    EditForm
  }
})
export default class WithdrawDialog extends Vue {
  @State withdrawDialogVisible
  @Mutation updateWithdrawDialogVisible
  // 弹框的数据源
  // 弹框的配置项
  formColumn: any = {}

  // 弹框的表单对象
  dialogForm: any = {}
  // 表单校验rules
  formRules: any = {}

  // 找回密码的数据源
  mobile: string = ''
  email: string = ''
  id: number = 0
  // 获取邮箱/手机验证码的定时器
  timer: any = null
  // tab默认选中的值
  tabName: string = ''
  codeText: string = '秒后重新获取'
  check: string = ''

  loadingDialog: boolean = false
  $refs!: {
    editForm: any
  }
  // 表单验证
  validatorPassword(rule, value, callback) {
    if (value && !/^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/.test(value)) {
      callback(new Error('请输入6-16位数字或字母的密码'))
    } else {
      callback()
    }
  }
  validatorConfirmPsd(rule, value, callback) {
    if (this.dialogForm.password === value) {
      callback()
    } else {
      callback(new Error('两次输入的密码不一样，请重新输入'))
    }
  }

  validatorWithdrawPwd(rule, value, callback) {
    if (value && !/^[0-9]{4}$/.test(value)) {
      callback(new Error('请输入4位数字'))
    } else {
      callback()
    }
  }
  validatorSamePassword(rule, value, callback) {
    if (this.dialogForm.pwd1 === value) {
      callback()
    } else {
      callback(new Error('两次输入的密码不一样，请重新输入'))
    }
  }
  // 监听store，在用户登录的弹框里是否点击了忘记密码或者免费试玩的情况，弹出相对应的弹框
  @Watch('withdrawDialogVisible')
  onfreeAForgetKeyChanged(val) {
    if (val) {
      this.init()
    }
  }

  // 显示忘记密码的弹框
  init() {
    this.formColumn = {
      title: '设置提现密码',
      cellGroup: [
        {
          label: '登录密码:',
          prop: 'pwd',
          type: 'input',
          placeholder: '请输入登录密码',
          password: true,
          icon: require('@/assets/img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('@/assets/img/view.png') : require('@/assets/img/password-not-view.png')
          }
        }
      ],
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.closeDialog()
          }
        },
        {
          label: '下一步',
          type: 'confirm',
          event: (item, callback) => {
            this.verificationPassword(item, callback, 'withdraw_password')
          }
        }
      ],
      footer: '输入登录密码验证身份',
      tabs: [
        {
          label: '登录密码',
          name: 'password'
        },
        {
          label: '手机身份验证',
          name: 'mobile'
        },
        {
          label: '邮箱身份验证',
          name: 'email'
        }
      ]
    }
    this.dialogForm = {
      pwd: ''
    }
    this.formRules = {
      pwd: [{ required: true, message: '请输入登录密码', trigger: 'blur' }, { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }]
    }
    this.tabName = 'password'
    this.tabClick(this.tabName)
  }

  // 点击tabs的tab时回调给父组件的方法
  tabClick(name) {
    this.clearTimer()
    this.tabName = name
    switch (name) {
      case 'password':
        this.$set(this.formColumn, 'footer', '输入登录密码验证身份')
        this.$set(this.formColumn, 'cellGroup', [
          {
            label: '登录密码:',
            prop: 'pwd',
            type: 'input',
            placeholder: '请输入登录密码',
            password: true,
            icon: require('@/assets/img/password-not-view.png'),
            iconEvent: obj => {
              const { password } = obj
              obj.password = !password
              obj.icon = password ? require('@/assets/img/view.png') : require('@/assets/img/password-not-view.png')
            }
          }
        ])
        this.$set(this.formColumn, 'btns', [
          {
            label: '取消',
            type: 'cancel',
            event: item => {
              this.closeDialog()
            }
          },
          {
            label: '下一步',
            type: 'confirm',
            event: (item, callback) => {
              this.verificationPassword(item, callback, 'withdraw_password')
            }
          }
        ])
        this.dialogForm = {
          pwd: ''
        }
        this.formRules = {
          pwd: [
            { required: true, message: '请输入登录密码', trigger: ['blur'] },
            { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }
          ]
        }
        break
      case 'mobile':
        this.loadingDialog = true
        api
          .getMobile()
          .then((res: any) => {
            const { code, data } = res
            if (code === 0) {
              const tempBoolean = data ? false : true
              if (tempBoolean) {
                this.$message.error('您没有绑定手机，请选择其他验证方式')
              }
              // 渲染表单的模板
              this.$set(this.formColumn, 'footer', '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。')
              this.$set(this.formColumn, 'cellGroup', [
                {
                  label: '手机号:',
                  prop: 'mobile',
                  type: data ? 'text' : 'input',
                  Disable: true
                },
                {
                  label: '验证码:',
                  prop: 'code',
                  type: 'input',
                  Disable: tempBoolean,
                  placeholder: '请输入验证码',
                  // 右侧按钮问题
                  button: '获取验证码',
                  buttonProp: 'mobile',
                  disabled: tempBoolean,
                  event: mobile => {
                    // 获取手机验证码请求
                    this.getVcodeMobile()
                  }
                }
              ])
              this.$set(this.formColumn, 'btns', [
                {
                  label: '取消',
                  type: 'cancel',
                  event: item => {
                    this.closeDialog()
                  }
                },
                {
                  label: '下一步',
                  type: 'confirm',
                  disabled: tempBoolean,
                  event: item => {
                    this.editMobileNext(item)
                  }
                }
              ])

              this.dialogForm = {
                mobile: data || '您未绑定手机号码',
                code: tempBoolean ? '请输入验证码' : ''
              }
              this.formRules = {
                mobile: [{ required: true, message: '请输入手机号码', trigger: ['blur'] }],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              this.loadingDialog = false
            }
          })
          .catch(error => {})
        break
      case 'email':
        this.loadingDialog = true
        api
          .getEmail()
          .then((res: any) => {
            const { code, data } = res
            if (code === 0) {
              const tempBoolean = data ? false : true
              if (tempBoolean) {
                this.$message.error('您没有绑定邮箱，请选择其他验证方式')
              }
              // 渲染表单的模板
              this.$set(this.formColumn, 'footer', '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或者联系在线客服。')
              this.$set(this.formColumn, 'cellGroup', [
                {
                  label: '邮箱:',
                  prop: 'email',
                  type: data ? 'text' : 'input',
                  Disable: true
                },
                {
                  label: '验证码:',
                  prop: 'code1',
                  type: 'input',
                  Disable: tempBoolean,
                  placeholder: '请输入验证码',
                  // 右侧按钮问题
                  button: '获取验证码',
                  buttonProp: 'email',
                  disabled: tempBoolean,
                  event: email => {
                    // 获取手机验证码请求
                    this.getVcodeEmail()
                  }
                }
              ])
              this.$set(this.formColumn, 'btns', [
                {
                  label: '取消',
                  type: 'cancel',
                  event: item => {
                    this.closeDialog()
                  }
                },
                {
                  label: '下一步',
                  type: 'confirm',
                  disabled: tempBoolean,
                  event: item => {
                    this.editEmailNext(item)
                  }
                }
              ])
              this.dialogForm = {
                email: data || '您未绑定邮箱',
                code1: tempBoolean ? '请输入验证码' : ''
              }
              this.formRules = {
                email: [{ required: true, message: '请输入邮箱', trigger: ['blur'] }],
                code1: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              this.loadingDialog = false
            }
          })
          .catch(error => {})
        break
    }
  }

  //  校验旧手机号码
  editMobileNext(obj) {
    const { code } = obj
    api.userVerificationMobile({ code }).then((res: any) => {
      const { code, msg, data } = res
      if (code === 0) {
        this.check = data
        this.clearTimer()
        const timer = setInterval(() => {
          this.setWithdrawPwd()
          clearInterval(timer)
        }, 0)
      } else {
        this.$message.error(msg)
      }
    })
  }

  // 获取手机验证码
  getVcodeMobile() {
    this.formColumn.cellGroup[1].disabled = true
    api
      .getVcodeMobile({ id: this.id })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('验证码已发送')
          let time = 60
          this.formColumn.cellGroup[1].button = time + this.codeText
          this.formColumn.cellGroup[1].disabled = true
          this.clearTimer()
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimer()
            } else {
              this.formColumn.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.formColumn.cellGroup[1].disabled = false
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {
        this.formColumn.cellGroup[1].disabled = false
      })
  }

  // 先校验旧的邮箱
  editEmailNext(obj) {
    const { code1 } = obj
    api
      .userVerificationEmail({ code: code1 })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          this.clearTimer()
          const timer = setInterval(() => {
            this.setWithdrawPwd()
            clearInterval(timer)
          }, 0)
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 获取邮箱验证码
  getVcodeEmail() {
    this.formColumn.cellGroup[1].disabled = true
    api
      .getVcodeEmail({ id: this.id })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('验证码已发送')
          let time = 60
          this.formColumn.cellGroup[1].button = time + this.codeText
          this.formColumn.cellGroup[1].disabled = true
          this.clearTimer()
          this.timer = setInterval(() => {
            time--
            if (time === 0) {
              this.clearTimer()
            } else {
              this.formColumn.cellGroup[1].button = time + this.codeText
            }
          }, 1000)
        } else {
          this.formColumn.cellGroup[1].disabled = false
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {
        this.formColumn.cellGroup[1].disabled = false
      })
  }

  // 关闭弹框事件
  closeDialog() {
    this.clearTimer()
    this.updateWithdrawDialogVisible(false)
  }
  // 清楚定时器的问题
  clearTimer() {
    //
    if (this.timer && this.formColumn.cellGroup && this.formColumn.cellGroup[1]) {
      this.dialogForm.code = ''
      this.formColumn.cellGroup[1].button = '获取验证码'
      this.formColumn.cellGroup[1].disabled = false
      clearInterval(this.timer)
    }
  }

  // 验证登密码
  // obj:需要提交的表单对象
  // callback：成功之后的回调
  verificationPassword(obj, callback1, key) {
    api
      .userPassword(obj)
      .then((res: any) => {
        const { code, data, msg } = res
        if (code === 0) {
          this.check = data
          this.clearTimer()
          const timer = setInterval(() => {
            this.setWithdrawPwd()
            clearInterval(timer)
          }, 0)
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 设置提现密码
  setWithdrawPwd() {
    this.formColumn = {
      title: '重新设置提现密码',
      cellGroup: [
        {
          label: '提现密码:',
          prop: 'pwd1',
          type: 'widthdrawPassword',
          placeholder: '请输入提现密码',
          password: true,
          icon: require('@/assets/img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('@/assets/img/view.png') : require('@/assets/img/password-not-view.png')
          }
        },
        {
          label: '确定提现密码:',
          prop: 'pwd_confirm',
          type: 'widthdrawPassword',
          placeholder: '请输入确定提现密码',
          password: true,
          icon: require('@/assets/img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('@/assets/img/view.png') : require('@/assets/img/password-not-view.png')
          }
        }
      ],
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.closeDialog()
          }
        },
        {
          label: '确定设置',
          type: 'confirm',
          event: (item, callback) => {
            api
              .setUserWithdrawpwd({ pwd: item.pwd1, check: this.check })
              .then((res: any) => {
                const { code, msg } = res
                if (code === 0) {
                  this.$message.success('重新设置提现密码成功')
                  this.closeDialog()
                } else {
                  this.$message.error(msg)
                }
              })
              .catch((error: any) => {
                this.$message.error('重新设置提现密码失败，请稍后重试')
              })
          }
        }
      ]
    }
    this.dialogForm = {
      pwd1: '',
      pwd_confirm: ''
    }
    this.formRules = {
      pwd1: [
        { required: true, message: '请输入提现密码', trigger: ['blur', 'change'] },
        { required: true, validator: this.validatorWithdrawPwd, trigger: ['blur', 'change'] }
      ],
      pwd_confirm: [
        { required: true, message: '请输入确定提现密码', trigger: ['blur', 'change'] },
        { required: true, validator: this.validatorSamePassword, trigger: ['blur', 'change'] }
      ]
    }
  }
}
</script>
