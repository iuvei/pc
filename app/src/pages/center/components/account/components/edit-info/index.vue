<template lang="pug" src="./index.pug"></template> 

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Form, Input, RadioGroup, Radio, DatePicker, Button } from 'element-ui'
import api from '@/api'

@Component
export default class EditInfo extends Vue {
  /*************data***********/
  // 表单对象
  form: any = {
    qq: '',
    wechat: '',
    skype: '',
    birth: ''
  }

  // 表单的交易规则
  formRules: any = {
    qq: [{ validator: this.validatorQQ, trigger: ['blur', 'change'] }],
    wechat: [{ validator: this.validatorWechat, trigger: ['blur', 'change'] }],
    skype: [{ validator: this.validator, trigger: ['blur', 'change'] }]
  }
  validatorQQ(rule, value, callback) {
    if (value && !/^[0-9]{4,14}$/.test(value)) {
      callback(new Error('请输入4-14数字'))
    } else {
      callback()
    }
  }
  validatorWechat(rule, value, callback) {
    if (value && !/^[a-zA-Z].{1,19}$/.test(value)) {
      callback(new Error('请输入以字母开头不能大于20个字符'))
    } else {
      callback()
    }
  }
  validator(rule, value, callback) {
    if (value && !/^.{1,50}$/.test(value)) {
      callback(new Error('请输入少于50个字符'))
    } else {
      callback()
    }
  }
  // 性别数组
  sexInfo: object[] = [
    {
      id: 1,
      name: '男'
    },
    {
      id: 2,
      name: '女'
    },
    {
      id: 3,
      name: '保密'
    }
  ]

  isLoading: boolean = true
  // 渲染表单的模板
  formColumn: object[] = [
    { label: '真实姓名', prop: 'realname', type: 'input', disabled: true },
    { label: '用户名', prop: 'username', type: 'input', disabled: true },
    { label: '生日', prop: 'birth', type: 'date' },
    { label: '性别', prop: 'sex', type: 'radio', group: this.sexInfo },
    { label: 'QQ', prop: 'qq', type: 'input' },
    { label: '微信', prop: 'wechat', type: 'input' },
    { label: 'skype', prop: 'skype', type: 'input' }
  ]

  // 可供选选择的头像列表
  avaterArr: any = [
    { img: 'photo1.png' },
    { img: 'photo2.png' },
    { img: 'photo3.png' },
    { img: 'photo4.png' },
    { img: 'photo5.png' },
    { img: 'photo6.png' },
    { img: 'photo7.png' },
    { img: 'photo8.png' },
    { img: 'photo9.png' }
  ]

  /*************life-cycle***********/
  mounted() {
    this.request()
  }
  /*************methods***********/
  request() {
    api
      .userBaseinfo()
      .then((res: any) => {
        const { code, data } = res
        if (code == 0) {
          this.isLoading = false
          this.form = data || []
          const { birth } = data
          if (birth === '0000-00-00') {
            this.$set(this.form, 'birth', '')
          }
          this.form.avatar_url = data['avatar_url'] || this.avaterArr[0].img
        }
      })
      .catch(error => {})
  }
  // 保存
  submit() {
    const { avatar_url, birth, qq, sex, skype, wechat } = this.form
    api
      .userInfoEdit({
        avatar_url,
        birth: birth ? new Date(birth).format('yyyy-MM-ddd') : '',
        qq,
        sex,
        skype,
        wechat
      })
      .then((res: any) => {
        const { code, msg } = res
        if (code == 0) {
          this.$message.success('修改个人资料成功')
          this.request()
        } else {
          this.$message.error('修改个人资料失败')
        }
      })
      .catch(error => {})
  }
}
</script>
