<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import TypeMenu from './components/type-menu/index.vue'
import Banner from './components/banner/index.vue'
import ActiveList from './components/active-list/index.vue'
import { ListItem } from './interface'
import api from '@/api'

@Component({
  components: {
    TypeMenu,
    ActiveList,
    Banner
  }
})
export default class Activity extends Vue {
  activeList: Array<ListItem> = []
  changeType(id) {
    this.getActiveList(id)
  }
  getActiveList(id) {
    let params = {
      type_id: id
    }
    api
      .activeList(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.activeList = response.data
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }
}
</script>
