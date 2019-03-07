<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
import { Mutation, State } from 'vuex-class'
@Component
export default class HomeFooter extends Vue {
  @Mutation updateHelpCenterData
  @State bottom
  // 数据源
  dataSource: any = []

  // life methods
  mounted() {
    api.getHelpCenter().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        this.dataSource = data
        this.updateHelpCenterData(data)
      }
    })
  }
}
</script>
