import Taro from "@tarojs/taro";

const cloud = new Taro.cloud.Cloud({
  resourceAppid: "wx49c3883a33769944",
  resourceEnv: "cloudbase-0grapuis2753b5c0",
});

let initCloud: Promise<void> | null = null;

// 保证唯一实例
export function getCloud() {
  if (!initCloud) {
    initCloud = cloud.init();
  }
  return initCloud.then(() => cloud);
}
