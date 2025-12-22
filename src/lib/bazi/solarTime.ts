/**
 * 真太陽時計算引擎
 * 解決「真太陽時把 23:55 推到隔天 00:10」導致的日柱錯誤問題
 */

import type { SolarTimeMode, SolarTimeResult } from "@/types/bazi";

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const DEGREES_PER_HOUR = 15;
const SECONDS_PER_DEGREE = 240; // 每度 4 分鐘 = 240 秒

/**
 * 計算均時差（Equation of Time）
 * 返回值為秒，正值表示真太陽時比平太陽時快
 * 
 * @param dateUtc UTC 日期時間
 * @returns 均時差（秒）
 */
export function calculateEquationOfTimeSeconds(dateUtc: Date): number {
  // 計算年內天數 (Day of Year)
  const startOfYear = new Date(Date.UTC(dateUtc.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  
  // 使用簡化公式計算均時差
  // 更精確的公式需要天文曆算，這裡使用常用近似公式
  // B = 360 * (dayOfYear - 81) / 365 度
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180); // 轉為弧度
  
  // 均時差公式（分鐘）
  // EoT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
  const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  // 轉換為秒
  return Math.round(eotMinutes * 60);
}

/**
 * 將當地時間轉換為 UTC
 * 
 * @param local 當地時間組件
 * @param tzOffsetMinutesEast 時區偏移（東半球為正）
 * @returns UTC Date 物件
 */
export function buildLocalDateTimeUtc(
  local: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  tzOffsetMinutesEast: number
): Date {
  // 先建立 UTC 時間，然後減去時區偏移
  const utcMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second
  ) - tzOffsetMinutesEast * 60 * 1000;
  
  return new Date(utcMs);
}

/**
 * 應用太陽時校正
 * 
 * 核心修正：
 * - Day Delta: 回傳跨日偏移，解決「真太陽時把 23:55 推到隔天 00:10」導致的日柱錯誤
 * - Precision: 內部運算全用「秒」，最後才轉回時分，避免 Math.round 在節氣交界差 1 分鐘的錯誤
 * 
 * @param local 當地時間輸入
 * @param tzOffsetMinutesEast 時區偏移（東半球為正，例如 UTC+8 = 480）
 * @param longitude 經度（東經為正）
 * @param mode 太陽時模式
 * @returns 校正後的時間及跨日資訊
 */
export function applySolarTime(
  local: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  tzOffsetMinutesEast: number,
  longitude: number,
  mode: SolarTimeMode
): SolarTimeResult {
  // 不使用太陽時校正
  if (mode === "NONE") {
    return {
      adjusted: { 
        hour: local.hour, 
        minute: local.minute, 
        second: local.second 
      },
      dayDelta: 0,
      debug: { 
        lmtOffsetSeconds: 0, 
        eotSeconds: 0, 
        totalOffsetSeconds: 0 
      }
    };
  }

  // 1. 計算標準子午線（以 15 度為一時區）
  // 例如：tzOffset +480 (UTC+8) -> 標準經度 120 度
  const standardMeridian = (tzOffsetMinutesEast / 60) * DEGREES_PER_HOUR;

  // 2. 計算 LMT 偏移（秒）
  // 每度差 4 分鐘 = 240 秒
  // 經度比標準經線更東，太陽更早到達，時間應該加
  const lmtOffsetSeconds = (longitude - standardMeridian) * SECONDS_PER_DEGREE;

  // 3. 計算均時差偏移（秒）- 僅 TST 模式使用
  let eotSeconds = 0;
  if (mode === "TST") {
    // 建立 UTC 時間以計算準確的均時差
    const birthUtc = buildLocalDateTimeUtc(local, tzOffsetMinutesEast);
    eotSeconds = calculateEquationOfTimeSeconds(birthUtc);
  }

  // 4. 總偏移 & Day Delta 計算
  const totalOffsetSeconds = lmtOffsetSeconds + eotSeconds;

  // 當日總秒數（0 - 86399）
  const localTotalSeconds = 
    local.hour * SECONDS_PER_HOUR + 
    local.minute * SECONDS_PER_MINUTE + 
    local.second;

  const adjustedTotalSeconds = localTotalSeconds + totalOffsetSeconds;

  // 計算跨日 (Day Delta)
  // Math.floor(adjusted / 86400) ->
  //   例 86500 / 86400 = 1 (跨至隔天)
  //   例 -100 / 86400 = -1 (跨至前一天)
  const dayDelta = Math.floor(adjustedTotalSeconds / SECONDS_PER_DAY);

  // 正規化為 0-86399
  let normalizedSeconds = adjustedTotalSeconds % SECONDS_PER_DAY;
  if (normalizedSeconds < 0) {
    normalizedSeconds += SECONDS_PER_DAY;
  }

  // 轉換回時、分、秒
  const adjHour = Math.floor(normalizedSeconds / SECONDS_PER_HOUR);
  const adjMinute = Math.floor((normalizedSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const adjSecond = Math.round(normalizedSeconds % SECONDS_PER_MINUTE);

  return {
    adjusted: { 
      hour: adjHour, 
      minute: adjMinute, 
      second: adjSecond 
    },
    dayDelta,
    debug: { 
      lmtOffsetSeconds: Math.round(lmtOffsetSeconds), 
      eotSeconds, 
      totalOffsetSeconds: Math.round(totalOffsetSeconds) 
    }
  };
}

/**
 * 格式化太陽時結果為可讀字串
 */
export function formatSolarTimeResult(result: SolarTimeResult): string {
  const { adjusted, dayDelta, debug } = result;
  const timeStr = `${adjusted.hour.toString().padStart(2, '0')}:${adjusted.minute.toString().padStart(2, '0')}:${adjusted.second.toString().padStart(2, '0')}`;
  
  let dayStr = '';
  if (dayDelta === -1) dayStr = ' (前一天)';
  if (dayDelta === 1) dayStr = ' (隔天)';
  
  const offsetMinutes = Math.round(debug.totalOffsetSeconds / 60);
  const offsetSign = offsetMinutes >= 0 ? '+' : '';
  
  return `${timeStr}${dayStr} (偏移 ${offsetSign}${offsetMinutes} 分鐘)`;
}

/**
 * 計算經度對應的標準時區
 * @param longitude 經度
 * @returns 最接近的標準時區偏移（分鐘）
 */
export function getStandardTimezoneForLongitude(longitude: number): number {
  // 每 15 度對應 1 小時
  const hours = Math.round(longitude / 15);
  return hours * 60;
}
