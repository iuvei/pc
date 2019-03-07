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
  activeName: string = 'bet'
  days: string[] = []

  sizes: number[] = [10, 20, 50, 100, 200, 500]
  page: number = 1
  size: number = 10
  total: number = 0

  isLoading: boolean = false

  // 游戏api为全部
  allAPIs = {
    partner_name: '全部',
    id: ''
  }

  // 游戏类型
  optionTypes = [
    {
      name: '全部',
      game_type: 0,
      partners: [this.allAPIs]
    }
  ]

  // 游戏类型为全部时，默认游戏api的数组为partners
  defaultAPIs = [
    {
      partner_name: '全部',
      id: '',
      partners: [this.allAPIs]
    }
  ]

  optionAPIs = [this.allAPIs]

  optionStatus = [{ name: '全部', code: 0 }, { name: '中奖', code: 1 }, { name: '未中奖', code: 2 }, { name: '待结算', code: 3 }]

  form = {
    game_type: 0,
    partner_id: '',
    win_status: 0
  }
  tableHead = [
    {
      label: '游戏类型',
      prop: 'type',
      width: '80'
    },
    {
      label: '游戏API',
      prop: 'name',
      width: '80'
    },
    {
      label: '游戏名称',
      prop: 'game_name',
      width: '80'
    },
    {
      label: '投注时间',
      prop: 'bet_time',
      width: '135'
    },
    {
      label: '注单号',
      prop: 'order_number',
      width: '185'
    },
    {
      label: '投注内容',
      prop: 'bet_content',
      minWidth: '100'
    },
    {
      label: '投注金额',
      prop: 'bet_amount',
      width: '80'
    },
    {
      label: '有效投注',
      prop: 'validbet',
      width: '80'
    },
    {
      label: '状态',
      prop: 'display',
      width: '60',
      /** 自定义该字段显示规则 */
      formatter: (row, column, value: string, index): any => {
        let t: any = _.find(this.optionStatus, { code: value })
        return t ? t.name : value
      }
    },
    {
      label: '输赢',
      prop: 'profit',
      width: '80'
    }
  ]

  tableData = []

  mounted() {
    this.requestOrderMenu()
    this.requestTable()
  }
  // 请求投注记录的表格
  requestTable() {
    this.isLoading = true
    const { partner_id, game_type, win_status } = this.form

    let params = {
      page: this.page,
      page_size: this.size,
      win_status
    }

    if (this.days) {
      let days = {
        time_begin: this.days[0] + ' 00:00:00',
        time_end: this.days[1] + ' 23:59:59'
      }
      params = _.assign(params, days)
    }

    if (partner_id) {
      const tempArr = partner_id.split('_')
      params['partner_id'] = tempArr[1]
      params['game_type'] = tempArr[0]
    }
    if (game_type !== 0) {
      params['game_type'] = game_type
    }
    api
      .getUserRecordGames(params)
      .then((res: any) => {
        this.isLoading = false
        const { code, data } = res
        if (code === 0) {
          const { list, pagination } = data
          const { total, page, size } = pagination
          this.total = total
          this.size = size
          this.page = page
          this.tableData = list
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }

  // 请求游戏类型和游戏api类型的接口
  requestOrderMenu() {
    api.getUserOrderMenu().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        // 当游戏类型是全部时，游戏api类型需要组装数据
        this.optionTypes =
          data &&
          data.length &&
          data.map((obj: any) => {
            const { partners } = obj

            obj.partners =
              partners &&
              partners.length &&
              partners.map((item: any) => {
                this.optionAPIs.push({ ...item, partner_id: item.game_type + '_' + item.partner_id })
                return { ...item, partner_id: item.game_type + '_' + item.partner_id }
              })
            return obj
          })
        this.$set(this.optionTypes[0], 'partners', [...this.optionAPIs])
        this.$set(this.defaultAPIs[0], 'partners', [...this.optionAPIs])
        this.form.game_type = data[0].game_type
        this.form.partner_id = this.optionAPIs[0].id || ''
      }
    })
  }
  // 选择游戏类型时
  selectGameType(index) {
    const { partners } = this.optionTypes[index]
    this.optionAPIs = index === 0 ? [...this.defaultAPIs[0].partners] : [this.allAPIs, ...partners]
    this.form.partner_id = this.optionAPIs[0].id || ''
  }
  onQueryClick() {
    this.requestTable()
  }

  onResetClick() {
    this.$refs['form'].resetFields()
    this.$refs.dayPicker.$emit('reset')
    this.optionAPIs = [...this.defaultAPIs[0].partners]
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
