/**
 * 虹靈御所 八字 API SDK - TypeScript 類型定義
 * 
 * 此檔案導出所有 API 相關的 TypeScript 類型定義，
 * 讓開發者可以在自己的專案中直接使用這些類型。
 * 
 * @example
 * ```typescript
 * import type { 
 *   BaziCalculateRequest, 
 *   BaziV1Response,
 *   FourPillars,
 *   TenGodItem 
 * } from '@/lib/bazi-api-types';
 * ```
 */

// ============ 請求類型 ============

/** 八字計算請求參數 */
export interface BaziCalculateRequest {
  /** 姓名 */
  name: string;
  /** 性別 ('male' | 'female' | '男' | '女') */
  gender: 'male' | 'female' | '男' | '女';
  /** 出生日期 (YYYY-MM-DD) */
  birthDate: string;
  /** 出生時間 (HH:MM) */
  birthTime: string;
  /** 時區偏移（分鐘，東時區為正） */
  timezoneOffsetMinutes?: number;
  /** 出生地點經度（用於真太陽時計算） */
  longitude?: number;
  /** 是否使用真太陽時 */
  useSolarTime?: boolean;
}

/** V1 API 擴展請求參數 */
export interface BaziV1CalculateRequest extends BaziCalculateRequest {
  /** 年份（可選，用於覆蓋 birthDate） */
  year?: number;
  /** 月份（可選，用於覆蓋 birthDate） */
  month?: number;
  /** 日期（可選，用於覆蓋 birthDate） */
  day?: number;
  /** 小時（可選，用於覆蓋 birthTime） */
  hour?: number;
  /** 分鐘（可選，用於覆蓋 birthTime） */
  minute?: number;
  /** 真太陽時計算模式 */
  solarTimeMode?: 'off' | 'auto' | 'forced';
  /** 子時處理模式 */
  ziMode?: 'earlyZi' | 'lateZi' | 'splitZi';
}

// ============ 基礎資料結構 ============

/** 單柱資訊 */
export interface Pillar {
  /** 天干 */
  stem: string;
  /** 地支 */
  branch: string;
  /** 納音（可選） */
  nayin?: string;
}

/** 四柱結構 */
export interface FourPillars {
  /** 年柱 */
  year: Pillar;
  /** 月柱 */
  month: Pillar;
  /** 日柱 */
  day: Pillar;
  /** 時柱 */
  hour: Pillar;
}

/** 藏干類型 */
export type HiddenStemType = '本氣' | '中氣' | '餘氣';

/** 藏干項目 */
export interface HiddenStemItem {
  /** 天干 */
  stem: string;
  /** 藏干類型 */
  type: HiddenStemType;
  /** 力量比例 (0-1) */
  ratio: number;
}

/** 藏干結構（按柱位） */
export interface HiddenStems {
  year: HiddenStemItem[];
  month: HiddenStemItem[];
  day: HiddenStemItem[];
  hour: HiddenStemItem[];
}

/** 柱位名稱 */
export type PillarName = 'year' | 'month' | 'day' | 'hour';

/** 柱位中文名稱 */
export type PillarNameChinese = '年' | '月' | '日' | '時';

// ============ 五行與陰陽 ============

/** 五行元素 */
export type WuxingElement = '木' | '火' | '土' | '金' | '水';

/** 五行分數 */
export interface WuxingScores {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

/** 五行詳細分析 */
export interface WuxingBreakdown {
  /** 五行名稱 */
  element: WuxingElement;
  /** 總分 */
  score: number;
  /** 百分比 */
  percentage: number;
  /** 來源明細 */
  sources?: WuxingSource[];
}

/** 五行來源 */
export interface WuxingSource {
  /** 柱位 */
  pillar: PillarName;
  /** 來源類型 */
  type: 'stem' | 'branch' | 'hiddenStem';
  /** 貢獻值 */
  value: number;
}

/** 陰陽類型 */
export type YinYangType = 'yin' | 'yang';

/** 陰陽比例 */
export interface YinYangRatio {
  /** 陰比例 (0-1) */
  yin: number;
  /** 陽比例 (0-1) */
  yang: number;
  /** 陰數量 */
  yinCount: number;
  /** 陽數量 */
  yangCount: number;
}

// ============ 十神 ============

/** 十神名稱 */
export type TenGodName = 
  | '比肩' | '劫財'     // 比劫
  | '食神' | '傷官'     // 食傷
  | '正財' | '偏財'     // 財星
  | '正官' | '七殺'     // 官殺
  | '正印' | '偏印';    // 印星

/** 十神類別 */
export type TenGodCategory = '比劫' | '食傷' | '財星' | '官殺' | '印星';

/** 十神分支項目 */
export interface TenGodBranchItem {
  /** 天干 */
  stem: string;
  /** 十神 */
  tenGod: TenGodName | string;
  /** 藏干類型 */
  type: HiddenStemType;
}

/** 十神項目 */
export interface TenGodItem {
  /** 柱位 */
  pillar: PillarNameChinese | string;
  /** 天干 */
  stem: string;
  /** 十神 */
  tenGod: TenGodName | string;
  /** 地支藏干的十神（可選） */
  branchTenGods?: TenGodBranchItem[];
}

/** 十神統計 */
export interface TenGodStats {
  /** 十神名稱 */
  name: TenGodName;
  /** 類別 */
  category: TenGodCategory;
  /** 出現次數 */
  count: number;
  /** 柱位列表 */
  pillars: PillarName[];
}

// ============ 神煞 ============

/** 神煞類別 */
export type ShenshaCategory = 
  | '吉神' 
  | '凶煞' 
  | '桃花' 
  | '陰陽' 
  | '刑衝害破'
  | '其他';

/** 神煞稀有度 */
export type ShenshaRarity = 
  | 'common'     // 常見
  | 'uncommon'   // 少見
  | 'rare'       // 稀有
  | 'legendary'; // 傳奇

/** 神煞項目 */
export interface ShenshaItem {
  /** 神煞名稱 */
  name: string;
  /** 神煞類別 */
  category: ShenshaCategory | string;
  /** 效果描述 */
  effect: string;
  /** 匹配柱位 */
  matched_pillar: PillarName | string;
  /** 匹配值（干或支） */
  matched_value: string;
  /** 匹配原因 */
  why_matched: string;
  /** 稀有度 */
  rarity?: ShenshaRarity;
  /** 規則參考 */
  rule_ref?: string;
  /** 現代詮釋 */
  modern_meaning?: string;
  /** 吉凶屬性 */
  buff_or_debuff?: 'buff' | 'debuff' | 'neutral';
}

/** 神煞統計 */
export interface ShenshaStats {
  /** 吉神數量 */
  auspicious: number;
  /** 凶煞數量 */
  inauspicious: number;
  /** 總數 */
  total: number;
  /** 按類別分組 */
  byCategory: Record<ShenshaCategory, ShenshaItem[]>;
}

// ============ 納音 ============

/** 納音項目 */
export interface NayinItem {
  /** 柱位 */
  pillar: PillarName;
  /** 干支組合 */
  ganzhi: string;
  /** 納音名稱 */
  nayin: string;
  /** 納音五行 */
  element: WuxingElement;
}

// ============ 回應類型 ============

/** Legacy API 回應資料 */
export interface BaziCalculateData {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  pillars: FourPillars;
  hiddenStems: HiddenStems;
  wuxingScores: WuxingScores;
  yinyangRatio: YinYangRatio;
  tenGods?: TenGodItem[];
  shensha?: ShenshaItem[];
  calculatedAt: string;
}

/** 八字計算回應 (Legacy 格式) */
export interface BaziCalculateResponse {
  /** 是否成功 */
  success: boolean;
  /** 計算結果資料 */
  data?: BaziCalculateData;
  /** 錯誤訊息 */
  error?: string;
  /** 訊息 */
  message?: string;
}

/** V1 API 輸入回顯 */
export interface BaziV1Input {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
}

/** V1 API 分析資料 */
export interface BaziV1Analysis {
  wuxing: WuxingScores;
  yinyang: YinYangRatio;
  tenGods: TenGodItem[];
  shensha: ShenshaItem[];
}

/** V1 API 回應資料 */
export interface BaziV1Data {
  input: BaziV1Input;
  pillars: FourPillars;
  hiddenStems: HiddenStems;
  analysis: BaziV1Analysis;
}

/** V1 API 回應格式 */
export interface BaziV1Response {
  /** API 版本 */
  version: string;
  /** 時間戳記 */
  timestamp: string;
  /** 計算結果資料 */
  data: BaziV1Data;
}

// ============ 配置與錯誤 ============

/** SDK 配置選項 */
export interface BaziSDKConfig {
  /** API 金鑰 */
  apiKey: string;
  /** API 基礎 URL（預設為生產環境） */
  baseUrl?: string;
  /** 最大重試次數（預設 3） */
  maxRetries?: number;
  /** 初始重試延遲毫秒（預設 1000） */
  initialRetryDelay?: number;
  /** 請求超時毫秒（預設 30000） */
  timeout?: number;
}

/** API 錯誤碼 */
export type BaziErrorCode = 
  | 'UNAUTHORIZED'      // 401 - 未授權
  | 'FORBIDDEN'         // 403 - 禁止存取
  | 'NOT_FOUND'         // 404 - 資源不存在
  | 'RATE_LIMITED'      // 429 - 請求過於頻繁
  | 'VALIDATION_ERROR'  // 400 - 驗證錯誤
  | 'INTERNAL_ERROR'    // 500 - 內部錯誤
  | 'TIMEOUT'           // 408 - 請求超時
  | 'NETWORK_ERROR';    // 網路錯誤

/** API 錯誤資訊 */
export interface BaziErrorInfo {
  /** 錯誤訊息 */
  message: string;
  /** HTTP 狀態碼 */
  statusCode: number;
  /** 錯誤碼 */
  errorCode?: BaziErrorCode;
  /** 是否可重試 */
  retryable: boolean;
}

// ============ 軍團相關類型 ============

/** 軍團類型 */
export type LegionType = 'family' | 'growth' | 'self' | 'future';

/** 軍團角色 */
export type LegionRole = 'commander' | 'advisor' | 'lieutenant' | 'specialist';

/** 軍團成員 */
export interface LegionMember {
  /** 角色 */
  role: LegionRole;
  /** 名稱 */
  name: string;
  /** 五行 */
  element: WuxingElement;
  /** 陰陽 */
  yinyang: YinYangType;
  /** Buff 描述 */
  buff?: string;
  /** Debuff 描述 */
  debuff?: string;
}

/** 軍團資訊 */
export interface LegionInfo {
  /** 軍團類型 */
  type: LegionType;
  /** 柱位 */
  pillar: PillarName;
  /** 成員列表 */
  members: LegionMember[];
  /** 戰場（納音） */
  battlefield: string;
  /** 戰場五行 */
  battlefieldElement: WuxingElement;
}

// ============ 工具類型 ============

/** 深層唯讀 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 部分必填 */
export type PartialRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** API 回應包裝 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============ 類型守衛 ============

/** 檢查是否為有效的五行元素 */
export function isWuxingElement(value: unknown): value is WuxingElement {
  return typeof value === 'string' && ['木', '火', '土', '金', '水'].includes(value);
}

/** 檢查是否為有效的十神名稱 */
export function isTenGodName(value: unknown): value is TenGodName {
  return typeof value === 'string' && [
    '比肩', '劫財', '食神', '傷官', 
    '正財', '偏財', '正官', '七殺', 
    '正印', '偏印'
  ].includes(value);
}

/** 檢查是否為有效的柱位名稱 */
export function isPillarName(value: unknown): value is PillarName {
  return typeof value === 'string' && ['year', 'month', 'day', 'hour'].includes(value);
}

/** 檢查是否為 BaziAPIError */
export function isBaziAPIError(error: unknown): error is BaziErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}
