<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import Important from './components/important/index.vue'
import Normal from './components/normal/index.vue'
import Notice from './components/notice/index.vue'
import _ from 'lodash'

@Component({
  components: {
    Important,
    Normal,
    Notice
  }
})
export default class extends Vue {
  @State centerDialogConfig

  activeTab: string = 'important'

  @Watch('activeTab')
  onActiveTabChanged(tab: string) {
    let query = { ...this.$getURLQuery(), tab }
    this.$updateURLQuery(this.$route.path, query)
  }

  @Watch('centerDialogConfig', { deep: true })
  onCenterDialogConfigChanged({ visible, group, menu, tab }) {
    /** @note 判断个人中心弹窗是否打开，并且配置是指向当前的页面，防止不必要的执行 */
    if (visible && group == 2 && menu == 0) {
      this.checkTab(tab)
    }
  }

  created() {
    const { tab } = this.$getURLQuery() as any
    this.checkTab(tab)
  }

  /** @note 检查标签值，不为空且值属于默认的取值才赋值更新 */
  checkTab(tab) {
    if (_.includes(['important', 'normal', 'notice'], tab)) {
      this.activeTab = tab
    }
  }
}
</script>