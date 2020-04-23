<template>
  <scroll class="listview"
          :data="data"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
          ref="listview">
    <ul>
      <li class="list-group" v-for="(group, index) in data"
          :key="index" ref="listGroup">
        <h2 class="list-group-title">
          {{group.title}}
        </h2>
        <ul>
          <li class="list-group-item"
              v-for="(item, index) in group.items"
              :key="index"
              @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--移动端touchstart触摸事件：触摸开始，多点触控，后面的手指同样会触发,这里是当手指触摸右侧列表时触发触摸事件-->
    <!--touchmove:接触点改变，滑动时-->
    <div class="list-shortcut"
         @touchstart="onShortcutTouchStart"
        @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="item" v-for="(item, index) in shortcutList"
            :key="index" :data-index="index"
            :class="{'current': currentIndex === index}">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
    import Scroll from '@/base/scroll/scroll';
    import {getData} from '@/common/js/dom';
    import Loading from '@/base/loading/loading';
    // TODO 难点在于左右联动：要先达到实时滚动位置，根据滚动位置计算左侧落在哪个列表区间，这样就知道右侧对应的区间索引是哪个
    const ANCHOR_HEIGHT = 18;
    const TITLE_HEIGHT = 30;
    export default {
        name: 'listview',
        components: {
          Scroll,
          Loading
        },
        props: {
          data: {
            type: Array,
            default: () => []
          }
        },
        data() {
          return {
            scrollY: -1, // 用于观测实时滚动的位置
            currentIndex: 0, // 当前应该显示的列表
            diff: -1,
          };
        },
        computed: {
            // 获取右侧快速列表的数组
            shortcutList() {
              return this.data.map((group) => {
                return group.title.substr(0, 1);
              })
            },
            fixedTitle() {
              // scrollY小于0代表滚动到第一项往上
              if (this.scrollY > 0) {
                return
              }
              return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
            }
        },
        created() {
            // TODO 为什么不在data里定义？？因为不需要监听其变化
            this.touch = {};
            this.listenScroll = true; // 用于scroll组件派发滚动事件
            this.listHeight = []; // 用于保存每个列表组的高度
            this.probeType = 3;
        },
        methods: {
          selectItem(item) {
            this.$emit('select', item);
          },
          // 当点击右侧列表项时，左侧要跳转到相应的位置
          onShortcutTouchStart(e) {
            // 获取对应触摸的DOM上的data-index的值
            let anchorIndex = getData(e.target, 'index');
            // TODO touches：当前位于屏幕上的所有手指的列表（这一块还需进一步了解）
            let firstTouch = e.touches[0];
            // 记录开始触碰的位置
            this.touch.y1 = firstTouch.pageY;
            // 记录开始点击时的索引
            this.touch.anchorIndex = anchorIndex;
            this._scrollTo(anchorIndex);
          },
          onShortcutTouchMove(e) {
            let firstTouch = e.touches[0];
            // console.log(e.touches);
            // 记录结束触碰的位置
            this.touch.y2 = firstTouch.pageY;
            // 根据触摸开始位置到触摸结束位置计算滚动到第几项
            let delta = (this.touch.y2 - this.touch.y1)/ANCHOR_HEIGHT | 0;
            // 结束时的索引位置就等于开始时的索引位置+滚动了多少项
            // TODO this.touch.anchorIndex原先是字符串
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
            this._scrollTo(anchorIndex);
          },
          scroll(pos) {
            // pos.y是获取better-scroll实时滚动的y轴距离
            this.scrollY = pos.y;
          },
          // 根据右侧点击对应项，左侧内容跳转到对应的位置
          _scrollTo(index) {
            if (!index && index !== 0) {
              return
            }
            if (index < 0) {
              index = 0;
            } else if (index > this.listHeight.length - 2) {
              index = this.listHeight.length - 2;
            }
            this.scrollY = -this.listHeight[index];
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
          },
          // 计算每个列表组高度，获取当前滚动位置
          _calculateHeight() {
            this.listHeight = [];
            const list = this.$refs.listGroup;
            let height = 0;
            // 第一个元素的高度为0
            this.listHeight.push(height);
            //（listHeight的高度大于元素列表的高度）
            for (let i = 0; i < list.length; i++) {
              let item = list[i];
              // 高度是累加的
              height += item.clientHeight;
              this.listHeight.push(height);
            }
          }
        },
        watch: {
          data() {
            // 延时是因为数据到dom变化是有个延时(也可用nextTick,但为了确保所有手机都兼容，所以使用延时)
            setTimeout(() => {
              this._calculateHeight();
            }, 20)
          },
          // 监听滚动位置，获取滚动的对应列表项
          scrollY(newY) {
            console.log(newY);
            const listHeight = this.listHeight;
            // 1、当滚动到顶部,newY>0
            if (newY > 0) {
              this.currentIndex = 0;
              return
            }
            // 2、在中间部分滚动
            for (let i = 0; i < listHeight.length - 1; i++) {
              let height1 = listHeight[i] - 2;
              let height2 = listHeight[i+1];
              if (-newY >= height1 && -newY < height2) {
                this.currentIndex = i;
                this.diff = height2 + newY;
                // console.log(this.currentIndex);
                return
              }
            }
            // 3、当滚动到底部，且-newY大于最后一个元素的上限(减2是因为listHieght比右侧元素多一个)
            this.currentIndex = listHeight.length - 2;
          },
          diff(newVal) {
            // console.log(newVal);
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
            // if (this.fixedTop === fixedTop) {
            //   return
            // }
            // console.log(fixedTop);
            this.fixedTop = fixedTop;
            this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
          }
        }
    }
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
