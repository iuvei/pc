<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch, Inject } from 'vue-property-decorator'
import { Mutation, State, namespace, Action } from 'vuex-class'
import { Form } from 'element-ui'
import HomeMenu from '@/components/home-menu/index.vue'
import api from '@/api'

const USER = namespace('user')
const wallet = namespace('wallet')

@Component({
  components: {
    HomeMenu
  }
})
export default class HomeHeader extends Vue {
  @Inject('reload') reload!: Function
  @State isFree
  @State codeUrl
  @State registerSwitch
  @State loginNoticeStatus

  @Mutation updateLoginNotice
  @Mutation updateCenterDialogConfig
  @Mutation updateFreeDialogVisible
  @Mutation updateForgetDialogVisible
  @Mutation updatefreeAForgetKey

  @USER.State token
  @USER.State username
  @USER.State userType
  @USER.State messageNum

  @USER.Mutation updateUserType
  @USER.Mutation updateUsername
  @USER.Mutation updateToken

  @USER.Action getMessageRead
  @wallet.Action allRefresh
  @wallet.State totalBalance

  @Action requestNotice

  centerMenus = [
    {
      title: '我的账户',
      params: {
        group: 0,
        menu: 0,
        tab: 'baseInfo'
      }
    },
    {
      title: '在线充值',
      params: {
        group: 0,
        menu: 2,
        tab: 'recharge'
      }
    },
    {
      title: '线上提款',
      params: {
        group: 0,
        menu: 2,
        tab: 'withdraw'
      }
    },
    {
      title: '额度转换',
      params: {
        group: 0,
        menu: 1
      }
    },
    {
      title: '账变记录',
      params: {
        group: 1,
        menu: 0
      }
    },
    {
      title: '投注记录',
      params: {
        group: 1,
        menu: 1
      }
    }
  ]

  $refs!: {
    form: Form
  }

  loginForm: any = {
    username: localStorage.getItem('username') || '',
    password: ''
  }

  loginLoading: boolean = false
  loginoutLoading: boolean = false

  @Watch('token', { immediate: true })
  tokenChange(value) {
    // 请求主钱包的钱,用户登录了并且是正式账号登录
    if (value && this.userType !== '1') {
      this.getMessageRead()
      !Boolean(this.$route.query.center) && this.allRefresh()
    }
  }

  mounted() {
    this.$store.dispatch('registerSetting')
  }

  /* 个人中心的会员消息 */
  onMessageClick() {
    this.updateCenterDialogConfig({ visible: true, group: 2, menu: 0, tab: 'important' })
  }

  bindUser(data) {
    // 更新token、username、userType
    this.updateUsername(data.user.username)
    if (/^(game_)/.test(this.loginForm.username)) {
      this.updateUserType('1')
    }
    this.updateToken(data.token)
    this.updateLoginNotice(true)
    let user = {
      token: data.token,
      username: data.user.username,
      userType: /^(game_)/.test(this.loginForm.username) ? '1' : ''
    }
    localStorage.setItem('user', JSON.stringify(user))
  }

  onLoginClick() {
    if (this.loginForm.username === '') {
      this.$message.error('请输入用户名')
      return false
    } else if (this.loginForm.password === '') {
      this.$message.error('请输入密码')
      return false
    }
    this.loginLoading = true
    let params
    if (/^(game_)/.test(this.loginForm.username)) {
      params = {
        demo: this.loginForm.username,
        password: this.loginForm.password
      }
    } else {
      params = {
        username: this.loginForm.username,
        password: this.loginForm.password
      }
    }
    api
      .login(params)
      .then((response: any) => {
        setTimeout(() => {
          this.loginLoading = false
        }, 2000)
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: '登录成功！'
          })
          localStorage.setItem('username', this.loginForm.username)
          // 存储用户数据
          this.bindUser(response.data)
          // 请求主钱包的钱,用户登录了并且是正式账号登录
          this.reloadPage()
          if (this.$route.path === '/register') this.$router.push({ path: '/' })
        } else {
          this.$message({
            type: 'warning',
            message: response.msg
          })
        }
      })
      .catch(error => {
        this.loginLoading = false
      })
  }

  onCenterMenuClick(item) {
    this.updateCenterDialogConfig({ visible: true, ...item.params })
  }

  onLogoutClick() {
    this.loginoutLoading = true
    api
      .logout()
      .then((res: any) => {
        this.loginoutLoading = false
        if (res.code == 0) {
          this.$message.success('退出登录成功')
          this.updateToken()
          this.updateUsername()
          this.updateUserType()
          this.$router.push('/')
          if (sessionStorage.getItem('noticeList') !== 'has_been_shown' && sessionStorage.getItem('noticeList') == undefined) {
            this.requestNotice()
          }
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(error => {
        this.loginoutLoading = false
      })
  }

  goKefu() {
    window.open(this.codeUrl, 'newwindow', 'height=800, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
  }

  onAPPDownloadClick() {
    this.$router.push('/mobile-betting')
  }

  /* 刷新当前页面 */
  reloadPage() {
    const needReloadPages = ['/activity']
    if (!needReloadPages.includes(this.$route.path)) return
    this.reload()
  }
}
</script>
