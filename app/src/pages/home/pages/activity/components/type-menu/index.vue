<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator'
import { MenuItem } from '../../interface'
import api from '@/api'
@Component
export default class TypeMenu extends Vue {
  menu: MenuItem[] = []
  current: number = 0
  swiperOption = {
    speed: 600,
    allowTouchMove: false,
    observer: true,
    slidesPerView: 'auto',
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  }
  @Emit('changeType')
  changeType(id) {
    this.current = id
    sessionStorage.setItem('active-type', id)
  }
  mounted() {
    this.getActiveTypes()
  }
  getActiveTypes() {
    api
      .activeTypes()
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.menu = response.data
          let id = sessionStorage.getItem('active-type')
          if (this.$route.query.detailBack && id) {
            this.changeType(Number(id))
            setTimeout(() => {
              this.$router.push({ path: 'activity', query: {} })
            }, 20)
          } else {
            this.changeType(response.data[0].id)
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
}
</script>
