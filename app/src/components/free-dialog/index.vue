<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import api from '@/api'
import { Mutation, namespace, State } from 'vuex-class'
import EditForm from './../edit-form/index.vue'

const USER = namespace('user')

@Component({
  components: {
    EditForm
  }
})
export default class DialogForm extends Vue {
  @USER.Mutation updateToken
  @USER.Mutation updateUserType
  @USER.Mutation updateUsername
  @State freeDialogVisible
  @Mutation updateFreeDialogVisible
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

  // 监听store，在用户登录的弹框里是否点击了忘记密码或者免费试玩的情况，弹出相对应的弹框
  @Watch('freeDialogVisible')
  onfreeAForgetKeyChanged(val) {
    if (val) {
      this.free()
    }
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

  $refs!: {
    editForm
  }

  // 显示免费试玩的弹框
  free() {
    this.$nextTick(() => {
      this.$refs['editForm'].resetForm()
    })
    api
      .getTrialUsername()
      .then((res: any) => {
        const { code, data, msg } = res
        if (code === 0) {
          this.formColumn = {
            title: '试玩账号注册',
            cellGroup: [
              {
                label: '账号:',
                prop: 'username',
                type: 'text'
              },
              {
                label: '密码:',
                prop: 'password',
                type: 'input',
                placeholder: '请输入密码',
                password: true,
                icon: require('./../../assets/img/password-not-view.png'),
                iconEvent: obj => {
                  const { password } = obj
                  obj.password = !password
                  obj.icon = password ? require('./../../assets/img/view.png') : require('./../../assets/img/password-not-view.png')
                }
              },
              {
                label: '确认密码:',
                prop: 'confirmPsd',
                type: 'input',
                placeholder: '请输入确认密码',
                password: true,
                icon: require('./../../assets/img/password-not-view.png'),
                iconEvent: obj => {
                  const { password } = obj
                  obj.password = !password
                  obj.icon = password ? require('./../../assets/img/view.png') : require('./../../assets/img/password-not-view.png')
                }
              },
              {
                label: '',
                prop: 'check',
                type: 'hit-check',
                content: `<span style="color:#808080;font-size:12px;line-height:14px">本人承诺已满18岁并接受<span style="color:#F4002B;cursor:pointer">《条款和协议、隐私以及年龄限制条例》</span>！</span>`
              }
            ],
            btns: [
              {
                label: '注册',
                type: 'confirm',
                class: 'red-btn-260',
                event: (item, callback) => {
                  const { username, password } = item
                  const params = { username, password }
                  api
                    .postTrial(params)
                    .then((res: any) => {
                      const { code, msg, data } = res
                      if (code === 0) {
                        const { token } = data
                        this.bindUser(token)
                        this.updateUserType('1')
                        this.updateToken(token)
                        this.updateUsername(item.username)

                        this.formColumn = {
                          title: '温馨提示',
                          customfooter: `<div style="margin-bottom:20px;line-height:20px"><p style="text-align:center;line-height:21px">您已经成功登录试玩账号！</p><p>试玩账号不能进行充值、提现等操作，并且有可能存在彩期缺失的问题。体验完整内容请注册正式账号！</p></div>`,
                          btns: [
                            {
                              label: '关闭',
                              type: 'cancel',
                              event: () => {
                                this.updateFreeDialogVisible(false)
                              }
                            },
                            {
                              label: '确定',
                              type: 'confirm',
                              event: () => {
                                this.updateFreeDialogVisible(false)
                              }
                            }
                          ]
                        }
                        this.$message.success('免费试玩注册成功')

                        // 回调清除输入框
                        callback()
                        // 关闭弹框
                        // this.closeDialog()
                      } else {
                        this.$message.error(msg)
                      }
                    })
                    .catch((error: any) => {})
                }
              }
            ]
          }
          this.dialogForm = {
            username: data,
            password: '',
            confirmPsd: '',
            check: true
          }
          this.formRules = {
            password: [{ required: true, message: '请输入密码', trigger: ['blur'] }, { validator: this.validatorPassword, trigger: ['blur', 'change'] }],
            confirmPsd: [
              { required: true, message: '请输入确认密码', trigger: ['blur'] },
              { validator: this.validatorConfirmPsd, trigger: ['blur', 'change'] }
            ],
            check: [{ required: true, message: '请勾选此项', trigger: ['blur', 'change'] }]
          }
        }
      })
      .catch((error: any) => {})
  }
  /*
   * 存储登录数据
   */
  bindUser(token) {
    const user = {
      token: token,
      userType: '1',
      username: this.dialogForm.username
    }
    localStorage.setItem('user', JSON.stringify(user))
  }

  // 关闭弹框事件
  closeDialog() {
    this.$refs['editForm'].resetForm()
    this.updateFreeDialogVisible(false)
  }
}
</script>
