<template lang="pug">
  #app
    router-view(v-if="isRouterAlive")
    div(v-if="isRouterAlive")
      free-dialog
      login-dialog
      forget-dialog
      exchange-dialog
</template>

<script lang="ts">
import { Vue, Component, Provide } from 'vue-property-decorator'
import FreeDialog from '@/components/free-dialog/index.vue'
import LoginDialog from '@/components/login-dialog/index.vue'
import ForgetDialog from '@/components/forget-dialog/index.vue'
import ExchangeDialog from '@/components/exchange-dialog/index.vue'

@Component({
  components: {
    LoginDialog,
    ExchangeDialog,
    FreeDialog,
    ForgetDialog
  }
})
export default class App extends Vue {
  isRouterAlive: boolean = true

  @Provide('reload')
  reload() {
    this.isRouterAlive = false
    this.$nextTick(() => (this.isRouterAlive = true))
  }
}
</script>
