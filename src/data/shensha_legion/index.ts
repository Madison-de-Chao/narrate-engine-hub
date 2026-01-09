/**
 * 神煞規則索引 - 軍團版已取消
 * 直接使用傳統版規則 (shensha_trad)
 */

import { tradRules, tradRulesByName } from '../shensha_trad';
import type { ShenshaRuleDefinition } from '../shenshaTypes';

// 軍團版現在直接使用傳統版規則
export const legionRules: ShenshaRuleDefinition[] = tradRules;

// 按名稱索引
export const legionRulesByName: Record<string, ShenshaRuleDefinition> = tradRulesByName;

// 軍團版特有規則數量（已取消）
export const legionOnlyCount = 0;

export default legionRules;
