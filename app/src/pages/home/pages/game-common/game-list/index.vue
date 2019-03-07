<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Emit, Prop, Watch } from 'vue-property-decorator'
import api from '@/api'
import { Action, namespace } from 'vuex-class'
const USER = namespace('user')
@Component
export default class GameList extends Vue {
  @USER.State userType
  @USER.State token
  @Action gotoAPI
  @Action changeFavorite
  @Prop() gametype!: number
  @Prop() params!: any
  gamelist: any = []
  page: number = 1
  size: number = 20
  total: number = 0
  isPage: boolean = false
  mounted() {
    if (this.$route.params && this.$route.params.name) {
      this.isPage = true
    }
    this.$event.$on('gameSearch', this.requestList)
  }
  /**
   * 请求列表数据
   */
  requestList(val?: any) {
    const isSearch = val && val !== 'onMenuClick'
    let pages = {
      page: val === 'onMenuClick' ? 1 : this.page,
      page_size: this.size
    }
    // 默认参数
    let params: any = {
      ...pages,
      tag_id: this.params.tag_id,
      game_type: this.gametype || '',
      partner_id: this.params.partner_id,
      game_name: isSearch ? val.game_name : ''
    }
    // 我的收藏
    let apiUrl = 'gameList'
    if (params.tag_id === 'favorite') {
      apiUrl = 'getFavorites'
      params = {
        ...pages,
        game_name: isSearch ? val.game_name : ''
      }
    } else if (params.tag_id === 'all') {
      // 全部游戏
      params = {
        ...pages,
        game_type: this.gametype || '',
        partner_id: this.params.partner_id,
        game_name: isSearch ? val.game_name : ''
      }
    }
    api[apiUrl](params)
      .then((response: any) => {
        this.gamelist = []
        if (response.code === 0 && response.data) {
          this.size = response.data.pagination.size
          this.total = response.data.pagination.total
          this.page = response.data.pagination.page
          this.gamelist = response.data.list
        } else {
          this.total = 0
          this.gamelist = []
        }
      })
      .catch(error => {
        this.total = 0
        this.gamelist = []
      })
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
      game_id: item.id,
      game_name: item.partner_name,
      type: item.is_favorite === 0 ? 'add' : 'remove'
    }
    this.token && (this.gamelist[index].is_favorite = item.is_favorite === 0 ? 1 : 0)
    this.changeFavorite(params)
  }
  /** 分页器每页个数变化回调 */
  onPageSizeChange(size: number) {
    this.size = size
    this.requestList()
  }

  /** 分页器页码变化回调 */
  onCurrentChange(page: number) {
    this.page = page
    this.requestList()
  }
}
</script>
