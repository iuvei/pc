<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import DayPicker from '@/components/day-picker/index.vue'
import api from '@/api'
import { Form } from 'element-ui'
import _ from 'lodash'
@Component({
  components: {
    DayPicker
  }
})
export default class Record extends Vue {
  $refs!: {
    dayPicker: Vue
  }
  form = {
    category: 1
  }
  /** 日期范围初始值，取当天 */
  days: string[] = []

  sizes: number[] = [10, 20, 30, 40, 50]
  page: number = 1
  size: number = 10
  total: number = 0
  /** 类型下拉框的条件 */
  optionTypes = [
    {
      label: '充值',
      value: 1
    },
    {
      label: '提现',
      value: 2
    }
  ]
  /** 表格头部定义 */
  tableHead = [
    {
      label: '交易时间',
      prop: 'created_at',
      width: '200'
    },
    {
      label: '交易编号',
      prop: 'order_number',
      minWidth: '130'
    },
    {
      label: '交易类型',
      prop: 'type_name',
      width: '80'
    },
    {
      label: '交易状态',
      prop: 'status_name',
      width: '150'
    },
    {
      label: '交易金额',
      prop: 'amount',
      width: '150'
    },
    {
      label: '备注',
      prop: 'remark',
      minWidth: '130'
    }
  ]
  /** 表格数据 */
  tableData = []
  /** 表格是否正在加载 */
  isLoading: boolean = true

  mounted() {
    this.requestTable()
  }
  /**
   * 请求列表数据
   */
  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    let days = {
      start_time: this.days[0] + ' 00:00:00',
      end_time: this.days[1] + ' 23:59:59'
    }

    params = Object.assign(params, days, this.form)

    api
      .getRecordMoney(params)
      .then((res: any) => {
        this.isLoading = false
        const { code, data } = res
        if (code === 0) {
          const { list, pagination } = data
          const { size, page, total } = pagination
          this.size = size
          this.total = total
          this.page = page
          this.tableData = list || []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }
  /** 查询按钮回调 */
  onQueryClick() {
    this.page = 1
    this.requestTable()
  }

  /** 重置按钮回调 */
  onResetClick() {
    this.form = {
      category: 1
    }
    this.$refs.dayPicker.$emit('reset')
    this.page = 1

    this.size = 10
    this.total = 0
    this.requestTable()
  }
  /** 分页器每页个数变化回调 */
  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  /** 分页器页码变化回调 */
  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }
}
</script>
