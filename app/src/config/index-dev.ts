const config: any = {
  baseURL: getApi(), // 'http://dev.api-user.uniform.com'
  isDebugging: true // 开发环境true,测试环境true，beta和prod不需要定义，undefined即可
}

export default config

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'dev.api-user.' + arr.slice(arr.length - 2).join('.')
}
