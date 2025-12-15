/**
 * 神煞計算器 - 使用規則引擎
 * 此模組提供向下兼容的接口，內部使用 ShenshaRuleEngine
 */

import { 
  shenshaEngine, 
  calculateShenshaSimple, 
  calculateShenshaWithEvidence,
  type ShenshaMatch 
} from './shenshaRuleEngine';
import shenshaData from '@/data/shensha.json';

// 重新導出規則引擎的類型和函數
export { 
  shenshaEngine, 
  calculateShenshaWithEvidence,
  type ShenshaMatch 
};

/**
 * 計算神煞（向下兼容接口）
 * @param dayStem 日干
 * @param yearBranch 年支
 * @param monthBranch 月支  
 * @param dayBranch 日支
 * @param hourBranch 時支
 * @returns 神煞名稱列表
 */
export function calculateShensha(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): string[] {
  return calculateShenshaSimple(dayStem, yearBranch, monthBranch, dayBranch, hourBranch);
}

/**
 * 獲取神煞的詳細資訊
 */
export function getShenshaInfo(shensha: string) {
  // 先嘗試從規則引擎獲取
  const rules = shenshaEngine.calculate({
    dayStem: '甲', // dummy values for lookup
    yearBranch: '子',
    monthBranch: '子', 
    dayBranch: '子',
    hourBranch: '子'
  });
  
  // 從原始數據查找詳細信息
  // 查找吉神
  const jiShen = shenshaData.吉神[shensha as keyof typeof shenshaData.吉神];
  if (jiShen) {
    return {
      類型: '吉神',
      ...jiShen
    };
  }

  // 查找凶煞
  const xiongSha = shenshaData.凶煞[shensha as keyof typeof shenshaData.凶煞];
  if (xiongSha) {
    return {
      類型: '凶煞',
      ...xiongSha
    };
  }

  // 查找桃花
  const taoHua = shenshaData.桃花[shensha as keyof typeof shenshaData.桃花];
  if (taoHua) {
    return {
      類型: '桃花',
      ...taoHua
    };
  }

  // 查找特殊神煞
  const teShu = shenshaData.特殊神煞[shensha as keyof typeof shenshaData.特殊神煞];
  if (teShu) {
    return {
      類型: '特殊',
      ...teShu
    };
  }

  return null;
}
