/**
 * 節氣查詢服務
 * 處理時區轉換與資料來源透明度
 */

import type { SolarTermSource, SolarTermResult } from "@/types/bazi";
import keySolarTermsData from "@/data/key_solar_terms_database.json";
import preciseSolarTermsData from "@/data/solar_terms.json";
import completeSolarTermsData from "@/data/complete_solar_terms_1850_2100.json";

// ============================================
// 資料類型定義
// ============================================

interface HkoTermData {
  month: number;
  day: number;
  date: string;
  month_zhi?: string;
  description?: string;
}

interface HkoYearData {
  [termName: string]: HkoTermData;
}

interface HkoSolarTermsData {
  metadata: {
    source: string;
    coverage: string;
    total_years: number;
  };
  key_solar_terms: {
    [year: string]: HkoYearData;
  };
}

interface PreciseTermData {
  date: string;
  longitude: number;
}

interface PreciseYearData {
  [termName: string]: PreciseTermData;
}

interface PreciseSolarTermsData {
  years: {
    [year: string]: PreciseYearData;
  };
}

interface CompleteTermData {
  month: number;
  day: number;
  date: string;
  method?: string;
  confidence?: number;
}

interface CompleteYearData {
  [termName: string]: CompleteTermData;
}

interface CompleteSolarTermsData {
  metadata?: object;
  solar_terms: {
    [year: string]: CompleteYearData;
  };
}

const hkoData = keySolarTermsData as HkoSolarTermsData;
const preciseData = preciseSolarTermsData as PreciseSolarTermsData;
const completeData = completeSolarTermsData as CompleteSolarTermsData;

// ============================================
// 快取機制
// ============================================

// 簡單的記憶體快取: Map<year, Map<termName, Result>>
const termCache = new Map<number, Map<string, SolarTermResult>>();

/**
 * 清除快取
 */
export function clearSolarTermCache(): void {
  termCache.clear();
}

// ============================================
// 核心函式
// ============================================

/**
 * 解析節氣日期字串
 * 
 * 關鍵修正：不要在程式碼裡寫死 .replace(" ", "T") + "Z"
 * 必須根據資料來源的時區正確處理
 * 
 * @param rawDateStr 原始日期字串
 * @param sourceTzOffsetMinutes 資料來源的時區偏移（預設 480 = UTC+8，HKO 資料）
 * @returns 解析後的 UTC Date
 */
export function parseSolarTermDate(
  rawDateStr: string,
  sourceTzOffsetMinutes: number = 480
): Date | null {
  if (!rawDateStr) return null;

  // Case 1: ISO string with offset (e.g., "2024-02-04T16:27:00+08:00")
  if (/[+-]\d{2}:?\d{2}$/.test(rawDateStr)) {
    const parsed = new Date(rawDateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Case 2: ISO string with Z (already UTC)
  if (/[zZ]$/.test(rawDateStr)) {
    const parsed = new Date(rawDateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Case 3: Implicit Local Time (e.g., "2024-02-04 16:27" or "2024-02-04T16:27")
  // 必須當作該時區的時間，然後轉回 UTC
  const cleanStr = rawDateStr.replace(" ", "T");
  
  // 構造一個「假設它是 UTC」的時間
  const naive = new Date(`${cleanStr}Z`);
  if (Number.isNaN(naive.getTime())) return null;
  
  // 扣掉來源時區的 offset（轉回真正的 UTC）
  return new Date(naive.getTime() - sourceTzOffsetMinutes * 60 * 1000);
}

/**
 * 查詢精確節氣資料
 */
function findInPreciseJson(year: number, termName: string): Date | null {
  const yearData = preciseData.years?.[year.toString()];
  if (!yearData || !yearData[termName]) return null;
  
  // solar_terms.json 資料已經是 UTC 格式（以 Z 結尾）
  // 直接解析，不需要額外的時區轉換
  const dateStr = yearData[termName].date;
  if (!dateStr) return null;
  
  // 如果已經有時區標記（Z 或 +/-offset），直接解析
  if (/[zZ]$/.test(dateStr) || /[+-]\d{2}:?\d{2}$/.test(dateStr)) {
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // 如果沒有時區標記，假設為 UTC+8（向後兼容）
  return parseSolarTermDate(dateStr, 480);
}

/**
 * 查詢 HKO 節氣資料
 */
function findInHkoJson(year: number, termName: string): Date | null {
  const yearData = hkoData.key_solar_terms[year.toString()];
  if (!yearData || !yearData[termName]) return null;
  
  // HKO 資料僅有日期（如 "1999-01-06"），無精確時間
  // 假設為當地時間 00:00（香港 UTC+8）
  return parseSolarTermDate(yearData[termName].date, 480);
}

/**
 * 查詢完整節氣資料庫（1850-2100）
 */
function findInCompleteJson(year: number, termName: string): Date | null {
  const yearData = completeData.solar_terms?.[year.toString()];
  if (!yearData || !yearData[termName]) return null;
  
  // 完整資料僅有日期，假設為當地時間 00:00（UTC+8）
  return parseSolarTermDate(yearData[termName].date, 480);
}

/**
 * 取得節氣詳細資訊（含資料來源）
 * 
 * @param year 年份
 * @param termName 節氣名稱
 * @returns 節氣查詢結果
 */
export function getSolarTermDetail(year: number, termName: string): SolarTermResult | null {
  // 1. 查 Cache
  if (!termCache.has(year)) {
    termCache.set(year, new Map());
  }
  const yearCache = termCache.get(year)!;
  
  if (yearCache.has(termName)) {
    return yearCache.get(termName)!;
  }

  // 2. 查資料庫（按優先順序）
  let result: SolarTermResult | null = null;

  // 優先查精確資料（有精確時間）
  const preciseDate = findInPreciseJson(year, termName);
  if (preciseDate) {
    result = { dateUtc: preciseDate, source: "PRECISE_JSON", termName };
  } else {
    // Fallback 查 HKO
    const hkoDate = findInHkoJson(year, termName);
    if (hkoDate) {
      result = { dateUtc: hkoDate, source: "HKO_JSON", termName };
    } else {
      // Fallback 查完整資料庫（1850-2100）
      const completeDate = findInCompleteJson(year, termName);
      if (completeDate) {
        result = { dateUtc: completeDate, source: "HKO_JSON", termName };
      }
    }
  }

  // 3. 存入快取並回傳
  if (result) {
    yearCache.set(termName, result);
  }

  return result;
}

/**
 * 取得節氣時刻（簡化版，僅回傳 Date）
 */
export function getSolarTermUtc(year: number, termName: string): Date | null {
  const detail = getSolarTermDetail(year, termName);
  return detail?.dateUtc ?? null;
}

/**
 * 尋找最接近的節氣
 * 
 * @param dateUtc 目標 UTC 時間
 * @param termName 節氣名稱
 * @param tzOffsetMinutesEast 時區偏移
 * @returns 最接近的節氣資訊
 */
export function findNearestSolarTerm(
  dateUtc: Date,
  termName: string,
  tzOffsetMinutesEast: number
): { date: Date; year: number; source: SolarTermSource } | null {
  // 計算當地年份
  const localYear = new Date(dateUtc.getTime() + tzOffsetMinutesEast * 60 * 1000).getUTCFullYear();
  const searchYears = [localYear - 1, localYear, localYear + 1];

  let best: { date: Date; year: number; source: SolarTermSource } | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const candidateYear of searchYears) {
    const termDetail = getSolarTermDetail(candidateYear, termName);
    if (!termDetail) continue;

    const diff = Math.abs(termDetail.dateUtc.getTime() - dateUtc.getTime());
    if (diff < bestDiff) {
      best = { 
        date: termDetail.dateUtc, 
        year: candidateYear, 
        source: termDetail.source 
      };
      bestDiff = diff;
    }
  }

  return best;
}

/**
 * 節氣月支對應表（節令）
 */
export const SOLAR_TERM_BRANCH_ORDER: Array<{ term: string; branchIndex: number }> = [
  { term: "立春", branchIndex: 2 },   // 寅
  { term: "驚蟄", branchIndex: 3 },   // 卯
  { term: "清明", branchIndex: 4 },   // 辰
  { term: "立夏", branchIndex: 5 },   // 巳
  { term: "芒種", branchIndex: 6 },   // 午
  { term: "小暑", branchIndex: 7 },   // 未
  { term: "立秋", branchIndex: 8 },   // 申
  { term: "白露", branchIndex: 9 },   // 酉
  { term: "寒露", branchIndex: 10 },  // 戌
  { term: "立冬", branchIndex: 11 },  // 亥
  { term: "大雪", branchIndex: 0 },   // 子
  { term: "小寒", branchIndex: 1 }    // 丑
];

/**
 * 取得月支索引（根據節氣）
 */
export function getMonthBranchIndex(dateUtc: Date, tzOffsetMinutesEast: number): number {
  const localYear = new Date(dateUtc.getTime() + tzOffsetMinutesEast * 60 * 1000).getUTCFullYear();
  const searchYears = [localYear - 1, localYear, localYear + 1];

  const occurrences: Array<{ date: Date; branchIndex: number }> = [];

  for (const yearCandidate of searchYears) {
    for (const { term, branchIndex } of SOLAR_TERM_BRANCH_ORDER) {
      const termDate = getSolarTermUtc(yearCandidate, term);
      if (!termDate) continue;
      occurrences.push({ date: termDate, branchIndex });
    }
  }

  if (occurrences.length === 0) {
    // Fallback：使用農曆月份近似
    const localMonth = new Date(dateUtc.getTime() + tzOffsetMinutesEast * 60 * 1000).getUTCMonth() + 1;
    const fallbackMapping = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
    return fallbackMapping[localMonth] ?? 1;
  }

  // 按時間排序
  occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());

  // 找到最後一個小於等於目標時間的節氣
  for (let i = occurrences.length - 1; i >= 0; i--) {
    if (occurrences[i].date.getTime() <= dateUtc.getTime()) {
      return occurrences[i].branchIndex;
    }
  }

  return SOLAR_TERM_BRANCH_ORDER[0].branchIndex;
}
