/**
 * 八字計算引擎核心型別定義
 * 根據商業級重構規範設計
 */

// ============================================
// 1. 輸入介面定義
// ============================================

/**
 * 太陽時模式
 * - NONE: 不使用太陽時校正（使用標準時區時間）
 * - LMT: 平太陽時（Local Mean Time，僅經度補償）
 * - TST: 真太陽時（True Solar Time，經度 + 均時差補償）
 */
export type SolarTimeMode = "NONE" | "LMT" | "TST";

/**
 * 子時換日模式
 * - EARLY: 早子時（23:00 換日，傳統八字用法）
 * - LATE: 晚子時（00:00 換日，現代民用時間）
 */
export type ZiMode = "EARLY" | "LATE";

/**
 * 日柱邊界模式
 * - CIVIL_MIDNIGHT: 民用午夜（00:00 換日）
 * - SOLAR_MIDNIGHT: 太陽午夜（根據太陽時計算）
 */
export type DayBoundaryMode = "CIVIL_MIDNIGHT" | "SOLAR_MIDNIGHT";

/**
 * 明確的出生時間輸入介面
 * 解決 JS Date.getTimezoneOffset 正負號混淆問題
 */
export interface BirthLocalInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number; // 建議加入秒，避免四捨五入誤差

  /**
   * 核心修正：明確定義為「東半球偏移分鐘數」
   * UTC+8 = +480，UTC-5 = -300
   * 拒絕使用 JS Date.getTimezoneOffset() 的反向邏輯
   */
  tzOffsetMinutesEast: number;

  /** 經度（用於 LMT/TST 計算，正為東經，負為西經） */
  longitude?: number;

  /** 緯度（預留給極區日出日落計算，八字少用但建議保留） */
  latitude?: number;

  /** 太陽時模式 */
  solarTimeMode: SolarTimeMode;

  /** 子時換日模式 */
  ziMode: ZiMode;

  /** 日柱邊界模式（可選，預設 CIVIL_MIDNIGHT） */
  dayBoundaryMode?: DayBoundaryMode;
}

/**
 * 輔助函式：將 JS timezone offset 轉為 tzOffsetMinutesEast 格式
 * JS: UTC+8 = -480 -> 轉為 +480
 */
export function fromJsTimezoneOffset(jsOffset: number): number {
  return -jsOffset;
}

/**
 * 輔助函式：將 tzOffsetMinutesEast 轉為 JS timezone offset 格式
 * +480 -> -480 (JS 格式)
 */
export function toJsTimezoneOffset(tzOffsetMinutesEast: number): number {
  return -tzOffsetMinutesEast;
}

// ============================================
// 2. 真太陽時計算結果
// ============================================

/**
 * 真太陽時計算結果
 */
export interface SolarTimeResult {
  /** 校正後的時間 */
  adjusted: {
    hour: number;
    minute: number;
    second: number;
  };
  /** 跨日偏移：-1（前一天）、0（當天）、+1（隔天） */
  dayDelta: number;
  /** 調試資訊 */
  debug: {
    /** LMT 偏移（秒） */
    lmtOffsetSeconds: number;
    /** 均時差偏移（秒） */
    eotSeconds: number;
    /** 總偏移（秒） */
    totalOffsetSeconds: number;
  };
}

// ============================================
// 3. 驗證結果
// ============================================

/**
 * 驗證錯誤
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 驗證結果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// 4. 節氣資料類型
// ============================================

/**
 * 節氣資料來源
 */
export type SolarTermSource = "PRECISE_JSON" | "HKO_JSON" | "ALGORITHM_FALLBACK";

/**
 * 節氣查詢結果
 */
export interface SolarTermResult {
  dateUtc: Date;
  source: SolarTermSource;
  termName: string;
}

// ============================================
// 5. 地支互動（刑衝會合）
// ============================================

/**
 * 地支互動類型
 */
export type InteractionType = 
  | "COMBINATION_3"  // 三合
  | "COMBINATION_6"  // 六合
  | "CLASH"          // 六衝
  | "HARM"           // 六害
  | "PUNISHMENT";    // 相刑

/**
 * 地支互動結果
 */
export interface InteractionResult {
  type: InteractionType;
  name: string;           // e.g. "子午衝", "申子辰三合水局"
  branches: string[];     // 涉及的地支 e.g. ["子", "午"]
  description: string;
  // Level 2 預留欄位
  // energyChange?: { target: string; delta: number };
}

// ============================================
// 6. 四柱相關類型
// ============================================

export type PillarName = "year" | "month" | "day" | "hour";

export interface PillarDetail {
  stem: string;
  branch: string;
}

export type FourPillars = Record<PillarName, PillarDetail>;

export interface HiddenStemEntry {
  stem: string;
  weight: number;
  ratio?: number;           // 百分比 (0-100)
  type?: '本氣' | '中氣' | '餘氣';  // 藏干類型
}

// ============================================
// 7. 五行分數
// ============================================

export interface WuxingScore {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface WuxingBreakdownEntry {
  element: keyof WuxingScore;
  value: number;
  source: string;
}

// ============================================
// 8. 計算日誌
// ============================================

export interface CalculationLogs {
  year_log: string[];
  month_log: string[];
  day_log: string[];
  hour_log: string[];
  solar_terms_log: string[];
  five_elements_log: string[];
  solar_time_log?: string[];  // 新增：太陽時計算日誌
  validation_log?: string[];   // 新增：驗證日誌
}

// ============================================
// 9. 計算結果
// ============================================

/**
 * 計算元數據
 */
export interface CalculationMeta {
  /** UTC 出生時刻 */
  birthUtc: string;
  /** 校正後的太陽時（HH:MM:SS） */
  solarAdjustedTime: string;
  /** 跨日偏移 */
  dayDelta: number;
  /** 使用的太陽時模式 */
  solarMode: SolarTimeMode;
  /** 使用的子時模式 */
  ziMode: ZiMode;
  /** 節氣資料來源 */
  solarTermSource?: SolarTermSource;
}

/**
 * 完整八字計算結果
 */
export interface BaziCalculationResult {
  pillars: FourPillars;
  hiddenStems: Record<PillarName, HiddenStemEntry[]>;
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxing: WuxingScore;
  wuxingBreakdown: WuxingBreakdownEntry[];
  yinyang: {
    yang: number;
    yin: number;
  };
  fourSeasonsTeam: import('../lib/fourSeasonsAnalyzer').FourSeasonsTeam;
  /** 地支互動（刑衝會合） */
  interactions?: InteractionResult[];
  /** 計算元數據 */
  meta?: CalculationMeta;
  /** 可選的計算日誌 */
  calculationLogs?: CalculationLogs;
}

// ============================================
// 10. 常用時區預設
// ============================================

export const TIMEZONE_PRESETS = {
  /** 中國標準時間 UTC+8 */
  CHINA: 480,
  /** 台灣標準時間 UTC+8 */
  TAIWAN: 480,
  /** 日本標準時間 UTC+9 */
  JAPAN: 540,
  /** 韓國標準時間 UTC+9 */
  KOREA: 540,
  /** 香港標準時間 UTC+8 */
  HONG_KONG: 480,
  /** 新加坡標準時間 UTC+8 */
  SINGAPORE: 480,
  /** 美東標準時間 UTC-5 */
  US_EASTERN: -300,
  /** 美西標準時間 UTC-8 */
  US_PACIFIC: -480,
  /** 倫敦時間 UTC+0 */
  LONDON: 0,
} as const;

/** 中國標準時間基準經度 */
export const STANDARD_LONGITUDE_CHINA = 120;
