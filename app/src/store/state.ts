/**
 * rootState 根节点数据
 *
 * @author zhenda.li
 */

const state = {
  /** 本地语言 */
  locale: sessionStorage.getItem('locale') || 'zh-CN',

  /** 个人中心弹窗配置参数 */
  centerDialogConfig: {
    /** 个人中心弹窗是否显示 */
    visible: false,
    /** 分组序号 */
    group: 0,
    /** 菜单序号 */
    menu: 0,
    /** 标签栏名字（没有就不传）*/
    tab: ''
  },

  /** 公告弹窗配置参数 */
  noticeDialogConfig: {
    /** 公告弹窗是否显示 */
    visible: false,
    /** 公告数据ID */
    id: 0,
    /* 公告数据 */
    list: []
  },

  /** 登录是否显示 */
  dialogLoginVisible: false,

  /** 是否显示免费试玩 */
  isFree: 'true',

  /** 是否显示注册入口开关状态 */
  registerSwitch: true,

  /** 是否显示steam入口开关状态 */
  steamSwitch: false,

  /** 免费试玩弹框*/
  freeDialogVisible: false,
  /** 忘记密码弹框*/
  forgetDialogVisible: false,
  /** 忘记提现密码弹框*/
  withdrawDialogVisible: false,

  /** 在线客服地址 */
  codeUrl: '',

  // 网站配置
  webTitle: '',
  pageTitle: '',
  favicon: '',
  logo1: '',
  logo2: '',
  qrcode_h5: '',
  qrcode_ios: '',
  qrcode_android: '',
  qrcode: {},
  bottom: '',

  // hc game对应的游戏以及id，多处使用，所以存在这里
  hcgame: [
    { iconkey: 'lol', name: '英雄联盟', game_id: 1, img_url: require('@/components/egame-sidebar/img/logo/lol.png') },
    { iconkey: 'gok', name: '王者荣耀', game_id: 2, img_url: require('@/components/egame-sidebar/img/logo/gok.png') },
    { iconkey: 'dota2', name: 'DOTA2', game_id: 3, img_url: require('@/components/egame-sidebar/img/logo/dota2.png') },
    { iconkey: 'csgo', name: 'CS：GO', game_id: 4, img_url: require('@/components/egame-sidebar/img/logo/csgo.png') },
    { iconkey: 'pubg', name: '绝地求生', game_id: 5, img_url: require('@/components/egame-sidebar/img/logo/pubg.png') },
    { iconkey: 'overwatch', name: '守望先锋', game_id: 6, img_url: require('@/components/egame-sidebar/img/logo/overwatch.png') },
    { iconkey: 'starcraft2', name: '星际争霸2', game_id: 7, img_url: require('@/components/egame-sidebar/img/logo/starcraft2.png') },
    { iconkey: 'warcraft3', name: '魔兽争霸3', game_id: 8, img_url: require('@/components/egame-sidebar/img/logo/warcraft3.png') },
    { iconkey: 'hearthstone', name: '炉石传说', game_id: 9, img_url: require('@/components/egame-sidebar/img/logo/hearthstone_1.png') }
  ],

  // 帮助中心的数据源
  helpCenterData: null,

  /** 服务器所在时区和时间 */
  timezone: {
    name: '', // 时区名字
    utc: '', // utc时间
    value: 0, // 时间戳
    startUp: false // 是否开启计时
  },

  // 登录公告显示
  loginNoticeStatus: false,

  /** 订阅数据，页面开始渲染前的数据请求 */
  subscription: {
    timezone: false // 获取服务器时间
  }
}

export default state
