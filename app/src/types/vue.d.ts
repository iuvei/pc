declare module 'vue/types/vue' {
  interface Vue {
    $log(message?: any, ...optionalParams: any[]): void
    $getURLQuery(): object | null
    $updateURLQuery(path: string, query: any): void
    $event: Vue
    $generateAgentAdminUrl: () => string
  }
}

export {}
