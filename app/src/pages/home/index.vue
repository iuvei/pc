<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Action, Mutation, State, namespace } from 'vuex-class'
import HomeHeader from '@/components/home-header/index.vue'
import HomeNotice from '@/components/home-notice/index.vue'
import HomeFooter from '@/components/home-footer/index.vue'
import Center from '@/pages/center/index.vue'
import AdFloat from '@/components/ad-float/index.vue'
import AdApi from '@/components/ad-api/index.vue'
import SideBar from '@/components/side-bar/index.vue'
import NoticeDialog from '@/components/notice-dialog/index.vue'
import { values } from 'lodash'

const USER = namespace('user')
@Component({
  components: {
    HomeHeader,
    HomeNotice,
    HomeFooter,
    Center,
    AdFloat,
    AdApi,
    SideBar,
    NoticeDialog
  }
})
export default class Home extends Vue {
  @Action getHomeDome
  @Action getWebInfo
  @Action getTimezone
  @Action requestNotice
  @Mutation updateTimezone
  @State timezone
  @State subscription
  @USER.State token

  timer: number = 0

  /** 全部订阅完成后开始渲染 */
  get subscriptionAllRight() {
    return values(this.subscription).every(v => v)
  }

  @Watch('token')
  onTokenChanged(val: string) {
    if (val === '') {
      if (sessionStorage.getItem('noticeList') !== 'has_been_shown' && sessionStorage.getItem('noticeList') == undefined && this.$route.path === '/') {
        this.requestNotice()
      }
    }
  }
  @Watch('$route.path')
  onRouteChanged(val: string) {
    if (val === '/' && !this.token) {
      if (sessionStorage.getItem('noticeList') !== 'has_been_shown' && sessionStorage.getItem('noticeList') == undefined && this.$route.path === '/') {
        this.requestNotice()
      }
    }
  }

  mounted() {
    this.getWebInfo()
    this.getHomeDome()
    this.getTimezone()
    this.onTokenChanged(this.token)
  }
  created() {
    this.setInvitCode()
  }

  /*
   * 获取-注册邀请码
   */
  setInvitCode() {
    const { code } = this.$route.query
    if (code) {
      sessionStorage.setItem('invite_code', code)
    }
  }

  beforeDestroy() {
    clearInterval(this.timer)
  }

  @Watch('timezone.startUp')
  timerStart(newVal, oldVal) {
    // 秒定时器开启，只在请求后状态false->true时触发一次
    if (!oldVal && newVal) {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        const timezone = { ...this.timezone, value: this.timezone.value + 1000 }
        this.updateTimezone(timezone)
      }, 1000)
    }
  }
}
</script>
