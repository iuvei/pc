<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import DayPicker from '@/components/day-picker/index.vue'
import api from '@/api'
import _ from 'lodash'
import { Form } from 'element-ui'

@Component({
  components: {
    DayPicker
  }
})
export default class extends Vue {
  $refs!: {
    dayPicker: Vue
    form: Form
  }
  activeName: string = 'transaction'

  form = {
    category: ''
  }

  days: string[] = []

  sizes: number[] = [10, 20, 50, 100, 200, 500]
  page: number = 1
  size: number = 10
  total: number = 0

  isLoading: boolean = false

  optionTypes: any = []

  tableHead = [
    {
      label: '交易时间',
      prop: 'created_at',
      width: '200'
    },
    {
      label: '类型',
      prop: 'type',
      width: '150'
    },
    {
      label: '交易金额',
      prop: 'deal_money',
      width: '120'
    },
    {
      label: '交易后余额',
      prop: 'balance',
      width: '120'
    },
    {
      label: '备注',
      prop: 'remark',
      minWidth: '200'
    }
  ]

  tableData = []

  mounted() {
    this.requestTable()
    this.getRecordFrom()
  }

  getRecordFrom() {
    api
      .getRecordFrom()
      .then((response: any) => {
        this.isLoading = false
        if (response.code === 0 && response.data) {
          const menu = _.toPairs(response.data || {}).map(([key, val]) => ({ value: key, label: val }))
          this.optionTypes = [{ value: '', label: '全部' }, ...menu]
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    if (this.days) {
      let days = {
        time_begin: this.days[0],
        time_end: this.days[1]
      }
      params = _.assign(params, days)
    }

    params = _.assign(params, this.form)

    api
      .getRecordFromsearch(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0 && response.data) {
          this.total = response.data.pagination.total
          this.size = response.data.pagination.size
          this.page = response.data.pagination.page
          this.tableData = response.data.list
          let balance = response.data.balance
          let totalMoney = response.data.totalMoney
        } else {
          this.total = 0
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  onQueryClick() {
    this.requestTable()
  }

  onResetClick() {
    this.$refs['form'].resetFields()
    this.$refs.dayPicker.$emit('reset')
    this.page = 1
    this.size = 10
    this.requestTable()
  }

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }
}
</script>
