/**
 * 天干角色頭像映射
 * 檔名格式：{天干}_{角色名稱}.png
 */

import 甲木_森林將軍 from './甲木_森林將軍.png';
import 乙木_花蔓軍師 from './乙木_花蔓軍師.png';
import 丙火_烈日戰神 from './丙火_烈日戰神.png';
import 丁火_誓燈法師 from './丁火_誓燈法師.png';
import 戊土_山岳守護 from './戊土_山岳守護.png';
import 己土_大地母親 from './己土_大地母親.png';
import 庚金_天鍛騎士 from './庚金_天鍛騎士.png';
import 辛金_靈晶鑑定師 from './辛金_靈晶鑑定師.png';
import 壬水_龍河船長 from './壬水_龍河船長.png';
import 癸水_甘露天使 from './癸水_甘露天使.png';

// 天干到頭像的映射
export const commanderAvatars: Record<string, string> = {
  '甲': 甲木_森林將軍,
  '乙': 乙木_花蔓軍師,
  '丙': 丙火_烈日戰神,
  '丁': 丁火_誓燈法師,
  '戊': 戊土_山岳守護,
  '己': 己土_大地母親,
  '庚': 庚金_天鍛騎士,
  '辛': 辛金_靈晶鑑定師,
  '壬': 壬水_龍河船長,
  '癸': 癸水_甘露天使,
};

// 根據天干取得頭像
export function getCommanderAvatar(stem: string): string | undefined {
  return commanderAvatars[stem];
}

export default commanderAvatars;
