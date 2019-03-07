<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import DayPicker from '@/components/day-picker/index.vue'
import api from '@/api'
import _ from 'lodash'

@Component({
  components: {
    DayPicker
  }
})
export default class extends Vue {
  $refs!: {
    dayPicker: Vue
  }

  activeName: string = 'discount'

  form = {
    status: '1'
  }

  days: string[] = []

  sizes: number[] = [10, 20, 50, 100, 200, 500]
  page: number = 1
  size: number = 10
  total: number = 0

  isLoading: boolean = false

  optionStatus = [
    {
      label: '通过',
      value: '1'
    },
    {
      label: '未通过',
      value: '2'
    },
    {
      label: '未处理',
      value: '0'
    }
  ]

  tableHead = [
    {
      label: '申请时间',
      prop: 'created_at',
      width: '150'
    },
    {
      label: '活动名称',
      prop: 'active_name',
      minWidth: '200'
    },
    {
      label: '活动奖励',
      prop: 'coupon_amount',
      minWidth: '150'
    },
    {
      label: '状态',
      prop: 'status',
      width: '150'
    }
  ]

  tableData = []

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    let params = {
      page: this.page,
      page_size: this.size
    }

    if (this.days) {
      let days = {
        date_begin: this.days[0],
        date_end: this.days[1]
      }
      params = _.assign(params, days)
    }

    params = _.assign(params, this.form)

    api
      .getApiUserGetMyCoupon(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0 && response.data) {
          this.total = response.data.pagination.total
          this.size = response.data.pagination.size
          this.page = response.data.pagination.page
          this.tableData = response.data.list
        } else {
          this.total = 0
          this.tableData = []
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

  onQueryClick() {
    this.requestTable()
  }

  onResetClick() {
    this.form = {
      status: '1'
    }
    this.$refs.dayPicker.$emit('reset')
    this.page = 1
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
