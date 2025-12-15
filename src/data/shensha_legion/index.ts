/**
 * 神煞規則索引 - 軍團版 (shensha_legion)
 * 繼承傳統版並添加特化規則（共14個軍團特有神煞）
 */

import { tradRules } from '../shensha_trad';
import qiangTaohua from './qiang_taohua.json';
import shuangGuiren from './shuang_guiren.json';
import jixingGaozhao from './jixing_gaozhao.json';
import yimaFenxing from './yima_fenxing.json';
import wenchangHuagai from './wenchang_huagai.json';
import hongluanTianxi from './hongluan_tianxi.json';
import guchenGuasu from './guchen_guasu.json';
import yangrenQisha from './yangren_qisha.json';
import kongwangShuangkong from './kongwang_shuangkong.json';
import kuigangChongchong from './kuigang_chongchong.json';
import tianluoDiwang from './tianluo_diwang.json';
import liuheGuiren from './liuhe_guiren.json';
import sanheGuiju from './sanhe_guiju.json';
import fudeGuiren from './fude_guiren.json';

import type { ShenshaRuleDefinition } from '../shenshaTypes';

// 軍團版特有規則（14個）
const legionOnlyRules: ShenshaRuleDefinition[] = [
  qiangTaohua as unknown as ShenshaRuleDefinition,
  shuangGuiren as unknown as ShenshaRuleDefinition,
  jixingGaozhao as unknown as ShenshaRuleDefinition,
  yimaFenxing as unknown as ShenshaRuleDefinition,
  wenchangHuagai as unknown as ShenshaRuleDefinition,
  hongluanTianxi as unknown as ShenshaRuleDefinition,
  guchenGuasu as unknown as ShenshaRuleDefinition,
  yangrenQisha as unknown as ShenshaRuleDefinition,
  kongwangShuangkong as unknown as ShenshaRuleDefinition,
  kuigangChongchong as unknown as ShenshaRuleDefinition,
  tianluoDiwang as unknown as ShenshaRuleDefinition,
  liuheGuiren as unknown as ShenshaRuleDefinition,
  sanheGuiju as unknown as ShenshaRuleDefinition,
  fudeGuiren as unknown as ShenshaRuleDefinition
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

// 導出軍團版特有規則數量
export const legionOnlyCount = legionOnlyRules.length;

export default legionRules;
