<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class WithdrawPassword extends Vue {
  // 父组件的表单对象
  @Prop(Object) resultForm!: object

  // 该表单对应的key
  @Prop(String) resultKey!: string

  // 重置值
  @Prop(Boolean) isReset!: boolean

  @Watch('isReset')
  onIsResetChanged(val) {
    if (val) {
      this.valuesArr = [-1, -1, -1, -1]
    }
  }

  // select绑定的数据源
  valuesArr: number[] = [-1, -1, -1, -1]

  // select可选择项
  options: object[] = [
    {
      value: -1,
      label: '-'
    }
  ]

  // ---
  mounted() {
    for (let i = 0; i < 10; i++) {
      this.options.push({ value: i, label: i })
    }
  }

  // 点击选择时
  changePsd() {
    // 改变表单的值
    this.resultForm[this.resultKey] = this.valuesArr.join('')
  }
}
</script>
<style lang="stylus">
.withdraw-password
  .el-input
    width auto !important
    margin-left 1px

  .el-select .el-input .el-select__caret
    font-size 24px
    color #181819

  .el-icon-arrow-up:before
    content '\E60C'
</style>
