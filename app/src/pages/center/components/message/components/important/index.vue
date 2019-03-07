<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { namespace } from 'vuex-class'

const USER = namespace('user')

@Component
export default class Important extends Vue {
  @USER.Action getMessageRead

  isSelected: boolean = false
  isLoading: boolean = false
  selectIds: number[] = []

  tableHead = [
    {
      label: '状态',
      prop: 'status',
      width: '100',
      formatter: (row, column, value: number, index): string => {
        return value === 1 ? '已读' : '未读'
      }
    },
    {
      label: '日期',
      prop: 'start_time',
      width: '200'
    },
    {
      label: '标题',
      prop: 'title',
      minWidth: '300'
    }
  ]

  tableData = []

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    let params = {
      type: 1
    }

    api
      .getGeneralMsg(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0) {
          this.tableData = response.data
        } else {
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

  onSelectionChange(selection) {
    this.isSelected = selection.length > 0
    this.selectIds = selection.map(item => {
      return item.id
    })
  }

  /* 批量删除 */
  clickDelete() {
    let params = {
      id: this.selectIds.join(',')
    }
    api
      .deleteMsgStatus(params)
      .then((response: any) => {
        if (response.code == 0) {
          this.$message({
            type: 'success',
            message: '删除消息成功'
          })
          this.requestTable()
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }

  /* 批量已读 */
  clickRead() {
    let params = {
      id: this.selectIds.join(',')
    }
    api
      .changeMsgStatus(params)
      .then((response: any) => {
        if (response.code == 0) {
          this.$message({
            type: 'success',
            message: '选中消息已标为已读'
          })
          this.requestTable()
          this.getMessageRead()
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }

  /* 查看 */
  clickDetail(row) {
    this.$alert(row.content, row.title, {
      confirmButtonText: '确定',
      callback: action => {
        this.requestTable()
      }
    })
    if (!row.status) {
      let params = {
        id: row.id
      }
      api
        .changeMsgStatus(params)
        .then((response: any) => {
          if (response.code == 0) {
            this.getMessageRead()
          } else {
            this.$message({
              type: 'warning',
              message: response.msg
            })
          }
        })
        .catch(error => {})
    }
  }
}
</script>
