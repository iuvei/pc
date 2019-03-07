<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit, Prop, Watch } from 'vue-property-decorator'
import CommonHeader from './header/index.vue'
import Recommend from './recommend/index.vue'
import GameList from './game-list/index.vue'
import egameSidebar from '@/components/egame-sidebar/index.vue'
import api from '@/api'
import './theme/FG.styl'
import './theme/AG.styl'
import './theme/BNG.styl'
import './theme/CQ9.styl'
import './theme/GNS.styl'
import './theme/HB.styl'
import './theme/KY.styl'
import './theme/LEG.styl'
import './theme/MG.styl'
import './theme/MW.styl'
import './theme/SG.styl'
import './theme/BBIN.styl'
import './theme/PT.styl'

interface MenuItem {
  id: number
  name: string
  pid: number
  remark: string
  is_default: boolean
  created_at: string
  updated_at: string
  second_menu: SecondMenu[]
}

interface SecondMenu {
  id: number
  name: string
  pid: number
  remark: string
  is_default: boolean
  created_at: string
  updated_at: string
}

@Component({
  components: {
    CommonHeader,
    Recommend,
    GameList,
    egameSidebar
  }
})
export default class GameCommon extends Vue {
  @Prop() data!: any

  @Prop() gametype!: string

  options: any = {
    partner_name: '',
    partner_id: ''
  }

  menu: MenuItem[] = []

  current: number = 0

  second_current: number = 0

  gameType = this.gametype || 1

  isPage: boolean = false

  bg_name: string = ''

  /** api广告列表 */
  AdList: any = []

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
      el: '.swiper-pagination-ad',
      clickable: true
    }
  }

  get partnerClass(): string {
    return `theme-${this.options.partner_name || 'HB'}`
  }

  tagId: any = ''

  @Watch('data')
  typeChange(newVal, oldVal) {
    if (newVal) {
      this.options.partner_name = newVal.partner_name
      this.options.partner_id = newVal.partner_id
      this.getApiActive(this.options.partner_id)
      this.getMenus()
    }
  }

  mounted() {
    if (this.$route.params && this.$route.params.name) {
      this.isPage = true
      const { type, name } = this.$route.params
      this.bg_name = require(`./img/bg_${type}.png`)
      this.options.partner_name = name.toUpperCase()
      let game_type = type === 'egame' ? 1 : 6
      this.getPartnerList({ game_type, name })
    }
  }

  /*** 获取厂商列表 */
  getPartnerList(params) {
    api
      .getPartner({ game_type: params.game_type })
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          let list = response.data
          let nowPartner = list.filter(v => v.partner_name === params.name.toUpperCase())
          this.options.partner_id = nowPartner && nowPartner[0].partner_id
          this.gameType = params.game_type
          this.getMenus()
          this.getApiActive(this.options.partner_id)
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }

  /** 获取导航菜单 */
  getMenus() {
    let params = {
      partner_id: this.options.partner_id,
      game_type: this.gameType
    }
    api
      .egameTags(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.menu = []
          for (let key in response.data) {
            this.menu.push(response.data[key])
          }
          this.current = this.menu[0].id
          this.tagId = this.menu[0].id
          this.$nextTick(() => this.$event.$emit('gameSearch', 'onMenuClick'))
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }

  /** 获取活动api广告 */
  getApiActive(id) {
    let params = {
      partner_id: id
    }
    api
      .apiActive(params)
      .then((response: any) => {
        if (response.code === 0 && response.data) {
          this.AdList = response.data
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {})
  }

  /** 菜单项点击事件 */
  onTagChange(e, id, type, id2?: any) {
    e.stopPropagation()
    e.preventDefault()
    this.tagId = id
    if (type === 1) {
      this.current = id
      this.second_current = 0
    } else {
      this.current = id2
      this.second_current = id
    }
    this.$nextTick(() => this.$event.$emit('gameSearch', 'onMenuClick'))
  }

  /** 推荐游戏更多 */
  toRecommends() {
    window.open(
      `/recommends?type=${this.gameType}`,
      'egame&card',
      'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=yes, location=no, status=no'
    )
  }
}
</script>
