<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import api from '@/api'
import OnlinePaymentBase from '../online-payment-base/index.vue'
import { Form } from 'element-ui'
import copy from 'copy-to-clipboard'
import QrcodeVue from 'qrcode.vue'
import { State } from 'vuex-class'

@Component({
  components: {
    QrcodeVue
  }
})
export default class OtherPay extends OnlinePaymentBase {}
</script>
