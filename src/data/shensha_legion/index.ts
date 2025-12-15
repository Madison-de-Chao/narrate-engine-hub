/**
 * 神煞規則索引 - 軍團版 (shensha_legion)
 * 繼承傳統版並添加特化規則
 */

import { tradRules } from '../shensha_trad';
import qiangTaohua from './qiang_taohua.json';
import type { ShenshaRuleDefinition } from '../shenshaTypes';

// 軍團版特有規則
const legionOnlyRules: ShenshaRuleDefinition[] = [
  qiangTaohua as ShenshaRuleDefinition
];

// 軍團版神煞規則列表（繼承傳統版 + 特化版本）
export const legionRules: ShenshaRuleDefinition[] = [
  ...legionOnlyRules,  // 軍團版特有規則優先
  ...tradRules         // 繼承傳統版
];

// 按名稱索引
export const legionRulesByName: Record<string, ShenshaRuleDefinition> = {};
legionRules.forEach(rule => {
  legionRulesByName[rule.name] = rule;
});

export default legionRules;
