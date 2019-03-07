<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import api from '@/api'

@Component
export default class Money extends Vue {
  list = []
  listTop: number = 0
  listTimer?: number
  listPause: boolean = false

  mounted() {
    this.requestWinners()

    this.listTimer = setInterval(() => {
      if (this.listPause) return
      if (this.listTop === -249) {
        this.listTop = -25
      } else {
        this.listTop -= 1
      }
    }, 60)
  }

  beforeDestroy() {
    if (this.listTimer) clearInterval(this.listTimer)
  }

  requestWinners() {
    api
      .homeWinners()
      .then((response: any) => {
        if (response.code === 0) {
          let list: any = []
          response.data.forEach(v => {
            list.push({
              user: v.username,
              game: v.name,
              money: v.prize
            })
          })
          this.list = list
        } else {
        }
      })
      .catch(error => {})
  }

  onListEnter() {
    this.listPause = true
  }

  onListLeave() {
    this.listPause = false
  }

  onRegisterClick() {
    this.$router.push('/register')
  }

  onActivityClick() {
    this.$router.push('/activity')
  }
}
</script>
