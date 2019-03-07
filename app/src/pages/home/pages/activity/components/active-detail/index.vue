<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'
@Component
export default class ActiveDetail extends Vue {
  details: Detail = {
    title: '',
    begin_time: '',
    end_time: '',
    cover: '',
    content_pc: ''
  }
  mounted() {
    if (this.$route.query.id) this.getActiveDetail(this.$route.query)
  }
  getActiveDetail(params) {
    api
      .activeDetail(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          for (let key in this.details) {
            this.details[key] = response.data[key]
          }
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }
  goBack() {
    this.$router.push({ path: 'activity', query: { detailBack: 'true' } })
  }
}
interface Detail {
  title: string
  begin_time: string
  end_time: string
  cover: string
  content_pc: string
}
</script>
