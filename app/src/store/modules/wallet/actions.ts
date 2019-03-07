import api from '@/api'
import ElementUI from 'element-ui'

// 注意：
// state.exchangeDialogConfig.visible：当快速额度转换弹框打开时，不走计算总资产逻辑
export default {
  /** 请求主钱包的接口 */
  requestMainWallet({ state, commit }) {
    api.wallet().then((res: any) => {
      const { code, data } = res
      if (code === 0) {
        commit('updateMainWalletObj', data)
        // 当快速额度转换弹框打开时，不走计算总资产逻辑
        !state.exchangeDialogConfig.visible && commit('updateAllBalance')
      }
    })
  },

  /** 请求子钱包列表 */
  requestChildWalletArr({ commit, dispatch }) {
    commit('updateloadingCWallet', true)
    api
      .childWallet()
      .then((res: any) => {
        let { code, data } = res
        if (code === 0) {
          // 组装子钱包数组数据
          if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
              const { partner_id } = data[i]
              data[i] = { ...data[i], isShowValue: false, balance: 0 }
            }
          }
        }
        commit('updateChildWalletArr', { arr: data || [] })
        data &&
          data.length &&
          data.map((obj: any, index: number) => {
            const { partner_id } = obj
            dispatch('requestChildWallet', { partner_id, index })
          })

        commit('updateloadingCWallet', false)
        commit('updateChildLenCount', { type: 'clear' })
      })
      .catch(err => {
        commit('updateloadingCWallet', false)
      })
  },

  /** 请求具体子钱包的情况 */
  requestChildWallet({ state, commit, dispatch }, { partner_id, index }) {
    let isUpdate: boolean = true
    // 标志如果是弹框的里面的方法，则不执行关于钱包的计算
    const isExDialog = state.exchangeDialogConfig.visible
    if (!isExDialog) {
      commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShowValue: false, balance: 0 })
      isUpdate = partner_id === state.childWalletArr[index].partner_id
    }
    api
      .getChildWallet({ partner_id })
      .then((res: any) => {
        const { code, data } = res
        let tempBalance: any = 0
        if (code === 0) {
          tempBalance = (data && Number(data.balance)) || 0
        } else {
          tempBalance = '获取失败'
        }
        if (isExDialog) {
          commit('updateExchangeDialogConfig', { ...state.exchangeDialogConfig, childBalance: tempBalance })
          return
        }
        if (isUpdate) {
          commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShowValue: true, balance: tempBalance })
          commit('updateChildLenCount', { type: 'add' })
          tempBalance !== '获取失败' && commit('updateAllBalance')
        }
      })
      .catch((error: any) => {
        if (isExDialog) {
          commit('updateExchangeDialogConfig', { ...state.exchangeDialogConfig, childBalance: '获取失败' })
          return
        }
        if (isUpdate) {
          commit('updateChildWalletArr', { arr: state.childWalletArr, index, isShowValue: true, balance: '获取失败' })
          commit('updateChildLenCount', { type: 'add' })
        }
      })
  },

  /** 全部刷新 */
  allRefresh({ commit, dispatch }) {
    // 清空总资产，所有子钱包的总钱数
    commit('initBalance')

    // 请求主钱包和各个子钱包的钱数
    dispatch('requestMainWallet')
    dispatch('requestChildWalletArr')
  },

  /** 刷新单个钱包 */
  reflreshChildWallet({ state, commit, dispatch }, index) {
    commit('updateChildLenCount', { type: 'reduce' })
    const { partner_id } = state.childWalletArr[index]
    // 刷新主钱包
    dispatch('requestMainWallet')
    // 刷新该子钱包
    dispatch('requestChildWallet', { partner_id, index })
  },

  /** 2s后再请求的逻辑 */
  setSecondAble({ commit }) {
    let c = 0
    commit('updateIsOneRecycle', true)
    commit('updateTimer', { type: 'clear' })
    const timer = setInterval(() => {
      c++
      if (c === 2) {
        commit('updateIsOneRecycle', false)
        commit('updateTimer', { timer, type: 'clear' })
      }
    }, 1000)
    commit('updateTimer', { timer, type: 'create' })
  },

  /** 一键回收 */
  oneRecycle({ state, commit, dispatch }) {
    dispatch('setSecondAble')
    commit('updateIsLoading', true)
    api
      .walletRecovery()
      .then((res: any) => {
        const { code, msg } = res
        if (code === 0) {
          ElementUI.Message.success('全部回收成功')
          // 分快速额度转换弹框的情况
          // 1，是快速额度转换的一键回收的话，就先请求对应的子钱包的金额，通过改变快速额度转换的弹框对象，来发主钱包的请求（已写到了快速额度转换的组建里面了）
          // 2，是个人中心的话，就走刷新页面的逻辑
          if (state.exchangeDialogConfig.visible) {
            dispatch('requestChildWallet', { partner_id: state.exchangeDialogConfig.partner_id })
          } else {
            dispatch('allRefresh')
          }
        } else {
          ElementUI.Message.error(msg)
        }
        commit('updateIsLoading', false)
      })
      .catch((error: any) => {
        commit('updateIsLoading', false)
        ElementUI.Message.error('全部回收失败，请稍后重试')
      })
  },

  /** 额度转换 */
  moneyConversion({ state, commit, dispatch }, { param, index }) {
    dispatch('setSecondAble')

    commit('updateIsLoading', true)
    commit('updateIsOkExchange', false)
    api
      .userExchange(param)
      .then((res: any) => {
        const { msg, code } = res
        if (code === 0) {
          ElementUI.Message.success(`${param.type === 1 ? '子钱包' : '主钱包'}转入成功`)
          // 刷新子钱包
          // 分快速额度转换弹框的情况
          // 1，是快速额度转换的一键回收的话，就先请求对应的子钱包的金额，通过改变快速额度转换的弹框对象，来发主钱包的请求（已写到了快速额度转换的组建里面了）
          // 2，是个人中心的额度转换页的话，就走刷新子钱包和主钱包的逻辑
          if (state.exchangeDialogConfig.visible) {
            // 直接请求子钱包的金额
            dispatch('requestChildWallet', { partner_id: state.exchangeDialogConfig.partner_id })
          } else {
            // 刷新子钱包和主钱包的
            dispatch('reflreshChildWallet', index)
          }
          commit('updateIsOkExchange', true)
        } else {
          ElementUI.Message.error(msg)
        }
        commit('updateIsLoading', false)
      })
      .catch((error: any) => {
        commit('updateIsLoading', false)
        ElementUI.Message.error('额度转换失败，请稍后重试')
      })
  }
}
