<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace, Action } from 'vuex-class'
import api from '@/api'
import _ from 'lodash'

const USER = namespace('user')

@Component
export default class NoticeDialog extends Vue {
  @USER.State token
  @State noticeDialogConfig
  @State loginNoticeStatus
  @Mutation updateLoginNotice
  @Mutation updateNoticeDialogConfig
  @Action requestNotice

  activeIndex = 0

  checked: boolean = false

  list: any = []

  @Watch('noticeDialogConfig', { deep: true, immediate: true })
  onNoticeDialogConfigChanged({ visible, id, list }) {
    if (visible) {
      this.activeIndex = _.findIndex(list, { id })
      this.list = this.noticeDialogConfig.list
    }
  }

  @Watch('token')
  onTokenChanged(val: string) {
    if (val !== '') {
      if (this.loginNoticeStatus) {
        this.requestNotice()
        this.updateLoginNotice(false)
      }
    }
  }

  mounted() {
    this.onTokenChanged(this.token)
  }

  onItemClick(index) {
    this.activeIndex = index
  }

  onClose() {
    this.updateNoticeDialogConfig({ visible: false })
    this.activeIndex = 0
    if (this.checked) {
      if (!this.token) {
        sessionStorage.setItem('noticeList', 'has_been_shown')
      }
    }
  }
}
</script>
