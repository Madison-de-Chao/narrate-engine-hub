import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * 八字計算公開 API
 * 
 * 此 API 可供外部系統調用，無需認證
 * 
 * POST /bazi-api
 * 
 * Request Body:
 * {
 *   "name": "姓名",
 *   "gender": "male" | "female",
 *   "birthDate": "YYYY-MM-DD",
 *   "birthTime": "HH:MM",
 *   "timezoneOffsetMinutes": 480  // 可選，預設 UTC+8 (480分鐘)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "pillars": { year, month, day, hour },
 *     "nayin": { year, month, day, hour },
 *     "wuxingScores": { 木, 火, 土, 金, 水 },
 *     "yinyangRatio": { yin, yang },
 *     "tenGods": { year, month, day, hour },
 *     "shensha": [...]
 *   }
 * }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ========== 天干地支資料 ==========
const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 納音五行表
const NAYIN: Record<string, string> = {
  "甲子": "海中金", "乙丑": "海中金", "丙寅": "爐中火", "丁卯": "爐中火",
  "戊辰": "大林木", "己巳": "大林木", "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "劍鋒金", "癸酉": "劍鋒金", "甲戌": "山頭火", "乙亥": "山頭火",
  "丙子": "澗下水", "丁丑": "澗下水", "戊寅": "城頭土", "己卯": "城頭土",
  "庚辰": "白蠟金", "辛巳": "白蠟金", "壬午": "楊柳木", "癸未": "楊柳木",
  "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹靂火", "己丑": "霹靂火", "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "長流水", "癸巳": "長流水", "甲午": "沙中金", "乙未": "沙中金",
  "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "覆燈火", "乙巳": "覆燈火", "丙午": "天河水", "丁未": "天河水",
  "戊申": "大驛土", "己酉": "大驛土", "庚戌": "釵釧金", "辛亥": "釵釧金",
  "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大溪水", "乙卯": "大溪水",
  "丙辰": "沙中土", "丁巳": "沙中土", "戊午": "天上火", "己未": "天上火",
  "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水"
};

// 五行對應
const WUXING_MAP: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火",
  "戊": "土", "己": "土", "庚": "金", "辛": "金",
  "壬": "水", "癸": "水",
  "寅": "木", "卯": "木", "巳": "火", "午": "火",
  "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金", "子": "水", "亥": "水"
};

// 陰陽對應
const YINYANG_MAP: Record<string, string> = {
  "甲": "陽", "乙": "陰", "丙": "陽", "丁": "陰",
  "戊": "陽", "己": "陰", "庚": "陽", "辛": "陰",
  "壬": "陽", "癸": "陰",
  "子": "陽", "丑": "陰", "寅": "陽", "卯": "陰",
  "辰": "陽", "巳": "陰", "午": "陽", "未": "陰",
  "申": "陽", "酉": "陰", "戌": "陽", "亥": "陰"
};

// 地支藏干
const DIZHI_CANGGAN: Record<string, string[]> = {
  "子": ["癸"], "丑": ["己", "癸", "辛"], "寅": ["甲", "丙", "戊"],
  "卯": ["乙"], "辰": ["戊", "乙", "癸"], "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"], "未": ["己", "丁", "乙"], "申": ["庚", "壬", "戊"],
  "酉": ["辛"], "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"]
};

// 節氣對應月支
const SOLAR_TERM_BRANCH: Record<string, number> = {
  "立春": 2, "驚蟄": 3, "清明": 4, "立夏": 5,
  "芒種": 6, "小暑": 7, "立秋": 8, "白露": 9,
  "寒露": 10, "立冬": 11, "大雪": 0, "小寒": 1,
};

// 關鍵節氣資料庫 (1950-2050)
const SOLAR_TERMS_DATA: Record<string, Record<string, string>> = {
  "1950": { "小寒": "1950-01-06", "立春": "1950-02-04", "驚蟄": "1950-03-06", "清明": "1950-04-05", "立夏": "1950-05-06", "芒種": "1950-06-06", "小暑": "1950-07-07", "立秋": "1950-08-08", "白露": "1950-09-08", "寒露": "1950-10-08", "立冬": "1950-11-08", "大雪": "1950-12-07" },
  "1951": { "小寒": "1951-01-06", "立春": "1951-02-04", "驚蟄": "1951-03-06", "清明": "1951-04-05", "立夏": "1951-05-06", "芒種": "1951-06-06", "小暑": "1951-07-08", "立秋": "1951-08-08", "白露": "1951-09-08", "寒露": "1951-10-09", "立冬": "1951-11-08", "大雪": "1951-12-08" },
  "1952": { "小寒": "1952-01-06", "立春": "1952-02-05", "驚蟄": "1952-03-06", "清明": "1952-04-05", "立夏": "1952-05-05", "芒種": "1952-06-05", "小暑": "1952-07-07", "立秋": "1952-08-07", "白露": "1952-09-07", "寒露": "1952-10-08", "立冬": "1952-11-07", "大雪": "1952-12-07" },
  "1960": { "小寒": "1960-01-06", "立春": "1960-02-05", "驚蟄": "1960-03-06", "清明": "1960-04-05", "立夏": "1960-05-05", "芒種": "1960-06-06", "小暑": "1960-07-07", "立秋": "1960-08-07", "白露": "1960-09-07", "寒露": "1960-10-08", "立冬": "1960-11-07", "大雪": "1960-12-07" },
  "1970": { "小寒": "1970-01-06", "立春": "1970-02-04", "驚蟄": "1970-03-06", "清明": "1970-04-05", "立夏": "1970-05-06", "芒種": "1970-06-06", "小暑": "1970-07-07", "立秋": "1970-08-08", "白露": "1970-09-08", "寒露": "1970-10-08", "立冬": "1970-11-08", "大雪": "1970-12-07" },
  "1980": { "小寒": "1980-01-06", "立春": "1980-02-05", "驚蟄": "1980-03-05", "清明": "1980-04-04", "立夏": "1980-05-05", "芒種": "1980-06-05", "小暑": "1980-07-07", "立秋": "1980-08-07", "白露": "1980-09-07", "寒露": "1980-10-08", "立冬": "1980-11-07", "大雪": "1980-12-07" },
  "1985": { "小寒": "1985-01-05", "立春": "1985-02-04", "驚蟄": "1985-03-05", "清明": "1985-04-05", "立夏": "1985-05-05", "芒種": "1985-06-06", "小暑": "1985-07-07", "立秋": "1985-08-07", "白露": "1985-09-07", "寒露": "1985-10-08", "立冬": "1985-11-07", "大雪": "1985-12-07" },
  "1990": { "小寒": "1990-01-05", "立春": "1990-02-04", "驚蟄": "1990-03-06", "清明": "1990-04-05", "立夏": "1990-05-05", "芒種": "1990-06-06", "小暑": "1990-07-07", "立秋": "1990-08-07", "白露": "1990-09-08", "寒露": "1990-10-08", "立冬": "1990-11-07", "大雪": "1990-12-07" },
  "1994": { "小寒": "1994-01-05", "立春": "1994-02-04", "驚蟄": "1994-03-06", "清明": "1994-04-05", "立夏": "1994-05-05", "芒種": "1994-06-06", "小暑": "1994-07-07", "立秋": "1994-08-07", "白露": "1994-09-08", "寒露": "1994-10-08", "立冬": "1994-11-07", "大雪": "1994-12-07" },
  "1995": { "小寒": "1995-01-05", "立春": "1995-02-04", "驚蟄": "1995-03-06", "清明": "1995-04-05", "立夏": "1995-05-06", "芒種": "1995-06-06", "小暑": "1995-07-07", "立秋": "1995-08-08", "白露": "1995-09-08", "寒露": "1995-10-09", "立冬": "1995-11-08", "大雪": "1995-12-07" },
  "2000": { "小寒": "2000-01-06", "立春": "2000-02-04", "驚蟄": "2000-03-05", "清明": "2000-04-04", "立夏": "2000-05-05", "芒種": "2000-06-05", "小暑": "2000-07-07", "立秋": "2000-08-07", "白露": "2000-09-07", "寒露": "2000-10-08", "立冬": "2000-11-07", "大雪": "2000-12-07" },
  "2005": { "小寒": "2005-01-05", "立春": "2005-02-04", "驚蟄": "2005-03-05", "清明": "2005-04-05", "立夏": "2005-05-05", "芒種": "2005-06-05", "小暑": "2005-07-07", "立秋": "2005-08-07", "白露": "2005-09-07", "寒露": "2005-10-08", "立冬": "2005-11-07", "大雪": "2005-12-07" },
  "2010": { "小寒": "2010-01-05", "立春": "2010-02-04", "驚蟄": "2010-03-06", "清明": "2010-04-05", "立夏": "2010-05-05", "芒種": "2010-06-06", "小暑": "2010-07-07", "立秋": "2010-08-07", "白露": "2010-09-08", "寒露": "2010-10-08", "立冬": "2010-11-07", "大雪": "2010-12-07" },
  "2015": { "小寒": "2015-01-06", "立春": "2015-02-04", "驚蟄": "2015-03-06", "清明": "2015-04-05", "立夏": "2015-05-06", "芒種": "2015-06-06", "小暑": "2015-07-07", "立秋": "2015-08-08", "白露": "2015-09-08", "寒露": "2015-10-08", "立冬": "2015-11-08", "大雪": "2015-12-07" },
  "2020": { "小寒": "2020-01-06", "立春": "2020-02-04", "驚蟄": "2020-03-05", "清明": "2020-04-04", "立夏": "2020-05-05", "芒種": "2020-06-05", "小暑": "2020-07-06", "立秋": "2020-08-07", "白露": "2020-09-07", "寒露": "2020-10-08", "立冬": "2020-11-07", "大雪": "2020-12-07" },
  "2021": { "小寒": "2021-01-05", "立春": "2021-02-03", "驚蟄": "2021-03-05", "清明": "2021-04-04", "立夏": "2021-05-05", "芒種": "2021-06-05", "小暑": "2021-07-07", "立秋": "2021-08-07", "白露": "2021-09-07", "寒露": "2021-10-08", "立冬": "2021-11-07", "大雪": "2021-12-07" },
  "2022": { "小寒": "2022-01-05", "立春": "2022-02-04", "驚蟄": "2022-03-05", "清明": "2022-04-05", "立夏": "2022-05-05", "芒種": "2022-06-06", "小暑": "2022-07-07", "立秋": "2022-08-07", "白露": "2022-09-07", "寒露": "2022-10-08", "立冬": "2022-11-07", "大雪": "2022-12-07" },
  "2023": { "小寒": "2023-01-05", "立春": "2023-02-04", "驚蟄": "2023-03-06", "清明": "2023-04-05", "立夏": "2023-05-06", "芒種": "2023-06-06", "小暑": "2023-07-07", "立秋": "2023-08-08", "白露": "2023-09-08", "寒露": "2023-10-08", "立冬": "2023-11-08", "大雪": "2023-12-07" },
  "2024": { "小寒": "2024-01-06", "立春": "2024-02-04", "驚蟄": "2024-03-05", "清明": "2024-04-04", "立夏": "2024-05-05", "芒種": "2024-06-05", "小暑": "2024-07-06", "立秋": "2024-08-07", "白露": "2024-09-07", "寒露": "2024-10-08", "立冬": "2024-11-07", "大雪": "2024-12-07" },
  "2025": { "小寒": "2025-01-05", "立春": "2025-02-03", "驚蟄": "2025-03-05", "清明": "2025-04-04", "立夏": "2025-05-05", "芒種": "2025-06-05", "小暑": "2025-07-07", "立秋": "2025-08-07", "白露": "2025-09-07", "寒露": "2025-10-08", "立冬": "2025-11-07", "大雪": "2025-12-07" },
  "2030": { "小寒": "2030-01-05", "立春": "2030-02-04", "驚蟄": "2030-03-05", "清明": "2030-04-05", "立夏": "2030-05-05", "芒種": "2030-06-05", "小暑": "2030-07-07", "立秋": "2030-08-07", "白露": "2030-09-07", "寒露": "2030-10-08", "立冬": "2030-11-07", "大雪": "2030-12-07" },
  "2040": { "小寒": "2040-01-06", "立春": "2040-02-04", "驚蟄": "2040-03-05", "清明": "2040-04-04", "立夏": "2040-05-05", "芒種": "2040-06-05", "小暑": "2040-07-06", "立秋": "2040-08-07", "白露": "2040-09-07", "寒露": "2040-10-08", "立冬": "2040-11-07", "大雪": "2040-12-06" },
  "2050": { "小寒": "2050-01-05", "立春": "2050-02-04", "驚蟄": "2050-03-05", "清明": "2050-04-05", "立夏": "2050-05-05", "芒種": "2050-06-05", "小暑": "2050-07-07", "立秋": "2050-08-07", "白露": "2050-09-07", "寒露": "2050-10-08", "立冬": "2050-11-07", "大雪": "2050-12-07" },
};

// ========== 輔助函數 ==========

function toLocal(dateUtc: Date, tzMinutes: number): Date {
  return new Date(dateUtc.getTime() + tzMinutes * 60 * 1000);
}

function createUtcFromLocalParts(birth: Date, hour: number, minute: number, tzMinutes: number): Date {
  const utcMs = Date.UTC(
    birth.getUTCFullYear(),
    birth.getUTCMonth(),
    birth.getUTCDate(),
    hour,
    minute,
    0,
    0
  ) - tzMinutes * 60 * 1000;
  return new Date(utcMs);
}

// 取得節氣日期（優先使用資料庫，否則近似計算）
function getSolarTermDate(year: number, termName: string): Date {
  const yearData = SOLAR_TERMS_DATA[String(year)];
  if (yearData && yearData[termName]) {
    return new Date(yearData[termName] + "T00:00:00Z");
  }
  // 近似計算（作為備援）
  const termDates: Record<string, [number, number]> = {
    "小寒": [1, 6], "立春": [2, 4], "驚蟄": [3, 6], "清明": [4, 5],
    "立夏": [5, 6], "芒種": [6, 6], "小暑": [7, 7], "立秋": [8, 8],
    "白露": [9, 8], "寒露": [10, 8], "立冬": [11, 8], "大雪": [12, 7],
  };
  const [month, day] = termDates[termName] || [1, 1];
  return new Date(Date.UTC(year, month - 1, day));
}

// ========== 四柱計算 ==========

function calculateYearPillar(birthUtc: Date, tzOffset: number): { stem: string; branch: string } {
  const birthLocal = toLocal(birthUtc, tzOffset);
  const year = birthLocal.getUTCFullYear();
  const lichun = getSolarTermDate(year, "立春");
  const adjustedYear = birthLocal < lichun ? year - 1 : year;
  
  const stemIndex = (adjustedYear - 4) % 10;
  const branchIndex = (adjustedYear - 4) % 12;
  
  return {
    stem: TIANGAN[stemIndex < 0 ? stemIndex + 10 : stemIndex],
    branch: DIZHI[branchIndex < 0 ? branchIndex + 12 : branchIndex]
  };
}

function calculateMonthPillar(yearStem: string, birthUtc: Date, tzOffset: number): { stem: string; branch: string } {
  const birthLocal = toLocal(birthUtc, tzOffset);
  const year = birthLocal.getUTCFullYear();
  
  // 找出當前所在的節氣月份
  const TERM_ORDER = ["小寒", "立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
  let currentBranchIndex = 1; // 預設丑月
  
  // 檢查當年和前一年的節氣
  for (let y = year; y >= year - 1; y--) {
    for (let i = TERM_ORDER.length - 1; i >= 0; i--) {
      const termDate = getSolarTermDate(y, TERM_ORDER[i]);
      if (birthLocal >= termDate) {
        currentBranchIndex = SOLAR_TERM_BRANCH[TERM_ORDER[i]];
        break;
      }
    }
    if (currentBranchIndex !== 1) break;
  }
  
  // 五虎遁月：根據年干推月干
  const yearStemIdx = TIANGAN.indexOf(yearStem);
  const monthStemStartIdx = [2, 4, 6, 8, 0][yearStemIdx % 5]; // 甲己起丙寅...
  const monthStemIdx = (monthStemStartIdx + (currentBranchIndex - 2 + 12) % 12) % 10;
  
  return {
    stem: TIANGAN[monthStemIdx],
    branch: DIZHI[currentBranchIndex]
  };
}

function calculateDayPillar(birthLocal: Date, hour: number): { stem: string; branch: string } {
  // 計算儒略日數 (JDN)
  const y = birthLocal.getUTCFullYear();
  const m = birthLocal.getUTCMonth() + 1;
  const d = birthLocal.getUTCDate();
  
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  
  // 子時（23:00-01:00）跨日處理
  const adjustedJdn = hour >= 23 ? jdn + 1 : jdn;
  
  // 甲子日 JDN = 2451911 (2001-01-01)
  const refJdn = 2451911;
  const cycleIndex = ((adjustedJdn - refJdn) % 60 + 60) % 60;
  
  return {
    stem: TIANGAN[cycleIndex % 10],
    branch: DIZHI[cycleIndex % 12]
  };
}

function calculateHourPillar(dayStem: string, hour: number): { stem: string; branch: string } {
  // 時支對照表
  const hourBranchIndex = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11][hour];
  
  // 五鼠遁時
  const dayStemIdx = TIANGAN.indexOf(dayStem);
  const hourStemStartIdx = [0, 2, 4, 6, 8][dayStemIdx % 5]; // 甲己起甲子...
  const hourStemIdx = (hourStemStartIdx + hourBranchIndex) % 10;
  
  return {
    stem: TIANGAN[hourStemIdx],
    branch: DIZHI[hourBranchIndex]
  };
}

// ========== 五行與陰陽計算 ==========

function calculateWuxingScores(pillars: {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}) {
  const scores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  
  // 天干得分
  const stemWeight = 1.0;
  Object.values(pillars).forEach(pillar => {
    const element = WUXING_MAP[pillar.stem];
    if (element) scores[element] += stemWeight;
  });
  
  // 地支藏干得分
  const branchWeights = [0.6, 0.3, 0.1]; // 本氣、中氣、餘氣
  Object.values(pillars).forEach(pillar => {
    const hiddenStems = DIZHI_CANGGAN[pillar.branch] || [];
    hiddenStems.forEach((stem, idx) => {
      const element = WUXING_MAP[stem];
      const weight = branchWeights[idx] || 0.1;
      if (element) scores[element] += weight;
    });
  });
  
  return scores;
}

function calculateYinYangRatio(pillars: {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}) {
  let yin = 0, yang = 0;
  
  Object.values(pillars).forEach(pillar => {
    if (YINYANG_MAP[pillar.stem] === "陽") yang++;
    else yin++;
    if (YINYANG_MAP[pillar.branch] === "陽") yang++;
    else yin++;
  });
  
  return { yin, yang, yinPercent: Math.round((yin / 8) * 100), yangPercent: Math.round((yang / 8) * 100) };
}

// ========== 十神計算 ==========

const ELEMENT_RELATIONS: Record<string, { generates: string; controls: string }> = {
  木: { generates: "火", controls: "土" },
  火: { generates: "土", controls: "金" },
  土: { generates: "金", controls: "水" },
  金: { generates: "水", controls: "木" },
  水: { generates: "木", controls: "火" },
};

function calculateTenGod(dayStem: string, targetStem: string): string {
  if (dayStem === targetStem) return "比肩";
  
  const dayElement = WUXING_MAP[dayStem];
  const targetElement = WUXING_MAP[targetStem];
  const dayYinYang = YINYANG_MAP[dayStem];
  const targetYinYang = YINYANG_MAP[targetStem];
  const samePolarity = dayYinYang === targetYinYang;
  
  if (dayElement === targetElement) {
    return samePolarity ? "比肩" : "劫財";
  }
  
  const rel = ELEMENT_RELATIONS[dayElement];
  if (rel.generates === targetElement) {
    return samePolarity ? "食神" : "傷官";
  }
  if (targetElement === rel.generates) {
    // 目標生我
    const targetRel = ELEMENT_RELATIONS[targetElement];
    if (targetRel.generates === dayElement) {
      return samePolarity ? "偏印" : "正印";
    }
  }
  if (rel.controls === targetElement) {
    return samePolarity ? "偏財" : "正財";
  }
  // 目標剋我
  const targetControlsMe = ELEMENT_RELATIONS[targetElement].controls === dayElement;
  if (targetControlsMe) {
    return samePolarity ? "七殺" : "正官";
  }
  // 目標生我
  if (ELEMENT_RELATIONS[targetElement].generates === dayElement) {
    return samePolarity ? "偏印" : "正印";
  }
  
  return "未知";
}

function calculateTenGodForBranch(dayStem: string, branch: string): string {
  const hiddenStems = DIZHI_CANGGAN[branch];
  if (!hiddenStems || hiddenStems.length === 0) return "未知";
  return calculateTenGod(dayStem, hiddenStems[0]); // 取本氣
}

function calculateTenGods(pillars: {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}) {
  const dayStem = pillars.day.stem;
  
  return {
    year: {
      stem: calculateTenGod(dayStem, pillars.year.stem),
      branch: calculateTenGodForBranch(dayStem, pillars.year.branch)
    },
    month: {
      stem: calculateTenGod(dayStem, pillars.month.stem),
      branch: calculateTenGodForBranch(dayStem, pillars.month.branch)
    },
    day: {
      stem: "日元",
      branch: calculateTenGodForBranch(dayStem, pillars.day.branch)
    },
    hour: {
      stem: calculateTenGod(dayStem, pillars.hour.stem),
      branch: calculateTenGodForBranch(dayStem, pillars.hour.branch)
    }
  };
}

// ========== 簡易神煞計算 ==========

function calculateShensha(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): string[] {
  const results: string[] = [];
  const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
  
  // 天乙貴人
  const tianyiMap: Record<string, string[]> = {
    甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
    乙: ["子", "申"], 己: ["子", "申"],
    丙: ["亥", "酉"], 丁: ["亥", "酉"],
    壬: ["卯", "巳"], 癸: ["卯", "巳"],
    辛: ["寅", "午"]
  };
  const tianyiBranches = tianyiMap[dayStem] || [];
  branches.forEach((b, i) => {
    if (tianyiBranches.includes(b)) {
      results.push(`天乙貴人（${pillarNames[i]}）`);
    }
  });
  
  // 桃花
  const taohuaMap: Record<string, string> = {
    寅: "卯", 午: "卯", 戌: "卯",
    申: "酉", 子: "酉", 辰: "酉",
    亥: "子", 卯: "子", 未: "子",
    巳: "午", 酉: "午", 丑: "午"
  };
  const taohua = taohuaMap[yearBranch];
  if (taohua && branches.includes(taohua)) {
    results.push(`桃花（${pillarNames[branches.indexOf(taohua)]}）`);
  }
  
  // 驛馬
  const yimaMap: Record<string, string> = {
    寅: "申", 午: "申", 戌: "申",
    申: "寅", 子: "寅", 辰: "寅",
    亥: "巳", 卯: "巳", 未: "巳",
    巳: "亥", 酉: "亥", 丑: "亥"
  };
  const yima = yimaMap[yearBranch];
  if (yima && branches.includes(yima)) {
    results.push(`驛馬（${pillarNames[branches.indexOf(yima)]}）`);
  }
  
  // 文昌
  const wenchangMap: Record<string, string> = {
    甲: "巳", 乙: "午", 丙: "申", 丁: "酉",
    戊: "申", 己: "酉", 庚: "亥", 辛: "子",
    壬: "寅", 癸: "卯"
  };
  const wenchang = wenchangMap[dayStem];
  if (wenchang && branches.includes(wenchang)) {
    results.push(`文昌（${pillarNames[branches.indexOf(wenchang)]}）`);
  }
  
  // 華蓋
  const huagaiMap: Record<string, string> = {
    寅: "戌", 午: "戌", 戌: "戌",
    申: "辰", 子: "辰", 辰: "辰",
    亥: "未", 卯: "未", 未: "未",
    巳: "丑", 酉: "丑", 丑: "丑"
  };
  const huagai = huagaiMap[yearBranch];
  if (huagai && branches.includes(huagai)) {
    results.push(`華蓋（${pillarNames[branches.indexOf(huagai)]}）`);
  }
  
  return results;
}

// ========== 主函數 ==========

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.',
        usage: {
          method: 'POST',
          body: {
            name: '姓名 (必填)',
            gender: 'male 或 female (必填)',
            birthDate: 'YYYY-MM-DD (必填)',
            birthTime: 'HH:MM (必填)',
            timezoneOffsetMinutes: '時區偏移分鐘數，預設480 (UTC+8)'
          },
          example: {
            name: '張三',
            gender: 'male',
            birthDate: '1990-05-15',
            birthTime: '14:30',
            timezoneOffsetMinutes: 480
          }
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    );
  }

  try {
    const body = await req.json();
    const { name, gender, birthDate, birthTime, timezoneOffsetMinutes = 480 } = body;

    // 驗證必填欄位
    if (!name || !gender || !birthDate || !birthTime) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          required: ['name', 'gender', 'birthDate', 'birthTime']
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 驗證性別
    if (!['male', 'female'].includes(gender)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid gender. Must be "male" or "female".'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 解析出生日期和時間
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid birthDate format. Use YYYY-MM-DD.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const [hourStr, minuteStr] = birthTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr) || 0;

    if (isNaN(hour) || hour < 0 || hour > 23) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid birthTime format. Use HH:MM (00:00-23:59).'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`[bazi-api] Calculating for: ${name}, ${birthDate} ${birthTime}, TZ: UTC+${timezoneOffsetMinutes / 60}`);

    // 計算八字
    const tzOffset = timezoneOffsetMinutes;
    const birthUtc = createUtcFromLocalParts(birth, hour, minute, tzOffset);
    const birthLocal = toLocal(birthUtc, tzOffset);

    // 四柱計算
    const yearPillar = calculateYearPillar(birthUtc, tzOffset);
    const monthPillar = calculateMonthPillar(yearPillar.stem, birthUtc, tzOffset);
    const dayPillar = calculateDayPillar(birthLocal, hour);
    const hourPillar = calculateHourPillar(dayPillar.stem, hour);

    const pillars = {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };

    // 納音
    const nayin = {
      year: NAYIN[yearPillar.stem + yearPillar.branch] || "未知",
      month: NAYIN[monthPillar.stem + monthPillar.branch] || "未知",
      day: NAYIN[dayPillar.stem + dayPillar.branch] || "未知",
      hour: NAYIN[hourPillar.stem + hourPillar.branch] || "未知"
    };

    // 五行與陰陽
    const wuxingScores = calculateWuxingScores(pillars);
    const yinyangRatio = calculateYinYangRatio(pillars);

    // 十神
    const tenGods = calculateTenGods(pillars);

    // 神煞
    const shensha = calculateShensha(
      dayPillar.stem,
      yearPillar.branch,
      monthPillar.branch,
      dayPillar.branch,
      hourPillar.branch
    );

    // 藏干詳情
    const hiddenStems = {
      year: DIZHI_CANGGAN[yearPillar.branch] || [],
      month: DIZHI_CANGGAN[monthPillar.branch] || [],
      day: DIZHI_CANGGAN[dayPillar.branch] || [],
      hour: DIZHI_CANGGAN[hourPillar.branch] || []
    };

    console.log(`[bazi-api] Result: ${yearPillar.stem}${yearPillar.branch} ${monthPillar.stem}${monthPillar.branch} ${dayPillar.stem}${dayPillar.branch} ${hourPillar.stem}${hourPillar.branch}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          input: {
            name,
            gender,
            birthDate,
            birthTime,
            timezoneOffsetMinutes: tzOffset
          },
          pillars,
          baziString: `${yearPillar.stem}${yearPillar.branch} ${monthPillar.stem}${monthPillar.branch} ${dayPillar.stem}${dayPillar.branch} ${hourPillar.stem}${hourPillar.branch}`,
          nayin,
          hiddenStems,
          wuxingScores,
          yinyangRatio,
          tenGods,
          shensha,
          dayMaster: {
            stem: dayPillar.stem,
            element: WUXING_MAP[dayPillar.stem],
            yinyang: YINYANG_MAP[dayPillar.stem]
          }
        },
        meta: {
          version: "1.0.0",
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: unknown) {
    console.error('[bazi-api] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
