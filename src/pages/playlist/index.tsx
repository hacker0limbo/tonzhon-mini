import Player from "@/components/player";
import { ScrollView, View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { type PlaylistInfo, getPlaylistInfo } from "@/api";
import { useEffect, useState } from "react";
import { Avatar, Cell, Space } from "@nutui/nutui-react-taro";
import { getPlaylistCoverUrl, formatCount } from "@/utils";
import { Heart, Service, Share } from "@nutui/icons-react-taro";
import SongList from "@/components/song-list";

import "./index.scss";

export default function Playlist() {
  const {
    params: { id },
  } = useRouter<{ id: string }>();
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo>();

  useEffect(() => {
    if (id) {
      Taro.showLoading({
        title: "获取歌单信息中",
      });
      getPlaylistInfo(id)
        .then((res) => {
          if (res.data.success) {
            setPlaylistInfo(res.data.playlist);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "获取歌单失败",
            icon: "error",
          });
        })
        .finally(() => {
          Taro.hideLoading();
        });
    }
  }, [id]);

  return (
    <ScrollView>
      <View className="playlist-container">
        <Cell.Group className="playlist-info-container">
          <Cell className="playlist-info-cell">
            <Avatar size="80" shape="square" src={getPlaylistCoverUrl(playlistInfo?.cover)} />
            <View className="playlist-info-details">
              <Text className="playlist-name">{playlistInfo?.name}</Text>
              <Text>创建者: {playlistInfo?.author}</Text>
            </View>
          </Cell>
          <Cell className="playlist-actions-cell">
            <View className="playlist-action-item">
              <Service size={20} />
              <Text>{formatCount(playlistInfo?.playCount)}</Text>
            </View>
            <View className="playlist-action-item">
              <Heart size={20} />
              <Text>{formatCount(playlistInfo?.collectCount)}</Text>
            </View>
            <View
              className="playlist-action-item"
              onClick={() => {
                Taro.setClipboardData({
                  data: `https://tonzhon.whamon.com/playlist/${id}`,
                  success: () => {
                    Taro.showToast({
                      title: "歌单链接已复制",
                      icon: "success",
                    });
                  },
                });
              }}
            >
              <Share size={20} />
              <Text>分享</Text>
            </View>
          </Cell>
        </Cell.Group>

        <SongList songs={playlistInfo?.songs ?? []} title="歌曲" />
      </View>
      <Player />
    </ScrollView>
  );
}
