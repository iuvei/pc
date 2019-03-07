<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit, Prop, Watch } from 'vue-property-decorator'
import Recommend from '../game-common/recommend/index.vue'
import api from '@/api'
@Component({
  components: {
    Recommend
  }
})
export default class Recommends extends Vue {
  gamename: string = ''
  placeholder: string = '请输入游戏名称'
  nameLength: number = 20
  doSearch() {
    let str = this.gamename.replace(/\s*/g, '')
    if (str.length < this.nameLength) {
      ;(this.$refs.recommend as any).getRecommend()
    } else {
      this.$message.warning(`最多输入${this.nameLength}个字符`)
    }
  }
}
</script>
