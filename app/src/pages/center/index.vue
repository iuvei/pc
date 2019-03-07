<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import _ from 'lodash'
import WidthdrawDialog from '@/components/withdraw-dialog/index.vue'

@Component({
  components: {
    WidthdrawDialog
  }
})
export default class Center extends Vue {
  @State centerDialogConfig
  @Mutation updateCenterDialogConfig

  groups = [
    {
      title: '会员信息',
      menus: [
        {
          name: 'account',
          title: '我的账户',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/account/index.vue')
        },
        {
          name: 'exchange',
          title: '额度转换',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/exchange/index.vue')
        },
        {
          name: 'deposit',
          title: '充值提现',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/deposit/index.vue')
        },
        {
          name: 'discount',
          title: '我的优惠',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/discount/index.vue')
        }
      ]
    },
    {
      title: '记录查询',
      menus: [
        {
          name: 'transaction',
          title: '账变记录',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/transaction/index.vue')
        },
        {
          name: 'bet',
          title: '投注记录',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/bet/index.vue')
        },
        {
          name: 'statement',
          title: '有效投注',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/statement/index.vue')
        }
      ]
    },
    {
      title: '其它信息',
      menus: [
        {
          name: 'message',
          title: '个人消息',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/message/index.vue')
        },
        {
          name: 'security',
          title: '安全中心',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/security/index.vue')
        },
        {
          name: 'agent',
          title: '代理中心',
          icon: 'el-icon-document',
          component: () => import('@/pages/center/components/agent/index.vue')
        }
      ]
    }
  ]

  activeMenu: any = null

  @Watch('centerDialogConfig', { deep: true })
  onCenterDialogConfigChanged({ visible, group, menu, tab }) {
    let query: any = { ...this.$getURLQuery() }
    if (visible) {
      this.activeMenu = this.groups[group].menus[menu]
      query = { ...query, center: 'true', group, menu, tab }
      if (document.body.className.indexOf('dialog-css') === -1) {
        document.body.className += ' dialog-css'
      }
    } else {
      delete query.center
      delete query.group
      delete query.menu
      delete query.tab
      const timer = setTimeout(() => {
        document.body.setAttribute('class', '')
        clearTimeout(timer)
      }, 200)
    }
    this.$updateURLQuery(this.$route.path, query)
  }

  created() {
    // 先初始化数据
    this.activeMenu = this.groups[0].menus[0]

    // 读取浏览器地址栏参数，判断个人中心是否应该显示和需要显示的菜单和子页面
    const { center, group, menu, tab } = this.$route.query
    let visible = center === 'true'
    if (visible) {
      this.updateCenterDialogConfig({ visible, group, menu, tab })
    }
  }

  onMenuSelect(name) {
    let group = _.findIndex(this.groups, { menus: [{ name }] })
    let groups = this.groups[group] as any
    let menu = _.findIndex(groups.menus, { name })
    this.updateCenterDialogConfig({ group, menu, tab: '' })
  }

  onClose() {
    this.updateCenterDialogConfig({ visible: false })
  }
}
</script>
