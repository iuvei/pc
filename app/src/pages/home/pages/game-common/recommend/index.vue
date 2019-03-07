<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit, Prop } from 'vue-property-decorator'
import api from '@/api'
import { Action, namespace } from 'vuex-class'
const USER = namespace('user')
import '../game-list/index.styl'
@Component
export default class Recommend extends Vue {
  @USER.State userType
  @USER.State token
  @Action gotoAPI
  @Action changeFavorite
  @Prop() type!: string
  @Prop() gamename!: string
  list: ListItem[] = []
  swiperOption = {
    slidesPerView: 5,
    slidesPerGroup: 5,
    spaceBetween: 20,
    loopFillGroupWithBlank: true,
    loop: true,
    allowTouchMove: false,
    observer: true,
    pagination: {
      el: '.swiper-pagination-recommend',
      clickable: true
    }
  }
  page: number = 1
  size: number = 15
  total: number = 0
  mounted() {
    this.getRecommend()
  }
  /** 获取推荐游戏列表 */
  getRecommend() {
    let params = {
      page: this.type === 'swiper' ? 1 : this.page,
      page_size: 15
    }
    if (this.gamename) {
      params = Object.assign({ game_name: this.gamename }, params)
    }
    api
      .recommendList(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.list = response.data.list
          if (!this.type) {
            this.size = response.data.pagination.size
            this.total = response.data.pagination.total
            this.page = response.data.pagination.page
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
  btnClick(type) {
    if (this.$refs.swiper) {
      let Swiper: any = this.$refs.swiper
      if (type === 1) {
        Swiper.swiper.slideNext()
      } else {
        Swiper.swiper.slideNext()
      }
    }
  }
  /** 进入游戏 */
  onPlayClick(item) {
    this.gotoAPI({
      game_type: item.game_type,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      game_code: item.game_code,
      return_url: item.game_url || '',
      support_demo: item.support_demo
    })
  }
  /**@note [特殊] 正式账号登录时，点击试玩每次都是新的试玩账号 */
  onTryClick(item) {
    this.gotoAPI({
      game_type: item.game_type,
      partner_id: item.partner_id,
      partner_name: item.partner_name,
      game_code: item.game_code,
      return_url: item.game_url,
      is_trial: 1
    })
  }
  /** 收藏change事件 */
  changeFavoriteStatus(item, index) {
    let params = {
      game_id: item.game_id,
      game_name: item.partner_name,
      type: item.is_favorite === 0 ? 'add' : 'remove'
    }
    this.token && (this.list[index].is_favorite = item.is_favorite === 0 ? 1 : 0)
    this.changeFavorite(params)
  }
  /** 分页器每页个数变化回调 */
  onPageSizeChange(size: number) {
    this.size = size
    this.getRecommend()
  }

  /** 分页器页码变化回调 */
  onCurrentChange(page: number) {
    this.page = page
    this.getRecommend()
  }
}
interface ListItem {
  partner_id: number
  partner_name: string
  game_id: number
  game_name: string
  img_url: string
  game_code: string
  is_favorite: number
}
</script>
