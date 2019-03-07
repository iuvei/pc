<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import GameMenu from './components/game-menu/index.vue'
import Banner from './components/banner/index.vue'
import GameCommon from '../game-common/index.vue'
import api from '@/api'

@Component({
  components: {
    GameMenu,
    GameCommon,
    Banner
  }
})
export default class Egame extends Vue {
  gameInfo: any = {}
  changeGame(val) {
    this.gameInfo = val
  }
}
</script>
