import {playMode} from '@/common/js/config';
const state = {
  singer: {}, // 歌手数据
  playing: false, // 播放状态
  fullScreen: false, // 全屏
  playlist: [], // 播放列表
  sequenceList: [], // 随机播放列表
  mode: playMode.sequence,
  currentIndex: -1, // 当前播放索引
};

export default state;
