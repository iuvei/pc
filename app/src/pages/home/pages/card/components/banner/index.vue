<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'

@Component
export default class Banner extends Vue {
  /** 默认的轮播图资源，当服务器没有数据时展示 */
  defaultSlides = [
    {
      img_pc: require('./img/1.png'),
      link_pc: ''
    }
  ]

  slides: any = []

  swiperOption = {
    effect: 'fade',
    speed: 600,
    preventClicks: false,
    allowTouchMove: false,
    slidesPerView: 'auto',
    loop: true,
    autoplay: {
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    }
  }

  mounted() {
    this.requestBanner()
  }

  requestBanner() {
    let params = {
      type: 6
    }

    api
      .apiActive(params)
      .then((response: any) => {
        if (response.code === 0 && response.data.length > 0) {
          this.slides = response.data
        } else {
          this.slides = this.defaultSlides
        }
      })
      .catch(error => {
        this.slides = this.defaultSlides
      })
  }
}
</script>
