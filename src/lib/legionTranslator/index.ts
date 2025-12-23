/**
 * 命理角色轉譯模組 - 統一導出
 * 《虹靈御所八字人生兵法》四時軍團系統
 */

// 類型導出
export * from './types';

// 角色數據
export { GAN_CHARACTERS, ZHI_CHARACTERS, getGanCharacter, getZhiCharacter, getElementColor } from './characterData';

// 納音戰場
export { NAYIN_BATTLEFIELDS, getNayinBattlefield, getNayinElement, calculateBattlefieldEffect } from './nayinBattlefields';

// Buff/Debuff 引擎
export {
  getWuxingBuff,
  getTenGodBuff,
  calculateWuxingInteraction,
  calculateTenGodStrength,
  calculateHiddenStemEffect,
  calculateBattlefieldEffects,
  calculateShenshaEffect,
  calculateInternalHarmony,
  calculateComprehensiveBuff,
  checkWuxingGenerate,
  checkWuxingControl
} from './buffDebuffEngine';

// 核心轉譯器
export { translatePillarToLegion, translateBaziToArmy, generateLegionNarrative, translateBazi } from './translator';
