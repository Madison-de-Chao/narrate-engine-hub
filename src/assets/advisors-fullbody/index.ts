/**
 * 地支角色全身動態圖映射
 */

import 子水_夜行刺客_全身動態 from './子水_夜行刺客_全身動態.png';
import 丑土_封藏守衛_全身動態 from './丑土_封藏守衛_全身動態.png';
import 巳火_蛇焰術士_全身動態 from './巳火_蛇焰術士_全身動態.png';
import 午火_日鬃騎兵_全身動態 from './午火_日鬃騎兵_全身動態.png';

// 地支到全身動態圖的映射
export const advisorFullbodyAvatars: Record<string, string> = {
  '子': 子水_夜行刺客_全身動態,
  '丑': 丑土_封藏守衛_全身動態,
  '巳': 巳火_蛇焰術士_全身動態,
  '午': 午火_日鬃騎兵_全身動態,
};

export function getAdvisorFullbodyAvatar(branch: string): string | undefined {
  return advisorFullbodyAvatars[branch];
}

export default advisorFullbodyAvatars;
