<template>
    <!-- TODO better-scroll滚动原理：根据初始化或者调用refresh的时机，拿那个时候父元素的高度和子元素的高度的差去做计算，算到它可以滚动到的位置-->
    <!-- TODO 所以去实例化或者调用refresh一定要保证dom已经渲染,才能保证高度正常;高度变化一定要重新refresh -->
    <!-- 封装的原因：希望通过封装一个组件，用于初始化better-scroll，
    这样项目中任何使用到滚动的地方，都可直接在外层去嵌套这个组件来达到初始化的目的 ，
    这样就不用每次使用滚动都需要去进行一次初始化工作,达到复用的目的 -->
    <div ref="wrapper">
      <slot></slot>
    </div>
</template>

<script>
    import BScroll from 'better-scroll';
    export default {
        name: 'scroll',
        props: {
          /*
          有时候我们需要知道滚动的位置(派发滚动事件)。
          当 probeType 为 1 的时候会非实时（屏幕滑动超过一定时间后）派发scroll 事件；
          当 probeType 为 2 的时候，会在屏幕滑动的过程中实时的派发 scroll 事件；
          当 probeType 为 3 的时候，不仅在屏幕滑动的过程中，而且在 momentum 滚动动画运行过程中实时派发 scroll 事件。
          如果没有设置该值，其默认值为 0，即不派发 scroll 事件
          */
          probeType: {
            type: Number,
            default: 1
          },
          /*
          better-scroll 默认会阻止浏览器的原生 click 事件。
          当设置为 true，better-scroll 会派发一个 click 事件，
          我们会给派发的 event 参数加一个私有属性 _constructed，值为 true
          */
          click: {
            type: Boolean,
            default: true
          },
          /*
          组件数据是动态变化的，所以当我们数据变化的时候需要重新refresh我们better-scroll,
          达到计算正确（否则会出现滚动条滚动不了的情况）
          */
          data: {
            type: Array,
            default: null
          },
          // 用于判断scroll是否去监听滚动事件
          listenScroll: {
            type: Boolean,
            default: false
          }
        },
        mounted() {
          // TODO 为了保证DOM渲染???mounted是挂载阶段，dom肯定是渲染完成了，为什么还需要定时器??
          setTimeout(() => {
            this._initScroll();
          }, 20)
        },
        methods: {
          // scroll初始化
          _initScroll() {
            if (!this.$refs.wrapper) {
              return
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
              probeType: this.probeType,
              click: this.click
            });
            // 这一步是为了在外面能够监听scroll事件
            if (this.listenScroll) {
              let me = this; // 保留vue实例的this
              this.scroll.on('scroll', (pos) => {
                // better-scroll里面的this默认指向scroll
                me.$emit('scroll', pos); // $emit是vue实例上的方法
              });
            }
          },
          // 挂载better-scroll上的方法
          // 启用 better-scroll, 默认 开启
          enable() {
            this.scroll && this.scroll.enable();
          },
          // 禁用 better-scroll，DOM 事件（如 touchstart、touchmove、touchend）的回调函数不再响应
          disable() {
            this.scroll && this.scroll.disable();
          },
          // 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常
          refresh() {
            this.scroll && this.scroll.refresh();
          },
          // 滚动到指定的位置:scrollTo(x, y, time, easing)
          /*
          * params x: x 横轴坐标（单位 px）
          * params y: y 纵轴坐标（单位 px）
          * params time: 滚动动画执行的时长（单位 ms）
          * params easing: 缓动函数，一般不建议修改，如果想修改，参考源码中的 ease.js 里的写法
          * */
          scrollTo() {
            // 使用apply是因为有一些参数是需要传到封装的组件scroll中去调用
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
          },
          // 滚动到指定的目标元素
          scrollToElement() {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
          }
        },
        watch: {
          // data数据变化需重新计算保证滚动效果正常
          //（不建议在调用方去监听data,在scroll组件里监听，只需把data传过来，一有变化，组件会自动的去刷新计算）
          // 这样就不用调用者自己手动的去监听触发refresh事件
          /*TODO 当不传data的时候，better-scroll的初始化是发生在mounted里的，此时可能数据还是请求回来，DOM还没有高度，所以当数据回来完成渲染时，并未触发refresh，所以滚动不了*/
          data() {
            setTimeout(() => {
              this.refresh();
            }, 20)
          }
        }
    }
</script>

<style scoped>

</style>
