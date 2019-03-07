<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class DayPicker extends Vue {
  @State timezone
  @Prop(Array) value!: string[] /** 支持传入自己设置的时间 */
  @Prop({ default: () => [] })
  defaultValue!: number[] /** 默认选择时间 */

  days: string[] = this.value
  initDays: string[] = [...this.value] /** 用于存储自己设置的时间，重置事件使用 */

  /** 基础时间，若无则取本地时间 */
  get baseTime() {
    return this.timezone.value || new Date().getTime()
  }

  created() {
    !this.initDays.length && this.defaultValue.length > 0 && this.reset()
    this.$on('reset', this.reset)
  }

  /** 以默认值重置选项 */
  reset() {
    if (this.initDays.length) {
      this.onChange([...this.initDays])
    } else {
      const days = this.defaultValue.map(v => {
        const time = new Date(this.baseTime)
        time.setTime(time.getTime() + 3600 * 1000 * 24 * v)
        return time.format('yyyy-MM-dd')
      })
      this.onChange(days)
    }
  }

  /** 选择今天 */
  setToday(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    picker.$emit('pick', [start, end])
  }
  /** 选择最近三天 */
  setBeforeThreeDay(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (3 - 1))
    picker.$emit('pick', [start, end])
  }
  /** 选择最近一周 */
  setBeforeWeek(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setTime(start.getTime() - 3600 * 1000 * 24 * (7 - 1))
    picker.$emit('pick', [start, end])
  }
  /** 选择最近一个月 */
  setBeforeMonth(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setMonth(start.getMonth() - 1)
    start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
    picker.$emit('pick', [start, end])
  }
  /** 选择最近三个月 */
  setBeforeThreeMonth(picker) {
    const end = new Date(this.baseTime)
    const start = new Date(this.baseTime)
    start.setMonth(start.getMonth() - 3)
    start.setTime(start.getTime() + 3600 * 1000 * 24 * 1)
    picker.$emit('pick', [start, end])
  }

  pickerOptions = {
    shortcuts: [
      {
        text: '今天',
        onClick: this.setToday
      },
      {
        text: '最近三天',
        onClick: this.setBeforeThreeDay
      },
      {
        text: '最近一周',
        onClick: this.setBeforeWeek
      },
      {
        text: '最近一个月',
        onClick: this.setBeforeMonth
      },
      {
        text: '最近三个月',
        onClick: this.setBeforeThreeMonth
      }
    ]
  }

  @Watch('value')
  onChildChanged(value: string[]) {
    this.days = value
  }

  @Emit('input')
  onChange(days: string[]) {}
}
</script>
<style lang="stylus">
.el-date-table td.end-date span, .el-date-table td.start-date span
  background-color #f4002b

.el-date-table td.available:hover
  color #f4002b
</style>
