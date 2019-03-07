<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Form, Tabs, Loading } from 'element-ui'
import WithdrawPassword from './../withdraw-password/index.vue'

@Component({
  components: {
    WithdrawPassword
  }
})
export default class Editform extends Vue {
  /*************data***********/
  // 弹框表单的参数 设置，表单对象，校验
  @Prop(Object) formColumn!: object
  @Prop(Object) form!: object
  @Prop(Object) formRules!: object
  @Prop(String) tabName!: string
  @Prop({ type: Boolean, default: false })
  @Prop(Boolean)
  loading!: boolean
  @Prop(Boolean) dialogVisible!: boolean

  // 绑定tabs的model
  activeTabs: string = ''
  @Watch('tabName', { deep: true, immediate: true })
  onTabnameChanged(val: string, oldVal: string) {
    if (val) {
      this.activeTabs = val
    }
  }

  @Watch('formRules', { immediate: true })
  onFormRulesChanged(val) {
    this.$nextTick(() => {
      this.$refs['formDom'] && this.$refs['formDom'].clearValidate()
    })
  }

  $refs!: {
    formDom: Form
  }
  /*************life-cycle***********/
  /*************methods***********/
  // 处理按钮事件
  handlerClick(btn) {
    const { type, event } = btn
    switch (type) {
      case 'confirm':
        this.$refs['formDom'].validate((valid: any) => {
          if (valid) {
            event(this.form, this.resetForm)
          }
        })
        break
      case 'cancel':
        this.resetForm()
        event()
        break
    }
  }

  // 处理获取验证码事件
  validatorButton(obj) {
    const { buttonProp } = obj
    this.$refs['formDom'].validateField(buttonProp, msg => {
      if (!msg.length) {
        obj.event(this.form[buttonProp])
      }
    })
  }

  // 清空表单事件
  resetForm() {
    this.activeTabs = this.tabName
    this.$refs['formDom'].resetFields()
  }

  // 点击了tab头部的方法
  handleTabsClick(tab, event) {
    this.resetForm()
    const timer = setInterval(() => {
      this.$emit('tabClick', tab.name)
      clearInterval(timer)
    }, 0)
  }
}
</script>
