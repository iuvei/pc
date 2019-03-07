<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import BaseInfo from './components/base-info/index.vue'
import EditInfo from './components/edit-info/index.vue'
import BankManage from './components/bank-manage/index.vue'
import _ from 'lodash'

@Component({
  components: {
    BaseInfo,
    EditInfo,
    BankManage
  }
})
export default class Account extends Vue {
  @State centerDialogConfig

  activeTab: string = 'baseInfo'

  @Watch('activeTab')
  onActiveTabChanged(tab: string) {
    let query = { ...this.$getURLQuery(), tab }
    this.$updateURLQuery(this.$route.path, query)
  }

  @Watch('centerDialogConfig', { deep: true })
  onCenterDialogConfigChanged({ visible, group, menu, tab }) {
    this.$log('Account onCenterDialogConfigChanged')
    /** @note 判断个人中心弹窗是否打开，并且配置是指向当前的页面，防止不必要的执行 */
    if (visible && group == 0 && menu == 0) {
      this.checkTab(tab)
    }
  }

  created() {
    const { tab } = this.$getURLQuery() as any
    this.checkTab(tab)
  }

  /** @note 检查标签值，不为空且值属于默认的取值才赋值更新 */
  checkTab(tab) {
    if (_.includes(['baseInfo', 'editInfo', 'bankManage'], tab)) {
      this.activeTab = tab
    }
  }
}
</script>
