// 🌈 八字精准计算引擎 - 基于虹灵御所数据
import solarTermsData from '@/data/solar_terms.json';
import fiveTigersData from '@/data/five_tigers.json';
import fiveRatsData from '@/data/five_rats.json';
import ganZhiData from '@/data/gan_zhi.json';
import nayinData from '@/data/nayin.json';
import hiddenStemsData from '@/data/hidden_stems.json';

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
export const DIZHI_CANGGAN: Record<string, string[]> = Object.fromEntries(
  Object.entries(hiddenStemsData.hiddenStems).map(([branch, data]: [string, any]) => [
    branch,
    data.stems.map((s: any) => s.stem)
  ])
);

// 纳音五行表
const NAYIN_TABLE: Record<string, string> = nayinData.nayin;

// 基准日期: 1900-01-31 = 甲辰日（索引40）
const BASE_DATE = new Date(1900, 0, 31);
const BASE_JIAZI_INDEX = 40; // 甲辰的索引为40（甲=0辰=4，按60甲子顺序）

/**
 * 获取节气时刻
 */
function getSolarTerm(year: number, termName: string): Date | null {
  const yearData = (solarTermsData.years as any)[year.toString()];
  if (!yearData || !yearData[termName]) return null;
  return new Date(yearData[termName].date);
}

/**
 * 计算年柱
 * 规则: 以立春为界
 */
export function calculateYearPillar(date: Date): { stem: string; branch: string } {
  const year = date.getFullYear();
  
  // 获取立春时刻
  const lichun = getSolarTerm(year, '立春');
  
  // 如果没有立春数据，用2月4日作为近似
  let actualYear = year;
  if (lichun) {
    actualYear = date >= lichun ? year : year - 1;
  } else {
    const approxLichun = new Date(year, 1, 4); // 2月4日
    actualYear = date >= approxLichun ? year : year - 1;
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
function getMonthBranchIndex(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  
  // 节气月对应表：立春(寅2)、惊蛰(卯3)、清明(辰4)、立夏(巳5)、芒种(午6)、小暑(未7)
  // 立秋(申8)、白露(酉9)、寒露(戌10)、立冬(亥11)、大雪(子0)、小寒(丑1)
  const termToMonth: Record<string, number> = {
    '立春': 2, '惊蛰': 3, '清明': 4, '立夏': 5, '芒种': 6, '小暑': 7,
    '立秋': 8, '白露': 9, '寒露': 10, '立冬': 11, '大雪': 0, '小寒': 1
  };
  
  // 获取当月的主要节气
  const monthTerms = [
    '立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
    '立秋', '白露', '寒露', '立冬', '大雪', '小寒'
  ];
  
  // 根据公历月份找对应的节气
  const termIndex = month - 2; // 2月立春=0
  let currentTerm = monthTerms[(termIndex + 12) % 12];
  let nextTerm = monthTerms[(termIndex + 1 + 12) % 12];
  
  // 获取节气时刻
  const currentTermDate = getSolarTerm(month === 1 ? year - 1 : year, currentTerm);
  const nextTermDate = getSolarTerm(year, nextTerm);
  
  // 判断是哪个节气月
  if (nextTermDate && date >= nextTermDate) {
    return termToMonth[nextTerm];
  } else if (currentTermDate) {
    return termToMonth[currentTerm];
  }
  
  // 如果没有节气数据，简化处理
  return (month + 1) % 12;
}

/**
 * 计算月柱
 * 规则: 以节气为界，使用五虎遁月
 */
export function calculateMonthPillar(date: Date, yearStem: string): { stem: string; branch: string } {
  // 获取月支索引
  const branchIndex = getMonthBranchIndex(date);
  const branch = DIZHI[branchIndex];
  
  // 使用五虎遁查表获取月干
  const mapping = (fiveTigersData.mapping as any)[yearStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];
  
  console.log(`[月柱] ${date.toISOString().split('T')[0]} - 年干:${yearStem}, 月支:${branch}(${branchIndex}), 月干:${stem}`);
  
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
  
  console.log(`[日柱] ${date.toISOString().split('T')[0]} - 天数差:${daysDiff}, 甲子索引:${jiaziIndex}, 干:${TIANGAN[stemIndex]}, 支:${DIZHI[branchIndex]}`);
  
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
  const mapping = (fiveRatsData.mapping as any)[dayStem];
  const stem = mapping ? mapping[branch] : TIANGAN[0];
  
  return { stem, branch };
}

/**
 * 计算五行分数
 */
export function calculateWuxing(pillars: any) {
  const wuxing = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  const elementMap: Record<string, keyof typeof wuxing> = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };
  
  // 天干得分 (每个1.5分)
  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(stem => {
    const element = TIANGAN_WUXING[stem];
    const key = elementMap[element];
    if (key) wuxing[key] += 1.5;
  });
  
  // 地支得分 (每个1分)
  [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch].forEach(branch => {
    const element = DIZHI_WUXING[branch];
    const key = elementMap[element];
    if (key) wuxing[key] += 1;
  });
  
  return wuxing;
}

/**
 * 计算阴阳比例
 */
export function calculateYinYang(pillars: any) {
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
  name: string;
  gender: string;
  location?: string;
  useSolarTime?: boolean;
}

export interface BaziCalculationResult {
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  hiddenStems: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxing: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinyang: {
    yang: number;
    yin: number;
  };
}

export function calculateBazi(input: BaziCalculationInput): BaziCalculationResult {
  const { birthDate, birthHour } = input;
  
  // 计算四柱
  const yearPillar = calculateYearPillar(birthDate);
  const monthPillar = calculateMonthPillar(birthDate, yearPillar.stem);
  const dayPillar = calculateDayPillar(birthDate);
  const hourPillar = calculateHourPillar(birthHour, dayPillar.stem);
  
  const pillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };
  
  // 计算藏干
  const hiddenStems = {
    year: DIZHI_CANGGAN[yearPillar.branch],
    month: DIZHI_CANGGAN[monthPillar.branch],
    day: DIZHI_CANGGAN[dayPillar.branch],
    hour: DIZHI_CANGGAN[hourPillar.branch]
  };
  
  // 计算纳音
  const nayin = {
    year: getNayin(yearPillar.stem, yearPillar.branch),
    month: getNayin(monthPillar.stem, monthPillar.branch),
    day: getNayin(dayPillar.stem, dayPillar.branch),
    hour: getNayin(hourPillar.stem, hourPillar.branch)
  };
  
  // 计算五行和阴阳
  const wuxing = calculateWuxing(pillars);
  const yinyang = calculateYinYang(pillars);
  
  return {
    pillars,
    hiddenStems,
    nayin,
    wuxing,
    yinyang
  };
}
