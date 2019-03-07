<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import OnlinePaymentBase from '../online-payment-base/index.vue'
import api from '@/api'
import QrcodeVue from 'qrcode.vue'

@Component({
  components: {
    QrcodeVue
  }
})
export default class OnlinePayment extends OnlinePaymentBase {
  formAdd = {
    scene_id: null,
    ...this.formAdd
  }
  rules = {
    scene: [{ required: true, message: '请选择支付渠道' }],
    ...this.rules
  }

  sceneItem: any = {}

  created() {
    this.updateSceneId()
  }

  /** 切换支付方式 */
  onPaymentChange(val: string) {
    this.listIndex = this.data.list.findIndex(item => item.scene === val)
    this.updateSceneId()
  }

  updateSceneId() {
    this.sceneItem = this.data.list[this.dataListIndex].scene_list[0]
    this.updateFormSceneId(this.sceneItem.id)
  }

  /** 切换支付付渠道 */
  onChannelChange(val: number) {
    this.sceneItem = this.data.list[this.dataListIndex].scene_list.find(sceneItem => sceneItem.id === val)
    this.updateFormSceneId(this.sceneItem.id)
  }

  /** 更新form表单中的scene_id */
  updateFormSceneId(id: number) {
    this.formAdd.scene_id = id
  }

  // override
  /** 金额验证 */
  validatorMoney(rule, value, callback) {
    const tempMoney = Number(value)
    const { once_max_limit, once_min_limit } = this.sceneItem
    if (/^([1-9]\d*|0)(\.\d{1,2})?$/.test(value)) {
      if (tempMoney > once_max_limit || tempMoney < once_min_limit) {
        callback(new Error(`请输入大于${once_min_limit}元，小于${once_max_limit}元`))
      } else {
        callback()
      }
    } else {
      callback(new Error('请输入整数或者两位小数的充值金额'))
    }
  }

  // override
  /** 生成提交参数 */
  generateParams(): Record<string, any> {
    const { money, active_id, scene, type, scene_id } = this.formAdd
    return { money, active_id, scene, type, id: scene_id }
  }
}
</script>