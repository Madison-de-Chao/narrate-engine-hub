/**
 * 天干角色全身動態圖映射 — 懶加載版本
 * 圖片在需要時才會被載入，避免首屏加載所有大型圖片
 */

const imageModules: Record<string, () => Promise<{ default: string }>> = {
  '甲': () => import('./甲木_森林將軍_全身動態.png'),
  '乙': () => import('./乙木_花蔓軍師_全身動態.png'),
  '丙': () => import('./丙火_烈日戰神_全身動態.png'),
  '丁': () => import('./丁火_誓燈法師_全身動態.png'),
  '戊': () => import('./戊土_山岳守護_全身動態.png'),
  '己': () => import('./己土_大地母親_全身動態.png'),
  '庚': () => import('./庚金_天鍛騎士_全身動態.png'),
  '辛': () => import('./辛金_靈晶鑑定師_全身動態.png'),
  '壬': () => import('./壬水_龍河船長_全身動態.png'),
  '癸': () => import('./癸水_甘露天使_全身動態.png'),
};

// Cache resolved URLs
const cache: Record<string, string> = {};

/**
 * 取得天干角色全身動態圖 URL（非同步，懶加載）
 */
export async function getCommanderFullbodyAvatar(stem: string): Promise<string | undefined> {
  if (cache[stem]) return cache[stem];
  const loader = imageModules[stem];
  if (!loader) return undefined;
  const mod = await loader();
  cache[stem] = mod.default;
  return mod.default;
}

// Keep a synchronous record for backward compatibility (will be empty until loaded)
export const commanderFullbodyAvatars: Record<string, string> = cache;

export default commanderFullbodyAvatars;
