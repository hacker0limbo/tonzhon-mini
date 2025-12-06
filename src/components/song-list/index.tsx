import { Image, Pin, Play } from "@nutui/icons-react-taro";
import { Avatar, Cell } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";
import { type Song } from "@/api";
import { usePlayer } from "@/hooks";
import { clsx } from "@/utils";
import { useMemo } from "react";

import "./index.scss";

type SongListProps = {
  title?: React.ReactNode;
  songs: Song[];
  // 展示的歌曲数量, 默认全部展示
  showCount?: number;
  extra?: React.ReactNode;
};

// 歌曲列表组件
export default function SongList({ title = "全部播放", songs = [], showCount, extra }: SongListProps) {
  const { resetSongs, matchCurrentSong, playSong, addSongToQueue } = usePlayer();

  // 展示的歌曲
  const displayedSongs = useMemo(() => (showCount ? songs.slice(0, showCount) : songs), [showCount, songs]);

  return (
    <>
      <View className="song-list-title">
        <View className="song-list-title-label">
          {typeof title === "string" ? <Text>{title}</Text> : <>{title}</>}
          {songs.length ? (
            <Avatar
              size="small"
              icon={<Play />}
              background="white"
              shape="round"
              color="black"
              onClick={() => {
                resetSongs(songs);
              }}
            />
          ) : null}
        </View>
        {extra}
      </View>
      <Cell.Group>
        {displayedSongs.map((song) => (
          <Cell
            key={song.newId}
            className="song-cell"
            clickable
            onClick={() => {
              playSong(song);
            }}
          >
            <View className="song-info">
              {song.cover ? (
                <Avatar src={song.cover} shape="square" size="normal" />
              ) : (
                <Avatar shape="square" size="normal" icon={<Image />} />
              )}
              <View className={clsx("song-label", matchCurrentSong(song) && "match-current-song")}>
                <Text className="song-label-name ellipsis">{song.name}</Text>
                <Text className="song-label-artist ellipsis">{song.artists?.map((a) => a.name)?.join(" / ")}</Text>
              </View>
            </View>
            <View className="song-actions">
              <Pin
                size={20}
                color="#505259"
                onClick={(e) => {
                  // 阻止冒泡, 否则会触发播放歌曲事件
                  e.stopPropagation();
                  addSongToQueue(song);
                }}
              />
            </View>
          </Cell>
        ))}
      </Cell.Group>
    </>
  );
}
