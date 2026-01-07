/**
 * 神煞規則引擎 v3.0 - 模組化架構
 * 支援多規則集、anyBranch、combo 規則類型、完整證據鏈
 */

import { tradRules } from '@/data/shensha_trad';
import { legionRules } from '@/data/shensha_legion';
import type { 
  ShenshaRuleDefinition, 
  ShenshaRule, 
  ShenshaMatch, 
  ShenshaEvidence,
  BaziChart,
  ComboCondition
} from '@/data/shenshaTypes';
import { RARITY_CONFIG, CATEGORY_CONFIG } from '@/data/shenshaTypes';

// 規則集類型
export type RulesetType = 'trad' | 'legion';

// 向下兼容的輸入格式
export interface ShenshaInput {
  dayStem: string;
  yearBranch: string;
  monthBranch: string;
  dayBranch: string;
  hourBranch: string;
  yearStem?: string;
  monthStem?: string;
  hourStem?: string;
}

// 三合局對照表
const TRIAD_MAP: Record<string, string> = {
  '申': '申子辰', '子': '申子辰', '辰': '申子辰',
  '寅': '寅午戌', '午': '寅午戌', '戌': '寅午戌',
  '巳': '巳酉丑', '酉': '巳酉丑', '丑': '巳酉丑',
  '亥': '亥卯未', '卯': '亥卯未', '未': '亥卯未'
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
  
  // 計算在60甲子中的位置
  let jiazi = (stemIndex * 12 + branchIndex) % 60;
  if ((stemIndex % 2) !== (branchIndex % 2)) {
    jiazi = (jiazi + 30) % 60;
  }
  
  // 確定旬
  const xunIndex = Math.floor(((stemIndex - branchIndex + 60) % 10) / 2);
  const xunNames = ['甲子旬', '甲戌旬', '甲申旬', '甲午旬', '甲辰旬', '甲寅旬'];
  
  return xunNames[xunIndex] || '甲子旬';
}

/**
 * 模組化神煞引擎
 */
export class ModularShenshaEngine {
  private rules: ShenshaRuleDefinition[];
  private ruleset: RulesetType;

  constructor(ruleset: RulesetType = 'trad') {
    this.ruleset = ruleset;
    this.rules = ruleset === 'legion' ? legionRules : tradRules;
  }

  /**
   * 切換規則集
   */
  setRuleset(ruleset: RulesetType): void {
    this.ruleset = ruleset;
    this.rules = ruleset === 'legion' ? legionRules : tradRules;
  }

  /**
   * 獲取當前規則集
   */
  getRuleset(): RulesetType {
    return this.ruleset;
  }

  /**
   * 計算所有匹配的神煞
   */
  calculate(input: ShenshaInput | BaziChart): ShenshaMatch[] {
    const chart = this.normalizeInput(input);
    const matches: ShenshaMatch[] = [];

    for (const ruleDef of this.rules) {
      if (!ruleDef.enabled) continue;

      for (const rule of ruleDef.rules) {
        const evidence = this.evaluateRule(rule, chart, ruleDef);
        if (evidence) {
          matches.push({
            name: ruleDef.name,
            category: ruleDef.category,
            rarity: ruleDef.rarity,
            priority: ruleDef.priority,
            effect: ruleDef.effect,
            modernMeaning: ruleDef.modernMeaning,
            buff: ruleDef.buff,
            debuff: ruleDef.debuff,
            evidence
          });
          break; // 同一神煞只匹配一次
        }
      }
    }

    // 按優先級排序（數字越小優先級越高）
    return matches.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 標準化輸入格式
   */
  private normalizeInput(input: ShenshaInput | BaziChart): BaziChart {
    if ('year' in input && 'month' in input) {
      return input as BaziChart;
    }

    const simple = input as ShenshaInput;
    return {
      year: { stem: simple.yearStem || '', branch: simple.yearBranch },
      month: { stem: simple.monthStem || '', branch: simple.monthBranch },
      day: { stem: simple.dayStem, branch: simple.dayBranch },
      hour: { stem: simple.hourStem || '', branch: simple.hourBranch }
    };
  }

  /**
   * 評估單條規則
   */
  private evaluateRule(
    rule: ShenshaRule, 
    chart: BaziChart,
    ruleDef: ShenshaRuleDefinition
  ): ShenshaEvidence | null {
    const allBranches = [
      { value: chart.year.branch, pillar: '年支', type: 'yearBranch' },
      { value: chart.month.branch, pillar: '月支', type: 'monthBranch' },
      { value: chart.day.branch, pillar: '日支', type: 'dayBranch' },
      { value: chart.hour.branch, pillar: '時支', type: 'hourBranch' }
    ];

    const allStems = [
      { value: chart.year.stem, pillar: '年干', type: 'yearStem' },
      { value: chart.month.stem, pillar: '月干', type: 'monthStem' },
      { value: chart.day.stem, pillar: '日干', type: 'dayStem' },
      { value: chart.hour.stem, pillar: '時干', type: 'hourStem' }
    ];

    switch (rule.anchor) {
      case 'dayStem':
        return this.evaluateDayStemRule(rule, chart, allBranches);

      case 'yearBranch':
        return this.evaluateBranchRule(rule, chart.year.branch, '年支', chart, allBranches);

      case 'monthBranch':
        return this.evaluateBranchRule(rule, chart.month.branch, '月支', chart, allBranches, allStems);

      case 'dayBranch':
        return this.evaluateBranchRule(rule, chart.day.branch, '日支', chart, allBranches);

      case 'hourBranch':
        return this.evaluateBranchRule(rule, chart.hour.branch, '時支', chart, allBranches);

      case 'anyBranch':
        return this.evaluateAnyBranchRule(rule, chart, allBranches);

      case 'dayPillar':
        return this.evaluateDayPillarRule(rule, chart, allBranches);

      case 'combo':
        return this.evaluateComboRule(rule, chart, allBranches);

      default:
        return null;
    }
  }

  /**
   * 評估日干規則
   */
  private evaluateDayStemRule(
    rule: ShenshaRule,
    chart: BaziChart,
    allBranches: { value: string; pillar: string; type: string }[]
  ): ShenshaEvidence | null {
    const dayStem = chart.day.stem;
    if (!rule.table || Array.isArray(rule.table)) return null;

    const targetValues = rule.table[dayStem];
    if (!targetValues) return null;

    const targets = Array.isArray(targetValues) ? targetValues : [targetValues];

    for (const branch of allBranches) {
      if (targets.includes(branch.value)) {
        return {
          anchor_basis: `日干=${dayStem}`,
          anchor_value: dayStem,
          why_matched: `查表得[${targets.join('/')}]，四柱${branch.pillar}=${branch.value}命中`,
          rule_ref: rule.rule_ref,
          matched_pillar: branch.pillar,
          matched_value: branch.value
        };
      }
    }

    return null;
  }

  /**
   * 評估地支規則
   */
  private evaluateBranchRule(
    rule: ShenshaRule,
    anchorBranch: string,
    anchorName: string,
    chart: BaziChart,
    allBranches: { value: string; pillar: string; type: string }[],
    allStems?: { value: string; pillar: string; type: string }[]
  ): ShenshaEvidence | null {
    if (!rule.table || Array.isArray(rule.table)) return null;

    let lookupKey = anchorBranch;
    let anchorBasis = `${anchorName}=${anchorBranch}`;

    // 處理三合局查表
    if (rule.anchorType === 'triad') {
      const triad = TRIAD_MAP[anchorBranch];
      if (triad) {
        lookupKey = triad;
        anchorBasis = `${anchorName}=${anchorBranch}(${triad})`;
      }
    }

    const targetValues = rule.table[lookupKey];
    if (!targetValues) return null;

    const targets = Array.isArray(targetValues) ? targetValues : [targetValues];
    const matchTarget = rule.matchTarget || 'anyBranch';

    // 檢查地支
    if (matchTarget === 'anyBranch' || matchTarget === 'anyStemOrBranch') {
      for (const branch of allBranches) {
        if (targets.includes(branch.value)) {
          return {
            anchor_basis: anchorBasis,
            anchor_value: anchorBranch,
            why_matched: `查表得[${targets.join('/')}]，四柱${branch.pillar}=${branch.value}命中`,
            rule_ref: rule.rule_ref,
            matched_pillar: branch.pillar,
            matched_value: branch.value
          };
        }
      }
    }

    // 檢查天干
    if ((matchTarget === 'anyStem' || matchTarget === 'anyStemOrBranch') && allStems) {
      for (const stem of allStems) {
        if (stem.value && targets.includes(stem.value)) {
          return {
            anchor_basis: anchorBasis,
            anchor_value: anchorBranch,
            why_matched: `查表得[${targets.join('/')}]，四柱${stem.pillar}=${stem.value}命中`,
            rule_ref: rule.rule_ref,
            matched_pillar: stem.pillar,
            matched_value: stem.value
          };
        }
      }
    }

    return null;
  }

  /**
   * 評估 anyBranch 規則（支對支互見）
   */
  private evaluateAnyBranchRule(
    rule: ShenshaRule,
    chart: BaziChart,
    allBranches: { value: string; pillar: string; type: string }[]
  ): ShenshaEvidence | null {
    if (!rule.table || Array.isArray(rule.table)) return null;

    for (const branch1 of allBranches) {
      const targetValues = rule.table[branch1.value];
      if (!targetValues) continue;

      const targets = Array.isArray(targetValues) ? targetValues : [targetValues];

      for (const branch2 of allBranches) {
        if (branch1.pillar !== branch2.pillar && targets.includes(branch2.value)) {
          return {
            anchor_basis: `${branch1.pillar}=${branch1.value}`,
            anchor_value: branch1.value,
            why_matched: `${branch1.pillar}${branch1.value}查表得[${targets.join('/')}]，${branch2.pillar}=${branch2.value}互見命中`,
            rule_ref: rule.rule_ref,
            matched_pillar: branch2.pillar,
            matched_value: branch2.value
          };
        }
      }
    }

    return null;
  }

  /**
   * 評估日柱規則（空亡、魁罡等）
   */
  private evaluateDayPillarRule(
    rule: ShenshaRule,
    chart: BaziChart,
    allBranches: { value: string; pillar: string; type: string }[]
  ): ShenshaEvidence | null {
    const dayPillar = `${chart.day.stem}${chart.day.branch}`;

    // 特定日柱組合（魁罡）
    if (rule.anchorType === 'specific') {
      if (Array.isArray(rule.table) && rule.table.includes(dayPillar)) {
        return {
          anchor_basis: `日柱=${dayPillar}`,
          anchor_value: dayPillar,
          why_matched: `日柱${dayPillar}為特定組合（${rule.table.join('/')}之一）`,
          rule_ref: rule.rule_ref,
          matched_pillar: '日柱',
          matched_value: dayPillar
        };
      }
      return null;
    }

    // 旬空亡
    if (rule.anchorType === 'xunkong') {
      const xun = getXun(chart.day.stem, chart.day.branch);
      if (!rule.table || Array.isArray(rule.table)) return null;

      const emptyBranches = rule.table[xun];
      if (!emptyBranches) return null;

      const targets = Array.isArray(emptyBranches) ? emptyBranches : [emptyBranches];

      for (const branch of allBranches) {
        if (targets.includes(branch.value)) {
          return {
            anchor_basis: `日柱${dayPillar}(${xun})`,
            anchor_value: xun,
            why_matched: `${xun}空亡[${targets.join('/')}]，${branch.pillar}=${branch.value}落空`,
            rule_ref: rule.rule_ref,
            matched_pillar: branch.pillar,
            matched_value: branch.value
          };
        }
      }
    }

    return null;
  }

  /**
   * 評估複合規則（combo）
   */
  private evaluateComboRule(
    rule: ShenshaRule,
    chart: BaziChart,
    allBranches: { value: string; pillar: string; type: string }[]
  ): ShenshaEvidence | null {
    if (!rule.combo || rule.combo.length === 0) return null;

    // 找到基礎規則（通常是第一個 yearBranch 規則）
    const baseRule = rule.combo.find(c => c.anchor === 'yearBranch' && c.table);
    if (!baseRule || !baseRule.table) return null;

    // 獲取年支對應的目標值
    const yearBranch = chart.year.branch;
    const lookupKey = TRIAD_MAP[yearBranch] || yearBranch;
    
    // 嘗試直接查找或通過三合局查找
    let targetValues = baseRule.table[yearBranch] || baseRule.table[lookupKey];
    if (!targetValues) return null;

    const targets = Array.isArray(targetValues) ? targetValues : [targetValues];

    // 找到多柱匹配規則
    const multiMatchRule = rule.combo.find(c => c.anchor === 'multiMatch');
    const minMatch = multiMatchRule?.minMatch || 2;
    const targetPillars = multiMatchRule?.targets || ['monthBranch', 'dayBranch', 'hourBranch'];

    // 計算匹配數量
    let matchCount = 0;
    const matchedPillars: string[] = [];

    const pillarMap: Record<string, { value: string; name: string }> = {
      'yearBranch': { value: chart.year.branch, name: '年支' },
      'monthBranch': { value: chart.month.branch, name: '月支' },
      'dayBranch': { value: chart.day.branch, name: '日支' },
      'hourBranch': { value: chart.hour.branch, name: '時支' }
    };

    for (const pillarType of targetPillars) {
      const pillar = pillarMap[pillarType];
      if (pillar && targets.includes(pillar.value)) {
        matchCount++;
        matchedPillars.push(pillar.name);
      }
    }

    if (matchCount >= minMatch) {
      return {
        anchor_basis: `年支=${yearBranch}(${TRIAD_MAP[yearBranch] || yearBranch})`,
        anchor_value: yearBranch,
        why_matched: `查表得[${targets.join('/')}]，${matchedPillars.join('、')}同見（${matchCount}柱）`,
        rule_ref: rule.rule_ref,
        matched_pillar: matchedPillars.join('、'),
        matched_value: targets.join('/')
      };
    }

    return null;
  }

  /**
   * 獲取神煞詳情
   */
  getShenshaInfo(name: string): ShenshaRuleDefinition | null {
    return this.rules.find(r => r.name === name) || null;
  }

  /**
   * 按分類分組
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
   * 按稀有度分組
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

  /**
   * 獲取規則數量統計
   */
  getStats(): { total: number; byCategory: Record<string, number>; byRarity: Record<string, number> } {
    const byCategory: Record<string, number> = { '吉神': 0, '凶煞': 0, '桃花': 0, '特殊': 0 };
    const byRarity: Record<string, number> = { 'SSR': 0, 'SR': 0, 'R': 0, 'N': 0 };

    for (const rule of this.rules) {
      if (rule.enabled) {
        byCategory[rule.category]++;
        byRarity[rule.rarity]++;
      }
    }

    return {
      total: this.rules.filter(r => r.enabled).length,
      byCategory,
      byRarity
    };
  }
}

// 導出單例（向下兼容）
export const shenshaEngine = new ModularShenshaEngine('trad');

// 兵符對照表（神煞名稱到兵符定義的映射）
import { bingfuById, allBingfu, type BingfuDefinition } from '@/data/bingfu';

// 建立神煞名稱到兵符ID的映射
const shenshaToBingfuMap: Record<string, string> = {
  // 吉神
  '天乙貴人': 'tianyi_guiren',
  '文昌貴人': 'wenchang',
  '文昌': 'wenchang',
  '學堂': 'xuetang',
  '太極貴人': 'taiji_guiren',
  '天德': 'tiande',
  '月德': 'yuede',
  // 合類型沿用本體兵符
  '天德合': 'tiande',
  '月德合': 'yuede',
  '金輿': 'jinyu',
  '驛馬': 'yima',
  '將星': 'jiangxing',
  '華蓋': 'huagai',
  '天廚': 'tianchu',
  '三台': 'santai',
  '八座': 'bazuo',
  '福星': 'fuxing_guiren',
  '福星貴人': 'fuxing_guiren',
  '天官貴人': 'tianguan_guiren',
  // 凶煞
  '羊刃': 'yangren',
  '亡神': 'wangshen',
  '劫煞': 'jiesha',
  '災煞': 'zaisha',
  '六厄': 'zaiyang',
  '白虎': 'baihu',
  '天狗': 'tiangou',
  '喪門': 'sangmen',
  '披麻': 'pima',
  '官符': 'guanfu',
  '病符': 'bingfu',
  '天刑': 'tianxing',
  '五鬼': 'wugui',
  '血刃': 'baihu',
  '流霞': 'liuxia',
  // 桃花
  '桃花': 'taohuasha',
  '咸池': 'xianchi',
  '紅鸞': 'hongluan',
  '天喜': 'tianxi',
  '沐浴桃花': 'muyu_taohua',
  '紅艷': 'liuxia',
  // 陰陽
  '孤辰': 'guchen',
  '寡宿': 'guasu',
  '天羅': 'tianluo',
  '地網': 'diwang',
  '空亡': 'kongwang',
  '截路': 'tianluo',
  '旬空': 'kongwang',
  '魁罡': 'kuigang',
  '陰陽差錯': 'yinyang_chacuo',
  '四廢': 'sifei',
  '十惡大敗': 'shi_e_dabai',
  // 刑沖害破
  '子午沖': 'ziwu_chong',
  '卯酉沖': 'maoyou_chong',
  '寅申沖': 'yinshen_chong',
  '巳亥沖': 'sihai_chong',
  '辰戌沖': 'chenxu_chong',
  '丑未沖': 'chouwei_chong',
  '寅巳申三刑': 'yinsishen_xing',
  '丑戌未三刑': 'chouxuwei_xing',
  '子卯刑': 'zimao_xing',
  '辰午酉亥自刑': 'chenwu_xing',
  '子未害': 'ziwei_hai',
  '丑午害': 'chouwu_hai',
  '反吟': 'fanyin',
  '伏吟': 'fuyin',
};

/**
 * 獲取神煞對應的兵符定義
 */
export function getShenshaBingfu(shenshaName: string): BingfuDefinition | null {
  const bingfuId = shenshaToBingfuMap[shenshaName];
  if (bingfuId && bingfuById[bingfuId]) {
    return bingfuById[bingfuId];
  }
  // 嘗試模糊匹配
  const matchedBingfu = allBingfu.find(bf => 
    bf.name === shenshaName || 
    bf.alias === shenshaName ||
    shenshaName.includes(bf.name)
  );
  return matchedBingfu || null;
}

/**
 * 擴展的神煞匹配結果，包含兵符資訊
 */
export interface EnrichedShenshaMatch extends ShenshaMatch {
  bingfu?: {
    id: string;
    alias: string;
    storyFragment: string;
    legionInterpretation: BingfuDefinition['legionInterpretation'];
    effect: BingfuDefinition['effect'];
  };
}

/**
 * 計算神煞並附加兵符資訊
 */
export function calculateShenshaWithBingfu(input: ShenshaInput | BaziChart): EnrichedShenshaMatch[] {
  const engine = new ModularShenshaEngine('trad');
  const matches = engine.calculate(input);
  
  return matches.map(match => {
    const bingfuDef = getShenshaBingfu(match.name);
    const enriched: EnrichedShenshaMatch = { ...match };
    
    if (bingfuDef) {
      enriched.bingfu = {
        id: bingfuDef.id,
        alias: bingfuDef.alias,
        storyFragment: bingfuDef.storyFragment,
        legionInterpretation: bingfuDef.legionInterpretation,
        effect: bingfuDef.effect,
      };
    }
    
    return enriched;
  });
}

/**
 * 根據柱位獲取對應的兵符解讀
 */
export function getBingfuInterpretation(
  shenshaName: string, 
  pillar: 'year' | 'month' | 'day' | 'hour'
): string | null {
  const bingfu = getShenshaBingfu(shenshaName);
  if (!bingfu) return null;
  return bingfu.legionInterpretation[pillar] || null;
}

/**
 * 獲取兵符故事片段（已填充角色名稱）
 */
export function getBingfuStoryFragment(
  shenshaName: string,
  commanderName?: string,
  advisorName?: string
): string | null {
  const bingfu = getShenshaBingfu(shenshaName);
  if (!bingfu) return null;
  
  let fragment = bingfu.storyFragment;
  if (commanderName) {
    fragment = fragment.replace(/{commander}/g, commanderName);
  }
  if (advisorName) {
    fragment = fragment.replace(/{advisor}/g, advisorName);
  }
  return fragment;
}

// 向下兼容的函數接口
export function calculateShenshaWithEvidence(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
  ruleset: RulesetType = 'trad'
): ShenshaMatch[] {
  const engine = new ModularShenshaEngine(ruleset);
  return engine.calculate({
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

// 重新導出類型
export type { ShenshaMatch, ShenshaEvidence, ShenshaRuleDefinition, BaziChart };
export { RARITY_CONFIG, CATEGORY_CONFIG, bingfuById, allBingfu };
export type { BingfuDefinition };
