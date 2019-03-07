<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation, namespace } from 'vuex-class'
import api from '@/api'
import { Loading, Button, Dialog } from 'element-ui'
import EditForm from '@/components/edit-form/index.vue'
const USER = namespace('user')

@Component({
  components: {
    EditForm
  }
})
export default class Security extends Vue {
  @USER.Mutation updateUserType
  @USER.Mutation updateUsername
  @USER.Mutation updateToken
  @Mutation updateCenterDialogConfig
  @Mutation updateWithdrawDialogVisible
  // @Mutation updateLoginVisible
  /*************data***********/
  dataSource: any = {}

  activeName: string = 'security'

  // 安全中心的文字提示
  dataSourceLabel: any = {
    email: '安全邮箱',
    mobile: '手机号码',
    question: '安全问题',
    id_card: '实名认证',
    active_pwd: '动态密码',
    withdraw_password: '提现密码',
    password: '登录密码',
    steam_auth: 'Steam账号设置'
  }

  loading: boolean = true
  loadingDialog: boolean = false

  // 列表的文字提示
  status0: string = '设置'
  status1: string = '修改'
  codeText: string = '秒后重新获取'

  // 弹框表单的参数 设置，表单对象，校验
  formColumn: any = {}
  form: any = {}
  formRules: any = {}
  dialogVisible: boolean = false

  // 获取邮箱/手机验证码的定时器
  timer: any = null

  check: string = ''

  // 给tabs邦定的model
  tabName: string = ''

  // 计算安全级别的数组
  levelArr: string[] = []

  /********表单校验**********/
  validatorIdcard(rule, value, callback) {
    if (value && !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
      callback(new Error('请输入合理的身份证号'))
    } else {
      callback()
    }
  }
  validatorPassword(rule, value, callback) {
    if (value && !/^[~!@#$%^&*()-_=+|{},.?:;a-zA-Z0-9]{6,16}$/.test(value)) {
      callback(new Error('请输入6-16位数字或字母的密码'))
    } else {
      callback()
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
    if (this.form.new_pwd === value || this.form.pwd === value) {
      callback()
    } else {
      callback(new Error('两次输入的密码不一样，请重新输入'))
    }
  }
  validatorMobile(rule, value, callback) {
    if (value && !/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/.test(value)) {
      callback(new Error('请输入合理的手机号码'))
    } else {
      callback()
    }
  }
  validatorEmail(rule, value, callback) {
    if (value && !/^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/.test(value)) {
      callback(new Error('请输入合理的邮箱'))
    } else {
      callback()
    }
  }
  validatorRealname(rule, value, callback) {
    if (value && !/^[\u4E00-\u9FA5]{1,10}$/.test(value)) {
      callback(new Error('请输入小于10个字中文'))
    } else {
      callback()
    }
  }
  /*************life-cycle***********/
  mounted() {
    this.userSafety()
  }
  /*************methods***********/
  // 获取了用户安全中心的情况
  userSafety() {
    this.loading = true
    api
      .userSafety()
      .then((res: any) => {
        const { data, code } = res
        if (code === 0) {
          Object.keys(data).forEach(key => {
            if (data[key].status == '1') {
              this.levelArr.push(data[key])
            }
          })
          if (this.levelArr.length <= 2) {
            this.levelArr = ['1']
          } else if (this.levelArr.length >= 5) {
            this.levelArr = ['1', '2', '3']
          } else {
            this.levelArr = ['1', '2']
          }
          // 组装数据
          this.dataSource = [
            {
              title: '实名认证',
              data: [{ key: 'id_card', arr: data['id_card'] }],
              pTitle: '用于提升账号的安全信任级别，认证后不能修改认证信息'
            },
            {
              title: '密码管理',
              data: [{ key: 'password', arr: data['password'] }, { key: 'withdraw_password', arr: data['withdraw_password'] }],
              pTitle: '互联网账号存在被盗风险，建议您定期更改密码以保护账户安全'
            },
            {
              title: '密保工具',
              data: [{ key: 'mobile', arr: data['mobile'] }, { key: 'email', arr: data['email'] }],
              pTitle: '完成密保工具的安全验证，有利于保障您的账户及资金账户的安全'
            }
          ]
          this.loading = false
        }
      })
      .catch((error: any) => {})
  }

  // 点击设置和修改的事件
  onClickCell(obj) {
    const { key } = obj
    switch (key) {
      case 'id_card':
        this.idCard(obj)
        break
      case 'mobile':
        this.mobile(obj)
        break
      case 'email':
        this.email(obj)
        break
      case 'withdraw_password':
        this.withdrawPwd(obj)
        break
      case 'password':
        this.password(obj)
        break
    }
  }

  // 实名认证
  idCard(obj) {
    const { status, value } = obj.arr
    switch (status) {
      case '0':
        api
          .getUserRealname()
          .then((res: any) => {
            const { code, data, msg } = res
            if (code === 0) {
              // 渲染表单的模板
              this.formColumn = {
                title: '身份证验证',
                cellGroup: [
                  {
                    label: '真实姓名:',
                    prop: 'realname',
                    type: data ? 'text' : 'input',
                    placeholder: '请输入您的真实姓名',
                    Disable: data ? true : false
                  },
                  {
                    label: '身份证号:',
                    prop: 'idcard',
                    type: 'input',
                    placeholder: '请输入您的身份证号'
                  }
                ],
                footer: '注：' + value,
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '实名认证',
                    type: 'confirm',
                    event: (item, callback) => {
                      const { realname, idcard } = item
                      let param = { idcard }
                      if (realname.indexOf('*') === -1) {
                        param['realname'] = realname
                      }
                      api
                        .userIdcard(param)
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.$message.success('实名认证成功')
                            // 回调清除输入框
                            callback()
                            // 关闭弹框
                            this.cancel()
                            // 刷新数据
                            this.userSafety()
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {
                          this.$message.error('实名认证失败')
                        })
                    }
                  }
                ]
              }
              this.form = {
                realname: data ? data : '',
                idcard: ''
              }
              this.formRules = {
                realname: data
                  ? [{ required: true, message: '请输入真实姓名', trigger: ['blur'] }]
                  : [
                      { required: true, message: '请输入真实姓名', trigger: ['blur'] },
                      { required: true, validator: this.validatorRealname, trigger: ['blur', 'change'] }
                    ],
                idcard: [
                  { required: true, message: '请输入身份证号', trigger: ['blur'] },
                  { required: true, validator: this.validatorIdcard, trigger: ['blur', 'change'] }
                ]
              }
              this.dialogVisible = true
            } else {
              this.$message.error(msg)
            }
          })
          .catch(err => {})
        break
      default:
        api
          .getUserRealname()
          .then((res: any) => {
            const { code, data, msg } = res
            if (code === 0) {
              this.formColumn = {
                title: '验证成功',
                cellGroup: [
                  {
                    label: '真实姓名:',
                    prop: 'realname',
                    type: 'input',
                    placeholder: '请输入您的真实姓名',
                    Disable: true
                  },
                  {
                    label: '身份证号:',
                    prop: 'idcard',
                    type: 'input',
                    placeholder: '请输入您的身份证号',
                    Disable: true
                  }
                ],
                btns: [
                  {
                    label: '关闭',
                    type: 'cancel',
                    event: item => {
                      this.dialogVisible = false
                    }
                  }
                ]
              }
              this.form = {
                realname: data,
                idcard: value.split(':')[1]
              }
              this.dialogVisible = true
            } else {
              this.$message.error(msg)
            }
          })
          .catch((error: any) => {})
    }
  }
  // 手机号码的设置和修改
  mobile(obj) {
    const { status } = obj.arr
    switch (status) {
      case '0':
        this.dialogVisible = true
        // 渲染表单的模板
        this.validLoginPWdEditObjAndForm('mobile', '绑定手机号码')
        break
      case '1':
        this.loadingDialog = true
        // 渲染表单的模板
        api
          .getMobile()
          .then((res: any) => {
            this.loadingDialog = false
            const { code, data, msg } = res
            if (code === 0) {
              this.formColumn = {
                title: '修改手机号',
                cellGroup: [
                  {
                    label: '旧手机号:',
                    prop: 'mobile',
                    type: 'text'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码请求
                      this.getVcodeMobile()
                    }
                  }
                ],
                footer: '绑定手机号主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '下一步',
                    type: 'confirm',
                    event: (item, callback) => {
                      this.editMobileNext(item, callback)
                    }
                  }
                ]
              }
              this.form = {
                mobile: data,
                code: ''
              }
              this.formRules = {
                mobile: [{ required: true, message: '请输入手机号码', trigger: ['blur'] }],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              this.dialogVisible = true
            } else {
              this.$message.error(msg)
            }
          })
          .catch(error => {})
    }
  }

  // 邮箱的设置和修改
  email(obj) {
    const { status } = obj.arr
    switch (status) {
      case '0':
        this.dialogVisible = true
        this.validLoginPWdEditObjAndForm('email', '邮箱设置')
        break
      case '1':
        this.loadingDialog = true
        api
          .getEmail()
          .then((res: any) => {
            const { code, data, msg } = res
            this.loadingDialog = false

            if (code === 0) {
              // 渲染表单的模板
              this.formColumn = {
                title: '修改邮箱',
                cellGroup: [
                  {
                    label: '旧邮箱:',
                    prop: 'email',
                    type: 'text'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取手机验证码请求
                      this.getVcodeEmail()
                    }
                  }
                ],
                footer: '绑定邮箱主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '下一步',
                    type: 'confirm',
                    event: (item, callback) => {
                      this.editEmailNext(item, callback)
                    }
                  }
                ]
              }
              this.form = {
                email: data,
                code: ''
              }
              this.formRules = {
                email: [{ required: true, message: '请输入邮箱', trigger: ['blur'] }],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              this.dialogVisible = true
            } else {
              this.$message.error(msg)
            }
          })
          .catch(error => {})
    }
  }

  // 提现密码的设置和修改
  withdrawPwd(obj) {
    this.dialogVisible = true
    switch (obj.arr.status) {
      case '0':
        this.formColumn = {
          title: '设置提现密码',
          cellGroup: [
            {
              label: '登录密码:',
              prop: 'pwd',
              type: 'input',
              placeholder: '请输入登录密码',
              password: true,
              icon: require('./img/password-not-view.png'),
              iconEvent: obj => {
                const { password } = obj
                obj.password = !password
                obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
              }
            }
          ],
          btns: [
            {
              label: '取消',
              type: 'cancel',
              event: item => {
                this.cancel()
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
        this.form = {
          pwd: ''
        }
        this.formRules = {
          pwd: [
            { required: true, message: '请输入登录密码', trigger: ['blur'] },
            { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }
          ]
        }
        if (this.tabName === '') {
          this.tabName = 'password'
        } else {
          this.tabClick(this.tabName)
        }
        break
      case '1':
        // 渲染表单的模板
        this.formColumn = {
          title: '旧提现密码',
          cellGroup: [
            {
              label: '旧提现密码:',
              prop: 'old_pwd',
              type: 'widthdrawPassword',
              placeholder: '请输入旧提现密码',
              password: true,
              icon: require('./img/password-not-view.png'),
              iconEvent: obj => {
                const { password } = obj
                obj.password = !password
                obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
              }
            },
            {
              label: '新提现密码:',
              prop: 'new_pwd',
              type: 'widthdrawPassword',
              placeholder: '请输入新提现密码',
              password: true,
              icon: require('./img/password-not-view.png'),
              iconEvent: obj => {
                const { password } = obj
                obj.password = !password
                obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
              }
            },
            {
              label: '确认新密码:',
              prop: 'new_pwd_confirm',
              type: 'widthdrawPassword',
              placeholder: '请输入新密码',
              password: true,
              icon: require('./img/password-not-view.png'),
              iconEvent: obj => {
                const { password } = obj
                obj.password = !password
                obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
              }
            }
          ],
          btns: [
            {
              label: '取消',
              type: 'cancel',
              event: item => {
                this.cancel()
              }
            },
            {
              label: '确定修改',
              type: 'confirm',
              event: (item, callback) => {
                const { old_pwd, new_pwd } = item
                api
                  .editUserWithdrawpwd({ old_pwd, new_pwd })
                  .then((res: any) => {
                    const { code, msg } = res
                    if (code === 0) {
                      this.$message.success('修改提现密码成功')
                      // 回调清除输入框
                      callback()
                      // 关闭弹框
                      this.cancel()
                      this.userSafety()
                    } else {
                      this.$message.error(msg)
                    }
                  })
                  .catch((error: any) => {
                    this.$message.error('修改密码失败')
                  })
              }
            }
          ]
        }
        this.form = {
          old_pwd: '',
          new_pwd: '',
          new_pwd_confirm: ''
        }
        this.formRules = {
          old_pwd: [
            { required: true, message: '请输入旧提现密码', trigger: ['blur'] },
            { required: true, validator: this.validatorWithdrawPwd, trigger: ['blur', 'change'] }
          ],
          new_pwd: [
            { required: true, message: '请输入新提现密码', trigger: ['blur'] },
            { required: true, validator: this.validatorWithdrawPwd, trigger: ['blur', 'change'] }
          ],
          new_pwd_confirm: [
            { required: true, message: '请输入确认新密码', trigger: ['blur'] },
            { required: true, validator: this.validatorSamePassword, trigger: ['blur', 'change'] }
          ]
        }
    }
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
            icon: require('./img/password-not-view.png'),
            iconEvent: obj => {
              const { password } = obj
              obj.password = !password
              obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
            }
          }
        ])
        this.$set(this.formColumn, 'btns', [
          {
            label: '取消',
            type: 'cancel',
            event: item => {
              this.cancel()
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
        this.form = {
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
                    this.cancel()
                  }
                },
                {
                  label: '下一步',
                  type: 'confirm',
                  disabled: tempBoolean,
                  event: (item, callback) => {
                    this.editMobileNext(item, callback, 'withdraw_password')
                  }
                }
              ])

              this.form = {
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
                    this.cancel()
                  }
                },
                {
                  label: '下一步',
                  type: 'confirm',
                  disabled: tempBoolean,
                  event: (item, callback) => {
                    this.editEmailNext(item, callback, 'withdraw_password')
                  }
                }
              ])
              this.form = {
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

  // 登录密码的修改
  password(obj) {
    this.dialogVisible = true

    // 渲染表单的模板
    this.formColumn = {
      title: '修改登录密码',
      cellGroup: [
        {
          label: '旧密码:',
          prop: 'old_pwd',
          type: 'input',
          placeholder: '请输入旧密码',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        },
        {
          label: '新密码:',
          prop: 'new_pwd',
          type: 'input',
          placeholder: '请输入新密码（6-16位数字、字母组成）',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        },
        {
          label: '确认新密码:',
          prop: 'new_pwd_confirm',
          type: 'input',
          placeholder: '请输入新密码',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        }
      ],
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.cancel()
          }
        },
        {
          label: '确定修改',
          type: 'confirm',
          event: (item, callback) => {
            const { old_pwd, new_pwd } = item
            const tempObj = {
              old_pwd,
              new_pwd
            }
            api
              .setUserPassword(tempObj)
              .then((res: any) => {
                const { code, msg } = res
                if (code === 0) {
                  this.$alert('修改密码成功', '成功', {
                    confirmButtonText: '确定',
                    callback: action => {
                      // 回调清除输入框
                      callback()
                      // 关闭弹框
                      this.cancel()

                      // 退出登录
                      api
                        .logout()
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.updateToken()
                            this.updateUsername()
                            this.updateUserType()
                            this.updateCenterDialogConfig({ visible: false })
                            // this.updateLoginVisible(true)
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {})
                    }
                  })
                } else {
                  this.$message.error(msg)
                }
              })
              .catch((error: any) => {
                this.$message.error('修改密码失败')
              })
          }
        }
      ]
    }
    this.form = {
      old_pwd: '',
      new_pwd: '',
      new_pwd_confirm: ''
    }
    this.formRules = {
      old_pwd: [{ required: true, message: '请输入旧密码', trigger: ['blur'] }, { validator: this.validatorPassword, trigger: ['blur', 'change'] }],
      new_pwd: [
        { required: true, message: '请输入新密码', trigger: ['blur'] },
        { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }
      ],
      new_pwd_confirm: [
        { required: true, message: '请输入确认新密码', trigger: ['blur'] },
        { required: true, validator: this.validatorSamePassword, trigger: ['blur', 'change'] }
      ]
    }
  }
  // 清楚定时器的问题
  clearTimer() {
    if (this.timer && this.formColumn.cellGroup && this.formColumn.cellGroup[1]) {
      this.form.code = ''
      this.formColumn.cellGroup[1].button = '获取验证码'
      this.formColumn.cellGroup[1].disabled = false
      clearInterval(this.timer)
    }
  }

  // 获取手机验证码
  getVcodeMobile(mobile?: string) {
    this.formColumn.cellGroup[1].disabled = true
    api
      .getVcodeMobile({ mobile })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('验证码已发送')
          this.clearTimer()
          let time = 60
          this.formColumn.cellGroup[1].button = time + this.codeText
          this.formColumn.cellGroup[1].disabled = true
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
  getVcodeEmail(email?: string) {
    this.formColumn.cellGroup[1].disabled = true
    api
      .getVcodeEmail({ email })
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          this.$message.success('验证码已发送')
          this.clearTimer()
          let time = 60
          this.formColumn.cellGroup[1].button = time + this.codeText
          this.formColumn.cellGroup[1].disabled = true
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

  // 点击弹框的叉叉触发的事件，清空定时器和数据源
  cancel() {
    this.clearTimer()
    this.dialogVisible = false
  }

  //  校验旧手机号码
  editMobileNext(obj, callback, key?: string) {
    const { code } = obj
    api
      .userVerificationMobile({ code })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          callback()
          this.clearTimer()
          switch (key) {
            case 'withdraw_password':
              this.setWithdrawPwd()
              break
            default:
              this.formColumn = {
                title: '修改手机号',
                cellGroup: [
                  {
                    label: '手机号:',
                    prop: 'mobile',
                    type: 'input',
                    placeholder: '请输入手机号码'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码请求
                      this.getVcodeMobile(mobile)
                    }
                  }
                ],
                footer: '绑定手机号主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '确定修改',
                    type: 'confirm',
                    event: (item, callback) => {
                      api
                        .ediltUserMobile({ check: this.check, ...item })
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.$message.success('修改手机号码成功')
                            callback()
                            this.cancel()
                            this.userSafety()
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {
                          this.$message.error('修改手机号码失败')
                        })
                    }
                  }
                ]
              }
              this.form = {
                mobile: '',
                code: ''
              }
              this.formRules = {
                mobile: [
                  { required: true, message: '请输入手机号码', trigger: ['blur'] },
                  { required: true, validator: this.validatorMobile, trigger: ['blur', 'change'] }
                ],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
          }
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 先校验旧的邮箱
  editEmailNext(obj, callback, key?: string) {
    const { code1, code } = obj
    api
      .userVerificationEmail({ code: code1 || code })
      .then((res: any) => {
        const { code, msg, data } = res
        if (code === 0) {
          this.check = data
          callback()
          this.clearTimer()
          switch (key) {
            case 'withdraw_password':
              this.setWithdrawPwd()
              break
            default:
              this.formColumn = {
                title: '修改邮箱',
                cellGroup: [
                  {
                    label: '新邮箱:',
                    prop: 'email',
                    type: 'input',
                    placeholder: '请输入您的新邮箱'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取手机验证码请求
                      this.getVcodeEmail(email)
                    }
                  }
                ],
                footer: '绑定邮箱主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '确定修改',
                    type: 'confirm',
                    event: (item, callback) => {
                      api
                        .ediltUserEmail({ check: this.check, ...item })
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.$message.success('修改邮箱成功')
                            callback()
                            this.cancel()
                            this.userSafety()
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {
                          this.$message.error('修改邮箱失败')
                        })
                    }
                  }
                ]
              }
              this.form = {
                email: '',
                code: ''
              }
              this.formRules = {
                email: [
                  { required: true, message: '请输入邮箱', trigger: ['blur'] },
                  { required: true, validator: this.validatorEmail, trigger: ['blur', 'change'] }
                ],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
          }
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
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
          callback1()
          this.check = data
          switch (key) {
            case 'email':
              // 渲染表单的模板
              this.formColumn = {
                title: '邮箱设置',
                cellGroup: [
                  {
                    label: '邮箱:',
                    prop: 'email',
                    type: 'input',
                    placeholder: '请输入您的邮箱'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'email',
                    disabled: false,
                    event: email => {
                      // 获取手机验证码请求
                      this.getVcodeEmail(email)
                    }
                  }
                ],
                footer: '绑定邮箱主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '绑定邮箱',
                    type: 'confirm',
                    event: (item, callback) => {
                      item['check'] = this.check
                      api
                        .setUserEmail(item)
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.$message.success('绑定邮箱成功')
                            // 回调清除输入框
                            callback()
                            // 关闭弹框
                            this.cancel()
                            // 刷新数据
                            this.userSafety()
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {
                          this.$message.error('绑定邮箱失败')
                        })
                    }
                  }
                ]
              }
              this.form = {
                email: '',
                code: ''
              }
              this.formRules = {
                email: [
                  { required: true, message: '请输入邮箱', trigger: ['blur'] },
                  { required: true, validator: this.validatorEmail, trigger: ['blur', 'change'] }
                ],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              break
            case 'mobile':
              this.formColumn = {
                title: '绑定手机号码',
                cellGroup: [
                  {
                    label: '手机号:',
                    prop: 'mobile',
                    type: 'input',
                    placeholder: '请输入您的手机号'
                  },
                  {
                    label: '验证码:',
                    prop: 'code',
                    type: 'input',
                    placeholder: '请输入验证码',
                    // 右侧按钮问题
                    button: '获取验证码',
                    buttonProp: 'mobile',
                    disabled: false,
                    event: mobile => {
                      // 获取手机验证码请求
                      this.getVcodeMobile(mobile)
                    }
                  }
                ],
                footer: '绑定手机号主要用于密码找回及短信通知',
                btns: [
                  {
                    label: '取消',
                    type: 'cancel',
                    event: item => {
                      this.cancel()
                    }
                  },
                  {
                    label: '绑定手机号',
                    type: 'confirm',
                    event: (item, callback) => {
                      item['check'] = this.check
                      api
                        .setUserMobile(item)
                        .then((res: any) => {
                          const { code, msg } = res
                          if (code === 0) {
                            this.$message.success('绑定手机号码成功')
                            // 回调清除输入框
                            callback()
                            this.cancel()
                            // 刷新数据
                            this.userSafety()
                          } else {
                            this.$message.error(msg)
                          }
                        })
                        .catch((error: any) => {
                          this.$message.error('绑定手机号码失败')
                        })
                    }
                  }
                ]
              }
              this.form = {
                mobile: '',
                code: ''
              }
              this.formRules = {
                mobile: [
                  { required: true, message: '请输入手机号码', trigger: ['blur'] },
                  { required: true, validator: this.validatorMobile, trigger: ['blur', 'change'] }
                ],
                code: [{ required: true, message: '请输入验证码', trigger: ['blur'] }]
              }
              break
            case 'withdraw_password':
              this.setWithdrawPwd()
              break
          }
        } else {
          this.$message.error(msg)
        }
      })
      .catch((error: any) => {})
  }

  // 设置提现密码
  setWithdrawPwd() {
    this.formColumn = {
      title: '设置提现密码',
      cellGroup: [
        {
          label: '提现密码:',
          prop: 'pwd',
          type: 'widthdrawPassword',
          placeholder: '请输入提现密码',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        },
        {
          label: '确定提现密码:',
          prop: 'pwd_confirm',
          type: 'widthdrawPassword',
          placeholder: '请输入确定提现密码',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        }
      ],
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.cancel()
          }
        },
        {
          label: '确定设置',
          type: 'confirm',
          event: (item, callback) => {
            api
              .setUserWithdrawpwd({ pwd: item.pwd, check: this.check })
              .then((res: any) => {
                const { code, msg } = res
                if (code === 0) {
                  this.$message.success('设置提现密码成功')
                  callback()
                  // 关闭弹框
                  this.cancel()
                  this.userSafety()
                } else {
                  this.$message.error(msg)
                }
              })
              .catch((error: any) => {
                this.$message.error('设置提现密码失败，请稍后重试')
              })
          }
        }
      ]
    }
    this.form = {
      pwd: '',
      pwd_confirm: ''
    }
    this.formRules = {
      pwd: [
        { required: true, message: '请输入提现密码', trigger: ['blur', 'change'] },
        { required: true, validator: this.validatorWithdrawPwd, trigger: ['blur', 'change'] }
      ],
      pwd_confirm: [
        { required: true, message: '请输入确定提现密码', trigger: ['blur', 'change'] },
        { required: true, validator: this.validatorSamePassword, trigger: ['blur', 'change'] }
      ]
    }
  }

  // 验证登录密码的editObj和form的设置
  validLoginPWdEditObjAndForm(key, title) {
    this.formColumn = {
      title,
      cellGroup: [
        {
          label: '登录密码:',
          prop: 'pwd',
          type: 'input',
          placeholder: '请输入登录密码',
          password: true,
          icon: require('./img/password-not-view.png'),
          iconEvent: obj => {
            const { password } = obj
            obj.password = !password
            obj.icon = password ? require('./img/view.png') : require('./img/password-not-view.png')
          }
        }
      ],
      btns: [
        {
          label: '取消',
          type: 'cancel',
          event: item => {
            this.cancel()
          }
        },
        {
          label: '下一步',
          type: 'confirm',
          event: (item, callback) => {
            this.verificationPassword(item, callback, key)
          }
        }
      ],
      footer: '输入登录密码验证身份'
    }
    this.form = {
      pwd: ''
    }
    this.formRules = {
      pwd: [
        { required: true, message: '请输入登录密码', trigger: ['blur'] },
        { required: true, validator: this.validatorPassword, trigger: ['blur', 'change'] }
      ]
    }
  }
}
</script>
