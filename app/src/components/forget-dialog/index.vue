<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import api from '@/api'
import { Mutation, State } from 'vuex-class'
import EditForm from './../edit-form/index.vue'

@Component({
  components: {
    EditForm
  }
})
export default class DialogForm extends Vue {
  @State forgetDialogVisible
  @Mutation updateForgetDialogVisible
  // @State freeAForgetKey
  // @Mutation updatefreeAForgetKey
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
  // 监听store，在用户登录的弹框里是否点击了忘记密码或者免费试玩的情况，弹出相对应的弹框
  @Watch('forgetDialogVisible')
  onfreeAForgetKeyChanged(val) {
    if (val) {
      this.forgetPsd()
    }
  }

  // 显示忘记密码的弹框
  forgetPsd() {
    this.dialogForm = {
      data: ''
    }
    this.formColumn = {
      title: '找回密码',
      cellGroup: [
        {
          label: '账号:',
          prop: 'data',
          type: 'input',
          placeholder: '用户名\\手机\\邮箱登录'
        }
      ],
      footer: '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或联系在线客服处理',
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.updateForgetDialogVisible(false)
          }
        },
        {
          label: '下一步',
          type: 'confirm',
          event: (item, callback) => {
            api.getUserResetpwd(item).then((res: any) => {
              const { code, data, msg } = res
              if (code === 0) {
                const { mobile, email, id } = data
                this.mobile = mobile
                this.email = email
                this.id = id
                this.tabClick('mobile')
              } else {
                this.$message.error(msg)
              }
            })
          }
        }
      ]
    }
    this.formRules = {
      data: [{ required: true, message: '请输入账号', trigger: 'blur' }]
    }
  }

  // 点击tabs的tab时回调给父组件的方法
  tabClick(name) {
    this.clearTimer()
    this.tabName = name
    switch (name) {
      case 'mobile':
        const { mobile } = this
        const tempDiable = mobile ? false : true
        this.formColumn = {
          title: '找回密码',
          cellGroup: [
            {
              label: '手机号:',
              prop: 'mobile',
              type: mobile ? 'text' : 'input',
              Disable: true,
              placeholder: '该用户未绑定手机\\邮箱，请联系客服'
            },
            {
              label: '验证码:',
              prop: 'code',
              type: 'input',
              Disable: tempDiable,
              placeholder: '请输入验证码',
              // 右侧按钮问题
              button: '获取验证码',
              buttonProp: 'mobile',
              disabled: tempDiable,
              event: mobile => {
                // 获取手机验证码请求
                this.getVcodeMobile()
              }
            }
          ],
          tabs: [
            {
              label: '手机身份验证',
              name: 'mobile'
            },
            {
              label: '邮箱身份验证',
              name: 'email'
            }
          ],
          btns: [
            {
              label: '取消',
              type: 'cancel',
              event: item => {
                this.closeDialog()
                this.updateForgetDialogVisible(false)
              }
            },
            {
              label: '下一步',
              type: 'confirm',
              disabled: tempDiable,
              event: (item, callback) => {
                this.changeNewPassword(item, callback)
              }
            }
          ],
          footer: '如果您的手机号或邮箱没有进行绑定，将无法进行密码修改，您可以进行绑定操作或联系在线客服处理'
        }
        this.dialogForm = {
          mobile,
          code: ''
        }
        this.formRules = {
          code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }],
          mobile: [{ required: true }]
        }
        break
      case 'email':
        const { email } = this
        const tempAble = email ? false : true
        this.$set(this.formColumn, 'cellGroup', [
          {
            label: '邮箱:',
            prop: 'email',
            type: email ? 'text' : 'input',
            Disable: true,
            placeholder: '该用户未绑定手机\\邮箱，请联系客服'
          },
          {
            label: '验证码:',
            prop: 'code1',
            type: 'input',
            Disable: tempAble,
            placeholder: '请输入验证码',
            // 右侧按钮问题
            button: '获取验证码',
            buttonProp: 'email',
            disabled: tempAble,
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
              this.updateForgetDialogVisible(false)
            }
          },
          {
            label: '下一步',
            type: 'confirm',
            disabled: tempAble,
            event: (item, callback) => {
              this.changeNewPassword(item, callback)
            }
          }
        ])
        this.dialogForm = {
          email,
          code1: ''
        }
        this.formRules = {
          code1: [{ required: true, message: '请输入验证码', trigger: ['blur'] }],
          email: [{ required: true }]
        }
        break
    }
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
  // 先校验，下一步修改密码
  changeNewPassword(obj, callback) {
    //
    const { mobile, code, code1 } = obj

    const temp = obj.hasOwnProperty('mobile') ? 'userVerificationMobile' : 'userVerificationEmail'

    api[temp]({ code: code || code1, id: this.id })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          this.clearTimer()
          callback()
          const timerout = setTimeout(() => {
            this.formColumn = {
              title: `设置登录密码`,
              cellGroup: [
                {
                  label: '新密码',
                  prop: 'password',
                  type: 'input',
                  password: true,
                  placeholder: '请输入新密码',
                  icon: require('../../assets/img/password-not-view.png'),
                  iconEvent: obj => {
                    const { password } = obj
                    obj.password = !password
                    obj.icon = password ? require('../../assets/img/view.png') : require('../../assets/img/password-not-view.png')
                  }
                },
                {
                  label: '确认新密码',
                  prop: 'password_confirm',
                  type: 'input',
                  password: true,
                  placeholder: '请输入确认新密码',
                  icon: require('../../assets/img/password-not-view.png'),
                  iconEvent: obj => {
                    const { password } = obj
                    obj.password = !password
                    obj.icon = password ? require('../../assets/img/view.png') : require('../../assets/img/password-not-view.png')
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
                  label: '确认',
                  type: 'confirm',
                  event: item => {
                    this.getNewPassword(item)
                  }
                }
              ]
            }
            this.dialogForm = {
              password: '',
              pasword_confirm: ''
            }
            this.formRules = {
              password: [
                { required: true, message: '请输入新密码', trigger: ['blur'] },
                { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }
              ],
              password_confirm: [
                { required: true, message: '请输入确认新密码', trigger: ['blur'] },
                { required: true, validator: this.validatorConfirmPsd, trigger: ['blur', 'change'] }
              ]
            }
            clearTimeout(timerout)
          }, 0)
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 修改新密码的请求
  getNewPassword(obj) {
    const params = {
      check: this.check,
      new_pwd: obj.password,
      id: this.id
    }
    api
      .setUserPassword(params)
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('修改登录密码成功！')
          this.updateForgetDialogVisible(false)
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }
  // 关闭弹框事件
  closeDialog() {
    this.clearTimer()
    this.updateForgetDialogVisible(false)
  }
  // 清楚定时器的问题
  clearTimer() {
    if (this.timer && this.formColumn.cellGroup && this.formColumn.cellGroup[1]) {
      this.dialogForm.code = ''
      this.formColumn.cellGroup[1].button = '获取验证码'
      this.formColumn.cellGroup[1].disabled = false
      clearInterval(this.timer)
    }
  }
}
</script>
