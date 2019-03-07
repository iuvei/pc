<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { GameType } from '@/enums'
import api from '@/api'

@Component
export default class ESport extends Vue {
  @Prop(String) partner_name!: string
  @Prop(Number) game_code!: number

  url = ''

  mounted() {
    let params = {
      game_type: GameType.ESport,
      partner_name: this.partner_name,
      game_code: this.game_code,
      extrance_name: 'gameUrl',
      platform: 0 // 对应平台 0 : PC | 1 : H5
    }

    api
      .gameThirdLogin(params)
      .then(({ code, data }: any) => {
        if (code === 0) {
          this.url = data.url
        }
      })
      .catch(error => {})
  }
}
</script>
