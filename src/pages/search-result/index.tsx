import { ScrollView, View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { searchAll, type Song } from "@/api";
import { useEffect, useState } from "react";
import SongList from "@/components/song-list";
import Player from "@/components/player";

import "./index.scss";

export default function SearchResult() {
  const {
    params: { keyword },
  } = useRouter<{ keyword: string }>();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (keyword) {
      Taro.showLoading({
        title: "搜索中...",
      });
      searchAll(keyword)
        .then((res) => {
          if (res.data.success) {
            setSongs(res.data.data || []);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "搜索失败",
            icon: "error",
          });
          setSongs([]);
        })
        .finally(() => {
          Taro.hideLoading();
        });
    }
  }, [keyword]);

  return (
    <ScrollView scrollY>
      <View className="search-result">
        <SongList
          songs={songs}
          title={
            songs.length ? (
              <View>
                <Text>搜索</Text>
                <Text className="highlight">{keyword}</Text>
              </View>
            ) : (
              "暂无搜索结果"
            )
          }
        />
      </View>
      <Player />
    </ScrollView>
  );
}
