import { View, Text } from "@tarojs/components";
import { type Artist } from "@/api";
import { Avatar, Cell } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";

import "./index.scss";

type ArtistListProps = {
  singers: Artist[];
};

export default function ArtistList({ singers }: ArtistListProps) {
  return (
    <View className="artist-list-container">
      <Cell.Group>
        {singers.map((singer) => (
          <Cell
            key={singer.name}
            className="artist-cell"
            clickable
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/artist/index?name=${singer.name}&pic=${singer.pic}`,
              });
            }}
          >
            <Avatar src={singer.pic} />
            <Text>{singer.name}</Text>
          </Cell>
        ))}
      </Cell.Group>
    </View>
  );
}
