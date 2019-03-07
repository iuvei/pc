<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'

@Component
export default class Notice extends Vue {
  isSelected: boolean = false
  isLoading: boolean = false
  selectIds: number[] = []

  tableHead = [
    {
      label: '标题',
      prop: 'title',
      width: '300'
    },
    {
      label: '内容',
      prop: 'content',
      minWidth: '500'
    }
  ]

  tableData = []

  /**分页相关数据 */
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    const params = {
      page: this.page,
      page_size: this.size
    }

    api
      .noticeList(params)
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0 && response.data && response.data.list) {
          const list = response.data.list || []
          const { pagination } = response.data

          this.size = pagination.size
          this.total = pagination.total
          this.page = pagination.page

          this.tableData = list
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
