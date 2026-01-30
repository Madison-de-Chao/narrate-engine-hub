import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * 內部八字計算 API v1.0
 * 
 * 專為內部產品（尋妖記、元壹卜卦等）設計的輕量級 API
 * 使用 Service Role Key 或內部 API Key 認證
 * 
 * POST /internal-bazi-api
 * 
 * Headers:
 *   X-Internal-Key: your-internal-key (必填)
 * 
 * Request Body:
 * {
 *   "year": 1990,
 *   "month": 5,
 *   "day": 15,
 *   "hour": 14,
 *   "minute": 30,
 *   "tzOffsetMinutesEast": 480  // 可選，預設 UTC+8
 * }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// 內部 API Key (從 Secrets 讀取)
const INTERNAL_API_KEY = Deno.env.get('INTERNAL_API_KEY');

// ========== 天干地支資料 ==========
const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_PROPERTIES: Record<string, { element: string; yinyang: string }> = {
  "甲": { element: "木", yinyang: "陽" },
  "乙": { element: "木", yinyang: "陰" },
  "丙": { element: "火", yinyang: "陽" },
  "丁": { element: "火", yinyang: "陰" },
  "戊": { element: "土", yinyang: "陽" },
  "己": { element: "土", yinyang: "陰" },
  "庚": { element: "金", yinyang: "陽" },
  "辛": { element: "金", yinyang: "陰" },
  "壬": { element: "水", yinyang: "陽" },
  "癸": { element: "水", yinyang: "陰" }
};

const BRANCH_PROPERTIES: Record<string, { element: string; yinyang: string }> = {
  "子": { element: "水", yinyang: "陽" },
  "丑": { element: "土", yinyang: "陰" },
  "寅": { element: "木", yinyang: "陽" },
  "卯": { element: "木", yinyang: "陰" },
  "辰": { element: "土", yinyang: "陽" },
  "巳": { element: "火", yinyang: "陰" },
  "午": { element: "火", yinyang: "陽" },
  "未": { element: "土", yinyang: "陰" },
  "申": { element: "金", yinyang: "陽" },
  "酉": { element: "金", yinyang: "陰" },
  "戌": { element: "土", yinyang: "陽" },
  "亥": { element: "水", yinyang: "陰" }
};

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

// 地支藏干
const DIZHI_CANGGAN: Record<string, string[]> = {
  "子": ["癸"], "丑": ["己", "癸", "辛"], "寅": ["甲", "丙", "戊"],
  "卯": ["乙"], "辰": ["戊", "乙", "癸"], "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"], "未": ["己", "丁", "乙"], "申": ["庚", "壬", "戊"],
  "酉": ["辛"], "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"]
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

// 五虎遁年起月
const WUHU_DUN: Record<string, string> = {
  "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
  "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲"
};

// 五鼠遁日起時
const WUSHU_DUN: Record<string, string> = {
  "甲": "甲", "乙": "丙", "丙": "戊", "丁": "庚", "戊": "壬",
  "己": "甲", "庚": "丙", "辛": "戊", "壬": "庚", "癸": "壬"
};

// 節氣資料
const SOLAR_TERMS_DATA: Record<string, Record<string, string>> = {
  "1950": { "小寒": "1950-01-06", "立春": "1950-02-04", "驚蟄": "1950-03-06", "清明": "1950-04-05", "立夏": "1950-05-06", "芒種": "1950-06-06", "小暑": "1950-07-07", "立秋": "1950-08-08", "白露": "1950-09-08", "寒露": "1950-10-08", "立冬": "1950-11-08", "大雪": "1950-12-07" },
  "1980": { "小寒": "1980-01-06", "立春": "1980-02-05", "驚蟄": "1980-03-05", "清明": "1980-04-04", "立夏": "1980-05-05", "芒種": "1980-06-05", "小暑": "1980-07-07", "立秋": "1980-08-07", "白露": "1980-09-07", "寒露": "1980-10-08", "立冬": "1980-11-07", "大雪": "1980-12-07" },
  "1985": { "小寒": "1985-01-05", "立春": "1985-02-04", "驚蟄": "1985-03-05", "清明": "1985-04-05", "立夏": "1985-05-05", "芒種": "1985-06-06", "小暑": "1985-07-07", "立秋": "1985-08-07", "白露": "1985-09-07", "寒露": "1985-10-08", "立冬": "1985-11-07", "大雪": "1985-12-07" },
  "1990": { "小寒": "1990-01-05", "立春": "1990-02-04", "驚蟄": "1990-03-06", "清明": "1990-04-05", "立夏": "1990-05-05", "芒種": "1990-06-06", "小暑": "1990-07-07", "立秋": "1990-08-07", "白露": "1990-09-08", "寒露": "1990-10-08", "立冬": "1990-11-07", "大雪": "1990-12-07" },
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
  "2026": { "小寒": "2026-01-05", "立春": "2026-02-04", "驚蟄": "2026-03-05", "清明": "2026-04-05", "立夏": "2026-05-05", "芒種": "2026-06-05", "小暑": "2026-07-07", "立秋": "2026-08-07", "白露": "2026-09-07", "寒露": "2026-10-08", "立冬": "2026-11-07", "大雪": "2026-12-07" },
  "2030": { "小寒": "2030-01-05", "立春": "2030-02-04", "驚蟄": "2030-03-05", "清明": "2030-04-05", "立夏": "2030-05-05", "芒種": "2030-06-05", "小暑": "2030-07-07", "立秋": "2030-08-07", "白露": "2030-09-07", "寒露": "2030-10-08", "立冬": "2030-11-07", "大雪": "2030-12-07" },
};

// 節氣對應月支
const SOLAR_TERM_BRANCH: Record<string, number> = {
  "立春": 2, "驚蟄": 3, "清明": 4, "立夏": 5,
  "芒種": 6, "小暑": 7, "立秋": 8, "白露": 9,
  "寒露": 10, "立冬": 11, "大雪": 0, "小寒": 1,
};

// ========== 計算函數 ==========

function getJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getYearPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  const yearTerms = SOLAR_TERMS_DATA[year.toString()];
  let effectiveYear = year;
  
  if (yearTerms) {
    const lichunStr = yearTerms["立春"];
    if (lichunStr) {
      const [ly, lm, ld] = lichunStr.split('-').map(Number);
      const lichunJdn = getJDN(ly, lm, ld);
      const birthJdn = getJDN(year, month, day);
      if (birthJdn < lichunJdn) {
        effectiveYear = year - 1;
      }
    }
  }
  
  const stemIndex = (effectiveYear - 4) % 10;
  const branchIndex = (effectiveYear - 4) % 12;
  return { 
    stem: TIANGAN[(stemIndex + 10) % 10], 
    branch: DIZHI[(branchIndex + 12) % 12] 
  };
}

function getMonthPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  const TERMS_ORDER = ["小寒", "立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
  
  let effectiveYear = year;
  let branchIndex = 2; // 預設寅月
  
  // 查找當前日期對應的月支
  const yearTerms = SOLAR_TERMS_DATA[year.toString()];
  const prevYearTerms = SOLAR_TERMS_DATA[(year - 1).toString()];
  
  if (yearTerms) {
    const birthJdn = getJDN(year, month, day);
    
    // 檢查是否在立春前
    const lichunStr = yearTerms["立春"];
    if (lichunStr) {
      const [ly, lm, ld] = lichunStr.split('-').map(Number);
      if (birthJdn < getJDN(ly, lm, ld)) {
        effectiveYear = year - 1;
        // 在立春前，需要用上一年的大雪後的丑月
        if (prevYearTerms) {
          const daxueStr = prevYearTerms["大雪"];
          if (daxueStr) {
            const [dy, dm, dd] = daxueStr.split('-').map(Number);
            if (birthJdn >= getJDN(dy, dm, dd)) {
              branchIndex = 0; // 子月
            } else {
              // 小寒到大雪之間的月份
              const xiaohanStr = yearTerms["小寒"];
              if (xiaohanStr) {
                const [xy, xm, xd] = xiaohanStr.split('-').map(Number);
                if (birthJdn >= getJDN(xy, xm, xd)) {
                  branchIndex = 1; // 丑月
                }
              }
            }
          }
        }
      } else {
        // 立春後，按節氣確定月支
        for (let i = TERMS_ORDER.length - 1; i >= 0; i--) {
          const termName = TERMS_ORDER[i];
          const termStr = yearTerms[termName];
          if (termStr) {
            const [ty, tm, td] = termStr.split('-').map(Number);
            if (birthJdn >= getJDN(ty, tm, td)) {
              branchIndex = SOLAR_TERM_BRANCH[termName];
              break;
            }
          }
        }
      }
    }
  }
  
  // 根據年干計算月干
  const yearPillar = getYearPillar(effectiveYear, month, day);
  const yearStemIdx = TIANGAN.indexOf(yearPillar.stem);
  const baseMonthStem = WUHU_DUN[yearPillar.stem];
  const baseIdx = TIANGAN.indexOf(baseMonthStem);
  const monthStemIdx = (baseIdx + (branchIndex + 10) % 12) % 10;
  
  return { 
    stem: TIANGAN[monthStemIdx], 
    branch: DIZHI[branchIndex] 
  };
}

function getDayPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  const jdn = getJDN(year, month, day);
  const K = 49; // Calibration constant
  const rawMod60 = jdn % 60;
  const cycleIndex = (rawMod60 + K + 60) % 60;
  
  const stemIndex = cycleIndex % 10;
  const branchIndex = cycleIndex % 12;
  
  return { stem: TIANGAN[stemIndex], branch: DIZHI[branchIndex] };
}

function getHourPillar(dayStem: string, hour: number): { stem: string; branch: string } {
  // 時辰對應地支
  const hourBranchIdx = Math.floor((hour + 1) / 2) % 12;
  
  // 根據日干計算時干
  const baseHourStem = WUSHU_DUN[dayStem];
  const baseIdx = TIANGAN.indexOf(baseHourStem);
  const hourStemIdx = (baseIdx + hourBranchIdx) % 10;
  
  return { stem: TIANGAN[hourStemIdx], branch: DIZHI[hourBranchIdx] };
}

function calculateWuxingScores(pillars: { year: any; month: any; day: any; hour: any }): Record<string, number> {
  const scores: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  
  const allChars = [
    pillars.year.stem, pillars.year.branch,
    pillars.month.stem, pillars.month.branch,
    pillars.day.stem, pillars.day.branch,
    pillars.hour.stem, pillars.hour.branch
  ];
  
  for (const char of allChars) {
    const element = WUXING_MAP[char];
    if (element) {
      scores[element]++;
    }
  }
  
  return scores;
}

function calculateYinyangRatio(pillars: { year: any; month: any; day: any; hour: any }): { yin: number; yang: number } {
  let yin = 0;
  let yang = 0;
  
  const allChars = [
    pillars.year.stem, pillars.year.branch,
    pillars.month.stem, pillars.month.branch,
    pillars.day.stem, pillars.day.branch,
    pillars.hour.stem, pillars.hour.branch
  ];
  
  for (const char of allChars) {
    const yy = YINYANG_MAP[char];
    if (yy === "陰") yin++;
    else if (yy === "陽") yang++;
  }
  
  return { yin, yang };
}

function getHiddenStems(branch: string): string[] {
  return DIZHI_CANGGAN[branch] || [];
}

function getNayin(stem: string, branch: string): string {
  return NAYIN[stem + branch] || "";
}

// 計算十神
function calculateTenGods(dayStem: string, pillars: { year: any; month: any; day: any; hour: any }): Record<string, { stem: string; branch: string }> {
  const dayStemElement = STEM_PROPERTIES[dayStem].element;
  const dayStemYinyang = STEM_PROPERTIES[dayStem].yinyang;
  
  const getGodRelation = (targetStem: string): string => {
    const targetElement = STEM_PROPERTIES[targetStem]?.element || BRANCH_PROPERTIES[targetStem]?.element;
    const targetYinyang = STEM_PROPERTIES[targetStem]?.yinyang || BRANCH_PROPERTIES[targetStem]?.yinyang;
    
    if (!targetElement) return "";
    
    const sameYinyang = dayStemYinyang === targetYinyang;
    
    // 同我者比劫
    if (targetElement === dayStemElement) {
      return sameYinyang ? "比肩" : "劫財";
    }
    
    // 生我者印星
    const generatesMap: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
    for (const [gen, rec] of Object.entries(generatesMap)) {
      if (gen === targetElement && rec === dayStemElement) {
        return sameYinyang ? "偏印" : "正印";
      }
    }
    
    // 我生者食傷
    if (generatesMap[dayStemElement] === targetElement) {
      return sameYinyang ? "食神" : "傷官";
    }
    
    // 我剋者財星
    const controlsMap: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" };
    if (controlsMap[dayStemElement] === targetElement) {
      return sameYinyang ? "偏財" : "正財";
    }
    
    // 剋我者官殺
    for (const [ctrl, victim] of Object.entries(controlsMap)) {
      if (ctrl === targetElement && victim === dayStemElement) {
        return sameYinyang ? "七殺" : "正官";
      }
    }
    
    return "";
  };
  
  return {
    year: { 
      stem: getGodRelation(pillars.year.stem), 
      branch: getGodRelation(DIZHI_CANGGAN[pillars.year.branch]?.[0] || "") 
    },
    month: { 
      stem: getGodRelation(pillars.month.stem), 
      branch: getGodRelation(DIZHI_CANGGAN[pillars.month.branch]?.[0] || "") 
    },
    day: { 
      stem: "日主", 
      branch: getGodRelation(DIZHI_CANGGAN[pillars.day.branch]?.[0] || "") 
    },
    hour: { 
      stem: getGodRelation(pillars.hour.stem), 
      branch: getGodRelation(DIZHI_CANGGAN[pillars.hour.branch]?.[0] || "") 
    }
  };
}

// ========== 驗證內部 API Key ==========
function verifyInternalKey(providedKey: string | null): { valid: boolean; error?: string } {
  if (!providedKey) {
    return { valid: false, error: 'X-Internal-Key header is required' };
  }
  
  if (!INTERNAL_API_KEY) {
    console.error('[internal-bazi-api] INTERNAL_API_KEY not configured in secrets');
    return { valid: false, error: 'Internal API not configured' };
  }
  
  if (providedKey !== INTERNAL_API_KEY) {
    console.log('[internal-bazi-api] Invalid internal key provided');
    return { valid: false, error: 'Invalid internal key' };
  }
  
  return { valid: true };
}

// ========== 主處理函數 ==========
serve(async (req) => {
  const startTime = Date.now();
  
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // 驗證內部 API Key
    const internalKey = req.headers.get('X-Internal-Key');
    const keyVerification = verifyInternalKey(internalKey);
    
    if (!keyVerification.valid) {
      return new Response(
        JSON.stringify({ success: false, error: keyVerification.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 解析請求體
    const body = await req.json();
    const { year, month, day, hour, minute = 0, tzOffsetMinutesEast = 480 } = body;
    
    // 驗證必填欄位
    if (!year || !month || !day || hour === undefined) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: year, month, day, hour' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 驗證數值範圍
    if (year < 1900 || year > 2100) {
      return new Response(
        JSON.stringify({ success: false, error: 'Year must be between 1900 and 2100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid date/time values' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 計算四柱
    const yearPillar = getYearPillar(year, month, day);
    const monthPillar = getMonthPillar(year, month, day);
    const dayPillar = getDayPillar(year, month, day);
    const hourPillar = getHourPillar(dayPillar.stem, hour);
    
    const pillars = {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };
    
    // 計算納音
    const nayin = {
      year: getNayin(yearPillar.stem, yearPillar.branch),
      month: getNayin(monthPillar.stem, monthPillar.branch),
      day: getNayin(dayPillar.stem, dayPillar.branch),
      hour: getNayin(hourPillar.stem, hourPillar.branch)
    };
    
    // 計算藏干
    const hiddenStems = {
      year: getHiddenStems(yearPillar.branch),
      month: getHiddenStems(monthPillar.branch),
      day: getHiddenStems(dayPillar.branch),
      hour: getHiddenStems(hourPillar.branch)
    };
    
    // 計算五行
    const wuxingScores = calculateWuxingScores(pillars);
    
    // 計算陰陽
    const yinyangRatio = calculateYinyangRatio(pillars);
    
    // 計算十神
    const tenGods = calculateTenGods(dayPillar.stem, pillars);
    
    const responseTime = Date.now() - startTime;
    
    console.log(`[internal-bazi-api] Calculated bazi for ${year}-${month}-${day} ${hour}:${minute} in ${responseTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          input: { year, month, day, hour, minute, tzOffsetMinutesEast },
          pillars,
          nayin,
          hiddenStems,
          wuxingScores,
          yinyangRatio,
          tenGods,
          dayStem: dayPillar.stem,
          dayMaster: {
            stem: dayPillar.stem,
            element: STEM_PROPERTIES[dayPillar.stem].element,
            yinyang: STEM_PROPERTIES[dayPillar.stem].yinyang
          }
        },
        meta: {
          version: "1.0.0",
          responseTimeMs: responseTime
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('[internal-bazi-api] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
