<template lang="pug" src="./index.pug"></template> 
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ADFloatPosition } from '@/enums'
import api from '@/api'

@Component
export default class AdFloat extends Vue {
  /** 默认的左上角广告数据 */
  defaultLeftTopData = {
    pic: require('./img/1.png'),
    pic_detail: require('./img/2.png'),
    link: '/'
  }

  isLeftTopVisible: boolean = false
  isLeftCenterVisible: boolean = false
  isRightTopVisible: boolean = false

  leftTopData = {}
  leftCenterData = {}
  rightTopData = {}

  mounted() {
    this.requestFloat()
  }

  requestFloat() {
    api
      .homeFloat()
      .then((response: any) => {
        if (response.code === 0) {
          response.data.forEach(v => {
            switch (v.position) {
              case ADFloatPosition.LeftTop:
                this.isLeftTopVisible = true
                this.leftTopData = v
                break
              case ADFloatPosition.LeftCenter:
                this.isLeftCenterVisible = true
                this.leftCenterData = v
                break
              case ADFloatPosition.RightTop:
                this.isRightTopVisible = true
                this.rightTopData = v
                break
            }
          })
        }

        /** @note 特殊处理，当首页左侧顶部的广告服务器没有数据时，显示默认图 */
        if (!this.isLeftTopVisible) {
          this.isLeftTopVisible = true
          this.leftTopData = this.defaultLeftTopData
        }
      })
      .catch(error => {})
  }
}
</script>
