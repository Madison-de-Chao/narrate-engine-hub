/**
 * 地支角色頭像映射
 * 檔名格式：{地支}{五行}_{角色名稱}.png
 */

import 子水_夜行刺客 from './子水_夜行刺客.png';
import 丑土_封藏守衛 from './丑土_封藏守衛.png';
import 寅木_雷虎獵人 from './寅木_雷虎獵人.png';
import 卯木_玉兔使者 from './卯木_玉兔使者.png';
import 辰土_泥雲龍法師 from './辰土_泥雲龍法師.png';
import 巳火_蛇焰術士 from './巳火_蛇焰術士.png';
import 午火_日鬃騎兵 from './午火_日鬃騎兵.png';
import 未土_牧角調和者 from './未土_牧角調和者.png';
import 申金_金杖靈猴戰士 from './申金_金杖靈猴戰士.png';
import 酉金_鳳羽判衡者 from './酉金_鳳羽判衡者.png';
import 戌土_烽火戰犬統領 from './戌土_烽火戰犬統領.png';
import 亥水_潮典海豚智者 from './亥水_潮典海豚智者.png';

// 地支到頭像的映射
export const advisorAvatars: Record<string, string> = {
  '子': 子水_夜行刺客,
  '丑': 丑土_封藏守衛,
  '寅': 寅木_雷虎獵人,
  '卯': 卯木_玉兔使者,
  '辰': 辰土_泥雲龍法師,
  '巳': 巳火_蛇焰術士,
  '午': 午火_日鬃騎兵,
  '未': 未土_牧角調和者,
  '申': 申金_金杖靈猴戰士,
  '酉': 酉金_鳳羽判衡者,
  '戌': 戌土_烽火戰犬統領,
  '亥': 亥水_潮典海豚智者,
};

// 根據地支取得頭像
export function getAdvisorAvatar(branch: string): string | undefined {
  return advisorAvatars[branch];
}

export default advisorAvatars;
