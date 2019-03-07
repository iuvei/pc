import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import state from '@/store/modules/user/state'

Vue.use(Router)

const router = new Router({
  mode: 'history',

  /** 跳转新页面时滚到顶部 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  },

  routes: [
    {
      path: '/',
      component: () => import('@/pages/home/index.vue'),
      children: [
        {
          path: '',
          component: () => import('@/pages/home/pages/index/index.vue'),
          meta: {
            title: '首页'
          }
        },
        {
          path: 'esport',
          component: () => import('@/pages/home/pages/esport/index.vue'),
          meta: {
            title: '电竞竞猜'
          },
          props: route => ({
            partner_name: route.query.partner_name,
            game_code: route.query.game_code
          })
        },
        {
          path: 'live',
          component: () => import('@/pages/home/pages/live/index.vue'),
          meta: {
            title: '真人视讯'
          }
        },
        {
          path: 'sport',
          component: () => import('@/pages/home/pages/sport/index.vue'),
          meta: {
            title: '体育竞技'
          }
        },
        {
          path: 'lottery',
          component: () => import('@/pages/home/pages/lottery/index.vue'),
          meta: {
            title: '彩票游戏'
          }
        },
        {
          path: 'mobile-betting',
          component: () => import('@/pages/home/pages/mobile-betting/index.vue'),
          meta: {
            title: '手机投注'
          }
        },
        {
          path: 'activity',
          component: () => import('@/pages/home/pages/activity/index.vue'),
          meta: {
            title: '优惠活动'
          }
        },
        {
          path: 'active-detail',
          component: () => import('@/pages/home/pages/activity/components/active-detail/index.vue'),
          meta: {
            title: '优惠活动详情'
          }
        },
        {
          path: 'register',
          component: () => import('@/pages/register/index.vue'),
          meta: {
            title: '注册'
          }
        },
        {
          path: 'egame',
          component: () => import('@/pages/home/pages/egame/index.vue'),
          meta: {
            title: '电子游艺'
          }
        },
        {
          path: 'card',
          component: () => import('@/pages/home/pages/card/index.vue'),
          meta: {
            title: '棋牌对战'
          }
        },
        {
          path: 'help-center',
          component: () => import('@/pages/home/pages/help-center/index.vue'),
          meta: {
            title: '帮助中心'
          }
        }
      ]
    },
    {
      path: '/game/:type/:name',
      component: () => import('@/pages/home/pages/game-common/index.vue'),
      meta: {
        title: ''
      }
    },
    {
      path: '/recommends',
      component: () => import('@/pages/home/pages/recommends/index.vue'),
      meta: {
        title: '推荐游戏'
      }
    },
    {
      path: '/maintain',
      component: () => import('@/pages/maintain/index.vue'),
      meta: {
        title: '维护页面'
      }
    },
    {
      path: '/loading',
      component: () => import('@/pages/loading/index.vue')
    },
    {
      path: '*',
      component: () => import('@/pages/404/index.vue'),
      meta: {
        title: '404'
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 路由发生变化修改页面标题
  if (to.meta.title) {
    document.title = '皇朝国际 - ' + to.meta.title
  }

  next()

  // 拦截未登录 token 值为空的访客跳转到登录页
  // if (to.path !== '/login') {
  //   if (state.token.length === 0) {
  //     next({ path: '/login' })
  //   } else {
  //     next()
  //   }
  // } else {
  //   next()
  // }
})

export default router
