// 🌈 八字精准计算引擎 - 基于香港天文台資料
// 參考 lookup-calculator.ts 專業計算邏輯改進
import keySolarTermsData from "@/data/key_solar_terms_database.json";
import preciseSolarTermsData from "@/data/solar_terms.json";
import fiveTigersData from "@/data/five_tigers.json";
import fiveRatsData from "@/data/five_rats.json";
import ganZhiData from "@/data/gan_zhi.json";
import nayinData from "@/data/nayin.json";
import hiddenStemsData from "@/data/hidden_stems.json";
import { getFourSeasonsTeam as calculateFourSeasonsTeam } from "./fourSeasonsAnalyzer";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STANDARD_LONGITUDE = 120; // 中國標準時間基於東經120度

const SOLAR_TERM_BRANCH_ORDER: Array<{ term: string; branchIndex: number }> = [
  { term: "立春", branchIndex: 2 },
  { term: "驚蟄", branchIndex: 3 },
  { term: "清明", branchIndex: 4 },
  { term: "立夏", branchIndex: 5 },
  { term: "芒種", branchIndex: 6 },
  { term: "小暑", branchIndex: 7 },
  { term: "立秋", branchIndex: 8 },
  { term: "白露", branchIndex: 9 },
  { term: "寒露", branchIndex: 10 },
  { term: "立冬", branchIndex: 11 },
  { term: "大雪", branchIndex: 0 },
  { term: "小寒", branchIndex: 1 }
];

const MONTH_COMMAND_MULTIPLIER = 1.5;

// 香港天文台關鍵節氣資料類型（僅日期）
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

// 精確節氣資料類型（含時間）
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

const hkoData = keySolarTermsData as HkoSolarTermsData;
const preciseData = preciseSolarTermsData as PreciseSolarTermsData;

export interface HiddenStemEntry {
  stem: string;
  weight: number;
  ratio?: number;  // 百分比 (0-100)
  type?: '本氣' | '中氣' | '餘氣';  // 藏干類型
}

interface HiddenStemConfig {
  stems: HiddenStemEntry[];
}

type HiddenStemsDataset = { hiddenStems: Record<string, HiddenStemConfig> };

// 導出四時軍團分析器
export { 
  getFourSeasonsTeam, 
  calculateSeasonDistribution, 
  getSeasonByBranch,
  getSeasonColor,
  getSeasonElement,
  getSeasonFullName,
  type FourSeasonsTeam,
  type SeasonCycle,
  type SeasonDistribution
} from './fourSeasonsAnalyzer';

const hiddenStems = hiddenStemsData as HiddenStemsDataset;

type PillarName = "year" | "month" | "day" | "hour";

interface PillarDetail {
  stem: string;
  branch: string;
}

type FourPillars = Record<PillarName, PillarDetail>;

// 天干地支常量
export const TIANGAN = ganZhiData.stems;
export const DIZHI = ganZhiData.branches;

// 天干地支对应的五行
export const TIANGAN_WUXING: Record<string, string> = Object.fromEntries(
  TIANGAN.map(stem => [stem, ganZhiData.stemProperties[stem].element])
);

export const DIZHI_WUXING: Record<string, string> = Object.fromEntries(
  DIZHI.map(branch => [branch, ganZhiData.branchProperties[branch].element])
);

// 地支藏干表
export const DIZHI_CANGGAN: Record<string, HiddenStemEntry[]> = Object.fromEntries(
  Object.entries(hiddenStems.hiddenStems).map(([branch, data]) => [
    branch,
    data.stems
  ])
);

// 纳音五行表
const NAYIN_TABLE: Record<string, string> = nayinData.nayin;

// 基准日期: 1985-09-22 = 甲子日（权威基准，已验证）
const BASE_DATE = new Date(Date.UTC(1985, 8, 22));
const BASE_JIAZI_INDEX = 0; // 甲子的索引为0

interface DateComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function normalizeIsoString(input: string): string {
  const trimmed = input.trim();
  const spaced = trimmed.replace(" ", "T");
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(spaced)) {
    return spaced;
  }
  return `${spaced}Z`;
}

function parseSolarTermDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  const parsed = new Date(normalizeIsoString(dateString));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function getLocalComponents(dateUtc: Date, timezoneOffsetMinutes: number): DateComponents {
  const local = new Date(dateUtc.getTime() + timezoneOffsetMinutes * MS_PER_MINUTE);

  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    hour: local.getUTCHours(),
    minute: local.getUTCMinutes(),
    second: local.getUTCSeconds()
  };
}

function buildLocalDateUtc(
  components: Pick<DateComponents, "year" | "month" | "day">,
  timezoneOffsetMinutes: number
): Date {
  const utcMs = Date.UTC(components.year, components.month - 1, components.day) - timezoneOffsetMinutes * MS_PER_MINUTE;
  return new Date(utcMs);
}

/**
 * 获取节气时刻（優先使用精確時間資料）
 */
function getSolarTermUtc(year: number, termName: string): Date | null {
  // 優先檢查精確時間資料（含時分秒）
  const preciseYearData = preciseData.years?.[year.toString()];
  if (preciseYearData && preciseYearData[termName]) {
    const preciseDate = parseSolarTermDate(preciseYearData[termName].date);
    if (preciseDate) return preciseDate;
  }
  
  // 退回到 HKO 資料（僅日期，預設為當日 00:00 UTC）
  const yearData = hkoData.key_solar_terms[year.toString()];
  if (!yearData || !yearData[termName]) return null;
  return parseSolarTermDate(yearData[termName].date) ?? null;
}

function findNearestSolarTerm(
  dateUtc: Date,
  termName: string,
  timezoneOffsetMinutes: number
): { date: Date; year: number } | null {
  const localYear = getLocalComponents(dateUtc, timezoneOffsetMinutes).year;
  const searchYears = [localYear - 1, localYear, localYear + 1];
  let best: { date: Date; year: number } | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const candidateYear of searchYears) {
    const termDate = getSolarTermUtc(candidateYear, termName);
    if (!termDate) continue;
    const diff = Math.abs(termDate.getTime() - dateUtc.getTime());
    if (diff < bestDiff) {
      best = { date: termDate, year: candidateYear };
      bestDiff = diff;
    }
  }

  return best;
}

/**
 * 计算年柱
 * 规则: 以立春为界
 */
export function calculateYearPillar(dateUtc: Date, timezoneOffsetMinutes = 0): { stem: string; branch: string } {
  const local = getLocalComponents(dateUtc, timezoneOffsetMinutes);

  const lichunInfo = findNearestSolarTerm(dateUtc, "立春", timezoneOffsetMinutes);

  let actualYear = local.year;
  if (lichunInfo) {
    actualYear = dateUtc >= lichunInfo.date ? lichunInfo.year : lichunInfo.year - 1;
  } else {
    const approxLocal = { year: local.year, month: 2, day: 4, hour: 0, minute: 0, second: 0 };
    const approx = new Date(
      Date.UTC(
        approxLocal.year,
        approxLocal.month - 1,
        approxLocal.day,
        approxLocal.hour,
        approxLocal.minute,
        approxLocal.second
      ) - timezoneOffsetMinutes * MS_PER_MINUTE
    );
    actualYear = dateUtc >= approx ? local.year : local.year - 1;
  }
  
  // 1984年 = 甲子年，计算偏移
  const yearsSince1984 = actualYear - 1984;
  let stemIndex = yearsSince1984 % 10;
  let branchIndex = yearsSince1984 % 12;
  
  // 处理负数
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[branchIndex]
  };
}

/**
 * 获取月支的节气月
 */
function getMonthBranchIndex(dateUtc: Date, timezoneOffsetMinutes: number): number {
  const localYear = getLocalComponents(dateUtc, timezoneOffsetMinutes).year;
  const searchYears = [localYear - 1, localYear, localYear + 1];

  const occurrences: Array<{ date: Date; branchIndex: number }> = [];

  for (const yearCandidate of searchYears) {
    const yearData = hkoData.key_solar_terms[yearCandidate.toString()];
    if (!yearData) continue;

    for (const { term, branchIndex } of SOLAR_TERM_BRANCH_ORDER) {
      const termData = yearData[term];
      if (!termData) continue;
      const termDate = parseSolarTermDate(termData.date);
      if (!termDate) continue;
      occurrences.push({ date: termDate, branchIndex });
    }
  }

  if (occurrences.length === 0) {
    const month = getLocalComponents(dateUtc, timezoneOffsetMinutes).month;
    const fallbackMapping = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
    return fallbackMapping[month] ?? 1;
  }

  occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = occurrences.length - 1; i >= 0; i--) {
    if (occurrences[i].date.getTime() <= dateUtc.getTime()) {
      return occurrences[i].branchIndex;
    }
  }

  return SOLAR_TERM_BRANCH_ORDER[0].branchIndex;
}

/**
 * 计算月柱
 * 规则: 以节气为界，使用五虎遁月
 */
export function calculateMonthPillar(
  dateUtc: Date,
  timezoneOffsetMinutes = 0
): { stem: string; branch: string } {
  // 获取月支索引
  const branchIndex = getMonthBranchIndex(dateUtc, timezoneOffsetMinutes);
  const branch = DIZHI[branchIndex];

  // 先計算年柱以獲得正確的年干（以立春為界）
  const yearPillar = calculateYearPillar(dateUtc, timezoneOffsetMinutes);
  const yearStem = yearPillar.stem;
  
  // 使用五虎遁查表获取月干
  const mapping = (fiveTigersData.mapping as Record<string, Record<string, string>>)[yearStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];

  return { stem, branch };
}

/**
 * 计算日柱
 * 使用基准日推算法: 1900-01-31 = 甲子日
 */
export function calculateDayPillar(date: Date): { stem: string; branch: string } {
  // 计算天数差
  const timeDiff = date.getTime() - BASE_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 计算干支索引（60甲子循环）
  let jiaziIndex = (BASE_JIAZI_INDEX + daysDiff) % 60;
  if (jiaziIndex < 0) jiaziIndex += 60;
  
  const stemIndex = jiaziIndex % 10;
  const branchIndex = jiaziIndex % 12;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[branchIndex]
  };
}

/**
 * 获取时支索引 - 精確兩小時一支查表
 */
function getHourBranchIndex(hour: number): number {
  // 23-1点为子时(0), 1-3点为丑时(1), ...
  if (hour >= 23 || hour < 1) return 0; // 子
  if (hour >= 1 && hour < 3) return 1;  // 丑
  if (hour >= 3 && hour < 5) return 2;  // 寅
  if (hour >= 5 && hour < 7) return 3;  // 卯
  if (hour >= 7 && hour < 9) return 4;  // 辰
  if (hour >= 9 && hour < 11) return 5; // 巳
  if (hour >= 11 && hour < 13) return 6; // 午
  if (hour >= 13 && hour < 15) return 7; // 未
  if (hour >= 15 && hour < 17) return 8; // 申
  if (hour >= 17 && hour < 19) return 9; // 酉
  if (hour >= 19 && hour < 21) return 10; // 戌
  return 11; // 亥 (21-23)
}

/**
 * 真太陽時調整計算
 * @param longitude 經度（正為東經，負為西經）
 * @returns 時間調整量（小時）
 */
export function calculateTrueSolarTimeAdjustment(longitude: number): number {
  // 每15度差1小時
  return (longitude - STANDARD_LONGITUDE) / 15;
}

/**
 * 應用真太陽時調整
 */
export function applyTrueSolarTime(hour: number, minute: number, longitude: number): { hour: number; minute: number } {
  const adjustment = calculateTrueSolarTimeAdjustment(longitude);
  const totalMinutes = hour * 60 + minute + adjustment * 60;
  
  // 處理跨日
  let adjustedMinutes = totalMinutes;
  if (adjustedMinutes < 0) adjustedMinutes += 24 * 60;
  if (adjustedMinutes >= 24 * 60) adjustedMinutes -= 24 * 60;
  
  return {
    hour: Math.floor(adjustedMinutes / 60),
    minute: Math.floor(adjustedMinutes % 60)
  };
}

/**
 * 计算时柱
 * 使用五鼠遁时
 */
export function calculateHourPillar(hour: number, dayStem: string): { stem: string; branch: string } {
  // 获取时支
  const branchIndex = getHourBranchIndex(hour);
  const branch = DIZHI[branchIndex];
  
  // 使用五鼠遁查表获取时干
  const mapping = (fiveRatsData.mapping as Record<string, Record<string, string>>)[dayStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];
  
  return { stem, branch };
}

/**
 * 计算五行分数
 */
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

export function calculateWuxing(
  pillars: FourPillars,
  hiddenStemConfig: Record<PillarName, HiddenStemEntry[]>
): { totals: WuxingScore; breakdown: WuxingBreakdownEntry[] } {
  const totals: WuxingScore = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const breakdown: WuxingBreakdownEntry[] = [];

  const elementMap: Record<string, keyof WuxingScore> = {
    木: "wood",
    火: "fire",
    土: "earth",
    金: "metal",
    水: "water"
  };

  const pushContribution = (stemOrBranch: string, value: number, descriptor: string, isStem = true) => {
    const elementSymbol = isStem ? TIANGAN_WUXING[stemOrBranch] : DIZHI_WUXING[stemOrBranch];
    const key = elementMap[elementSymbol];
    if (!key || value <= 0) return;
    totals[key] += value;
    breakdown.push({ element: key, value, source: descriptor });
  };

  (Object.entries(pillars) as Array<[PillarName, PillarDetail]>).forEach(([pillarName, pillar]) => {
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
 * 计算阴阳比例
 */
export function calculateYinYang(pillars: FourPillars) {
  let yang = 0, yin = 0;
  
  // 天干阴阳
  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(stem => {
    const yinyang = ganZhiData.stemProperties[stem].yinyang;
    if (yinyang === '陽') yang++; else yin++;
  });
  
  // 地支阴阳
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
 * 获取纳音
 */
export function getNayin(stem: string, branch: string): string {
  const ganzhiKey = stem + branch;
  return NAYIN_TABLE[ganzhiKey] || "未知";
}

/**
 * 計算日誌介面
 */
export interface CalculationLogs {
  year_log: string[];
  month_log: string[];
  day_log: string[];
  hour_log: string[];
  solar_terms_log: string[];
  five_elements_log: string[];
}

/**
 * 完整八字计算
 */
export interface BaziCalculationInput {
  birthDate: Date;
  birthHour: number;
  birthMinute?: number;
  name: string;
  gender: string;
  location?: string;
  useSolarTime?: boolean;
  timezoneOffsetMinutes?: number;
  longitude?: number; // 經度（用於真太陽時計算）
  useEarlyZi?: boolean; // 子時是否換日（早子時模式）
  debug?: boolean; // 是否返回計算日誌
}

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
  fourSeasonsTeam: import('./fourSeasonsAnalyzer').FourSeasonsTeam;
  calculationLogs?: CalculationLogs; // 可選的計算日誌
}

export function calculateBazi(input: BaziCalculationInput): BaziCalculationResult {
  const {
    birthDate,
    birthHour,
    birthMinute = 0,
    timezoneOffsetMinutes = 0,
    longitude,
    useEarlyZi = true, // 預設使用早子時換日
    debug = false
  } = input;

  // 初始化計算日誌
  const logs: CalculationLogs = {
    year_log: [],
    month_log: [],
    day_log: [],
    hour_log: [],
    solar_terms_log: [],
    five_elements_log: []
  };

  const baseYear = birthDate.getUTCFullYear();
  const baseMonth = birthDate.getUTCMonth();
  const baseDay = birthDate.getUTCDate();

  // 處理真太陽時調整
  let adjustedHour = birthHour;
  let adjustedMinute = birthMinute;
  if (longitude !== undefined) {
    const trueSolar = applyTrueSolarTime(birthHour, birthMinute, longitude);
    adjustedHour = trueSolar.hour;
    adjustedMinute = trueSolar.minute;
    const adjustment = calculateTrueSolarTimeAdjustment(longitude);
    logs.hour_log.push(
      `真太陽時調整: 經度${longitude}° → 時間調整${adjustment.toFixed(2)}小時 → ${adjustedHour}時${adjustedMinute}分`
    );
  }

  const birthUtc = new Date(
    Date.UTC(baseYear, baseMonth, baseDay, adjustedHour, adjustedMinute) - timezoneOffsetMinutes * MS_PER_MINUTE
  );

  const localComponents = getLocalComponents(birthUtc, timezoneOffsetMinutes);

  // 计算四柱
  const yearPillar = calculateYearPillar(birthUtc, timezoneOffsetMinutes);
  logs.year_log.push(`年柱計算: ${localComponents.year}年 → ${yearPillar.stem}${yearPillar.branch}`);
  
  const monthPillar = calculateMonthPillar(birthUtc, timezoneOffsetMinutes);
  logs.month_log.push(`月柱計算: 五虎遁 年干${yearPillar.stem} + 月支${monthPillar.branch} → ${monthPillar.stem}${monthPillar.branch}`);

  const dayStartUtc = new Date(Date.UTC(localComponents.year, localComponents.month - 1, localComponents.day));

  // 子時換日處理 - 根據 useEarlyZi 設定決定
  const ziHourCrossDay = localComponents.hour >= 23 && useEarlyZi;
  const adjustedDayUtc = ziHourCrossDay ? new Date(dayStartUtc.getTime() + MS_PER_DAY) : dayStartUtc;
  
  if (localComponents.hour >= 23) {
    logs.day_log.push(
      `子時處理: ${localComponents.hour}時 → ${useEarlyZi ? '早子時換日模式（計入次日）' : '晚子時不換日模式（仍屬當日）'}`
    );
  }

  const dayPillar = calculateDayPillar(adjustedDayUtc);
  logs.day_log.push(`日柱計算: 基準日1985/09/22甲子 → ${dayPillar.stem}${dayPillar.branch}`);
  
  const hourPillar = calculateHourPillar(localComponents.hour, dayPillar.stem);
  logs.hour_log.push(`時柱計算: 五鼠遁 日干${dayPillar.stem} + ${localComponents.hour}時 → ${hourPillar.stem}${hourPillar.branch}`);
  
  const pillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };

  // 计算藏干
  const hiddenStems: Record<PillarName, HiddenStemEntry[]> = {
    year: DIZHI_CANGGAN[yearPillar.branch] ?? [],
    month: DIZHI_CANGGAN[monthPillar.branch] ?? [],
    day: DIZHI_CANGGAN[dayPillar.branch] ?? [],
    hour: DIZHI_CANGGAN[hourPillar.branch] ?? []
  };
  
  // 计算纳音
  const nayin = {
    year: getNayin(yearPillar.stem, yearPillar.branch),
    month: getNayin(monthPillar.stem, monthPillar.branch),
    day: getNayin(dayPillar.stem, dayPillar.branch),
    hour: getNayin(hourPillar.stem, hourPillar.branch)
  };

  // 计算五行和阴阳
  const { totals: wuxing, breakdown: wuxingBreakdown } = calculateWuxing(pillars, hiddenStems);
  const yinyang = calculateYinYang(pillars);

  // 添加五行計算日誌
  wuxingBreakdown.forEach(entry => {
    logs.five_elements_log.push(`${entry.source}: ${entry.element} +${entry.value.toFixed(2)}`);
  });

  // 计算四时军团
  const fourSeasonsTeam = calculateFourSeasonsTeam(pillars);

  const result: BaziCalculationResult = {
    pillars,
    hiddenStems,
    nayin,
    wuxing,
    wuxingBreakdown,
    yinyang,
    fourSeasonsTeam
  };

  // 如果開啟 debug 模式，添加計算日誌
  if (debug) {
    result.calculationLogs = logs;
  }

  return result;
}
