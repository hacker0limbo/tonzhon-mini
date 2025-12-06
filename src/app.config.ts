export default defineAppConfig({
  pages: ["pages/index/index"],
  subPackages: [
    {
      root: "pages/search",
      pages: ["index"],
    },
    {
      root: "pages/search-result",
      pages: ["index"],
    },
    {
      root: "pages/recommend",
      pages: ["index"],
    },
    {
      root: "pages/artist",
      pages: ["index"],
    },
    {
      root: "pages/playlist",
      pages: ["index"],
    },
    {
      root: "pages/player-full",
      pages: ["index"],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "铜钟",
    navigationBarTextStyle: "black",
  },
  // 申明需要后台运行的能力
  requiredBackgroundModes: ["audio"],
});
