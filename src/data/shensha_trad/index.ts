/**
 * 神煞規則索引 - 傳統版 (shensha_trad)
 * 自動導出所有傳統版神煞規則
 */

import tianyiGuiren from './tianyi_guiren.json';
import wenchangGuiren from './wenchang_guiren.json';
import taijiGuiren from './taiji_guiren.json';
import taohua from './taohua.json';
import yima from './yima.json';
import yangren from './yangren.json';
import tiande from './tiande.json';
import yuede from './yuede.json';
import hongluan from './hongluan.json';
import tianxi from './tianxi.json';
import guchen from './guchen.json';
import guasu from './guasu.json';
import jiesha from './jiesha.json';
import wangshen from './wangshen.json';
import zaisha from './zaisha.json';
import huagai from './huagai.json';
import jiangxing from './jiangxing.json';
import kongwang from './kongwang.json';
import kuigang from './kuigang.json';
import xianchi from './xianchi.json';

import type { ShenshaRuleDefinition } from '../shenshaTypes';

// 傳統版神煞規則列表
export const tradRules: ShenshaRuleDefinition[] = [
  tianyiGuiren,
  wenchangGuiren,
  taijiGuiren,
  taohua,
  yima,
  yangren,
  tiande,
  yuede,
  hongluan,
  tianxi,
  guchen,
  guasu,
  jiesha,
  wangshen,
  zaisha,
  huagai,
  jiangxing,
  kongwang,
  kuigang,
  xianchi
] as ShenshaRuleDefinition[];

// 按名稱索引
export const tradRulesByName: Record<string, ShenshaRuleDefinition> = {};
tradRules.forEach(rule => {
  tradRulesByName[rule.name] = rule;
});

export default tradRules;
