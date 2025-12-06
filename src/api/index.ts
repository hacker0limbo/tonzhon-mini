import Taro from "@tarojs/taro";

const BASE_URL_1 = "https://tonzhon-music-api.whamon.com";
const BASE_URL_2 = "https://tonzhon.whamon.com/api";

export type Song = {
  // 用于获取歌曲内容和歌词等
  newId: string;
  name: string;
  // 艺人
  artists?: [
    {
      name: string;
      id: string;
    },
    {
      name: string;
      id: string;
    }
  ];
  // 专辑
  album: {
    name: string;
    id: string;
  };
  // 其他信息
  alias?: string;
  // e.g. 5964088
  mvId?: string;
  originalId?: string;
  // 来自什么平台, e.g. qq
  platform?: string;
  // 封面
  cover?: string;
};

export type Artist = {
  // 艺人名
  name: string;
  // 图片
  pic: string;
};

export type Playlist = {
  cover?: string;
  id: string;
  name: string;
};

export type PlaylistInfo = {
  author: string;
  // 收藏量
  collectCount: number;
  cover: string;
  // 创建时间
  created: string;
  name: string;
  // 播放量
  playCount: number;
  songs: Song[];
  __v: number;
  _id: string;
};

// 获取热门歌曲
export function getHotSongs() {
  return Taro.request<{ success: boolean; songs: Song[] | { error: string } }>({
    url: `${BASE_URL_1}/hot-songs`,
  });
}

// 根据 newId 获取歌曲播放地址
export function getSongSrc(newId: string) {
  return Taro.request<{ success: boolean; data: string }>({
    url: `${BASE_URL_1}/song_file/${newId}`,
  });
}

// 获取新歌
export function getNewSongs() {
  return Taro.request<{ success: boolean; songs: Song[] | { error: string } }>({
    url: `${BASE_URL_1}/new-songs`,
  });
}

// 根据关键词搜索所有歌曲
export function searchAll(keyword: string) {
  return Taro.request<{ success: boolean; data: Song[] }>({
    url: `${BASE_URL_1}/safe-search?keyword=${keyword}`,
  });
}

// 获取某个歌手的所有歌曲
export function getSongsOfArtist(name: string) {
  return Taro.request<{ songs?: Song[]; error?: string }>({
    url: `${BASE_URL_1}/songs_of_artist/${encodeURIComponent(name)}`,
  });
}

// 获取精选歌单
export function getRecommendPlaylists() {
  return Taro.request<{ success: boolean; playlists: Playlist[] }>({
    url: `${BASE_URL_2}/recommended_playlists`,
  });
}

// 获取歌单详情
export function getPlaylistInfo(id: string) {
  return Taro.request<{ success: boolean; playlist: PlaylistInfo }>({
    url: `${BASE_URL_2}/playlists/${id}`,
  });
}
