<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { GameType } from '@/enums'
import api from '@/api'

@Component
export default class Live extends Vue {
  @Action gotoAPI

  /** 控制该组件是否显示，默认显示，当接口返回数据为空时再设置为隐藏，这样首屏初始化时默认占位，有数据渲染不会出现闪现和滑动条变动，优化首次加载体验 */
  isVisible: boolean = true

  list = []

  swiperOption = {
    slidesPerView: 'auto',
    spaceBetween: 16,
    allowTouchMove: false,
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
    this.requestLive()
  }

  requestLive() {
    api
      .homeLive()
      .then((response: any) => {
        if (response.code === 0) {
          this.list = response.data
          this.$nextTick(() => {
            this.initEvents()
          })
        }
        this.isVisible = this.list.length != 0
      })
      .catch(error => {})
  }

  /** 初始化轮播图的鼠标监听，鼠标滑动选中时停止轮播动画，移出恢复动画 */
  initEvents() {
    let swiper = this.$refs['swiper'] as any
    let nodes = document.querySelectorAll('.live-wrap .swiper-slide')
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener('mouseenter', () => {
        swiper.swiper.autoplay.stop()
      })
      nodes[i].addEventListener('mouseleave', () => {
        swiper.swiper.autoplay.start()
      })

      /** 产品需求改为点击整个 silde */
      nodes[i].addEventListener('click', () => {
        let index = i % this.list.length
        this.onEnterClick(this.list[index])
      })

      /** @todo swiper 开启循环模式后，自动复制的 slide 不会复制点击事件，这里主动给所有的 slide 的按钮添加点击事件，修复该问题 */
      // let btn = nodes[i].querySelector('.btn')
      // if (btn) {
      //   btn.addEventListener('click', () => {
      //     let index = i % this.list.length
      //     this.onEnterClick(this.list[index])
      //   })
      // }
    }
  }

  getAPIName(item) {
    return item.partner_name.toLowerCase()
  }

  getImagePath(item) {
    let name = this.getAPIName(item)
    return require(`./img/${name}.png`)
  }

  onEnterClick(item) {
    this.gotoAPI({
      game_type: GameType.Live,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      support_demo: item.support_demo
    })
  }
}
</script>
