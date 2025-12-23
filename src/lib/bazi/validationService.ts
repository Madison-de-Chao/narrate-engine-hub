/**
 * RSBZS ValidationService
 * 後端嚴格驗證服務，防禦錯誤數據污染核心計算
 * 
 * Phase 2: QA 驗證層
 */

import type { BirthLocalInput, ValidationError, ValidationResult, SolarTimeMode, ZiMode } from "@/types/bazi";

// ============================================
// 驗證常量
// ============================================

const VALID_SOLAR_TIME_MODES: SolarTimeMode[] = ["NONE", "LMT", "TST"];
const VALID_ZI_MODES: ZiMode[] = ["EARLY", "LATE"];
const VALID_DAY_BOUNDARY_MODES = ["CIVIL_MIDNIGHT", "SOLAR_MIDNIGHT"];

// 支援的年份範圍（與節氣資料庫對齊）
const MIN_YEAR = 1850;
const MAX_YEAR = 2100;

// 時區偏移範圍 (UTC-14 to UTC+14)
const MIN_TZ_OFFSET = -840;
const MAX_TZ_OFFSET = 840;

// ============================================
// 核心驗證函式
// ============================================

/**
 * 完整驗證八字輸入資料
 * 
 * 驗證順序：
 * 1. 必填欄位檢查
 * 2. 基礎範圍驗證
 * 3. 日期合法性（閏年/大小月）
 * 4. 時區合理性
 * 5. 經緯度範圍
 * 6. 模式相依性
 * 7. 邏輯一致性
 */
export function validateBaziInputStrict(input: BirthLocalInput): ValidationResult {
  const errors: ValidationError[] = [];

  // === 1. 基礎日期時間範圍驗證 ===
  
  if (!Number.isInteger(input.year) || input.year < MIN_YEAR || input.year > MAX_YEAR) {
    errors.push({ 
      field: "year", 
      message: `年份必須是整數且在 ${MIN_YEAR}-${MAX_YEAR} 之間` 
    });
  }

  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    errors.push({ field: "month", message: "月份必須是 1-12 的整數" });
  }

  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 31) {
    errors.push({ field: "day", message: "日期必須是 1-31 的整數" });
  }

  if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23) {
    errors.push({ field: "hour", message: "時必須是 0-23 的整數" });
  }

  if (!Number.isInteger(input.minute) || input.minute < 0 || input.minute > 59) {
    errors.push({ field: "minute", message: "分必須是 0-59 的整數" });
  }

  if (input.second !== undefined) {
    if (!Number.isInteger(input.second) || input.second < 0 || input.second > 59) {
      errors.push({ field: "second", message: "秒必須是 0-59 的整數" });
    }
  }

  // === 2. 日期合法性檢查（處理閏年/大小月）===
  
  // 只有當年月日都在合理範圍內才進行日期合法性檢查
  if (errors.length === 0 || !errors.some(e => ["year", "month", "day"].includes(e.field))) {
    const checkDate = new Date(input.year, input.month - 1, input.day);
    if (
      checkDate.getFullYear() !== input.year ||
      checkDate.getMonth() !== input.month - 1 ||
      checkDate.getDate() !== input.day
    ) {
      errors.push({ 
        field: "day", 
        message: `${input.year}年${input.month}月${input.day}日不是有效日期（請檢查閏年/大小月）` 
      });
    }
  }

  // === 3. 時區偏移量驗證 ===
  
  if (!Number.isInteger(input.tzOffsetMinutesEast) || 
      input.tzOffsetMinutesEast < MIN_TZ_OFFSET || 
      input.tzOffsetMinutesEast > MAX_TZ_OFFSET) {
    errors.push({ 
      field: "tzOffsetMinutesEast", 
      message: `時區偏移量必須是整數且在 ${MIN_TZ_OFFSET} ~ ${MAX_TZ_OFFSET} 分鐘之間（UTC-14 ~ UTC+14）` 
    });
  }

  // === 4. 經緯度驗證 ===
  
  if (input.longitude !== undefined) {
    if (typeof input.longitude !== 'number' || 
        !Number.isFinite(input.longitude) || 
        input.longitude < -180 || 
        input.longitude > 180) {
      errors.push({ field: "longitude", message: "經度必須是 -180 到 180 之間的有限數值" });
    }
  }

  if (input.latitude !== undefined) {
    if (typeof input.latitude !== 'number' || 
        !Number.isFinite(input.latitude) || 
        input.latitude < -90 || 
        input.latitude > 90) {
      errors.push({ field: "latitude", message: "緯度必須是 -90 到 90 之間的有限數值" });
    }
  }

  // === 5. 模式有效性驗證 ===
  
  if (!VALID_SOLAR_TIME_MODES.includes(input.solarTimeMode)) {
    errors.push({ 
      field: "solarTimeMode", 
      message: `無效的太陽時模式，必須為 ${VALID_SOLAR_TIME_MODES.join('、')}` 
    });
  }

  if (!VALID_ZI_MODES.includes(input.ziMode)) {
    errors.push({ 
      field: "ziMode", 
      message: `無效的子時模式，必須為 ${VALID_ZI_MODES.join('、')}` 
    });
  }

  if (input.dayBoundaryMode !== undefined) {
    if (!VALID_DAY_BOUNDARY_MODES.includes(input.dayBoundaryMode)) {
      errors.push({ 
        field: "dayBoundaryMode", 
        message: `無效的日柱邊界模式，必須為 ${VALID_DAY_BOUNDARY_MODES.join('、')}` 
      });
    }
  }

  // === 6. 模式相依性檢查 ===
  
  if (input.solarTimeMode !== "NONE") {
    if (input.longitude === undefined) {
      errors.push({ 
        field: "longitude", 
        message: "開啟真太陽時/平太陽時模式時，必須提供經度" 
      });
    }
  }

  // === 7. 邏輯一致性檢查 ===
  
  // 檢查時區與經度的大致一致性（容許 2 小時誤差）
  if (input.longitude !== undefined && !errors.some(e => e.field === 'longitude' || e.field === 'tzOffsetMinutesEast')) {
    const expectedTzOffset = Math.round(input.longitude / 15) * 60;
    const tzDifference = Math.abs(input.tzOffsetMinutesEast - expectedTzOffset);
    
    // 超過 2 小時差異發出警告（但不視為錯誤）
    if (tzDifference > 120) {
      // 這裡可以添加警告機制，但不阻止計算
      // 例如：極端案例如中國新疆使用 UTC+8 但經度約 E80
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 快速驗證（僅檢查必要欄位存在性）
 */
export function quickValidate(input: Partial<BirthLocalInput>): ValidationResult {
  const errors: ValidationError[] = [];
  const requiredFields: (keyof BirthLocalInput)[] = [
    'year', 'month', 'day', 'hour', 'minute', 'tzOffsetMinutesEast', 'solarTimeMode', 'ziMode'
  ];

  for (const field of requiredFields) {
    if (input[field] === undefined || input[field] === null) {
      errors.push({ field, message: `${field} 為必填欄位` });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return validateBaziInputStrict(input as BirthLocalInput);
}

/**
 * 驗證 API 請求參數
 * 用於 Edge Function 的入口驗證
 */
export function validateApiRequest(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: [{ field: 'body', message: '請求體必須是有效的 JSON 物件' }]
    };
  }

  const input = body as Record<string, unknown>;

  // 轉換並驗證
  const baziInput: Partial<BirthLocalInput> = {
    year: typeof input.year === 'number' ? input.year : undefined,
    month: typeof input.month === 'number' ? input.month : undefined,
    day: typeof input.day === 'number' ? input.day : undefined,
    hour: typeof input.hour === 'number' ? input.hour : undefined,
    minute: typeof input.minute === 'number' ? input.minute : undefined,
    second: typeof input.second === 'number' ? input.second : undefined,
    tzOffsetMinutesEast: typeof input.tzOffsetMinutesEast === 'number' ? input.tzOffsetMinutesEast : undefined,
    longitude: typeof input.longitude === 'number' ? input.longitude : undefined,
    latitude: typeof input.latitude === 'number' ? input.latitude : undefined,
    solarTimeMode: typeof input.solarTimeMode === 'string' ? input.solarTimeMode as SolarTimeMode : undefined,
    ziMode: typeof input.ziMode === 'string' ? input.ziMode as ZiMode : undefined,
  };

  return quickValidate(baziInput);
}

/**
 * 格式化驗證錯誤為 API 回應格式
 */
export function formatValidationErrorsForApi(errors: ValidationError[]): {
  code: string;
  message: string;
  details: ValidationError[];
} {
  return {
    code: 'VALIDATION_ERROR',
    message: errors.map(e => e.message).join('; '),
    details: errors
  };
}

/**
 * 節氣邊界日期驗證
 * 用於測試套件驗證節氣邊界案例
 */
export function validateSolarTermBoundary(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  minute: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // 節氣邊界特殊驗證
  // 立春通常在 2/3-2/5 之間
  // 其他節氣的邊界檢查可依需求擴展

  const isLichunPeriod = month === 2 && day >= 3 && day <= 5;
  
  if (isLichunPeriod) {
    // 立春邊界期間，需要精確到分鐘的計算
    // 這裡只做標記，實際判斷由節氣服務處理
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 閏年驗證
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 跨日案例驗證
 * 驗證太陽時校正可能導致的跨日情況
 */
export function validateCrossDayScenario(
  hour: number, 
  minute: number, 
  longitude: number, 
  tzOffsetMinutesEast: number
): { 
  mayBeCrossDay: boolean; 
  direction: 'forward' | 'backward' | 'none';
  estimatedShiftMinutes: number;
} {
  // 計算標準子午線
  const standardMeridian = (tzOffsetMinutesEast / 60) * 15;
  
  // 計算 LMT 偏移（分鐘）
  const lmtOffsetMinutes = (longitude - standardMeridian) * 4;
  
  // 估算總偏移（加上可能的 EoT，最大約 ±16 分鐘）
  const maxEotMinutes = 16;
  const maxShift = Math.abs(lmtOffsetMinutes) + maxEotMinutes;
  
  const localMinutes = hour * 60 + minute;
  
  // 檢查是否可能跨日
  if (localMinutes + lmtOffsetMinutes + maxEotMinutes >= 1440) {
    return { mayBeCrossDay: true, direction: 'forward', estimatedShiftMinutes: maxShift };
  }
  
  if (localMinutes + lmtOffsetMinutes - maxEotMinutes < 0) {
    return { mayBeCrossDay: true, direction: 'backward', estimatedShiftMinutes: maxShift };
  }
  
  return { mayBeCrossDay: false, direction: 'none', estimatedShiftMinutes: Math.round(lmtOffsetMinutes) };
}
