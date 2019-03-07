import api from '@/api'
import ElementUI from 'element-ui'

export default {
  /** 统一进入第三方游戏入口方法 */
  gotoAPI({ dispatch, commit, state }: any, payload: any) {
    /** @note 未登录不能进入第三方游戏，显示登录弹窗 */
    if (state.user.token.length === 0) {
      /** @note 试玩模式，引导用户注册试玩账号 */
      if (payload.is_trial === 1) {
        commit('updateFreeDialogVisible', true)
      } else {
        commit('updateLoginVisible', true)
      }
      return
    }

    /** @note 判断试玩账号登录时，第三方游戏是否支持试玩进入 */
    if (state.user.userType === '1' && !payload.support_demo) {
      ElementUI.Message.error('仅支持正式账号！')
      return
    }

    dispatch('checkBalance', payload).then(() => {
      /** @note 这里先立即调用打开一个新的空白窗口，可以修复因为异步请求导致后面打开窗口不会自动获取焦点的问题，这样每次窗口都会在最前面了 */
      /** @note 替换成加载窗口，体验更好 */
      let apiWindow = window.open('/loading', 'api', 'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')

      let params = {
        ...payload,
        extrance_name: 'gameUrl',
        platform: 0 // 对应平台 0 : PC | 1 : H5
      }

      api
        .gameThirdLogin(params)
        .then((response: any) => {
          if (response.code === 0) {
            /** @note 如果上面初始化打开的窗口被用户关闭了，则就不在跳转第三方游戏了 */
            if (apiWindow && !apiWindow.closed) {
              apiWindow = window.open(response.data.url, 'api', 'width=1300, height=930, top=40, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
              apiWindow && apiWindow.focus() // 没啥卵用，先写着看 IE 是否需要
            }
          } else {
            /** @note 如果获取第三方入口地址出错，就关闭该弹出窗口 */
            apiWindow && apiWindow.close()
            ElementUI.Message.error(response.msg)
          }
        })
        .catch(error => {})
    })
  },

  /** 进入第三方游戏前需要先检测子钱包余额，根据余额判断是否显示额度转换弹窗 */
  checkBalance({ commit, state }: any, payload: any) {
    const { partner_id } = payload
    return new Promise(resolve => {
      /** @note 判断是否是试玩账号，试玩账号不需要额度转换 */
      if (state.user.userType === '1' || payload.is_trial === 1) {
        resolve()
      } else {
        api
          .getChildWallet({ partner_id })
          .then(({ code, data, msg }: any) => {
            if (code === 0) {
              if (data.balance >= 10) {
                resolve()
              } else {
                commit('wallet/updateExchangeDialogConfig', {
                  visible: true,
                  childName: data.name,
                  childBalance: data.balance,
                  partner_id,
                  apiParams: payload,
                  gotoAPIMethod: resolve
                })
              }
            } else {
              ElementUI.Message.error(msg)
            }
          })
          .catch((error: any) => {})
      }
    })
  },

  getWebInfo({ commit }: any) {
    api.getHelpCollaborate().then((res: any) => {
      const { code, data } = res
      if (code === 0 && data && data[0]) {
        const { title, title_icon, logo, logo2, qrcode_android, qrcode_h5, qrcode_ios, bottom } = data[0]
        commit('updateWebTitle', title)
        commit('updateDocumentTitle')
        commit('updateFavicon', title_icon)
        commit('updateLogo', { logo, logo2 })
        commit('updateQrcode', { h5: qrcode_h5, app: qrcode_ios || qrcode_android })
        commit('updateBottom', bottom)
      }
    })
  },

  /** 请求是否显示免费试玩按钮的接口 */
  getHomeDome({ commit }: any) {
    api.homeDemo().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateIsFree', data)
      }
    })
  },

  /** 获取注册入口开关与steam入口开关状态 */
  registerSetting({ commit }: any) {
    api.getRegisterSetting().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateRegister', data.register_witch)
        commit('updateSteam', data.steam_witch)
      }
    })
  },
  /** 请求服务器所在的时区和时间 */
  getTimezone({ commit }) {
    api
      .getTimezone()
      .then((res: any) => {
        if (res.code === 0) {
          commit('updateTimezone', {
            name: res.data.timezone_name,
            utc: res.data.timezone,
            value: new Date(res.data.timestamp.replace(/-/g, '/')).getTime(),
            startUp: true
          })
        }
        commit('updateSubscription', 'timezone')
      })
      .catch(err => commit('updateSubscription', 'timezone'))
  },
  /* 获取所有公告 */
  requestNotice({ commit, state }) {
    api
      .homeNoticeList()
      .then((response: any) => {
        if (response.code === 0) {
          let popup_type1 = response.data.some(item => item.popup_type == 1) // 判断登录弹出公告是否存在
          let popup_type2 = response.data.some(item => item.popup_type == 2) // 判断首页弹出公告是否存在

          if ((state.user.token && popup_type1) || (!state.user.token && popup_type2)) {
            // 若登录状态且有登录弹出公告 || 未登录状态且无首页弹出公告
            commit('updateNoticeDialogConfig', { visible: true, id: response.data[0].id, list: response.data })
          } else if ((state.user.token && !popup_type1) || (!state.user.token && !popup_type2)) {
            // 若登录状态且无登录弹出公告 || 未登录状态且无首页弹出公告
            commit('updateNoticeDialogConfig', { visible: false })
          }
        }
      })
      .catch(error => {})
  },
  /** 电子棋牌收藏/移除收藏 */
  changeFavorite({ commit, state }: any, payload: any) {
    const { game_name, game_id, type } = payload
    const requestApi = type === 'add' ? 'addFavorite' : 'removeFavorite'
    api[requestApi]({ game_name, game_id })

      .then(({ code, data, msg }: any) => {
        if (code === 0) {
        } else {
          ElementUI.Message.error(msg)
        }
      })
      .catch((error: any) => {})
  }
}
