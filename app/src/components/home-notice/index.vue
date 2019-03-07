<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import api from '@/api'

@Component
export default class HomeNotice extends Vue {
  @Mutation updateNoticeDialogConfig
  @State timezone
  @Action requestNotice

  list = []

  get dateLabel() {
    return new Date(this.timezone.value).format('yyyy-MM-dd hh:mm:ss')
  }

  mounted() {
    this.requestHomeRollNotice()
  }

  requestHomeRollNotice() {
    api
      .homeRollNotice()
      .then((response: any) => {
        if (response.code === 0) {
          this.list = response.data
        }
      })
      .catch(error => {})
  }

  onNoticeClick(item) {
    api
      .homeNoticeList()
      .then((response: any) => {
        if (response.code === 0) {
          this.updateNoticeDialogConfig({ visible: true, id: item.id, list: response.data })
        }
      })
      .catch(error => {})
  }

  onMarqueeMouseOver() {
    let marquee = this.$refs['marquee'] as any
    marquee.stop()
  }

  onMarqueeMouseOut() {
    let marquee = this.$refs['marquee'] as any
    marquee.start()
  }
}
</script>
