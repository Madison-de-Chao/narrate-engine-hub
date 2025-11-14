// 🌈 八字精准计算引擎 - 基于虹灵御所数据
import solarTermsData from "@/data/solar_terms.json";
import fiveTigersData from "@/data/five_tigers.json";
import fiveRatsData from "@/data/five_rats.json";
import ganZhiData from "@/data/gan_zhi.json";
import nayinData from "@/data/nayin.json";
import hiddenStemsData from "@/data/hidden_stems.json";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

type SolarTermsYearData = Record<string, { date: string }>;
type SolarTermsDataset = { years: Record<string, SolarTermsYearData> };

export interface HiddenStemEntry {
  stem: string;
  weight: number;
}

interface HiddenStemConfig {
  stems: HiddenStemEntry[];
}

type HiddenStemsDataset = { hiddenStems: Record<string, HiddenStemConfig> };

const solarTermsYears = solarTermsData as SolarTermsDataset;
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
 * 获取节气时刻
 */
function getSolarTermUtc(year: number, termName: string): Date | null {
  const yearData = solarTermsYears.years[year.toString()];
  if (!yearData) return null;
  return parseSolarTermDate(yearData[termName]?.date) ?? null;
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
    const yearData = solarTermsYears.years[yearCandidate.toString()];
    if (!yearData) continue;

    for (const { term, branchIndex } of SOLAR_TERM_BRANCH_ORDER) {
      const termDate = parseSolarTermDate(yearData[term]?.date);
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
 * 获取时支索引
 */
function getHourBranchIndex(hour: number): number {
  // 23-1点为子时(0), 1-3点为丑时(1), ...
  if (hour >= 23 || hour < 1) return 0; // 子
  return Math.floor((hour + 1) / 2);
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
}

export function calculateBazi(input: BaziCalculationInput): BaziCalculationResult {
  const {
    birthDate,
    birthHour,
    birthMinute = 0,
    timezoneOffsetMinutes = 0
  } = input;

  const baseYear = birthDate.getUTCFullYear();
  const baseMonth = birthDate.getUTCMonth();
  const baseDay = birthDate.getUTCDate();

  const birthUtc = new Date(
    Date.UTC(baseYear, baseMonth, baseDay, birthHour, birthMinute) - timezoneOffsetMinutes * MS_PER_MINUTE
  );

  const localComponents = getLocalComponents(birthUtc, timezoneOffsetMinutes);

  // 计算四柱
  const yearPillar = calculateYearPillar(birthUtc, timezoneOffsetMinutes);
  const monthPillar = calculateMonthPillar(birthUtc, timezoneOffsetMinutes);

  const dayStartUtc = new Date(Date.UTC(localComponents.year, localComponents.month - 1, localComponents.day));

  const ziHourCrossDay = localComponents.hour === 23;
  const adjustedDayUtc = ziHourCrossDay ? new Date(dayStartUtc.getTime() + MS_PER_DAY) : dayStartUtc;

  const dayPillar = calculateDayPillar(adjustedDayUtc);
  const hourPillar = calculateHourPillar(localComponents.hour, dayPillar.stem);
  
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

  return {
    pillars,
    hiddenStems,
    nayin,
    wuxing,
    wuxingBreakdown,
    yinyang
  };
}
