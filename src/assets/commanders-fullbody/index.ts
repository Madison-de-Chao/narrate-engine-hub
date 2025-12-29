/**
 * 天干角色全身動態圖映射
 */

import 甲木_森林將軍_全身動態 from './甲木_森林將軍_全身動態.png';
import 乙木_花蔓軍師_全身動態 from './乙木_花蔓軍師_全身動態.png';
import 丙火_烈日戰神_全身動態 from './丙火_烈日戰神_全身動態.png';
import 丁火_誓燈法師_全身動態 from './丁火_誓燈法師_全身動態.png';
import 戊土_山岳守護_全身動態 from './戊土_山岳守護_全身動態.png';
import 己土_大地母親_全身動態 from './己土_大地母親_全身動態.png';
import 庚金_天鍛騎士_全身動態 from './庚金_天鍛騎士_全身動態.png';
import 辛金_靈晶鑑定師_全身動態 from './辛金_靈晶鑑定師_全身動態.png';
import 壬水_龍河船長_全身動態 from './壬水_龍河船長_全身動態.png';
import 癸水_甘露天使_全身動態 from './癸水_甘露天使_全身動態.png';

// 天干到全身動態圖的映射
export const commanderFullbodyAvatars: Record<string, string> = {
  '甲': 甲木_森林將軍_全身動態,
  '乙': 乙木_花蔓軍師_全身動態,
  '丙': 丙火_烈日戰神_全身動態,
  '丁': 丁火_誓燈法師_全身動態,
  '戊': 戊土_山岳守護_全身動態,
  '己': 己土_大地母親_全身動態,
  '庚': 庚金_天鍛騎士_全身動態,
  '辛': 辛金_靈晶鑑定師_全身動態,
  '壬': 壬水_龍河船長_全身動態,
  '癸': 癸水_甘露天使_全身動態,
};

export function getCommanderFullbodyAvatar(stem: string): string | undefined {
  return commanderFullbodyAvatars[stem];
}

export default commanderFullbodyAvatars;
