/**
 * 八字輸入驗證服務
 * 後端嚴格驗證，防禦錯誤數據污染核心計算
 */

import type { BirthLocalInput, ValidationError, ValidationResult } from "@/types/bazi";

/**
 * 驗證八字輸入資料
 */
export function validateBaziInput(input: BirthLocalInput): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 基礎日期時間範圍驗證
  if (input.year < 1850 || input.year > 2100) {
    errors.push({ field: "year", message: "年份必須在 1850-2100 之間" });
  }

  if (input.month < 1 || input.month > 12) {
    errors.push({ field: "month", message: "月份必須在 1-12 之間" });
  }

  if (input.day < 1 || input.day > 31) {
    errors.push({ field: "day", message: "日期必須在 1-31 之間" });
  }

  if (input.hour < 0 || input.hour > 23) {
    errors.push({ field: "hour", message: "時必須在 0-23 之間" });
  }

  if (input.minute < 0 || input.minute > 59) {
    errors.push({ field: "minute", message: "分必須在 0-59 之間" });
  }

  if (input.second !== undefined && (input.second < 0 || input.second > 59)) {
    errors.push({ field: "second", message: "秒必須在 0-59 之間" });
  }

  // 2. 日期合法性檢查（處理閏年/大小月）
  // 利用 Date 物件自動修正特性：如果輸入 2/30，Date 會變 3/x，就不相等
  const checkDate = new Date(input.year, input.month - 1, input.day);
  if (
    checkDate.getFullYear() !== input.year ||
    checkDate.getMonth() !== input.month - 1 ||
    checkDate.getDate() !== input.day
  ) {
    errors.push({ field: "day", message: "無效的日期（例如閏年錯誤或該月無此日）" });
  }

  // 3. 時區偏移量驗證
  // UTC-14 (Line Islands) 到 UTC+14 (Line Islands)
  if (input.tzOffsetMinutesEast < -840 || input.tzOffsetMinutesEast > 840) {
    errors.push({ 
      field: "tzOffsetMinutesEast", 
      message: "時區偏移量超出合理範圍（-840 ~ +840 分鐘，即 UTC-14 ~ UTC+14）" 
    });
  }

  // 4. 經緯度驗證
  if (input.longitude !== undefined) {
    if (input.longitude < -180 || input.longitude > 180) {
      errors.push({ field: "longitude", message: "經度必須在 -180 到 180 之間" });
    }
  }

  if (input.latitude !== undefined) {
    if (input.latitude < -90 || input.latitude > 90) {
      errors.push({ field: "latitude", message: "緯度必須在 -90 到 90 之間" });
    }
  }

  // 5. 模式相依性檢查
  if (input.solarTimeMode !== "NONE") {
    if (input.longitude === undefined) {
      errors.push({ 
        field: "longitude", 
        message: "開啟真太陽時/平太陽時模式，必須提供經度" 
      });
    }
  }

  // 6. 太陽時模式有效性
  if (!["NONE", "LMT", "TST"].includes(input.solarTimeMode)) {
    errors.push({ 
      field: "solarTimeMode", 
      message: "無效的太陽時模式，必須為 NONE、LMT 或 TST" 
    });
  }

  // 7. 子時模式有效性
  if (!["EARLY", "LATE"].includes(input.ziMode)) {
    errors.push({ 
      field: "ziMode", 
      message: "無效的子時模式，必須為 EARLY 或 LATE" 
    });
  }

  // 8. 日柱邊界模式有效性（如果提供）
  if (input.dayBoundaryMode !== undefined) {
    if (!["CIVIL_MIDNIGHT", "SOLAR_MIDNIGHT"].includes(input.dayBoundaryMode)) {
      errors.push({ 
        field: "dayBoundaryMode", 
        message: "無效的日柱邊界模式，必須為 CIVIL_MIDNIGHT 或 SOLAR_MIDNIGHT" 
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 快速驗證（僅檢查必要欄位）
 */
export function quickValidateBaziInput(input: Partial<BirthLocalInput>): ValidationResult {
  const errors: ValidationError[] = [];

  // 必要欄位檢查
  if (input.year === undefined) {
    errors.push({ field: "year", message: "年份為必填" });
  }
  if (input.month === undefined) {
    errors.push({ field: "month", message: "月份為必填" });
  }
  if (input.day === undefined) {
    errors.push({ field: "day", message: "日期為必填" });
  }
  if (input.hour === undefined) {
    errors.push({ field: "hour", message: "時為必填" });
  }
  if (input.minute === undefined) {
    errors.push({ field: "minute", message: "分為必填" });
  }
  if (input.tzOffsetMinutesEast === undefined) {
    errors.push({ field: "tzOffsetMinutesEast", message: "時區偏移量為必填" });
  }
  if (input.solarTimeMode === undefined) {
    errors.push({ field: "solarTimeMode", message: "太陽時模式為必填" });
  }
  if (input.ziMode === undefined) {
    errors.push({ field: "ziMode", message: "子時模式為必填" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 如果必要欄位都有，進行完整驗證
  return validateBaziInput(input as BirthLocalInput);
}

/**
 * 格式化驗證錯誤為可讀訊息
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join('\n');
}
