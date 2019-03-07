const userItem = localStorage.getItem('user') || sessionStorage.getItem('user') || ''
let user: any = {}
if (userItem.length) {
  user = JSON.parse(userItem)
}
const state = {
  token: (user && user.token) || '', // 用户 token
  userType: (user && user.userType) || '', //如果为“1”是试玩账号
  messageNum: sessionStorage.getItem('message') || 0, //会员消息的条数
  username: (user && user.username) || '' //账号的名字
}

export default state
