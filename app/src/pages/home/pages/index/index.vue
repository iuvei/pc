<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Banner from './components/banner/index.vue'
import Money from './components/money/index.vue'
import Guide from './components/guide/index.vue'
import Type from './components/type/index.vue'
import Game from './components/game/index.vue'
import Live from './components/live/index.vue'
import App from './components/app/index.vue'

@Component({
  components: {
    Banner,
    Money,
    Guide,
    Type,
    Game,
    Live,
    App
  }
})
export default class Index extends Vue {}
</script>
