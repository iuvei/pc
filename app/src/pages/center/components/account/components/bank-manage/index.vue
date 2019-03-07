<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { Form, Table, Button, Pagination, Select, Dialog } from 'element-ui'
import WithdrawPassword from '@/components/withdraw-password/index.vue'
import { Mutation } from 'vuex-class'

@Component({
  components: {
    WithdrawPassword
  }
})
export default class BankManage extends Vue {
  @Mutation updateWithdrawDialogVisible
  /*************data***********/
  // 银行卡列表
  bankList: any = {}

  // 获取表格的绑定的银行卡信息
  profileList: any = []

  $refs!: {
    form: Form
    deleteForm: Form
  }
  // 未添加银行卡的数据源
  realName: string = ''
  // 表单验证
  form: any = {
    withdraw_password: '',
    bank_id: '',
    name: '',
    card: '',
    address: ''
  }
  // 表单校验规则
  formRules: any = {
    withdraw_password: [
      { required: true, message: '请输入提现密码', trigger: ['blur', 'change'] },
      { validator: this.validatePass, trigger: ['blur', 'change'] }
    ],
    bank_id: [{ required: true, message: '请选择银行名称', trigger: ['blur', 'change'] }],
    name: [{ required: true, message: '请输入开户名', trigger: ['blur'] }, { validator: this.validateName, trigger: ['blur', 'change'] }],
    card: [{ required: true, message: '请输入银行账号', trigger: ['blur'] }, { validator: this.validateCard, trigger: ['blur', 'change'] }],
    address: [{ required: true, message: '请输入开户行', trigger: ['blur'] }, { validator: this.validateAdress, trigger: ['blur', 'change'] }]
  }

  isLoading: boolean = true

  isSave: boolean = false
  // 渲染表单的模板
  get formColumn() {
    return [
      { label: '提现密码', prop: 'withdraw_password', type: 'widthdrawPassword' },
      { label: '银行名称', prop: 'bank_id', type: 'select', options: this.bankList },
      { label: '开户名', prop: 'name', type: this.realName ? 'text' : 'input' },
      { label: '银行账号', prop: 'card', type: 'input' },
      { label: '开户行', prop: 'address', type: 'textarea' }
    ]
  }

  // 已添加银行卡的数据源
  // 绑定银行卡的table设置
  get tableColumn() {
    return [
      { label: '银行账号', prop: 'card', minWidth: '80' },
      { label: '银行名称', prop: 'bank', minWidth: '100' },
      { label: '银行简称', prop: 'code', minWidth: '60' },
      { label: '开户支行', prop: 'address', minWidth: '160' },
      { label: '开户名', prop: 'name', minWidth: '60' },
      { label: '创建时间', prop: 'created_at', minWidth: '100' }
    ]
  }
  dialogVisible: boolean = false

  // 删除银行卡弹框的数据
  deletedialogVisible: boolean = false
  deleteForm = {
    withdraw_password: ''
  }

  // 控制显示忘记密码的弹框
  isShowWithdraw: boolean = false

  // 是否设置了提现密码的标志,0请求没有完成，1是显示还没设置，2是显示忘记密码
  isSetPassword: number = 0
  // 表单验证方法
  validateName(rule, value, callback) {
    if (value && !/^[\u4e00-\u9fff]{2,10}$/.test(value)) {
      callback(new Error('请输入2-10个汉字'))
    } else {
      callback()
    }
  }
  validatePass(rule, value, callback) {
    if (value && !/^[0-9]{4}$/.test(value)) {
      callback(new Error('请输入4位数字'))
    } else {
      callback()
    }
  }
  validateCard(rule, value, callback) {
    if (value && !/^[0-9]{16,19}$/.test(value)) {
      callback(new Error('请输入16-19位数字'))
    } else {
      callback()
    }
  }
  validateAdress(rule, value, callback) {
    if (value && !/^[\u4e00-\u9fff]{1,50}$/.test(value)) {
      callback(new Error('请输入不超过50个汉字'))
    } else {
      callback()
    }
  }
  /*************life-cycle***********/
  mounted() {
    this.$refs['form'].resetFields()
    this.getProfileBanks()
    this.getUserName()
  }
  /*************methods***********/
  // 获取查询已添加的银行列表
  getProfileBanklist() {
    api
      .getProfileBanklist()
      .then((res: any) => {
        const { data, code } = res
        if (code === 0) {
          this.isLoading = false
          let tempArr: any = []
          data.map((obj: any) => {
            this.bankList.map((bank: any) => {
              if (bank.id === obj.bank_id) {
                const { name, code } = bank
                tempArr.push({ ...obj, bank: name, code })
              }
            })
          })
          this.profileList = tempArr
          if (!data.length) {
            // 没有绑定银行卡时，需要检验用户有没有设置提款密码
            this.getWithDrawPassword()
          }
        }
      })
      .catch((error: any) => {})
  }

  // 获取是否设置了提现密码的情况
  getWithDrawPassword() {
    this.isSetPassword = 0
    api
      .userSafety()
      .then((res: any) => {
        const { data, code } = res
        if (code === 0) {
          const tempBoolean = data.withdraw_password.status
          if (tempBoolean === '0') {
            this.isSetPassword = 1
            this.$alert('您还没设置提现密码，前往设置提现密码？', '提示', {
              confirmButtonText: '确定',
              showCancelButton: true,
              cancelButtonText: '取消',
              cancelButtonClass: 'hollow',
              confirmButtonClass: 'solid',
              callback: action => {
                action === 'confirm' && this.updateWithdrawDialogVisible(true)
              }
            })
          } else if (tempBoolean === '1') {
            this.isSetPassword = 2
          }
        }
      })
      .catch(err => {})
  }

  // 获取用户的真实姓名
  getUserName() {
    api.getUserRealname().then((res: any) => {
      const { code, data } = res
      if (code === 0 && data) {
        this.realName = data
        this.$set(this.form, 'name', data)
        this.$set(this.formRules, 'name', [{ require: true }])
      }
    })
  }

  // 获取银行卡列表
  getProfileBanks() {
    api
      .getProfileBanks()
      .then((res: any) => {
        const { data, code } = res
        if (code === 0) {
          this.bankList = data.filter((obj: any) => {
            return obj.is_online === false
          })
          this.getProfileBanklist()
        }
      })
      .catch((error: any) => {})
  }

  save() {
    this.$refs['form'].validate((valid: any) => {
      if (valid) {
        this.isSave = true
        api
          .postProfileBank(this.form)
          .then((res: any) => {
            const { data, code, msg } = res
            if (code === 0) {
              this.$message.success('新增银行卡成功')
              this.getProfileBanklist()
              if (!this.realName) {
                this.getUserName()
              }
              if (this.dialogVisible) {
                this.dialogVisible = false
              }
              this.close()
            } else {
              this.$message.error(msg)
            }
            this.isSave = false
          })
          .catch((error: any) => {
            this.isSave = false
            this.$message.error('添加银行卡失败，请稍后重试')
          })
      }
    })
  }
  // 关闭弹框试讲
  close() {
    this.$refs['form'].resetFields()
    this.form.withdraw_password = ''
    if (this.realName) {
      this.form.name = this.realName
    }
  }
  close1() {
    this.$refs['deleteForm'].resetFields()
  }
  // 删除已绑定银行卡
  deleteFromId(id) {
    this.$alert('确定要删除该银行卡', '温馨提示', {
      confirmButtonText: '确定',
      callback: action => {
        if (action === 'confirm') {
          this.deletedialogVisible = true
          this.deleteForm['id'] = id
        }
      }
    })
  }

  // 删除银行卡的请求
  deleteBank() {
    this.$refs['deleteForm'].validate(valid => {
      if (valid) {
        api
          .deleteProfileBank({ ...this.deleteForm })
          .then((res: any) => {
            const { msg, code } = res
            if (code === 0) {
              this.$message.success('已绑定银行卡删除成功')
              this.deletedialogVisible = false
              this.getProfileBanklist()
              this.close1()
            } else {
              this.$message.error(msg)
            }
          })
          .catch((error: any) => {
            this.$message.error('已绑定银行卡删除失败，请稍后重试')
          })
      }
    })
  }
}
</script>
