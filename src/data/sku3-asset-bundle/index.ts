/**
 * RSBZS v3.0 - SKU 3 Asset Bundle
 * 紅鸞八字系統資產包索引
 * 
 * 此資產包包含所有八字計算所需的核心數據檔案
 * 可作為獨立 SKU 授權使用
 */

// === 核心計算數據 ===
import ganZhi from '../gan_zhi.json';
import hiddenStems from '../hidden_stems.json';
import nayin from '../nayin.json';
import tenGods from '../ten_gods.json';
import fiveRats from '../five_rats.json';
import fiveTigers from '../five_tigers.json';

// === 節氣數據 ===
import solarTerms from '../solar_terms.json';
import hkoSolarTerms from '../hko_solar_terms.json';
import completeSolarTerms from '../complete_solar_terms_1850_2100.json';
import keySolarTermsDatabase from '../key_solar_terms_database.json';

// === 神煞數據 ===
import shenshaRules from '../shensha_rules.json';
import shenshaComplete from '../shensha_complete.json';
import { tradRules, tradRulesByName } from '../shensha_trad/index';
import { legionRules, legionRulesByName } from '../shensha_legion/index';

// === 角色與提示詞 ===
import characters from '../characters.json';
import prompts from '../prompts.json';

// === 學院課程 ===
import { BAZI_LESSONS, LEGION_LESSONS, WUXING_LESSONS, TENGODS_LESSONS, SHENSHA_LESSONS, NAYIN_LESSONS } from '../academyLessons';

// === 類型定義 ===
export interface AssetBundleManifest {
  version: string;
  sku: string;
  buildDate: string;
  assets: {
    core: string[];
    solarTerms: string[];
    shensha: string[];
    content: string[];
  };
}

// === 資產包清單 ===
export const ASSET_BUNDLE_MANIFEST: AssetBundleManifest = {
  version: '3.0.0',
  sku: 'RSBZS-SKU3',
  buildDate: new Date().toISOString().split('T')[0],
  assets: {
    core: [
      'gan_zhi.json',
      'hidden_stems.json',
      'nayin.json',
      'ten_gods.json',
      'five_rats.json',
      'five_tigers.json',
    ],
    solarTerms: [
      'solar_terms.json',
      'hko_solar_terms.json',
      'complete_solar_terms_1850_2100.json',
      'key_solar_terms_database.json',
    ],
    shensha: [
      'shensha_rules.json',
      'shensha_complete.json',
      'shensha_trad/*',
      'shensha_legion/*',
    ],
    content: [
      'characters.json',
      'prompts.json',
      'academyLessons.ts',
    ],
  },
};

// === 統一導出 ===
export const CoreAssets = {
  ganZhi,
  hiddenStems,
  nayin,
  tenGods,
  fiveRats,
  fiveTigers,
};

export const SolarTermAssets = {
  solarTerms,
  hkoSolarTerms,
  completeSolarTerms,
  keySolarTermsDatabase,
};

export const ShenshaAssets = {
  shenshaRules,
  shenshaComplete,
  tradRules,
  tradRulesByName,
  legionRules,
  legionRulesByName,
};

export const ContentAssets = {
  characters,
  prompts,
  lessons: {
    bazi: BAZI_LESSONS,
    legion: LEGION_LESSONS,
    wuxing: WUXING_LESSONS,
    tenGods: TENGODS_LESSONS,
    shensha: SHENSHA_LESSONS,
    nayin: NAYIN_LESSONS,
  },
};

// === 完整資產包 ===
export const SKU3AssetBundle = {
  manifest: ASSET_BUNDLE_MANIFEST,
  core: CoreAssets,
  solarTerms: SolarTermAssets,
  shensha: ShenshaAssets,
  content: ContentAssets,
};

// === 版本資訊 ===
export const RSBZS_VERSION = {
  major: 3,
  minor: 0,
  patch: 0,
  full: '3.0.0',
  codename: 'RSBZS',
  displayName: 'RSBZS v3.0',
  copyright: '© 2024 虹靈御所',
};

export default SKU3AssetBundle;
