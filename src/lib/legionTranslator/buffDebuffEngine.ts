/**
 * 命理角色轉譯模組 - Buff/Debuff 計算引擎
 * 處理十神、五行、藏干、納音、神煞的增減益計算
 */

import type {
  WuxingElement,
  BuffDebuff,
  PillarKey,
  TenGodBuffDebuff,
  ElementBuffDebuff
} from './types';
import { WUXING_BUFFS, TEN_GOD_BUFFS } from './types';
import { calculateBattlefieldEffect, getNayinBattlefield } from './nayinBattlefields';

// ==================== 五行相生相剋 ====================

const WUXING_GENERATES: Record<WuxingElement, WuxingElement> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木'
};

const WUXING_CONTROLS: Record<WuxingElement, WuxingElement> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木'
};

// 檢查五行相生關係
export function checkWuxingGenerate(from: WuxingElement, to: WuxingElement): boolean {
  return WUXING_GENERATES[from] === to;
}

// 檢查五行相剋關係
export function checkWuxingControl(controller: WuxingElement, controlled: WuxingElement): boolean {
  return WUXING_CONTROLS[controller] === controlled;
}

// ==================== 五行 Buff/Debuff ====================

export function getWuxingBuff(element: WuxingElement): ElementBuffDebuff {
  return WUXING_BUFFS[element];
}

// 計算五行互動效果
export function calculateWuxingInteraction(
  element1: WuxingElement,
  element2: WuxingElement
): { type: '相生' | '相剋' | '中立'; buff: number; description: string } {
  if (checkWuxingGenerate(element1, element2)) {
    return {
      type: '相生',
      buff: 15,
      description: `${element1}生${element2}，形成支援加成`
    };
  }
  
  if (checkWuxingGenerate(element2, element1)) {
    return {
      type: '相生',
      buff: 12,
      description: `${element2}生${element1}，獲得滋養`
    };
  }
  
  if (checkWuxingControl(element1, element2)) {
    return {
      type: '相剋',
      buff: -18,
      description: `${element1}克${element2}，形成壓制`
    };
  }
  
  if (checkWuxingControl(element2, element1)) {
    return {
      type: '相剋',
      buff: -15,
      description: `${element2}克${element1}，受到制約`
    };
  }
  
  if (element1 === element2) {
    return {
      type: '中立',
      buff: 8,
      description: `同為${element1}，形成比和`
    };
  }
  
  return {
    type: '中立',
    buff: 0,
    description: `${element1}與${element2}互不相涉`
  };
}

// ==================== 十神 Buff/Debuff ====================

export function getTenGodBuff(tenGod: string): TenGodBuffDebuff | null {
  return TEN_GOD_BUFFS[tenGod] || null;
}

// 計算十神強度（基於出現次數）
export function calculateTenGodStrength(
  tenGods: string[],
  targetGod: string
): { count: number; strength: '弱' | '中' | '強' | '過旺'; effects: BuffDebuff } {
  const count = tenGods.filter(g => g === targetGod).length;
  const godBuff = getTenGodBuff(targetGod);
  
  if (!godBuff) {
    return {
      count,
      strength: '弱',
      effects: { buff: '', buffValue: 0, debuff: '', debuffValue: 0 }
    };
  }
  
  let strength: '弱' | '中' | '強' | '過旺';
  let buffMultiplier: number;
  let debuffMultiplier: number;
  
  if (count === 0) {
    strength = '弱';
    buffMultiplier = 0;
    debuffMultiplier = 0;
  } else if (count === 1) {
    strength = '中';
    buffMultiplier = 1;
    debuffMultiplier = 0.5;
  } else if (count === 2) {
    strength = '強';
    buffMultiplier = 1.5;
    debuffMultiplier = 1;
  } else {
    strength = '過旺';
    buffMultiplier = 1.2; // 過旺反而buff降低
    debuffMultiplier = 2; // debuff加倍
  }
  
  return {
    count,
    strength,
    effects: {
      buff: godBuff.buff,
      buffValue: Math.round(godBuff.buffValue * buffMultiplier),
      debuff: godBuff.debuff,
      debuffValue: Math.round(godBuff.debuffValue * debuffMultiplier)
    }
  };
}

// ==================== 藏干 Buff/Debuff ====================

export interface HiddenStemEffect {
  isPure: boolean;
  stemCount: number;
  buff: string;
  buffValue: number;
  debuff: string;
  debuffValue: number;
  description: string;
}

export function calculateHiddenStemEffect(hiddenStems: string[]): HiddenStemEffect {
  const stemCount = hiddenStems.length;
  
  if (stemCount === 1) {
    // 單一藏干 - 專一純粹
    return {
      isPure: true,
      stemCount,
      buff: '專注高效，個性純粹明確',
      buffValue: 15,
      debuff: '視野侷限，缺乏變通',
      debuffValue: -8,
      description: '藏干純粹，軍師個性專一穩定，策劃風格明確高效'
    };
  } else if (stemCount === 2) {
    // 雙藏干 - 適度複雜
    return {
      isPure: false,
      stemCount,
      buff: '雙重智囊，兼顧多面',
      buffValue: 12,
      debuff: '偶有矛盾，需要協調',
      debuffValue: -6,
      description: '藏干雙氣，軍師具備雙重思維，應變能力較強'
    };
  } else {
    // 多重藏干 - 複雜多變
    return {
      isPure: false,
      stemCount,
      buff: '多謀多策，資源豐富，應變能力強',
      buffValue: 18,
      debuff: '內在矛盾，決策遲疑，意見分歧',
      debuffValue: -15,
      description: '藏干複雜，軍師心中多層智囊，變化萬端但也容易自相矛盾'
    };
  }
}

// ==================== 納音戰場 Buff/Debuff ====================

export interface BattlefieldEffect {
  nayin: string;
  element: WuxingElement;
  generalEffect: { buff: number; description: string };
  strategistEffect: { buff: number; description: string };
  overallBuff: number;
  overallDescription: string;
}

export function calculateBattlefieldEffects(
  nayin: string,
  generalElement: WuxingElement,
  strategistElement: WuxingElement
): BattlefieldEffect | null {
  const battlefield = getNayinBattlefield(nayin);
  if (!battlefield) return null;
  
  const generalEffect = calculateBattlefieldEffect(battlefield, generalElement);
  const strategistEffect = calculateBattlefieldEffect(battlefield, strategistElement);
  
  const overallBuff = Math.round((generalEffect.buff + strategistEffect.buff) / 2);
  
  let overallDescription: string;
  if (overallBuff > 10) {
    overallDescription = `${battlefield.name}戰場對軍團形成順風局，整體戰力獲得提升`;
  } else if (overallBuff < -10) {
    overallDescription = `${battlefield.name}戰場對軍團形成逆風局，需克服環境挑戰`;
  } else {
    overallDescription = `${battlefield.name}戰場對軍團影響中性，需靠自身實力取勝`;
  }
  
  return {
    nayin,
    element: battlefield.element,
    generalEffect,
    strategistEffect,
    overallBuff,
    overallDescription
  };
}

// ==================== 神煞 Buff/Debuff ====================

export interface ShenshaEffect {
  name: string;
  type: '吉神' | '凶神' | '特殊';
  buff: string;
  buffValue: number;
  debuff: string;
  debuffValue: number;
  pillarEffect: string;
  narrativeHook: string;
}

export function calculateShenshaEffect(
  shenshaData: {
    name: string;
    type: '吉神' | '凶神' | '特殊';
    buff?: string;
    debuff?: string;
    pillar_meaning?: Record<string, string>;
  },
  pillarKey: PillarKey
): ShenshaEffect {
  const pillarNames: Record<PillarKey, string> = {
    year: '家族軍團',
    month: '成長軍團',
    day: '本我軍團',
    hour: '未來軍團'
  };
  
  const pillarEffect = shenshaData.pillar_meaning?.[pillarKey] || '此神煞在該柱發揮作用';
  
  // 根據神煞類型設定基礎值
  let baseBuff: number;
  let baseDebuff: number;
  
  switch (shenshaData.type) {
    case '吉神':
      baseBuff = 20;
      baseDebuff = -5;
      break;
    case '凶神':
      baseBuff = 5;
      baseDebuff = -20;
      break;
    case '特殊':
      baseBuff = 15;
      baseDebuff = -12;
      break;
    default:
      baseBuff = 10;
      baseDebuff = -10;
  }
  
  const narrativeHook = shenshaData.type === '吉神'
    ? `${shenshaData.name}降臨${pillarNames[pillarKey]}，帶來${shenshaData.buff || '正面加持'}`
    : shenshaData.type === '凶神'
    ? `${shenshaData.name}影響${pillarNames[pillarKey]}，需警惕${shenshaData.debuff || '潛在風險'}`
    : `${shenshaData.name}現身${pillarNames[pillarKey]}，帶來雙面影響`;
  
  return {
    name: shenshaData.name,
    type: shenshaData.type,
    buff: shenshaData.buff || '特殊加成',
    buffValue: baseBuff,
    debuff: shenshaData.debuff || '潛在風險',
    debuffValue: baseDebuff,
    pillarEffect,
    narrativeHook
  };
}

// ==================== 軍團內部和諧度計算 ====================

export function calculateInternalHarmony(
  generalElement: WuxingElement,
  strategistElement: WuxingElement,
  hiddenStems: string[],
  tenGods: string[]
): { harmony: number; description: string } {
  let harmony = 50; // 基礎中性值
  
  // 主將與軍師的五行互動
  const interaction = calculateWuxingInteraction(generalElement, strategistElement);
  if (interaction.type === '相生') {
    harmony += 25;
  } else if (interaction.type === '相剋') {
    harmony -= 30;
  }
  
  // 藏干複雜度影響
  const hiddenEffect = calculateHiddenStemEffect(hiddenStems);
  if (hiddenEffect.isPure) {
    harmony += 10;
  } else if (hiddenEffect.stemCount >= 3) {
    harmony -= 15;
  }
  
  // 十神平衡度
  const tenGodSet = new Set(tenGods);
  if (tenGodSet.size >= 4) {
    harmony += 5; // 多樣性加分
  }
  
  // 確保範圍在 -100 到 100 之間
  harmony = Math.max(-100, Math.min(100, harmony));
  
  let description: string;
  if (harmony >= 70) {
    description = '軍團內部高度和諧，主將軍師配合默契，戰力倍增';
  } else if (harmony >= 30) {
    description = '軍團內部運作順暢，偶有小摩擦但不影響大局';
  } else if (harmony >= -30) {
    description = '軍團內部存在分歧，需要協調各方意見';
  } else if (harmony >= -70) {
    description = '軍團內部矛盾較大，主將軍師理念衝突';
  } else {
    description = '軍團內部嚴重對立，內耗嚴重影響戰力';
  }
  
  return { harmony, description };
}

// ==================== 綜合 Buff/Debuff 計算 ====================

export interface ComprehensiveBuffResult {
  totalBuff: number;
  totalDebuff: number;
  netEffect: number;
  breakdown: {
    wuxing: { buff: number; debuff: number };
    tenGod: { buff: number; debuff: number };
    hiddenStem: { buff: number; debuff: number };
    battlefield: { buff: number; debuff: number };
    shensha: { buff: number; debuff: number };
  };
  summary: string;
}

export function calculateComprehensiveBuff(params: {
  generalElement: WuxingElement;
  strategistElement: WuxingElement;
  tenGods: string[];
  hiddenStems: string[];
  nayin?: string;
  shenshaList?: Array<{ name: string; type: '吉神' | '凶神' | '特殊'; buff?: string; debuff?: string }>;
  pillarKey: PillarKey;
}): ComprehensiveBuffResult {
  const breakdown = {
    wuxing: { buff: 0, debuff: 0 },
    tenGod: { buff: 0, debuff: 0 },
    hiddenStem: { buff: 0, debuff: 0 },
    battlefield: { buff: 0, debuff: 0 },
    shensha: { buff: 0, debuff: 0 }
  };
  
  // 1. 五行效果
  const generalWuxing = getWuxingBuff(params.generalElement);
  const strategistWuxing = getWuxingBuff(params.strategistElement);
  breakdown.wuxing.buff = Math.round((generalWuxing.buffValue + strategistWuxing.buffValue) / 2);
  breakdown.wuxing.debuff = Math.round((generalWuxing.debuffValue + strategistWuxing.debuffValue) / 2);
  
  // 2. 十神效果
  const uniqueTenGods = [...new Set(params.tenGods)];
  for (const god of uniqueTenGods) {
    const strength = calculateTenGodStrength(params.tenGods, god);
    breakdown.tenGod.buff += strength.effects.buffValue;
    breakdown.tenGod.debuff += strength.effects.debuffValue;
  }
  
  // 3. 藏干效果
  const hiddenEffect = calculateHiddenStemEffect(params.hiddenStems);
  breakdown.hiddenStem.buff = hiddenEffect.buffValue;
  breakdown.hiddenStem.debuff = hiddenEffect.debuffValue;
  
  // 4. 納音戰場效果
  if (params.nayin) {
    const battlefieldEffects = calculateBattlefieldEffects(
      params.nayin,
      params.generalElement,
      params.strategistElement
    );
    if (battlefieldEffects) {
      const avgEffect = battlefieldEffects.overallBuff;
      if (avgEffect > 0) {
        breakdown.battlefield.buff = avgEffect;
      } else {
        breakdown.battlefield.debuff = avgEffect;
      }
    }
  }
  
  // 5. 神煞效果
  if (params.shenshaList) {
    for (const shensha of params.shenshaList) {
      const effect = calculateShenshaEffect(shensha, params.pillarKey);
      breakdown.shensha.buff += effect.buffValue;
      breakdown.shensha.debuff += effect.debuffValue;
    }
  }
  
  // 計算總計
  const totalBuff = Object.values(breakdown).reduce((sum, cat) => sum + cat.buff, 0);
  const totalDebuff = Object.values(breakdown).reduce((sum, cat) => sum + cat.debuff, 0);
  const netEffect = totalBuff + totalDebuff;
  
  // 生成摘要
  let summary: string;
  if (netEffect >= 50) {
    summary = '軍團整體實力強勁，各方面加成顯著，戰力充沛';
  } else if (netEffect >= 20) {
    summary = '軍團整體表現良好，優勢大於劣勢，具備競爭力';
  } else if (netEffect >= -20) {
    summary = '軍團整體平衡，優劣勢相當，需謹慎應對';
  } else if (netEffect >= -50) {
    summary = '軍團面臨挑戰較多，需揚長避短，審慎行動';
  } else {
    summary = '軍團處境艱難，需克服重重困難，逆境求生';
  }
  
  return {
    totalBuff,
    totalDebuff,
    netEffect,
    breakdown,
    summary
  };
}
