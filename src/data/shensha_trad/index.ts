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
// 新增吉神
import xuetang from './xuetang.json';
import jinyu from './jinyu.json';
import fuxingGuiren from './fuxing_guiren.json';
import tianchu from './tianchu.json';
import tianguanGuiren from './tianguan_guiren.json';
import tiandeHe from './tiande_he.json';
import yuedeHe from './yuede_he.json';
import santai from './santai.json';
import bazuo from './bazuo.json';
// 新增凶煞
import baihu from './baihu.json';
import tiangou from './tiangou.json';
import pima from './pima.json';
import sangmen from './sangmen.json';
import liuxia from './liuxia.json';
import guanfu from './guanfu.json';
import tianxing from './tianxing.json';
import bingfu from './bingfu.json';
import wugui from './wugui.json';
// 新增桃花/特殊
import muyuTaohua from './muyu_taohua.json';
import tianluo from './tianluo.json';
import diwang from './diwang.json';
import yinyangChacuo from './yinyang_chacuo.json';
import fuyin from './fuyin.json';
import fanyin from './fanyin.json';
import shiEDabai from './shi_e_dabai.json';
import sifei from './sifei.json';

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
  xianchi,
  // 新增吉神
  xuetang,
  jinyu,
  fuxingGuiren,
  tianchu,
  tianguanGuiren,
  tiandeHe,
  yuedeHe,
  santai,
  bazuo,
  // 新增凶煞
  baihu,
  tiangou,
  pima,
  sangmen,
  liuxia,
  guanfu,
  tianxing,
  bingfu,
  wugui,
  // 新增桃花/特殊
  muyuTaohua,
  tianluo,
  diwang,
  yinyangChacuo,
  fuyin,
  fanyin,
  shiEDabai,
  sifei
] as ShenshaRuleDefinition[];

// 按名稱索引
export const tradRulesByName: Record<string, ShenshaRuleDefinition> = {};
tradRules.forEach(rule => {
  tradRulesByName[rule.name] = rule;
});

export default tradRules;
