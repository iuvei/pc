import 'babel-polyfill'
import 'isomorphic-fetch'

import Vue from 'vue'
import ElementUI from 'element-ui'
import app from '@/app.vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/i18n'
import '@/utils/helper'
import '@/styles'

import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'

Vue.use(VueAwesomeSwiper)

Vue.use(ElementUI, { i18n: (key: string, values?: any[]) => i18n.t(key, values) })

new Vue({
  router,
  store,
  i18n,
  render: h => h(app)
}).$mount('#app')
