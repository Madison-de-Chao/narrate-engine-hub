/**
 * 神煞規則引擎 - Shensha Rule Engine v2.0
 * 支援 JSON 規則定義、優先權評估、證據鏈追蹤
 */

import shenshaRules from '@/data/shensha_rules.json';

// 類型定義
export interface ShenshaRule {
  id: string;
  name: string;
  category: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  priority: number;
  anchor: string;
  anchorType?: string;
  conditions: Record<string, string | string[]> | string[];
  matchTarget: string;
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
}

export interface ShenshaMatch {
  id: string;
  name: string;
  category: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  priority: number;
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
  evidence: {
    anchorBasis: string;
    anchorValue: string;
    matchedBranch: string;
    matchedPillar: string;
    whyMatched: string;
  };
}

export interface RarityConfig {
  color: string;
  label: string;
  weight: number;
}

export interface CategoryConfig {
  color: string;
  icon: string;
}

// 輸入參數
export interface ShenshaInput {
  dayStem: string;
  yearBranch: string;
  monthBranch: string;
  dayBranch: string;
  hourBranch: string;
  yearStem?: string;
  monthStem?: string;
  hourStem?: string;
  dayPillar?: string;
}

// 三合局對照表
const TRIAD_MAP: Record<string, string> = {
  '申': '申子辰', '子': '申子辰', '辰': '申子辰',
  '寅': '寅午戌', '午': '寅午戌', '戌': '寅午戌',
  '巳': '巳酉丑', '酉': '巳酉丑', '丑': '巳酉丑',
  '亥': '亥卯未', '卯': '亥卯未', '未': '亥卯未'
};

// 方位組對照表（用於孤辰寡宿）
const GROUP_MAP: Record<string, string> = {
  '亥': '亥子丑', '子': '亥子丑', '丑': '亥子丑',
  '寅': '寅卯辰', '卯': '寅卯辰', '辰': '寅卯辰',
  '巳': '巳午未', '午': '巳午未', '未': '巳午未',
  '申': '申酉戌', '酉': '申酉戌', '戌': '申酉戌'
};

// 六十甲子旬空對照
const XUN_MAP: Record<string, string[]> = {
  '甲子旬': ['戌', '亥'],
  '甲戌旬': ['申', '酉'],
  '甲申旬': ['午', '未'],
  '甲午旬': ['辰', '巳'],
  '甲辰旬': ['寅', '卯'],
  '甲寅旬': ['子', '丑']
};

// 獲取日柱所在旬
function getXun(dayStem: string, dayBranch: string): string {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const stemIndex = stems.indexOf(dayStem);
  const branchIndex = branches.indexOf(dayBranch);
  
  // 計算甲子序數
  let jiazi = (stemIndex - branchIndex + 60) % 60;
  if (jiazi < 0) jiazi += 60;
  
  // 確定旬
  const xunStart = Math.floor(jiazi / 10) * 10;
  const xunNames = ['甲子旬', '甲戌旬', '甲申旬', '甲午旬', '甲辰旬', '甲寅旬'];
  
  // 根據旬起始點確定旬名
  const xunIndex = [0, 10, 20, 30, 40, 50].indexOf(xunStart);
  return xunNames[xunIndex >= 0 ? xunIndex : 0];
}

/**
 * 神煞規則引擎主類
 */
export class ShenshaRuleEngine {
  private rules: ShenshaRule[];
  private rarityConfig: Record<string, RarityConfig>;
  private categoryConfig: Record<string, CategoryConfig>;

  constructor() {
    this.rules = shenshaRules.rules as ShenshaRule[];
    this.rarityConfig = shenshaRules.rarityConfig as Record<string, RarityConfig>;
    this.categoryConfig = shenshaRules.categoryConfig as Record<string, CategoryConfig>;
  }

  /**
   * 計算所有匹配的神煞
   */
  calculate(input: ShenshaInput): ShenshaMatch[] {
    const matches: ShenshaMatch[] = [];
    const allBranches = [
      { branch: input.yearBranch, pillar: '年柱' },
      { branch: input.monthBranch, pillar: '月柱' },
      { branch: input.dayBranch, pillar: '日柱' },
      { branch: input.hourBranch, pillar: '時柱' }
    ];
    
    const allStems = [
      { stem: input.yearStem || '', pillar: '年柱' },
      { stem: input.monthStem || '', pillar: '月柱' },
      { stem: input.dayStem, pillar: '日柱' },
      { stem: input.hourStem || '', pillar: '時柱' }
    ];

    for (const rule of this.rules) {
      const result = this.evaluateRule(rule, input, allBranches, allStems);
      if (result) {
        matches.push(result);
      }
    }

    // 按優先級排序
    return matches.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 評估單條規則
   */
  private evaluateRule(
    rule: ShenshaRule, 
    input: ShenshaInput, 
    allBranches: { branch: string; pillar: string }[],
    allStems: { stem: string; pillar: string }[]
  ): ShenshaMatch | null {
    let anchorValue: string | null = null;
    let targetBranches: string[] = [];
    let targetStems: string[] = [];
    let anchorBasis = '';
    const matchTarget = rule.matchTarget || 'anyBranch';

    switch (rule.anchor) {
      case 'dayStem':
        anchorValue = input.dayStem;
        anchorBasis = `日干 ${anchorValue}`;
        if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
          const condValue = rule.conditions[anchorValue];
          if (condValue) {
            targetBranches = Array.isArray(condValue) ? condValue : [condValue];
          }
        }
        break;

      case 'yearBranch':
        anchorValue = input.yearBranch;
        if (rule.anchorType === 'triad') {
          const triad = TRIAD_MAP[anchorValue];
          anchorBasis = `年支 ${anchorValue} (${triad})`;
          if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
            const condValue = rule.conditions[triad];
            if (condValue) {
              targetBranches = Array.isArray(condValue) ? condValue : [condValue];
            }
          }
        } else if (rule.anchorType === 'group') {
          const group = GROUP_MAP[anchorValue];
          anchorBasis = `年支 ${anchorValue} (${group})`;
          if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
            const condValue = rule.conditions[group];
            if (condValue) {
              targetBranches = Array.isArray(condValue) ? condValue : [condValue];
            }
          }
        } else if (rule.anchorType === 'direct') {
          anchorBasis = `年支 ${anchorValue}`;
          if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
            const condValue = rule.conditions[anchorValue];
            if (condValue) {
              targetBranches = Array.isArray(condValue) ? condValue : [condValue];
            }
          }
        }
        break;

      case 'monthBranch':
        anchorValue = input.monthBranch;
        anchorBasis = `月支 ${anchorValue}`;
        if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
          const condValue = rule.conditions[anchorValue];
          if (condValue) {
            const values = Array.isArray(condValue) ? condValue : [condValue];
            // 根據 matchTarget 決定是查天干還是地支
            if (matchTarget === 'anyStem') {
              targetStems = values;
            } else if (matchTarget === 'anyStemOrBranch') {
              targetStems = values;
              targetBranches = values;
            } else {
              targetBranches = values;
            }
          }
        }
        break;

      case 'dayPillar':
        if (rule.anchorType === 'xunkong') {
          const xun = getXun(input.dayStem, input.dayBranch);
          anchorBasis = `日柱 ${input.dayStem}${input.dayBranch} (${xun})`;
          if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
            const condValue = rule.conditions[xun];
            if (condValue) {
              targetBranches = Array.isArray(condValue) ? condValue : [condValue];
            }
          }
        }
        break;

      case 'static':
        anchorBasis = '固定條件';
        if (Array.isArray(rule.conditions)) {
          targetBranches = rule.conditions;
        }
        break;

      case 'combo':
        // 強桃花等組合規則：需要多柱同時見到桃花位
        if (rule.anchorType === 'multiMatch') {
          const triad = TRIAD_MAP[input.yearBranch];
          anchorBasis = `年支 ${input.yearBranch} (${triad}) 多柱組合`;
          if (rule.conditions && typeof rule.conditions === 'object' && !Array.isArray(rule.conditions)) {
            const condValue = rule.conditions[triad] as any;
            if (condValue && typeof condValue === 'object' && condValue.taohua) {
              const taohuaBranch = condValue.taohua;
              const requirePillars = condValue.requireMultiple || [];
              
              // 檢查是否多柱都有桃花位
              let matchCount = 0;
              const matchedPillars: string[] = [];
              
              if (requirePillars.includes('monthBranch') && input.monthBranch === taohuaBranch) {
                matchCount++;
                matchedPillars.push('月柱');
              }
              if (requirePillars.includes('dayBranch') && input.dayBranch === taohuaBranch) {
                matchCount++;
                matchedPillars.push('日柱');
              }
              if (requirePillars.includes('hourBranch') && input.hourBranch === taohuaBranch) {
                matchCount++;
                matchedPillars.push('時柱');
              }
              
              // 需要至少兩柱見到桃花
              if (matchCount >= 2) {
                return {
                  id: rule.id,
                  name: rule.name,
                  category: rule.category,
                  rarity: rule.rarity,
                  priority: rule.priority,
                  effect: rule.effect,
                  modernMeaning: rule.modernMeaning,
                  buff: rule.buff,
                  debuff: rule.debuff,
                  evidence: {
                    anchorBasis,
                    anchorValue: input.yearBranch,
                    matchedBranch: taohuaBranch,
                    matchedPillar: matchedPillars.join('、'),
                    whyMatched: `${anchorBasis} 桃花位 ${taohuaBranch}，見於 ${matchedPillars.join('、')}（${matchCount}柱同見）`
                  }
                };
              }
            }
          }
        }
        return null;
    }

    // 檢查匹配
    if (targetBranches.length === 0 && targetStems.length === 0) {
      return null;
    }

    // 檢查地支匹配
    for (const { branch, pillar } of allBranches) {
      if (targetBranches.includes(branch)) {
        return {
          id: rule.id,
          name: rule.name,
          category: rule.category,
          rarity: rule.rarity,
          priority: rule.priority,
          effect: rule.effect,
          modernMeaning: rule.modernMeaning,
          buff: rule.buff,
          debuff: rule.debuff,
          evidence: {
            anchorBasis,
            anchorValue: anchorValue || '',
            matchedBranch: branch,
            matchedPillar: pillar,
            whyMatched: `${anchorBasis} 查得 ${targetBranches.join('/')}，見於 ${pillar} ${branch}`
          }
        };
      }
    }

    // 檢查天干匹配（用於天德、月德等）
    for (const { stem, pillar } of allStems) {
      if (stem && targetStems.includes(stem)) {
        return {
          id: rule.id,
          name: rule.name,
          category: rule.category,
          rarity: rule.rarity,
          priority: rule.priority,
          effect: rule.effect,
          modernMeaning: rule.modernMeaning,
          buff: rule.buff,
          debuff: rule.debuff,
          evidence: {
            anchorBasis,
            anchorValue: anchorValue || '',
            matchedBranch: stem,
            matchedPillar: pillar,
            whyMatched: `${anchorBasis} 查得 ${targetStems.join('/')}，見於 ${pillar} 天干 ${stem}`
          }
        };
      }
    }

    return null;
  }

  /**
   * 獲取神煞詳細資訊
   */
  getShenshaInfo(id: string): ShenshaRule | null {
    return this.rules.find(r => r.id === id) || null;
  }

  /**
   * 獲取稀有度配置
   */
  getRarityConfig(rarity: string): RarityConfig | null {
    return this.rarityConfig[rarity] || null;
  }

  /**
   * 獲取分類配置
   */
  getCategoryConfig(category: string): CategoryConfig | null {
    return this.categoryConfig[category] || null;
  }

  /**
   * 按分類分組神煞
   */
  groupByCategory(matches: ShenshaMatch[]): Record<string, ShenshaMatch[]> {
    const groups: Record<string, ShenshaMatch[]> = {
      '吉神': [],
      '凶煞': [],
      '桃花': [],
      '特殊': []
    };

    for (const match of matches) {
      if (groups[match.category]) {
        groups[match.category].push(match);
      }
    }

    return groups;
  }

  /**
   * 按稀有度分組神煞
   */
  groupByRarity(matches: ShenshaMatch[]): Record<string, ShenshaMatch[]> {
    const groups: Record<string, ShenshaMatch[]> = {
      'SSR': [],
      'SR': [],
      'R': [],
      'N': []
    };

    for (const match of matches) {
      if (groups[match.rarity]) {
        groups[match.rarity].push(match);
      }
    }

    return groups;
  }
}

// 導出單例
export const shenshaEngine = new ShenshaRuleEngine();

// 向下兼容的函數接口
export function calculateShenshaWithEvidence(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): ShenshaMatch[] {
  return shenshaEngine.calculate({
    dayStem,
    yearBranch,
    monthBranch,
    dayBranch,
    hourBranch
  });
}

// 簡單的字符串列表（向下兼容）
export function calculateShenshaSimple(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): string[] {
  const matches = shenshaEngine.calculate({
    dayStem,
    yearBranch,
    monthBranch,
    dayBranch,
    hourBranch
  });
  return matches.map(m => m.name);
}
