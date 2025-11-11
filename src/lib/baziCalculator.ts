// 八字精准计算引擎 - 基于文档规则实现

// 天干地支常量
export const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 天干地支对应的五行
export const TIANGAN_WUXING: Record<string, string> = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水"
};

export const DIZHI_WUXING: Record<string, string> = {
  "寅": "木", "卯": "木",
  "巳": "火", "午": "火",
  "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金",
  "子": "水", "亥": "水"
};

// 地支藏干表
export const DIZHI_CANGGAN: Record<string, string[]> = {
  "子": ["癸"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "丙", "戊"],
  "卯": ["乙"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "壬", "戊"],
  "酉": ["辛"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "甲"]
};

// 纳音五行表（60甲子）
const NAYIN_TABLE: Record<string, string> = {
  "甲子": "海中金", "乙丑": "海中金",
  "丙寅": "炉中火", "丁卯": "炉中火",
  "戊辰": "大林木", "己巳": "大林木",
  "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "剑锋金", "癸酉": "剑锋金",
  "甲戌": "山头火", "乙亥": "山头火",
  "丙子": "涧下水", "丁丑": "涧下水",
  "戊寅": "城墙土", "己卯": "城墙土",
  "庚辰": "白蜡金", "辛巳": "白蜡金",
  "壬午": "杨柳木", "癸未": "杨柳木",
  "甲申": "泉中水", "乙酉": "泉中水",
  "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹雳火", "己丑": "霹雳火",
  "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "长流水", "癸巳": "长流水",
  "甲午": "砂石金", "乙未": "砂石金",
  "丙申": "山下火", "丁酉": "山下火",
  "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土",
  "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "覆灯火", "乙巳": "覆灯火",
  "丙午": "天河水", "丁未": "天河水",
  "戊申": "大驿土", "己酉": "大驿土",
  "庚戌": "钗钏金", "辛亥": "钗钏金",
  "壬子": "桑柘木", "癸丑": "桑柘木",
  "甲寅": "大溪水", "乙卯": "大溪水",
  "丙辰": "沙中土", "丁巳": "沙中土",
  "戊午": "天上火", "己未": "天上火",
  "庚申": "石榴木", "辛酉": "石榴木",
  "壬戌": "大海水", "癸亥": "大海水"
};

// 基准日期: 1985年9月22日 = 甲子日
const BASE_DATE = new Date(1985, 8, 22); // 月份从0开始，8=9月
const BASE_JIAZI_INDEX = 0; // 甲子的索引

/**
 * 计算年柱
 * 规则: 以立春为界
 */
export function calculateYearPillar(date: Date): { stem: string; branch: string } {
  const year = date.getFullYear();
  
  // 简化版：暂时用2月4日作为立春分界
  // TODO: 后续需要精确到时刻
  const lichun = new Date(year, 1, 4); // 2月4日
  
  let targetYear = year;
  if (date < lichun) {
    targetYear = year - 1; // 立春前算前一年
  }
  
  const stemIndex = (targetYear - 4) % 10;
  const branchIndex = (targetYear - 4) % 12;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[branchIndex]
  };
}

/**
 * 计算月柱
 * 规则: 以节气为界，使用五虎遁月
 */
export function calculateMonthPillar(date: Date, yearStem: string): { stem: string; branch: string } {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // 月支对应表（从立春开始为寅月）
  const monthBranches = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  
  // 简化版：节气大致在每月7-8日，如果日期<8则算上个月的节气月
  let branchIndex;
  if (day < 8) {
    // 节气前，用上个月
    branchIndex = (month + 10) % 12;
  } else {
    // 节气后，用当月
    branchIndex = (month + 11) % 12;
  }
  const branch = monthBranches[branchIndex];
  
  // 五虎遁月口诀：甲己丙作首，乙庚戊为头，丙辛庚寅起，丁壬壬寅顺，戊癸甲寅求
  const yearStemIndex = TIANGAN.indexOf(yearStem);
  let monthStemStart = 0;
  
  if (yearStemIndex === 0 || yearStemIndex === 5) monthStemStart = 2; // 甲己年 - 丙寅开始
  else if (yearStemIndex === 1 || yearStemIndex === 6) monthStemStart = 4; // 乙庚年 - 戊寅开始
  else if (yearStemIndex === 2 || yearStemIndex === 7) monthStemStart = 6; // 丙辛年 - 庚寅开始
  else if (yearStemIndex === 3 || yearStemIndex === 8) monthStemStart = 8; // 丁壬年 - 壬寅开始
  else if (yearStemIndex === 4 || yearStemIndex === 9) monthStemStart = 0; // 戊癸年 - 甲寅开始
  
  const stemIndex = (monthStemStart + branchIndex) % 10;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: branch
  };
}

/**
 * 计算日柱
 * 使用基准日推算法
 */
export function calculateDayPillar(date: Date): { stem: string; branch: string } {
  // 使用1900-01-01（庚戌日）作为基准，这是常用的基准日
  const baseDate = new Date(1900, 0, 1); // 1900年1月1日 = 庚戌日
  const baseStemIndex = 6; // 庚
  const baseBranchIndex = 10; // 戌
  
  const timeDiff = date.getTime() - baseDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  let stemIndex = (baseStemIndex + daysDiff) % 10;
  let branchIndex = (baseBranchIndex + daysDiff) % 12;
  
  // 处理负数情况
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[branchIndex]
  };
}

/**
 * 计算时柱
 * 使用五鼠遁时
 */
export function calculateHourPillar(hour: number, dayStem: string): { stem: string; branch: string } {
  // 时辰对应表
  const hourBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  // 时辰计算（23-1点为子时，1-3点为丑时...）
  let branchIndex = Math.floor((hour + 1) / 2) % 12;
  const branch = hourBranches[branchIndex];
  
  // 五鼠遁时口诀
  const dayStemIndex = TIANGAN.indexOf(dayStem);
  let hourStemStart = 0;
  
  if (dayStemIndex === 0 || dayStemIndex === 5) hourStemStart = 0; // 甲己日 - 甲子开始
  else if (dayStemIndex === 1 || dayStemIndex === 6) hourStemStart = 2; // 乙庚日 - 丙子开始
  else if (dayStemIndex === 2 || dayStemIndex === 7) hourStemStart = 4; // 丙辛日 - 戊子开始
  else if (dayStemIndex === 3 || dayStemIndex === 8) hourStemStart = 6; // 丁壬日 - 庚子开始
  else if (dayStemIndex === 4 || dayStemIndex === 9) hourStemStart = 8; // 戊癸日 - 壬子开始
  
  const stemIndex = (hourStemStart + branchIndex) % 10;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: branch
  };
}

/**
 * 计算五行分数
 */
export function calculateWuxing(pillars: any) {
  const wuxing = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 天干得分 (每个1.5分)
  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(stem => {
    const element = TIANGAN_WUXING[stem];
    if (element === "木") wuxing.wood += 1.5;
    else if (element === "火") wuxing.fire += 1.5;
    else if (element === "土") wuxing.earth += 1.5;
    else if (element === "金") wuxing.metal += 1.5;
    else if (element === "水") wuxing.water += 1.5;
  });
  
  // 地支得分 (每个1分)
  [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch].forEach(branch => {
    const element = DIZHI_WUXING[branch];
    if (element === "木") wuxing.wood += 1;
    else if (element === "火") wuxing.fire += 1;
    else if (element === "土") wuxing.earth += 1;
    else if (element === "金") wuxing.metal += 1;
    else if (element === "水") wuxing.water += 1;
  });
  
  return wuxing;
}

/**
 * 计算阴阳比例
 */
export function calculateYinYang(pillars: any) {
  let yang = 0, yin = 0;
  
  // 天干阴阳
  const yangtian = ["甲", "丙", "戊", "庚", "壬"];
  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(stem => {
    if (yangtian.includes(stem)) yang++; else yin++;
  });
  
  // 地支阴阳
  const yangdi = ["子", "寅", "辰", "午", "申", "戌"];
  [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch].forEach(branch => {
    if (yangdi.includes(branch)) yang++; else yin++;
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
