<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ADFloatPosition } from '@/enums'
import api from '@/api'

@Component
export default class AdApi extends Vue {
  isLeftBottomVisible: boolean = false
  isRightBottomVisible: boolean = false

  leftBottomData = []
  rightBottomData = []

  swiperOption = {
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
    this.requestActivityAPI()
  }

  requestActivityAPI() {
    api
      .homeActivityAPI()
      .then((response: any) => {
        if (response.code === 0) {
          response.data.forEach(v => {
            switch (v.position) {
              case ADFloatPosition.LeftBottom:
                this.isLeftBottomVisible = true
                this.leftBottomData = v.floats
                break
              case ADFloatPosition.RightBottom:
                this.isRightBottomVisible = true
                this.rightBottomData = v.floats
                break
            }
          })
        }
      })
      .catch(error => {})
  }
}
</script>
