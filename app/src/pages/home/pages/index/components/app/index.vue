<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import api from '@/api'

@Component
export default class App extends Vue {
  @State qrcode
}
</script>
