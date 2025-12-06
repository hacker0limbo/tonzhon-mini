import { View, Text, ScrollView } from "@tarojs/components";
import { useEffect, useState } from "react";
import Player from "@/components/player";
import { Cell, pxTransform, SearchBar, Tabs, type TabPaneProps } from "@nutui/nutui-react-taro";
import { getHotSongs, getNewSongs, getRecommendPlaylists, type Playlist, type Song } from "@/api";
import Taro from "@tarojs/taro";
import { usePlayerHeight } from "@/hooks";
import { ArrowRight } from "@nutui/icons-react-taro";
import SongList from "@/components/song-list";
import ArtistList from "@/components/artist-list";
import PlaylistGroup from "@/components/playlist-group";

import { popularArtists } from "./popular-artists";
import "./index.scss";

type TabKey = "recommend" | "artists" | "playlists";

export default function Index() {
  const [tab, setTab] = useState<TabKey>("recommend");
  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [loadingHostSongs, setLoadingHotSongs] = useState(false);
  const [newSongs, setNewSongs] = useState<Song[]>([]);
  const [loadingNewSongs, setLoadingNewSongs] = useState(false);
  const playerHeight = usePlayerHeight();
  const [recommendPlaylists, setRecommendPlaylists] = useState<Playlist[]>([]);

  const tabs: Array<Partial<TabPaneProps & { children: React.ReactNode }>> = [
    {
      title: "推荐歌曲",
      value: "recommend",
      children: (
        <>
          <SongList
            title="热门歌曲"
            songs={hotSongs}
            // 首页仅展示 5 首歌曲
            showCount={5}
            extra={
              <View
                className="song-list-title-extra"
                onClick={() => {
                  Taro.navigateTo({
                    url: "/pages/recommend/index?type=hot",
                    success: (res) => {
                      res.eventChannel.emit("hotSongs", {
                        title: "热门歌曲",
                        songs: hotSongs,
                      });
                    },
                  });
                }}
              >
                <Text>更多</Text>
                <ArrowRight size={16} color="#505259" />
              </View>
            }
          />
          <SongList
            title="最新歌曲"
            songs={newSongs}
            // 首页仅展示 5 首歌曲
            showCount={5}
            extra={
              <View
                className="song-list-title-extra"
                onClick={() => {
                  Taro.navigateTo({
                    url: "/pages/recommend/index?type=new",
                    success: (res) => {
                      res.eventChannel.emit("hotSongs", {
                        title: "最新歌曲",
                        songs: newSongs,
                      });
                    },
                  });
                }}
              >
                <Text>更多</Text>
                <ArrowRight size={16} color="#505259" />
              </View>
            }
          />
        </>
      ),
    },
    {
      title: "推荐歌手",
      value: "artists",
      children: (
        <View style={{ marginTop: pxTransform(8) }}>
          <ArtistList singers={popularArtists} />
        </View>
      ),
    },
    {
      title: "热门歌单",
      value: "playlists",
      children: (
        <Cell style={{ marginTop: pxTransform(8) }}>
          <PlaylistGroup playlists={recommendPlaylists} />
        </Cell>
      ),
    },
  ];

  useEffect(() => {
    setLoadingHotSongs(true);
    getHotSongs()
      .then((res) => {
        if (res.data.success) {
          if (Array.isArray(res.data.songs)) {
            setHotSongs(res.data.songs);
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取热门歌曲失败",
          icon: "error",
        });
      })
      .finally(() => {
        setLoadingHotSongs(false);
      });
  }, []);

  useEffect(() => {
    setLoadingNewSongs(true);
    getNewSongs()
      .then((res) => {
        if (res.data.success) {
          if (Array.isArray(res.data.songs)) {
            setNewSongs(res.data?.songs);
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取最新歌曲失败",
          icon: "error",
        });
      })
      .finally(() => {
        setLoadingNewSongs(false);
      });
  }, []);

  useEffect(() => {
    if (tab === "playlists" && !recommendPlaylists.length) {
      // 当在 playlists 标签下且推荐歌单为空时才请求
      Taro.showLoading({
        title: "加载推荐歌单中",
      });
      getRecommendPlaylists()
        .then((res) => {
          if (res.data.success) {
            setRecommendPlaylists(res.data.playlists);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "获取推荐歌单失败",
          });
        })
        .finally(() => {
          Taro.hideLoading();
        });
    }
  }, [tab, recommendPlaylists]);

  useEffect(() => {
    if (loadingHostSongs || loadingNewSongs) {
      Taro.showLoading({
        title: "加载推荐歌曲中",
      });
    } else {
      Taro.hideLoading();
    }
  }, [loadingHostSongs, loadingNewSongs]);

  return (
    <ScrollView scrollY>
      <SearchBar
        shape="round"
        placeholder="安全搜索"
        onInputClick={() => {
          Taro.navigateTo({
            url: "/pages/search/index",
          });
        }}
      />
      <Tabs
        value={tab}
        onChange={(value) => {
          setTab(value as TabKey);
        }}
      >
        {tabs.map((t) => (
          <Tabs.TabPane title={t.title} value={t.value} key={t.value} />
        ))}
      </Tabs>

      <View className="index-container" style={{ marginBottom: playerHeight }}>
        {tabs.find((t) => t.value === tab)?.children}
      </View>

      <Player />
    </ScrollView>
  );
}
