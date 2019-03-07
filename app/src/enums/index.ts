/** HTTP 状态码 */
export const HTTPStatusCode = {
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404
}

/** 错误提示信息 */
export const ErrorMessage = {
  [1000]: '参数错误',
  [1000000]: '用户名或密码错误，请重新输入 ！',
  [1000004]: '您的账号已在其它地方登陆，请确认密码并重新登陆！'
}

/** 排序类型 */
export const OrderType = {
  ascending: 'asc',
  descending: 'desc'
}

/** 全局事件名 */
export const EventType = {}

/** 游戏大类 PS: 这里固定不变，和服务端的定义保持一致 */
export const GameType = {
  EGame: 1, // 电子游艺
  Live: 2, // 真人视讯
  Sport: 3, // 体育竞猜
  ESport: 4, // 电竞竞猜
  Lottery: 5, // 彩票游戏
  Card: 6 // 棋牌对战
}

/** 游戏大类对应的路由路径 */
export const GamePath = {
  [GameType.EGame]: '/egame',
  [GameType.Live]: '/live',
  [GameType.Sport]: '/sport',
  [GameType.ESport]: '/esport',
  [GameType.Lottery]: '/lottery',
  [GameType.Card]: '/card'
}

/** 首页浮动广告位置 */
export const ADFloatPosition = {
  /** 左上  */
  LeftTop: 1,
  /** 右上  */
  RightTop: 2,
  /** 左中  */
  LeftCenter: 3,
  /** 右中  */
  RightCenter: 4,
  /** 左下  */
  LeftBottom: 5,
  /** 右下  */
  RightBottom: 6
}
