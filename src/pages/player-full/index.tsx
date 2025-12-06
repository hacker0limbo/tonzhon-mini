import { Avatar, pxTransform, SafeArea } from "@nutui/nutui-react-taro";
import { View, Text, Image, Slider, Button } from "@tarojs/components";
import { usePlayerStore, backgroundAudioManager } from "@/store";
import {
  Copy,
  IconFont,
  ImageError,
  Link,
  List,
  PlayStart,
  PlayStop,
  Refresh,
  Reload,
  Share,
} from "@nutui/icons-react-taro";
import { usePlayer } from "@/hooks";
import Taro from "@tarojs/taro";
import { useState } from "react";
import PlayerQueuePopup from "@/components/player-queue-popup";
import { copySongInfoToClipboard, formatSongDuration, formatSongDurationToPercent } from "@/utils";
import { getSongSrc } from "@/api";
import PlaybackRatePopup from "@/components/playback-rate-popup";

import "./index.scss";

export default function PlayerFull() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackProgress = usePlayerStore((state) => state.playbackProgress);
  const playbackOrder = usePlayerStore((state) => state.playbackOrder);
  const { playNextSong, playPreviousSong, togglePlaybackOrder } = usePlayer();
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const [showPlayerQueuePopup, setShowPlayerQueuePopup] = useState(false);
  const [showPlaybackRatePopup, setShowPlaybackRatePopup] = useState(false);
  const playbackRate = usePlayerStore((state) => state.playbackRate);

  return (
    <View className="player-full-container">
      <View className="player-full-info">
        {currentSong?.cover ? (
          <Image src={currentSong?.cover ?? ""} className="player-full-cover" mode="widthFix" />
        ) : (
          <Avatar icon={<ImageError />} className="player-full-cover" size="200" shape="square" />
        )}
        <Text className="player-full-title">{currentSong?.name ?? "暂无歌曲"}</Text>
        <Text className="player-full-artist">{currentSong?.artists?.map((a) => a.name).join(" / ") ?? "未知歌手"}</Text>
      </View>
      <View className="player-full-controls">
        <View className="player-full-actions">
          <Text
            onClick={() => {
              setShowPlaybackRatePopup(true);
            }}
          >
            {playbackRate.toFixed(1)}X
          </Text>
          <Copy
            size={20}
            color="#505259"
            onClick={() => {
              copySongInfoToClipboard(currentSong);
            }}
          />
          <Link
            size={20}
            color="#505259"
            onClick={() => {
              if (currentSong) {
                getSongSrc(currentSong.newId).then((res) => {
                  if (res.data.success) {
                    Taro.setClipboardData({
                      data: res.data.data,
                      success: () => {
                        Taro.showToast({
                          title: "歌曲地址已复制",
                          icon: "success",
                        });
                      },
                    });
                  }
                });
              }
            }}
          />
          <View className="player-full-share">
            <Share size={20} color="#505259" />
            {/* 小程序只能通过按钮触发分享, 这里放一个透明度为 0 的 */}
            <Button openType="share" className="player-full-share-btn" />
          </View>
        </View>
        <Slider
          disabled={!currentSong || !backgroundAudioManager.duration}
          className="player-full-slider"
          activeColor="black"
          blockColor="black"
          blockSize={12}
          value={formatSongDurationToPercent(playbackProgress, backgroundAudioManager.duration)}
          step={0.1}
          onChange={(e) => {
            if (currentSong && backgroundAudioManager.duration) {
              const value = e.detail.value || 0;
              const newTime = (value / 100) * backgroundAudioManager.duration;
              backgroundAudioManager.seek(newTime);
            }
          }}
          onChanging={(e) => {
            // TODO: 滑动过程中更加丝滑
          }}
        />
        <View className="player-full-time-info">
          <Text>{currentSong ? formatSongDuration(playbackProgress) : "00:00"}</Text>
          <Text>{currentSong ? formatSongDuration(backgroundAudioManager.duration) : "00:00"}</Text>
        </View>
        <View className="player-full-buttons">
          <View
            style={{ marginTop: pxTransform(4) }}
            onClick={() => {
              togglePlaybackOrder();
            }}
          >
            {playbackOrder === "repeatAll" ? (
              <Refresh color="#505259" size={24} />
            ) : (
              <Reload color="#505259" size={24} />
            )}
          </View>
          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="shangyishoushangyige"
            size={24}
            onClick={() => {
              playPreviousSong();
            }}
          />
          {isPlaying ? (
            <PlayStop
              size={48}
              onClick={() => {
                if (currentSong) {
                  backgroundAudioManager.pause();
                }
              }}
            />
          ) : (
            <PlayStart
              size={48}
              onClick={() => {
                if (currentSong) {
                  backgroundAudioManager.play();
                }
              }}
            />
          )}
          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="xiayigexiayishou"
            size={24}
            onClick={() => {
              playNextSong();
            }}
          />
          <List
            size={24}
            style={{ marginLeft: pxTransform(4) }}
            onClick={() => {
              setShowPlayerQueuePopup(true);
            }}
          />
        </View>
        <SafeArea position="bottom" />
      </View>

      <PlayerQueuePopup
        visible={showPlayerQueuePopup}
        onClose={() => {
          setShowPlayerQueuePopup(false);
        }}
      />

      <PlaybackRatePopup
        visible={showPlaybackRatePopup}
        onClose={() => {
          setShowPlaybackRatePopup(false);
        }}
      />
    </View>
  );
}
