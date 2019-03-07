<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import api from '@/api'
import { State } from 'vuex-class'

@Component
export default class HelpCenter extends Vue {
  @State helpCenterData

  selectIndex: number = -1

  labelName: any = {
    关于我们: {
      english: 'ABOUT US',
      img: 'us.svg',
      selectImg: 'us_active.svg'
    },
    责任博彩: {
      english: 'RESPONSIBLE',
      img: 'responsible.svg',
      selectImg: 'responsible_active.svg'
    },
    免责说明: {
      english: 'DISCLAIMER',
      img: 'disclaimer.svg',
      selectImg: 'disclaimer_active.svg'
    },
    规则条款: {
      english: 'RULES',
      img: 'rules.svg',
      selectImg: 'rules_active.svg'
    },
    常见问题: {
      english: 'PROBLEMS',
      img: 'problems.svg',
      selectImg: 'problems_active.svg'
    },
    存款帮助: {
      english: 'PROBLEMS',
      img: 'save.svg',
      selectImg: 'save_active.svg'
    },
    转账帮助: {
      english: 'PROBLEMS',
      img: 'exchange.svg',
      selectImg: 'exchange_active.svg'
    },
    取款文案: {
      english: 'PROBLEMS',
      img: 'take.svg',
      selectImg: 'take_active.svg'
    },
    取款帮助: {
      english: 'PROBLEMS',
      img: 'take.svg',
      selectImg: 'take_active.svg'
    },
    联系我们: {
      english: 'CONTACT',
      img: 'contact.svg',
      selectImg: 'contact_active.svg'
    },
    服务条款: {
      english: 'SERVICE',
      img: 'service.svg',
      selectImg: 'service_active.svg'
    }
  }

  @Watch('helpCenterData', { deep: true, immediate: true })
  onhelpCenterDataChanged(val) {
    if (val) {
      this.selectIndex = Number(this.$route.query.index) || 0
    }
  }

  get content() {
    if (this.helpCenterData) {
      return this.helpCenterData[this.selectIndex].content
    }
  }
}
</script>
