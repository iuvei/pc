<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit, Prop } from 'vue-property-decorator'
import api from '@/api'
@Component
export default class CommonHeader extends Vue {
  @Prop() options!: any
  gamename: string = ''
  placeholder: string = '请输入游戏名称'
  nameLength: number = 20
  get config() {
    let obj: any = {
      logo: '',
      text: ''
    }
    if (this.options.partner_name) {
      obj = {
        logo: require(`./img/${this.options.partner_name}.png`),
        text: require(`./img/${this.options.partner_name}_TEXT.png`)
      }
    }
    return obj
  }
  doSearch() {
    let str = this.gamename.replace(/\s*/g, '')
    if (str.length < this.nameLength) {
      this.$event.$emit('gameSearch', { game_name: str })
    } else {
      this.$message.warning(`最多输入${this.nameLength}个字符`)
    }
  }
}
</script>
