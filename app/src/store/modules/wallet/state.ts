const state = {
  totalBalance: 0, //总资产
  mainWallet: 0, //主钱包的钱数
  freezeWithdraw: 0, //提款冻结
  totalChildrenBalance: 0, //所有的子钱包钱数
  childLenCount: 0, //计算请求子钱包接口完成的个数
  childWalletArr: [], //子钱包的数组
  loadingCWallet: true, //是否请求完子钱包列表的loading
  isOneRecycle: false, //控制是否一键回收2s内不能点击
  isLoading: false, //是否完成一键回收的请求
  timer: null, //定时器
  isOkExchange: false, //额度转换是否完成并且成功
  /** 额度转换弹窗配置参数 */
  exchangeDialogConfig: {
    /** 额度转换弹窗是否显示 */
    visible: false,
    /** 子钱包的名字 */
    childName: '',
    /** 子钱包的金额  */
    childBalance: 0,
    /** 子钱包的 partner_id */
    partner_id: 0,
    /** 需要回调的方法 */
    dialogRefrash: () => {},
    /** 第三方游戏配置参数 */
    apiParams: null,
    /** 直接进入第三方游戏的方法 */
    gotoAPIMethod: () => {}
  }
}

export default state
