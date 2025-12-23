/**
 * 命理角色轉譯模組 - 核心轉譯引擎
 * 將八字命盤轉換為四時軍團結構
 */

import type {
  BaziInput,
  PillarKey,
  Legion,
  LegionMember,
  FullLegionArmy,
  LegionNarrative,
  TranslationResult,
  WuxingElement
} from './types';
import { LEGION_DEFINITIONS, ROLE_POSITIONS } from './types';
import { GAN_CHARACTERS, ZHI_CHARACTERS, getGanCharacter, getZhiCharacter } from './characterData';
import { getNayinBattlefield } from './nayinBattlefields';
import { calculateComprehensiveBuff, calculateInternalHarmony, calculateHiddenStemEffect } from './buffDebuffEngine';

// 藏干數據
import hiddenStemsData from '@/data/hidden_stems.json';
import nayinData from '@/data/nayin.json';

// ==================== 核心轉譯函數 ====================

export function translatePillarToLegion(
  pillarKey: PillarKey,
  stem: string,
  branch: string,
  dayStem: string // 用於計算十神
): Legion {
  const legionInfo = LEGION_DEFINITIONS[pillarKey];
  const ganChar = getGanCharacter(stem);
  const zhiChar = getZhiCharacter(branch);
  
  if (!ganChar || !zhiChar) {
    throw new Error(`Invalid stem or branch: ${stem}, ${branch}`);
  }
  
  // 獲取藏干
  const hiddenStems = (hiddenStemsData.hiddenStems as Record<string, { stems: Array<{ stem: string; type: string }> }>)[branch]?.stems || [];
  const hiddenStemList = hiddenStems.map(h => h.stem);
  
  // 獲取納音
  const ganZhi = stem + branch;
  const nayin = (nayinData.nayin as Record<string, string>)[ganZhi] || '';
  const battlefield = getNayinBattlefield(nayin);
  
  // 構建主將
  const general: LegionMember = {
    role: 'general',
    character: ganChar,
    buffDebuffs: [{
      buff: ganChar.buff,
      buffValue: ganChar.buffValue,
      debuff: ganChar.debuff,
      debuffValue: ganChar.debuffValue
    }]
  };
  
  // 構建軍師
  const strategist: LegionMember = {
    role: 'strategist',
    character: zhiChar,
    buffDebuffs: [{
      buff: zhiChar.buff,
      buffValue: zhiChar.buffValue,
      debuff: zhiChar.debuff,
      debuffValue: zhiChar.debuffValue
    }]
  };
  
  // 構建副將（藏干主星）
  let lieutenant: LegionMember | undefined;
  if (hiddenStems.length > 0) {
    const mainHidden = hiddenStems[0];
    const lieutenantChar = getGanCharacter(mainHidden.stem);
    if (lieutenantChar) {
      lieutenant = {
        role: 'lieutenant',
        character: { ...lieutenantChar, position: 'lieutenant' },
        buffDebuffs: [{
          buff: lieutenantChar.buff,
          buffValue: Math.round(lieutenantChar.buffValue * 0.6),
          debuff: lieutenantChar.debuff,
          debuffValue: Math.round(lieutenantChar.debuffValue * 0.6)
        }]
      };
    }
  }
  
  // 構建奇謀（藏干副星）
  const specialists: LegionMember[] = hiddenStems.slice(1).map(h => {
    const specChar = getGanCharacter(h.stem);
    if (!specChar) return null;
    return {
      role: 'specialist' as const,
      character: { ...specChar, position: 'specialist' as const },
      buffDebuffs: [{
        buff: specChar.buff,
        buffValue: Math.round(specChar.buffValue * 0.4),
        debuff: specChar.debuff,
        debuffValue: Math.round(specChar.debuffValue * 0.4)
      }]
    };
  }).filter((s): s is LegionMember => s !== null);
  
  // 計算內部和諧度
  const harmony = calculateInternalHarmony(
    ganChar.element,
    zhiChar.element,
    hiddenStemList,
    [] // 十神稍後計算
  );
  
  // 計算綜合效果
  const comprehensiveBuff = calculateComprehensiveBuff({
    generalElement: ganChar.element,
    strategistElement: zhiChar.element,
    tenGods: [],
    hiddenStems: hiddenStemList,
    nayin,
    pillarKey
  });
  
  return {
    pillarKey,
    info: legionInfo,
    general,
    strategist,
    lieutenant,
    specialists,
    battlefield: battlefield || {
      name: nayin || '未知戰場',
      element: ganChar.element,
      environment: '神秘之地',
      advantages: [],
      challenges: [],
      buffCondition: '',
      debuffCondition: '',
      storyContext: ''
    },
    bingfus: [],
    totalBuff: comprehensiveBuff.totalBuff,
    totalDebuff: comprehensiveBuff.totalDebuff,
    internalHarmony: harmony.harmony,
    harmonyDescription: harmony.description
  };
}

// ==================== 完整命盤轉譯 ====================

export function translateBaziToArmy(input: BaziInput): FullLegionArmy {
  const familyLegion = translatePillarToLegion('year', input.yearStem, input.yearBranch, input.dayStem);
  const growthLegion = translatePillarToLegion('month', input.monthStem, input.monthBranch, input.dayStem);
  const selfLegion = translatePillarToLegion('day', input.dayStem, input.dayBranch, input.dayStem);
  const futureLegion = translatePillarToLegion('hour', input.hourStem, input.hourBranch, input.dayStem);
  
  return {
    familyLegion,
    growthLegion,
    selfLegion,
    futureLegion,
    interLegionRelations: [],
    overallStrength: Math.round(
      (familyLegion.totalBuff + growthLegion.totalBuff + selfLegion.totalBuff + futureLegion.totalBuff) / 4
    ),
    overallBalance: {
      distribution: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      dominant: null,
      lacking: null,
      isBalanced: true,
      analysisText: '五行分布待計算'
    },
    strategicAdvice: []
  };
}

// ==================== 敘事生成 ====================

export function generateLegionNarrative(army: FullLegionArmy): LegionNarrative {
  const generateLegionStory = (legion: Legion): string => {
    const general = legion.general.character;
    const strategist = legion.strategist.character;
    
    return `【${legion.info.name}】由${general.title}率領。這位${general.element}屬性的將領，${general.buff}，` +
      `然亦需慎防${general.debuff}。軍師${strategist.title}（屬${strategist.element}）深藏不露，` +
      `${strategist.buff}，但${strategist.debuff}或成隱患。` +
      `${legion.harmonyDescription}`;
  };
  
  return {
    opening: {
      title: '命運戰局總覽',
      content: '你的人生，就是一場軍團策略遊戲。出生時刻的時間能量化為四支軍團，' +
        '分別守護著家族、成長、本我與未來四大片區。你不是棋子，而是這場戰局的指揮官。'
    },
    legionStories: {
      year: { title: army.familyLegion.info.name, content: generateLegionStory(army.familyLegion) },
      month: { title: army.growthLegion.info.name, content: generateLegionStory(army.growthLegion) },
      day: { title: army.selfLegion.info.name, content: generateLegionStory(army.selfLegion) },
      hour: { title: army.futureLegion.info.name, content: generateLegionStory(army.futureLegion) }
    },
    relationships: {
      title: '軍團關係',
      content: '四大軍團之間相互影響，形成複雜的戰略格局。'
    },
    conclusion: {
      title: '戰略總結',
      content: '平衡各軍團能量，揚長避短，方能掌握屬於你自己的命運戰局。'
    },
    strategicFormula: '主將×軍師×戰場×技能×兵符×戰術×情境 = 人生戰役劇本'
  };
}

// ==================== 主要導出函數 ====================

export function translateBazi(input: BaziInput): TranslationResult {
  const army = translateBaziToArmy(input);
  const narrative = generateLegionNarrative(army);
  
  return {
    input,
    army,
    narrative,
    timestamp: new Date().toISOString()
  };
}
