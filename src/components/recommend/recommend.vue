<template>
  <div class="recommend" ref="recommend">
    <!-- 这里传discList的原因是recommends优先于其请求，所以当discList变化的时候轮播图已经有高度了，这样滚动效果才会正常-->
    <!-- TODO 但是实际情况是无法知道这两块的数据获取的先后顺序 -->
    <scroll class="recommend-content" ref="scroll" :data="discList">
      <!-- 因为better-scroll是父子级关系，
      如果需要轮播图和歌单列表都能滚动，
      就必须在这两块外层DOM嵌套一层DIV，将两块包裹起来 -->
      <div>
        <div class="slider-wrapper" v-if="recommends.length">
          <div class="slider-content">
            <slider>
              <div v-for="item in recommends" :key="item.id">
                <a :href="item.linkUrl">
                  <!-- TODO 轮播图的高度完全是由图片高度撑开的 -->
                  <img class="needsclick" @load="loadImage" :src="item.picUrl"/>
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item, index) in discList" class="item" :key="index">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Loading from '@/base/loading/loading'
  import Scroll from '@/base/scroll/scroll.vue';
  import {getRecommend, getDiscList} from '@/api/recommend';
  import {ERR_OK} from "@/api/config";
  import Slider from '@/base/slider/slider.vue';

  export default {
    name: 'recommend',
    created() {
      this._getRecommend();
      this._getDiscList();
    },
    data() {
      return {
        recommends: [], // 轮播图列表数据
        discList: [], // 歌单列表数据
      };
    },
    methods: {
      // 获取轮播图数据
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider;
          }
        })
      },
      // 获取歌单列表数据
      _getDiscList() {
        getDiscList().then(res => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list;
          }
        })
      },
      // 调用scroll的refresh
      loadImage() {
        // TODO 主要是为了解决轮播图出现后于列表渲染的情况
        // 一旦有一张图片加载，高度就会撑开，所以用个判断做限制,一次refresh就行，避免过多计算
        if (!this.checkLoaded) {
          this.$refs.scroll.refresh();
          this.checkLoaded = true;
        }
      }
    },
    components: {
      Slider,
      Scroll,
      Loading
    },
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        /*height: 0*/
        padding-top: 40%
        overflow: hidden
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
