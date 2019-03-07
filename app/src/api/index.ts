/**
 * 项目全部 API 接口定义，每个接口需要描述清楚作用，方便查找
 *
 * @author : zhenda.li
 */

import http from '@/utils/http'

export default {
  /** 获取站点基础信息 */
  getHelpCollaborate() {
    return http.get('/help/collaborate')
  },
  /* 获取注册入口开关与steam入口开关状态 */
  getRegisterSetting() {
    return http.get('/home/register/setting')
  },
  /**
   * 登录
   * @param params 请求参数
   */
  login(params: any) {
    return http.post('/user/login', params)
  },
  /**
   * 验证码登录
   * @param params 请求参数
   */
  loginByCode(params: any) {
    return http.post('/user/loginbycode', params)
  },

  /**
   * 登出
   */
  logout() {
    return http.post('/user/logout')
  },

  /**
   * 获取注册左侧的-热门游戏字段信息
   */
  getTagHot() {
    return http.get('/home/tag/hot')
  },

  /**
   * 获取注册字段信息
   */
  getRegister() {
    return http.get('/user/register')
  },
  /**
   * 注册
   * @param params 请求参数
   */
  register(params: any) {
    return http.post('/user/register', params)
  },
  /**
   * 获取图片验证码
   */
  vcode() {
    return http.get('/user/vcode')
  },

  /**
   * 修改密码
   * @param params 请求参数
   */
  changePassword(params: any) {
    return http.put('/account/password', params)
  },

  /** [首页] 获取服务器时间 */
  homeTime() {
    return http.get('/home/time')
  },

  /** [首页] 获取滚动公告 */
  homeRollNotice() {
    return http.get('/home/notice/pcRollNotice')
  },

  /** [首页] 获取首页弹出公告和滚动公告合集 */
  homeNoticeList() {
    return http.get('/home/notice/pcNotice')
  },

  /** [首页] 获得服务器所在时区和时间 */
  getTimezone() {
    return http.get('/timezone')
  },

  /** [首页] 获取菜单配置 */
  homeMenu() {
    return http.get('/home/menu')
  },

  /** [首页] 获取轮播图 */
  homeBanner(params: any) {
    return http.get('/home/banner', params)
  },

  /** [首页] 获取中奖用户列表 */
  homeWinners() {
    return http.get('/home/winners')
  },

  /** [首页] 获取视讯列表 */
  homeLive() {
    return http.get('/home/live')
  },

  /** [首页] 获取大类列表 */
  homeType() {
    return http.get('/home/type')
  },

  /** [首页] 获取客户端下载二维码 */
  homeAPPQRCode() {
    return http.get('/home/qrcode')
  },

  /** [首页] 获取热门游戏列表 */
  homeHotGames() {
    return http.get('/home/hotgames')
  },

  /** [首页] 获取对应电子API的奖池 */
  homeJackpot(params?: any) {
    return http.get('/home/jackpot', params)
  },

  /** [首页] 获取浮动广告：左上角、左中、右上 */
  homeFloat() {
    return http.get('/home/float')
  },

  /** [首页] 获取活动API轮播广告：左下、右下 */
  homeActivityAPI() {
    return http.get('/home/activeApi')
  },

  /** [真人视讯] 获取开启的真人视讯 API 相关数据 */
  live(params: any) {
    return http.get('/home/partner', params)
  },

  /** 各大类游戏页的 API 列表 */
  gameAPIs(params: any) {
    return http.get('/home/partner', params)
  },

  /** 各大类游戏页的广告轮播图 */
  gameBanners(params: any) {
    return http.get('/game/third/active', params)
  },

  /** [API] 第三方游戏登录 */
  gameThirdLogin(params: any) {
    return http.post('/game/third/login', params)
  },

  /**
   * 获取消息列表
   * @param params 请求参数
   */
  messages(params: any) {
    return http.get('/message/list', params)
  },

  /** 会员中心-我的账户-钱包接口 */
  wallet() {
    return http.get('/account/wallet')
  },

  /**
   * 获取子钱包列表的接口
   * @param params 请求参数
   */
  childWallet() {
    return http.get('/account/partners')
  },

  /**
   * 获取子钱包信息的接口
   * @param params 请求参数
   */
  getChildWallet(params: any) {
    return http.get('/account/wallet/child', params)
  },

  /**
   * 额度转换页 - 转换的接口
   * @param params 请求参数
   */
  userExchange(params: any) {
    return http.post('/bank/user/exchange', params)
  },

  /** 充值 - 获取充值信息 */
  getBankWalletRecharge() {
    return http.get('/bank/wallet/recharge')
  },
  /** 充值 - 提交 */
  putBankWalletRecharge(params: any) {
    return http.put('/bank/wallet/recharge', params)
  },
  /** 计算充值可得优惠 */
  getBankWalletCoupon(params: any) {
    return http.get('/bank/wallet/coupon', params)
  },
  /** 充值 - 查询线上充值状态 */
  getBankWalletPayStatus(params: any) {
    return http.get('/bank/wallet/payStatus', params)
  },
  /** 充值 - 公司转账 - 获取入款随机数 */
  getBankWalletOfflineMoney(params: any) {
    return http.get('/bank/wallet/offlineMoney', params)
  },
  /**
   * 我的账号 - 子钱包全部回收的
   *@param params 请求参数
   */
  walletRecovery() {
    return http.post('/account/wallet/recovery')
  },
  /**
   * 我的账号 - 有效投注
   *@param params 请求参数
   */
  userAccount() {
    return http.get('/user/account')
  },
  /**
   * 获取个人资料的接口
   * @param params 请求参数
   */
  userBaseinfo() {
    return http.get('/profile/info')
  },

  /**
   * 修改个人资料的接口
   * @param params 请求参数
   */
  userInfoEdit(params: any) {
    return http.post('/profile/info', params)
  },

  /** 银行管理 - 获取数据 */
  getProfileBanklist() {
    return http.get('/profile/banklist')
  },
  /** 银行管理 - 解除绑定 */
  deleteProfileBank(params: any) {
    return http.delete('/profile/bank', params)
  },
  /** 银行管理 - 查询可添加的银行列表 */
  getProfileBanks() {
    return http.get('/profile/banks')
  },
  /** 银行管理 - 添加银行卡信息 */
  postProfileBank(params: any) {
    return http.post('/profile/bank', params)
  },
  /**
   * 获取安全中心
   */
  userSafety() {
    return http.get('/safe/info')
  },

  /**
   * 安全中心页 - 设置实名认证
   * @param params 请求参数
   */
  userIdcard(params: any) {
    return http.post('/safe/user/idcard', params)
  },

  /**
   * 安全中心页 - 获取实名认证
   */
  getUserRealname() {
    return http.get('/safe/user/realname')
  },

  /**
   * 安全中心页 - 获取实名认证
   */
  getUserIdcard() {
    return http.get('/safe/user/idcard')
  },

  /**
   * 安全中心页 - 验证登录密码
   * @param params 请求参数
   */
  userPassword(params: any) {
    return http.post('/safe/user/password/valid', params)
  },

  /**
   * 安全中心页 - 校验邮箱
   * @param params 请求参数
   */
  userVerificationEmail(params: any) {
    return http.patch('/safe/user/email/valid', params)
  },

  /**
   * 安全中心页 - 校验手机
   * @param params 请求参数
   */
  userVerificationMobile(params: any) {
    return http.patch('/safe/user/mobile/valid', params)
  },

  /**
   * 安全中心页 - 获取手机
   * @param params 请求参数
   */
  getMobile() {
    return http.get('/safe/user/mobile')
  },

  /**
   * 安全中心页 - 获取手机验证码
   * @param params 请求参数
   */
  getVcodeMobile(params: any) {
    return http.post('/safe/user/mobile', params)
  },

  /**
   * 安全中心页 - 设置手机
   * @param params 请求参数
   */
  setUserMobile(params: any) {
    return http.put('/safe/user/mobile', params)
  },

  /**
   * 安全中心页 - 修改手机号码
   * @param params 请求参数
   */
  ediltUserMobile(params: any) {
    return http.patch('/safe/user/mobile', params)
  },

  /**
   * 安全中心页 - 获取邮箱验证码
   * @param params 请求参数
   */
  getVcodeEmail(params: any) {
    return http.post('/safe/user/email', params)
  },

  /**
   * 安全中心页 - 获取邮箱
   * @param params 请求参数
   */
  getEmail() {
    return http.get('/safe/user/email')
  },

  /**
   * 安全中心页 - 设置邮箱
   * @param params 请求参数
   */
  setUserEmail(params: any) {
    return http.put('/safe/user/email', params)
  },

  /**
   * 安全中心页 - 修改邮箱
   * @param params 请求参数
   */
  ediltUserEmail(params: any) {
    return http.patch('/safe/user/email', params)
  },

  /**
   * 安全中心页 - 修改登录密码
   * @param params 请求参数
   */
  setUserPassword(params: any) {
    return http.patch('/safe/user/password', params)
  },

  /**
   * 忘记密码页 - 设置新的登录密码
   * @param params 请求参数
   */
  userResetpwd(params: any) {
    return http.patch('/user/resetpwd', params)
  },

  /**
   * 安全中心页 - 设置提现密码
   * @param params 请求参数
   */
  setUserWithdrawpwd(params: any) {
    return http.put('/safe/user/withdrawpwd', params)
  },

  /**
   * 安全中心页 - 修改提现密码
   * @param params 请求参数
   */
  editUserWithdrawpwd(params: any) {
    return http.patch('/safe/user/withdrawpwd', params)
  },

  /**
   * 安全中心页 - 获取steam跳转地址
   * @param params 请求参数
   */
  apiVcodeGetSteamAuthLink(params: any) {
    return http.get('/api/vcode/getSteamAuthLink', params)
  },

  /**
   * 安全中心页 - 从steam第三方网址登陆后返回到我们的网站，获取steam账号绑定的是哪个用户信息
   * @param params 请求参数
   */
  apiVcodeGtSteamInfo(params: any) {
    return http.get('/api/vcode/getSteamInfo', params)
  },

  /**
   * 安全中心页 - 判断是否绑定了steam账号
   * @param params 请求参数
   */
  apiVcodeBindSteam(params: any) {
    return http.post('/api/vcode/bindSteam', params)
  },

  /**
   * 忘记密码页 - 设置新的登录密码
   * @param params 请求参数
   */
  getUserResetpwd(params: any) {
    return http.get('/user/resetpwd', params)
  },

  /**
   * 手机投注页 - 获取h5地址和安卓和ios的下载地址
   * @param params 请求参数
   */
  homeDownLoad() {
    return http.get('/home/download')
  },

  /** 试玩页面 - 获取试玩账号接口 */
  getTrialUsername() {
    return http.get('/demo/getuser')
  },

  /** 试玩页面 - 立即试玩接口 */
  postTrial(params: any) {
    return http.post('/demo/register', params)
  },

  /** 试玩页面 - 是否显示免费试玩按钮 */
  homeDemo() {
    return http.get('/home/demo')
  },

  /*
   * 会员消息 - 未读的会员消息条数
   */
  homeMessageRead() {
    return http.get('/home/message/read')
  },

  /**
   * 获取第三方客服
   * @param params 请求参数
   */
  service3th() {
    return http.get('/help/service/3th')
  },
  /**
   * 获取投注记录的分类
   */
  getUserOrderMenu() {
    return http.get('/order/menu')
  },
  /**
   * 获取第三方投注记录
   */
  getUserRecordGames(params: any) {
    return http.get('/order/record/games', params)
  },
  /** 有效投注列表 - 查询 */
  getEffectiveBetting(params: any) {
    return http.get('/order/getEffectiveBetting', params)
  },

  /** 我的优惠-列表数据 */
  getApiUserGetMyCoupon(params: any) {
    return http.get('/account/coupon', params)
  },

  /** 账变记录 - 列表数据 */
  getRecordFromsearch(params: any) {
    return http.get('/order/record/fromsearch', params)
  },

  /** 账变记录 - 获取分类 */
  getRecordFrom() {
    return http.get('/order/record/menu')
  },

  /**个人中心 - 存提记录 - 表格 */
  getRecordMoney(params: any) {
    return http.get('/bank/records/money', params)
  },

  /*
   * 获取-提现预申请数据
   */
  getBankWalletWithdraw() {
    return http.get('/bank/wallet/withdraw')
  },
  /*
   * 预申请
   */
  getPreApplication(params: any) {
    return http.post('/bank/wallet/withdrawinfo', params)
  },
  /*
   * 线上提款确认
   */
  confirmWithdrawal(params: any) {
    return http.put('/bank/wallet/withdraw', params)
  },

  /**
   * 获取消息
   */
  getGeneralMsg(params: any) {
    return http.get('/msg/message/list', params)
  },

  /**
   * 修改消息状态
   */
  changeMsgStatus(params: any) {
    return http.put('/msg/message/status', params)
  },

  /**
   * 删除消息
   */
  deleteMsgStatus(params: any) {
    return http.delete('/msg/message', params)
  },
  /**
   * 公告
   */
  noticeList(params: any) {
    return http.get('/home/notice/list', params)
  },
  /** 【个人中心-代理中心】-- 检查用户是否绑定代理 */
  // status 账户状态(0禁用 1启用 2待审核 3已拒绝);
  // 推广链接referralUrl(只有status=1时才会有referralUrl)
  agentBindingCheck() {
    return http.get('/user/agent/check')
  },
  /** 【个人中心-代理中心】-- 绑定用户 */
  agentBinding(params) {
    return http.post('/user/agent/binding', params)
  },
  /** 【个人中心-代理中心】-- 获取代理登录token */
  getAgentToken() {
    return http.get('/user/agent/token')
  },
  /** 【个人中心-代理中心】-- 解绑代理 */
  unbindAgent() {
    return http.delete('/user/agent/unbinding')
  },
  /**
   * 优惠活动类型
   */
  activeTypes() {
    return http.get('/active/types')
  },
  /**
   * 优惠活动列表
   */
  activeList(params: any) {
    return http.get('/active/list', params)
  },
  /**
   * 优惠活动详情
   */
  activeDetail(params: any) {
    return http.get('/active/detail', params)
  },
  /**
   * 优惠活动申请
   */
  activeApply(params: any) {
    return http.post('/active/list', params)
  },
  /**
   * 获取第三方api列表
   *
   */
  getPartner(params: any) {
    return http.get('/home/partner', params)
  },
  /**
   * 获取电子游艺-导航
   *
   */
  egameTags(params: any) {
    return http.get('/game/tags', params)
  },
  /**
   * 获取api广告
   *
   */
  apiActive(params: any) {
    return http.get('/game/third/active', params)
  },
  /**
   * 获取推荐游戏
   *
   */
  recommendList(params: any) {
    return http.get('/egame/recommend', params)
  },
  /**
   * 获取游戏列表
   */
  gameList(params: any) {
    return http.get('/game/tag/games', params)
  },
  /**
   * 获取我的收藏
   */
  getFavorites(params: any) {
    return http.get('/game/favorites', params)
  },
  /**
   * 电子api首页-侧边栏
   */
  egameSidebar() {
    return http.get('/home/sidebar')
  },

  /**
   * 获取帮助中心数据
   */
  getHelpCenter() {
    return http.get('/help/bottom')
  },
  /**
   * 查看厅状态
   */
  getCommonStatus() {
    return http.get('/common/status')
  },
  /**
   * 添加收藏
   */
  addFavorite(params: any) {
    return http.put('/egame/addfavorite', params)
  },
  /**
   * 移除收藏
   */
  removeFavorite(params: any) {
    return http.put('/egame/removefavorite', params)
  }
}
