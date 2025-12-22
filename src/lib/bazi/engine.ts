/**
 * 八字計算引擎 - Strict Mode 版本
 * 商業級重構：分離物理時間與鐘面時間
 */

import type {
  BirthLocalInput,
  BaziCalculationResult,
  CalculationMeta,
  CalculationLogs,
  FourPillars,
  HiddenStemEntry,
  PillarName,
  WuxingScore,
  WuxingBreakdownEntry,
} from "@/types/bazi";

import { validateBaziInput } from "./validation";
import { applySolarTime, buildLocalDateTimeUtc, formatSolarTimeResult } from "./solarTime";
import { getSolarTermUtc, findNearestSolarTerm, getMonthBranchIndex, SOLAR_TERM_BRANCH_ORDER } from "./solarTermsService";
import { detectInteractions } from "./interactions";

import ganZhiData from "@/data/gan_zhi.json";
import fiveTigersData from "@/data/five_tigers.json";
import fiveRatsData from "@/data/five_rats.json";
import nayinData from "@/data/nayin.json";
import hiddenStemsData from "@/data/hidden_stems.json";
import { getFourSeasonsTeam } from "../fourSeasonsAnalyzer";

// ============================================
// 常量定義
// ============================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_COMMAND_MULTIPLIER = 1.5;

// 基准日期: 1985-09-22 = 甲子日（權威基準，已驗證）
const BASE_DATE = new Date(Date.UTC(1985, 8, 22));
const BASE_JIAZI_INDEX = 0;

export const TIANGAN = ganZhiData.stems;
export const DIZHI = ganZhiData.branches;

export const TIANGAN_WUXING: Record<string, string> = Object.fromEntries(
  TIANGAN.map(stem => [stem, ganZhiData.stemProperties[stem].element])
);

export const DIZHI_WUXING: Record<string, string> = Object.fromEntries(
  DIZHI.map(branch => [branch, ganZhiData.branchProperties[branch].element])
);

interface HiddenStemConfig {
  stems: HiddenStemEntry[];
}

type HiddenStemsDataset = { hiddenStems: Record<string, HiddenStemConfig> };
const hiddenStems = hiddenStemsData as HiddenStemsDataset;

export const DIZHI_CANGGAN: Record<string, HiddenStemEntry[]> = Object.fromEntries(
  Object.entries(hiddenStems.hiddenStems).map(([branch, data]) => [
    branch,
    data.stems
  ])
);

const NAYIN_TABLE: Record<string, string> = nayinData.nayin;

// ============================================
// 輔助函式
// ============================================

/**
 * 獲取時支索引
 */
function getHourBranchIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;  // 子
  if (hour >= 1 && hour < 3) return 1;   // 丑
  if (hour >= 3 && hour < 5) return 2;   // 寅
  if (hour >= 5 && hour < 7) return 3;   // 卯
  if (hour >= 7 && hour < 9) return 4;   // 辰
  if (hour >= 9 && hour < 11) return 5;  // 巳
  if (hour >= 11 && hour < 13) return 6; // 午
  if (hour >= 13 && hour < 15) return 7; // 未
  if (hour >= 15 && hour < 17) return 8; // 申
  if (hour >= 17 && hour < 19) return 9; // 酉
  if (hour >= 19 && hour < 21) return 10; // 戌
  return 11; // 亥 (21-23)
}

/**
 * 計算年柱
 */
function calculateYearPillar(
  birthUtc: Date,
  tzOffsetMinutesEast: number,
  logs: CalculationLogs
): { stem: string; branch: string } {
  const lichunInfo = findNearestSolarTerm(birthUtc, "立春", tzOffsetMinutesEast);
  const localYear = new Date(birthUtc.getTime() + tzOffsetMinutesEast * 60 * 1000).getUTCFullYear();

  let actualYear = localYear;
  if (lichunInfo) {
    actualYear = birthUtc >= lichunInfo.date ? lichunInfo.year : lichunInfo.year - 1;
    logs.solar_terms_log.push(
      `立春: ${lichunInfo.date.toISOString()} (${lichunInfo.source}) → 年柱用 ${actualYear} 年`
    );
  } else {
    // Fallback: 約略在 2/4
    const approxLichun = new Date(Date.UTC(localYear, 1, 4));
    actualYear = birthUtc >= approxLichun ? localYear : localYear - 1;
    logs.solar_terms_log.push(`立春: 使用近似日期 ${localYear}/02/04 → 年柱用 ${actualYear} 年`);
  }

  // 1984年 = 甲子年
  const yearsSince1984 = actualYear - 1984;
  let stemIndex = yearsSince1984 % 10;
  let branchIndex = yearsSince1984 % 12;
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;

  const result = { stem: TIANGAN[stemIndex], branch: DIZHI[branchIndex] };
  logs.year_log.push(`年柱計算: ${actualYear}年 → ${result.stem}${result.branch}`);

  return result;
}

/**
 * 計算月柱
 */
function calculateMonthPillar(
  birthUtc: Date,
  tzOffsetMinutesEast: number,
  yearStem: string,
  logs: CalculationLogs
): { stem: string; branch: string } {
  const branchIndex = getMonthBranchIndex(birthUtc, tzOffsetMinutesEast);
  const branch = DIZHI[branchIndex];

  // 五虎遁
  const mapping = (fiveTigersData.mapping as Record<string, Record<string, string>>)[yearStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];

  logs.month_log.push(`月柱計算: 五虎遁 年干${yearStem} + 月支${branch} → ${stem}${branch}`);

  return { stem, branch };
}

/**
 * 計算日柱（從基準日推算）
 */
function calculateDayPillarFromDate(date: Date): { stem: string; branch: string } {
  const timeDiff = date.getTime() - BASE_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / MS_PER_DAY);

  let jiaziIndex = (BASE_JIAZI_INDEX + daysDiff) % 60;
  if (jiaziIndex < 0) jiaziIndex += 60;

  const stemIndex = jiaziIndex % 10;
  const branchIndex = jiaziIndex % 12;

  return { stem: TIANGAN[stemIndex], branch: DIZHI[branchIndex] };
}

/**
 * 計算時柱
 */
function calculateHourPillar(
  hour: number,
  dayStem: string,
  logs: CalculationLogs
): { stem: string; branch: string } {
  const branchIndex = getHourBranchIndex(hour);
  const branch = DIZHI[branchIndex];

  // 五鼠遁
  const mapping = (fiveRatsData.mapping as Record<string, Record<string, string>>)[dayStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];

  logs.hour_log.push(`時柱計算: 五鼠遁 日干${dayStem} + ${hour}時(${branch}) → ${stem}${branch}`);

  return { stem, branch };
}

/**
 * 計算五行分數
 */
function calculateWuxing(
  pillars: FourPillars,
  hiddenStemConfig: Record<PillarName, HiddenStemEntry[]>
): { totals: WuxingScore; breakdown: WuxingBreakdownEntry[] } {
  const totals: WuxingScore = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const breakdown: WuxingBreakdownEntry[] = [];

  const elementMap: Record<string, keyof WuxingScore> = {
    木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water"
  };

  const pushContribution = (stemOrBranch: string, value: number, descriptor: string, isStem = true) => {
    const elementSymbol = isStem ? TIANGAN_WUXING[stemOrBranch] : DIZHI_WUXING[stemOrBranch];
    const key = elementMap[elementSymbol];
    if (!key || value <= 0) return;
    totals[key] += value;
    breakdown.push({ element: key, value, source: descriptor });
  };

  (Object.entries(pillars) as Array<[PillarName, { stem: string; branch: string }]>).forEach(([pillarName, pillar]) => {
    pushContribution(pillar.stem, 1.0, `${pillarName}天干(${pillar.stem})`);
    pushContribution(pillar.branch, 0.8, `${pillarName}地支(${pillar.branch})`, false);

    const entries = hiddenStemConfig[pillarName] ?? [];
    entries.forEach((entry, index) => {
      let weight = entry.weight;
      if (pillarName === "month" && index === 0) {
        weight *= MONTH_COMMAND_MULTIPLIER;
      }
      pushContribution(entry.stem, weight, `${pillarName}藏干(${entry.stem})`);
    });
  });

  return { totals, breakdown };
}

/**
 * 計算陰陽比例
 */
function calculateYinYang(pillars: FourPillars): { yang: number; yin: number } {
  let yang = 0, yin = 0;

  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(stem => {
    const yinyang = ganZhiData.stemProperties[stem].yinyang;
    if (yinyang === '陽') yang++; else yin++;
  });

  [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch].forEach(branch => {
    const yinyang = ganZhiData.branchProperties[branch].yinyang;
    if (yinyang === '陽') yang++; else yin++;
  });

  const total = yang + yin;
  return {
    yang: Math.round((yang / total) * 100),
    yin: Math.round((yin / total) * 100)
  };
}

/**
 * 獲取納音
 */
function getNayin(stem: string, branch: string): string {
  return NAYIN_TABLE[stem + branch] || "未知";
}

// ============================================
// 主計算函式
// ============================================

/**
 * 八字計算引擎 - Strict Mode
 * 
 * 核心修正：
 * 1. 物理時間 (UTC)：用於年柱、月柱的節氣比對
 * 2. 真太陽時 (Solar Time)：用於時柱判定、日柱跨日判定
 * 3. Day Delta：處理真太陽時導致的跨日問題
 */
export function calculateBaziStrict(
  input: BirthLocalInput,
  debug: boolean = false
): BaziCalculationResult {
  // 初始化日誌
  const logs: CalculationLogs = {
    year_log: [],
    month_log: [],
    day_log: [],
    hour_log: [],
    solar_terms_log: [],
    five_elements_log: [],
    solar_time_log: [],
    validation_log: []
  };

  // 驗證輸入
  const validation = validateBaziInput(input);
  if (!validation.valid) {
    validation.errors.forEach(e => {
      logs.validation_log?.push(`❌ ${e.field}: ${e.message}`);
    });
    throw new Error(`輸入驗證失敗: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  logs.validation_log?.push("✓ 輸入驗證通過");

  // --- Step 1: 建立「物理出生瞬間」(UTC) ---
  // 用於：天文比對（年柱、月柱節氣）
  const birthUtc = buildLocalDateTimeUtc(
    {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      second: input.second ?? 0
    },
    input.tzOffsetMinutesEast
  );
  logs.solar_time_log?.push(`物理出生時刻 (UTC): ${birthUtc.toISOString()}`);

  // --- Step 2: 建立「太陽時校正後的鐘面時間」---
  // 用於：時柱判定、日柱跨日判定
  const solarInfo = input.longitude !== undefined
    ? applySolarTime(
        { ...input, second: input.second ?? 0 },
        input.tzOffsetMinutesEast,
        input.longitude,
        input.solarTimeMode
      )
    : applySolarTime(
        { ...input, second: input.second ?? 0 },
        input.tzOffsetMinutesEast,
        0,
        "NONE"
      );

  logs.solar_time_log?.push(`太陽時模式: ${input.solarTimeMode}`);
  logs.solar_time_log?.push(`校正結果: ${formatSolarTimeResult(solarInfo)}`);
  if (solarInfo.dayDelta !== 0) {
    logs.solar_time_log?.push(`⚠️ 跨日偏移: ${solarInfo.dayDelta > 0 ? '+' : ''}${solarInfo.dayDelta} 天`);
  }

  // --- Step 3: 處理日柱基準 ---
  // 日柱受「輸入日期 + Solar Day Delta + 子時換日規則」影響

  // 3a. 先算出「邏輯上的鐘面日期」
  const localDateBase = new Date(Date.UTC(input.year, input.month - 1, input.day));
  const solarAdjustedDate = new Date(localDateBase);
  solarAdjustedDate.setUTCDate(localDateBase.getUTCDate() + solarInfo.dayDelta);

  // 3b. 處理子時換日 (Zi Rollover)
  const adjHour = solarInfo.adjusted.hour;
  const isNightZi = (adjHour === 23);
  const isEarlyZiMode = (input.ziMode === "EARLY");

  const dayPillarDate = new Date(solarAdjustedDate);
  if (isNightZi && isEarlyZiMode) {
    dayPillarDate.setUTCDate(dayPillarDate.getUTCDate() + 1);
    logs.day_log.push(`子時處理: ${adjHour}時 → 早子時換日模式（計入次日）`);
  } else if (isNightZi) {
    logs.day_log.push(`子時處理: ${adjHour}時 → 晚子時不換日模式（仍屬當日）`);
  }

  // --- Step 4: 四柱計算 ---

  // 年柱 & 月柱：使用 birthUtc（物理時間）對齊節氣
  const yearPillar = calculateYearPillar(birthUtc, input.tzOffsetMinutesEast, logs);
  const monthPillar = calculateMonthPillar(birthUtc, input.tzOffsetMinutesEast, yearPillar.stem, logs);

  // 日柱：使用處理過 Delta 和 Zi 的日期
  const dayPillar = calculateDayPillarFromDate(dayPillarDate);
  logs.day_log.push(`日柱計算: 基準日1985/09/22甲子 → ${dayPillar.stem}${dayPillar.branch}`);

  // 時柱：使用「校正後的時辰」
  const hourPillar = calculateHourPillar(adjHour, dayPillar.stem, logs);

  const pillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };

  // --- Step 5: 藏干、納音、五行、陰陽 ---
  const hiddenStemsResult: Record<PillarName, HiddenStemEntry[]> = {
    year: DIZHI_CANGGAN[yearPillar.branch] ?? [],
    month: DIZHI_CANGGAN[monthPillar.branch] ?? [],
    day: DIZHI_CANGGAN[dayPillar.branch] ?? [],
    hour: DIZHI_CANGGAN[hourPillar.branch] ?? []
  };

  const nayin = {
    year: getNayin(yearPillar.stem, yearPillar.branch),
    month: getNayin(monthPillar.stem, monthPillar.branch),
    day: getNayin(dayPillar.stem, dayPillar.branch),
    hour: getNayin(hourPillar.stem, hourPillar.branch)
  };

  const { totals: wuxing, breakdown: wuxingBreakdown } = calculateWuxing(pillars, hiddenStemsResult);
  const yinyang = calculateYinYang(pillars);

  // 添加五行計算日誌
  wuxingBreakdown.forEach(entry => {
    logs.five_elements_log.push(`${entry.source}: ${entry.element} +${entry.value.toFixed(2)}`);
  });

  // --- Step 6: 地支互動（刑衝會合） ---
  const interactions = detectInteractions(pillars);

  // --- Step 7: 四時軍團 ---
  const fourSeasonsTeam = getFourSeasonsTeam(pillars);

  // --- Step 8: 元數據 ---
  const meta: CalculationMeta = {
    birthUtc: birthUtc.toISOString(),
    solarAdjustedTime: `${solarInfo.adjusted.hour.toString().padStart(2, '0')}:${solarInfo.adjusted.minute.toString().padStart(2, '0')}:${solarInfo.adjusted.second.toString().padStart(2, '0')}`,
    dayDelta: solarInfo.dayDelta,
    solarMode: input.solarTimeMode,
    ziMode: input.ziMode
  };

  // 組裝結果
  const result: BaziCalculationResult = {
    pillars,
    hiddenStems: hiddenStemsResult,
    nayin,
    wuxing,
    wuxingBreakdown,
    yinyang,
    fourSeasonsTeam,
    interactions,
    meta
  };

  if (debug) {
    result.calculationLogs = logs;
  }

  return result;
}

/**
 * 簡化版計算（向下兼容舊接口）
 */
export function calculateBaziSimple(
  birthDate: Date,
  birthHour: number,
  birthMinute: number = 0,
  options: {
    timezoneOffsetMinutes?: number;
    longitude?: number;
    useSolarTime?: boolean;
    useEarlyZi?: boolean;
  } = {}
): BaziCalculationResult {
  const {
    timezoneOffsetMinutes = 480,
    longitude,
    useSolarTime = false,
    useEarlyZi = true
  } = options;

  const input: BirthLocalInput = {
    year: birthDate.getUTCFullYear(),
    month: birthDate.getUTCMonth() + 1,
    day: birthDate.getUTCDate(),
    hour: birthHour,
    minute: birthMinute,
    second: 0,
    tzOffsetMinutesEast: timezoneOffsetMinutes,
    longitude,
    solarTimeMode: useSolarTime && longitude !== undefined ? "TST" : "NONE",
    ziMode: useEarlyZi ? "EARLY" : "LATE"
  };

  return calculateBaziStrict(input, false);
}
