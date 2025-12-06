import { View, Text } from "@tarojs/components";
import { type Playlist } from "@/api";
import { Row, Col, Avatar, Badge } from "@nutui/nutui-react-taro";
import { getPlaylistCoverUrl } from "@/utils";
import Taro from "@tarojs/taro";

import "./index.scss";

type PlaylistGroupProps = {
  playlists: Playlist[];
};

export default function PlaylistGroup({ playlists }: PlaylistGroupProps) {
  return (
    <View className="playlist-group-container">
      <Row gutter={16} wrap="wrap" justify="space-around" type="flex">
        {playlists?.map((playlist) => (
          <Col span={8} key={playlist.id}>
            <View
              className="playlist-item"
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/playlist/index?id=${playlist.id}`,
                });
              }}
            >
              <Avatar className="playlist-cover" src={getPlaylistCoverUrl(playlist.cover)} size="96" shape="square" />
              <Text className="playlist-name">{playlist.name}</Text>
            </View>
          </Col>
        ))}
      </Row>
    </View>
  );
}
