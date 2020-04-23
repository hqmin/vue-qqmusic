<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key="item"
        :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
    import BScroll from 'better-scroll';
    import {addClass} from '@/common/js/dom';
    export default {
        name: "slider",
        props: {
          // 是否可以轮播
          loop: {
            type: Boolean,
            default: true
          },
          // 自动轮播
          autoPlay: {
            type: Boolean,
            default: true
          },
          // 自动轮播时间间隔
          interval: {
            type: Number,
            default: 4000
          }
        },
        data() {
          return {
            dots: [],
            currentPageIndex: 0
          };
        },
        mounted() {
          // 保证DOM成功渲染,浏览器的刷新是17毫秒一次
          setTimeout(() => {
            this._setSliderWidth(); // 根据图片总数设置轮播视口宽度
            this._initDots();
            this._initSlider();
            if (this.autoPlay) {
              this._play();
            }
          }, 20);

          window.addEventListener('resize', () => {
            if (!this.slider) {
              return
            }
            this._setSliderWidth();
            this.slider.refresh(); // 刷新slider，重新做计算
          })
        },
      methods: {
          _setSliderWidth(isResize) {
            this.children = this.$refs.sliderGroup.children;
            let width = 0;
            let sliderWidth = this.$refs.slider.clientWidth;
            for (let i = 0; i < this.children.length; i++) {
              let child = this.children[i];
              addClass(child, 'slider-item');
              child.style.width = sliderWidth + 'px';
              width += sliderWidth;
            }

            // TODO 为什么宽度要多出俩个视口宽度
            if (this.loop && !isResize) {
              width += 2 * sliderWidth;
            }
            this.$refs.sliderGroup.style.width = width + 'px';
          },
          _initSlider() {
            this.slider = new BScroll(this.$refs.slider, {
              scrollX: true, // 允许横向滚动
              scrollY: false, // 不允许纵向滚动
              momentum: false, // 当快速在屏幕上滑动一段距离的时候，会根据滑动的距离和时间计算出动量，并生成滚动动画
              snap: true,
              snapLoop: this.loop, // 是否支持循环播放
              snapThreshold: 0.3,
              snapSpeed: 400,
              // click: true // better-scroll 默认会阻止浏览器的原生 click 事件。当设置为 true，better-scroll 会派发一个 click 事件
            });

            // 滚动结束的时候触发
            this.slider.on('scrollEnd', () => {
              let pageIndex = this.slider.getCurrentPage().pageX;
              if (this.loop) {
                pageIndex -= 1;
              }
              this.currentPageIndex = pageIndex;

              if (this.autoPlay) {
                clearTimeout(this.timer);
                this._play();
              }
            })
          },
          _initDots () {
              this.dots = new Array(this.children.length);
          },
          _play() {
              let pageIndex = this.currentPageIndex + 1;
              if (this.loop) {
                pageIndex += 1;
              }
              this.timer = setTimeout(() => {
                // 当我们做 slide 组件的时候，slide 通常会分成多个页面。调用此方法可以滚动到指定的页面
                this.slider.goToPage(pageIndex, 0, 400);
              }, this.interval)
          }
      },
      destroyed() {
          // 清除定时器，有利于内存的释放
          clearTimeout(this.timer);
      }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
