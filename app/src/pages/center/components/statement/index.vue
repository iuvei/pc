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
  activeName: string = 'statement'

  form = {
    gameType: '0'
  }

  days: string[] = []

  sizes: number[] = [10, 20, 50, 100, 200, 500]
  page: number = 1
  size: number = 10
  total: number = 0

  isLoading: boolean = false

  optionTypes = [
    {
      label: '全部',
      value: '0'
    },
    {
      label: '电子游艺',
      value: '1'
    },
    {
      label: '真人视讯',
      value: '2'
    },
    {
      label: '体育竞技',
      value: '3'
    },
    {
      label: '电竞竞猜',
      value: '4'
    },
    {
      label: '彩票游戏',
      value: '5'
    },
    {
      label: '棋牌对战',
      value: '6'
    }
  ]

  tableHead = [
    {
      label: '日期',
      prop: 'reckonTime',
      width: '150'
    },
    {
      label: '投注金额',
      prop: 'betAmount',
      minWidth: '150'
    },
    {
      label: '有效投注',
      prop: 'validBet',
      minWidth: '150'
    },
    {
      label: '中奖金额',
      prop: 'prize',
      minWidth: '150'
    },
    {
      label: '盈亏',
      prop: 'profit',
      minWidth: '120'
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
      pageSize: this.size
    }

    if (this.days) {
      let days = {
        startTime: this.days[0],
        endTime: this.days[1]
      }
      params = _.assign(params, days)
    }

    params = _.assign(params, this.form)

    api
      .getEffectiveBetting(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0 && response.data) {
          this.total = response.data.pagination.total
          this.size = response.data.pagination.size
          this.page = response.data.pagination.page
          if (response.data.list.length > 0) {
            var tableDataPageTotal = response.data.subTotalMoney
            var tableDataTotal = response.data.totalMoney
            tableDataPageTotal['reckonTime'] = '小计'
            tableDataTotal['reckonTime'] = '总计'
            response.data.list.push(tableDataPageTotal, tableDataTotal)
          }
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
      gameType: '0'
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
