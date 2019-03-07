<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ListItem } from '../../interface'
import api from '@/api'
import { Mutation, namespace, State } from 'vuex-class'
const USER = namespace('user')
@Component
export default class ActiveItem extends Vue {
  @USER.State token
  @USER.State userType
  @Mutation updateLoginVisible
  @Prop(Array) data!: Array<ListItem>

  /**
   *
   * 优惠详情按钮点击
   */
  onDetailClick(item) {
    // 常规活动
    if (!this.token) {
      this.updateLoginVisible(true)
      return
    }
    if (this.userType === '1') {
      this.$message.error('仅支持正式账号')
      return
    }
    if (item.type === 1) {
      this.$router.push({ path: 'active-detail', query: { id: item.id } })
    } else {
      // 外链活动 当前窗口
      if (item.open_mode === 3 && item.link_pc) {
        this.onApplyClick(item)
        window.location.href = item.link_pc
      }
      // 外链活动 新窗口
      if (item.open_mode === 2 && item.link_pc) {
        this.onApplyClick(item)
        window.open(item.link_pc)
      }
    }
  }

  /**
   *
   * 申请按钮点击
   */
  onApplyClick(item) {
    if (this.userType === '1') {
      this.$message.error('仅支持正式账号')
      return
    }
    let params = {
      id: item.id
    }
    api
      .activeApply(params)
      .then((response: any) => {
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: '活动申请已提交'
          })
        } else {
          this.$message({
            type: 'error',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }
}
</script>
