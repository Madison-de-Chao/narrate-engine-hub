/**
 * 地支角色全身動態圖映射 — 懶加載版本
 * 圖片在需要時才會被載入，避免首屏加載所有大型圖片
 */

const imageModules: Record<string, () => Promise<{ default: string }>> = {
  '子': () => import('./子水_夜行刺客_全身動態.png'),
  '丑': () => import('./丑土_封藏守衛_全身動態.png'),
  '寅': () => import('./寅木_雷虎獵人_全身動態.png'),
  '卯': () => import('./卯木_玉兔使者_全身動態.png'),
  '辰': () => import('./辰土_泥雲龍法師_全身動態.png'),
  '巳': () => import('./巳火_蛇焰術士_全身動態.png'),
  '午': () => import('./午火_日鬃騎兵_全身動態.png'),
  '未': () => import('./未土_牧角調和者_全身動態.png'),
  '申': () => import('./申金_金杖靈猴戰士_全身動態.png'),
  '酉': () => import('./酉金_鳳羽判衡者_全身動態.png'),
  '戌': () => import('./戌土_烽火戰犬統領_全身動態.png'),
  '亥': () => import('./亥水_潮典海豚智者_全身動態.png'),
};

const cache: Record<string, string> = {};

/**
 * 取得地支角色全身動態圖 URL（非同步，懶加載）
 */
export async function getAdvisorFullbodyAvatar(branch: string): Promise<string | undefined> {
  if (cache[branch]) return cache[branch];
  const loader = imageModules[branch];
  if (!loader) return undefined;
  const mod = await loader();
  cache[branch] = mod.default;
  return mod.default;
}

export const advisorFullbodyAvatars: Record<string, string> = cache;

export default advisorFullbodyAvatars;
