/**
 * 虹靈御所八字兵法 - 兵符資料庫總索引
 * 67張兵符 = 神煞的軍團化表達
 * 
 * 分類：
 * - 吉神兵符 16張
 * - 凶煞兵符 19張
 * - 桃花兵符 6張
 * - 陰陽兵符 11張
 * - 刑沖害破兵符 15張
 */

import { jishenBingfu } from './jishen';
import { xiongshaBingfu } from './xiongsha';
import { taohuaBingfu } from './taohua';
import { yinyangBingfu } from './yinyang';
import { xingchonghaipoBingfu } from './xingchonghaipo';

export interface BingfuDefinition {
  id: string;
  name: string;
  alias: string; // 符名
  category: 'jishen' | 'xiongsha' | 'taohua' | 'yinyang' | 'xingchonghaipo';
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  effect: {
    buff: string | null;
    debuff: string | null;
  };
  legionInterpretation: {
    year?: string;  // 年柱解讀
    month?: string; // 月柱解讀
    day?: string;   // 日柱解讀
    hour?: string;  // 時柱解讀
  };
  judgment: string; // 判定規則描述
  storyFragment: string; // 故事片段模板
}

// 合併所有兵符
export const allBingfu: BingfuDefinition[] = [
  ...jishenBingfu,
  ...xiongshaBingfu,
  ...taohuaBingfu,
  ...yinyangBingfu,
  ...xingchonghaipoBingfu,
];

// 按ID索引
export const bingfuById: Record<string, BingfuDefinition> = {};
allBingfu.forEach(bf => {
  bingfuById[bf.id] = bf;
});

// 按類別索引
export const bingfuByCategory = {
  jishen: jishenBingfu,
  xiongsha: xiongshaBingfu,
  taohua: taohuaBingfu,
  yinyang: yinyangBingfu,
  xingchonghaipo: xingchonghaipoBingfu,
};

// 統計
export const bingfuStats = {
  total: allBingfu.length,
  jishen: jishenBingfu.length,
  xiongsha: xiongshaBingfu.length,
  taohua: taohuaBingfu.length,
  yinyang: yinyangBingfu.length,
  xingchonghaipo: xingchonghaipoBingfu.length,
};

export { jishenBingfu, xiongshaBingfu, taohuaBingfu, yinyangBingfu, xingchonghaipoBingfu };
