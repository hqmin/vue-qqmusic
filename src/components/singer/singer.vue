<template>
  <div class="singer" ref="singer">
    <list-view :data="singers" @select="selectSinger"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from '@/api/singer.js';
  import {ERR_OK} from '@/api/config';
  import Singer from '@/common/js/singer';
  import ListView from '@/base/listview/listview';
  import {mapMutations} from 'vuex';
  const HOT_NAME = '热门';
  const HOT_SINGER_LEN = 10;
  export default {
    data() {
      return {
        singers: []
      };
    },
    created() {
      this._getSingerList();
    },
    components: {
      ListView
    },
    methods: {
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        });
        this.setSinger(singer);
      },
      // 获取歌手数据
      _getSingerList() {
        getSingerList().then(res => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list);
            // setTimeout(() => {
            //   console.log(this._normalizeSinger(this.singers));
            // }, 2000);
          }
        })
      },
      // 处理歌手数据
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        };
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name,
            }));
          }
          const key = item.Findex;
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name,
          }))
        });
        // console.log(map);
        // 为了得到有序列表，需要处理map
        let hot = [];
        let ret = [];
        for (let key in map) {
          let val = map[key];
          // 正则匹配是为了排除掉包括a-z以外的歌手:例如9
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val);
          } else if (val.title === HOT_NAME) {
            hot.push(val);
          }
        }
        // 将a-z之间的歌手排序
        ret.sort((a, b) => {
          // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
          return a.title.charCodeAt(0) - b.title.charCodeAt(0);
        });
        return hot.concat(ret);
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
