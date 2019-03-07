import i18n from '@/i18n'
import _ from 'lodash'
import ElementUI from 'element-ui'

export default {
  /** 更新语言：zh-CN | zh-TW | en-US | ms-MY */
  updateLocale(state: any, locale: string) {
    state.locale = locale
    i18n.locale = locale
    sessionStorage.setItem('locale', locale)
  },

  /** 更新个人中心弹窗配置参数 */
  updateCenterDialogConfig(state: any, payload: any) {
    if (payload.visible) {
      /** @note 未登录不能进入个人中心 */
      if (state.user.token.length === 0) {
        state.dialogLoginVisible = true
        return
      }
      /** @todo 判断太草率，后面改为枚举值，提示文案待修改 */
      if (state.user.userType === '1') {
        ElementUI.Message.error('仅支持正式账号！')
        return
      }
    }
    _.merge(state.centerDialogConfig, payload)
  },

  /** 更新公告弹窗配置参数 */
  updateNoticeDialogConfig(state: any, payload: any) {
    // _.merge(state.noticeDialogConfig, payload)
    state.noticeDialogConfig = { ...state.noticeDialogConfig, ...payload }
  },

  /** 更新登录弹框是否显示 */
  updateLoginVisible(state: any, dialogLoginVisible: boolean) {
    state.dialogLoginVisible = dialogLoginVisible
  },

  /** 更新站点标题 */
  updateWebTitle(state: any, webTitle: string) {
    state.webTitle = webTitle
  },

  /** 更新页面标题 */
  updatePageTitle(state: any, pageTitle: string) {
    state.pageTitle = pageTitle
  },

  /** 更新站点icon */
  updateFavicon(state: any, favicon: any) {
    state.favicon = favicon
    ;(document.getElementById('favicon') as HTMLLinkElement).href = favicon
  },

  /** 更新站点logo */
  updateLogo(state: any, payload: any) {
    state.logo1 = payload.logo
    state.logo2 = payload.logo2
  },

  /** 更新document.title */
  updateDocumentTitle(state: any) {
    if (state.pageTitle) {
      document.title = state.webTitle + ' - ' + state.pageTitle
    } else {
      document.title = state.webTitle
    }
  },

  // 更新免费试玩按钮的状态
  updateIsFree(state: any, isFree: string) {
    state.isFree = isFree
  },

  // 更新站点底部信息
  updateBottom(state: any, bottom: string) {
    state.bottom = bottom || '皇朝国际 HC'
  },

  // 更新注册入口开关状态
  updateRegister(state: any, registerSwitch: boolean) {
    state.registerSwitch = registerSwitch
  },

  // 更新steam入口开关状态
  updateSteam(state: any, steamSwitch: boolean) {
    state.steamSwitch = steamSwitch
  },

  // 更新steam入口开关状态
  updateQrcode(state: any, qrcode: any) {
    state.qrcode = qrcode
  },

  // 免费试玩弹框显示状态
  updateFreeDialogVisible(state: any, freeDialogVisible: boolean) {
    state.freeDialogVisible = freeDialogVisible || false
  },

  // 忘记密码弹框显示状态
  updateForgetDialogVisible(state: any, forgetDialogVisible: boolean) {
    state.forgetDialogVisible = forgetDialogVisible || false
  },

  // 忘记密码弹框显示状态
  updateWithdrawDialogVisible(state: any, withdrawDialogVisible: boolean) {
    state.withdrawDialogVisible = withdrawDialogVisible || false
  },

  // 更新在线客服的地址
  updateCodeUrl(state: any, codeUrl: string) {
    state.codeUrl = codeUrl || ''
  },

  // 更新登录公告
  updateLoginNotice(state: any, loginNoticeStatus: boolean) {
    state.loginNoticeStatus = loginNoticeStatus
  },

  // 更新帮助中心的数据源
  updateHelpCenterData(state: any, helpCenterData: any) {
    state.helpCenterData = helpCenterData || null
  },
  /** 更新时区信息 */
  updateTimezone(state: any, timezone: any) {
    state.timezone = timezone
  },
  /** 订阅数据，状态更新 */
  updateSubscription(state: any, key: string) {
    state.subscription[key] = true
  }
}
