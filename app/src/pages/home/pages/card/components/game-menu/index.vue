<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator'
import api from '@/api'
import '@/pages/home/pages/game-common/theme/KY.styl'
import '@/pages/home/pages/game-common/theme/LEG.styl'
import '@/pages/home/pages/game-common/theme/AQP.styl'
@Component
export default class GameMenu extends Vue {
  menu: any = []
  current: number = 0
  partnerClass: string = ''
  swiperOption = {
    allowTouchMove: false,
    observer: true,
    slidesPerView: 'auto'
  }
  @Emit('changeGame')
  changeGame(item) {
    if (!item.id) return
    this.partnerClass = `theme-${item.partner_name}`
    this.current = item.id
  }
  mounted() {
    this.getGameMenu()
  }
  getGameMenu() {
    let params = {
      game_type: 6
    }
    api
      .getPartner(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.menu = response.data
          this.current = response.data[0] ? response.data[0].id : 0
          this.menu.map((v: MenuItem) => {
            try {
              v.logo = require(`./img/${v.partner_name.toUpperCase()}.png`)
            } catch (error) {
              console.warn(`请先添加${v.partner_name}厂商logo`)
            }
          })
          if (this.menu.length < 6) {
            let len = this.menu.length
            for (let i = len; i < 6; i++) {
              this.menu.push({
                logo: require('./img/waiting.png'),
                name: '敬请期待'
              })
            }
          }
          this.menu[0].id && this.changeGame(this.menu[0])
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }
  btnClick(type) {
    if (this.$refs.swiper) {
      let Swiper: any = this.$refs.swiper
      if (type === 1) {
        Swiper.swiper.slidePrev()
      } else {
        Swiper.swiper.slideNext()
      }
    }
  }
}
interface MenuItem {
  id: number
  partner_id: number
  partner_name: string
  game_type: number
  sort: number
  status: number
  maintaining: boolean
  name: string
  logo?: string
}
</script>
