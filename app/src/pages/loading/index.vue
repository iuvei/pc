<style lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class LoadingPage extends Vue {
  created() {
    const loading = this.$loading({
      lock: true,
      text: '加载中，请稍后',
      spinner: 'el-icon-loading',
      customClass: 'loading-custom'
    })
  }
}
</script>
