/**
 * 神煞規則驗證器
 */

import type { ShenshaRuleDefinition, ShenshaRule } from './shenshaTypes';

// 合法天干
const VALID_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 合法地支
const VALID_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 合法錨點
const VALID_ANCHORS = ['dayStem', 'yearBranch', 'monthBranch', 'dayBranch', 'hourBranch', 'anyBranch', 'combo', 'dayPillar'];

// 合法分類
const VALID_CATEGORIES = ['吉神', '凶煞', '桃花', '特殊'];

// 合法稀有度
const VALID_RARITIES = ['SSR', 'SR', 'R', 'N'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 驗證單個神煞規則定義
 */
export function validateShenshaRule(rule: ShenshaRuleDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必填欄位檢查
  if (!rule.name) {
    errors.push('缺少 name 欄位');
  }

  if (typeof rule.enabled !== 'boolean') {
    errors.push('enabled 必須是布林值');
  }

  if (typeof rule.priority !== 'number') {
    errors.push('priority 必須是數字');
  }

  if (!VALID_CATEGORIES.includes(rule.category)) {
    errors.push(`category 必須是 ${VALID_CATEGORIES.join('/')} 之一`);
  }

  if (!VALID_RARITIES.includes(rule.rarity)) {
    errors.push(`rarity 必須是 ${VALID_RARITIES.join('/')} 之一`);
  }

  if (!Array.isArray(rule.rules) || rule.rules.length === 0) {
    errors.push('rules 必須是非空陣列');
  }

  // 驗證每條規則
  rule.rules?.forEach((r, index) => {
    const ruleErrors = validateSingleRule(r, index);
    errors.push(...ruleErrors);
  });

  // 警告檢查
  if (!rule.effect) {
    warnings.push('建議填寫 effect 欄位');
  }

  if (!rule.modernMeaning) {
    warnings.push('建議填寫 modernMeaning 欄位');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 驗證單條規則
 */
function validateSingleRule(rule: ShenshaRule, index: number): string[] {
  const errors: string[] = [];
  const prefix = `rules[${index}]`;

  if (!VALID_ANCHORS.includes(rule.anchor)) {
    errors.push(`${prefix}.anchor 必須是 ${VALID_ANCHORS.join('/')} 之一`);
  }

  if (!rule.rule_ref) {
    errors.push(`${prefix}.rule_ref 必填，請標記規則來源`);
  }

  // 驗證 table
  if (rule.table && typeof rule.table === 'object' && !Array.isArray(rule.table)) {
    Object.entries(rule.table).forEach(([key, value]) => {
      // 檢查 key 是否為合法天干/地支/旬
      const isValidKey = VALID_STEMS.includes(key) || 
                         VALID_BRANCHES.includes(key) || 
                         key.includes('旬');
      if (!isValidKey) {
        errors.push(`${prefix}.table 的 key "${key}" 不是合法的天干/地支`);
      }

      // 檢查 value 是否為合法地支/天干
      const values = Array.isArray(value) ? value : [value];
      values.forEach(v => {
        if (!VALID_BRANCHES.includes(v) && !VALID_STEMS.includes(v)) {
          errors.push(`${prefix}.table["${key}"] 的值 "${v}" 不是合法的天干/地支`);
        }
      });
    });
  }

  // combo 規則驗證
  if (rule.anchor === 'combo' && (!rule.combo || !Array.isArray(rule.combo))) {
    errors.push(`${prefix} anchor=combo 時必須提供 combo 陣列`);
  }

  return errors;
}

/**
 * 批量驗證多個神煞規則
 */
export function validateShenshaRules(rules: ShenshaRuleDefinition[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const names = new Set<string>();

  rules.forEach((rule, index) => {
    const result = validateShenshaRule(rule);
    
    result.errors.forEach(err => {
      allErrors.push(`[${rule.name || `規則${index}`}] ${err}`);
    });
    
    result.warnings.forEach(warn => {
      allWarnings.push(`[${rule.name || `規則${index}`}] ${warn}`);
    });

    // 檢查名稱唯一性
    if (names.has(rule.name)) {
      allErrors.push(`名稱 "${rule.name}" 重複`);
    }
    names.add(rule.name);
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

export default {
  validateShenshaRule,
  validateShenshaRules
};
