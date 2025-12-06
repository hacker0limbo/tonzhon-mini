import { useState, useEffect, useMemo } from "react";
import Taro from "@tarojs/taro";
import {
  usePlayerStore,
  clearBackgroundAudioManager,
  addSongToBackgroundAudioManager,
  backgroundAudioManager,
} from "@/store";
import { type Song } from "@/api";
import { isNil } from "@/utils";

// 获取播放器高度
export function usePlayerHeight() {
  const [playerHeight, setPlayerHeight] = useState(0);

  useEffect(() => {
    // 获取播放器的高度
    const query = Taro.createSelectorQuery();
    query.select(".player").boundingClientRect();
    query.exec(function (res) {
      setPlayerHeight(res[0]?.height || 0);
    });
  }, []);

  return playerHeight;
}

// 播放器相关方法
export function usePlayer() {
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setPlayerQueue = usePlayerStore((state) => state.setPlayerQueue);
  const setPlaybackProgress = usePlayerStore((state) => state.setPlaybackProgress);
  const setPlaybackOrder = usePlayerStore((state) => state.setPlaybackOrder);
  const playerQueue = usePlayerStore((state) => state.playerQueue);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackOrder = usePlayerStore((state) => state.playbackOrder);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  // 清空播放队列
  const clearPlayerQueue = () => {
    setPlayerQueue([]);
    setCurrentSong(undefined);
    setPlaybackProgress(0);

    clearBackgroundAudioManager();
  };

  // 覆盖播放队列并播放第一首
  const resetSongs = (songs: Song[]) => {
    if (songs.length) {
      const firstSong = songs[0];
      setPlayerQueue(songs);
      setCurrentSong(firstSong);

      addSongToBackgroundAudioManager(firstSong);
    } else {
      clearPlayerQueue();
    }
  };

  // 播放上一首或下一首
  const playPreviousOrNextSong = (direction: "next" | "previous") => () => {
    if (currentSong && playerQueue.length) {
      const currentIndex = playerQueue.findIndex((song) => song.newId === currentSong.newId);

      if (currentIndex >= 0) {
        const navigateIndex =
          direction === "next"
            ? (currentIndex + 1) % playerQueue.length
            : (currentIndex - 1 + playerQueue.length) % playerQueue.length;
        // 基于播放顺序获取到下一首歌曲
        const navigateSong = playerQueue[playbackOrder === "repeatAll" ? navigateIndex : currentIndex];

        // 停止当前播放
        backgroundAudioManager.stop();
        setCurrentSong(navigateSong);
        addSongToBackgroundAudioManager(navigateSong);
      } else {
        // 异常情况: 当前歌曲不在播放队列中, 播放第一首
        const firstSong = playerQueue[0];
        setCurrentSong(firstSong);
        addSongToBackgroundAudioManager(firstSong);
      }
    }
  };

  // 播放下一首
  const playNextSong = playPreviousOrNextSong("next");

  // 播放上一首
  const playPreviousSong = playPreviousOrNextSong("previous");

  // 播放队列中移除歌曲
  const removeSongFromQueue = (song: Song) => {
    if (currentSong && playerQueue.length) {
      const newQueue = playerQueue.filter((s) => s.newId !== song.newId);

      if (newQueue.length) {
        // 播放队列不为空
        if (song.newId === currentSong.newId) {
          // 如果移除的是当前播放的歌曲, 则播放下一首
          playNextSong();
        }

        setPlayerQueue(newQueue);
      } else {
        clearPlayerQueue();
      }
    }
  };

  // 判断歌曲是否是当前播放的歌曲
  const matchCurrentSong = (song: Song) => {
    return currentSong && currentSong?.newId === song.newId;
  };

  // 播放队列里的歌曲
  const playSongInQueue = (song: Song) => {
    if (song.newId !== currentSong?.newId) {
      // 正在播放的不是将要播放的歌曲
      setCurrentSong(song);
      addSongToBackgroundAudioManager(song);
    }
  };

  // 播放一首歌
  const playSong = (song: Song) => {
    if (currentSong && playerQueue.length) {
      // 如果播放队列不为空
      if (matchCurrentSong(song)) {
        // 如果播放的歌曲就是当前歌曲, 切换播放状态
        if (isPlaying) {
          backgroundAudioManager.pause();
        } else {
          backgroundAudioManager.play();
        }
      } else {
        // 非正在播放的歌曲, 要判断是否在播放队列中
        const songInQueue = playerQueue.find((s) => s.newId === song.newId);
        if (!songInQueue) {
          // 不在播放队列中, 直接播放, 但是在当前播放的歌曲后面添加该歌曲到播放队列中
          const currentIndex = playerQueue.findIndex((s) => s.newId === currentSong.newId);
          const newQueue = [...playerQueue.slice(0, currentIndex + 1), song, ...playerQueue.slice(currentIndex + 1)];
          setPlayerQueue(newQueue);
        }
        // 不管在不在播放队列中, 都直接播放该歌曲
        setCurrentSong(song);
        addSongToBackgroundAudioManager(song);
      }
    } else {
      // 如果播放队列为空, 则重置播放队列为当前歌曲
      resetSongs([song]);
    }
  };

  // 添加歌曲到播放队列稍后播放
  const addSongToQueue = (song: Song) => {
    if (currentSong && playerQueue.length) {
      if (matchCurrentSong(song)) {
        // 如果添加的歌曲就是当前歌曲, 则不做任何操作
        Taro.showToast({
          title: "歌曲正在播放中",
          icon: "none",
        });
      } else {
        // 非正在播放的歌曲, 要判断是否在播放队列中
        const songInQueue = playerQueue.find((s) => s.newId === song.newId);
        // 当前歌曲在队列中, 过滤掉后插入, 否则直接插入
        const queue = songInQueue ? playerQueue.filter((s) => s.newId !== song.newId) : playerQueue;
        const currentIndex = queue.findIndex((s) => s.newId === currentSong.newId);
        const newQueue = [...queue.slice(0, currentIndex + 1), song, ...queue.slice(currentIndex + 1)];
        setPlayerQueue(newQueue);
        Taro.showToast({
          title: "已添加至播放队列",
          icon: "none",
        });
      }
    } else {
      // 如果播放队列为空, 则重置播放队列为当前歌曲
      resetSongs([song]);
      Taro.showToast({
        title: "已添加至播放队列",
        icon: "none",
      });
    }
  };

  // 播放顺序切换
  const togglePlaybackOrder = () => {
    if (playbackOrder === "repeatAll") {
      setPlaybackOrder("repeatOne");
      Taro.showToast({
        title: "已切换为单曲循环",
        icon: "none",
      });
    } else {
      setPlaybackOrder("repeatAll");
      Taro.showToast({
        title: "已切换为列表循环",
        icon: "none",
      });
    }
  };

  return {
    clearPlayerQueue,
    resetSongs,
    playNextSong,
    playPreviousSong,
    removeSongFromQueue,
    matchCurrentSong,
    playSongInQueue,
    playSong,
    addSongToQueue,
    togglePlaybackOrder,
  };
}
