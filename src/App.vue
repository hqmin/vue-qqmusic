<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!--将DOM缓存到内存中:用于保留组件状态避免重新渲染，不加的时候在切换tab会会出现闪动的现象-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <Player></Player>
  </div>
</template>

<script>
import MHeader from '@/components/m-header/m-header';
import Tab from '@/components/tab/tab';
import Player from '@/components/player/player';
export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
