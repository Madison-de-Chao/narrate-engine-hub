import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * RSBZS v3.0 - /v1/bazi/calculate (SKU 1)
 * 
 * 八字計算核心 API - 純計算服務
 * 輸入出生時間，輸出四柱八字基礎數據
 * 
 * POST /v1-bazi-calculate
 * 
 * Headers:
 *   X-API-Key: your-api-key (必填)
 * 
 * Request Body:
 * {
 *   "year": 1990,
 *   "month": 5,
 *   "day": 15,
 *   "hour": 14,
 *   "minute": 30,
 *   "second": 0,                      // 可選，預設 0
 *   "tzOffsetMinutesEast": 480,       // 時區偏移（東半球為正）
 *   "longitude": 121.47,              // 可選，用於太陽時計算
 *   "solarTimeMode": "NONE",          // NONE | LMT | TST
 *   "ziMode": "EARLY"                 // EARLY | LATE
 * }
 */

// ============================================
// CORS & 品牌標頭
// ============================================

const RSBZS_VERSION = "3.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Powered-By': 'RSBZS',
  'X-RSBZS-Version': RSBZS_VERSION,
};

// ============================================
// 常量定義
// ============================================

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_PROPERTIES: Record<string, { element: string; yinyang: string }> = {
  "甲": { element: "木", yinyang: "陽" }, "乙": { element: "木", yinyang: "陰" },
  "丙": { element: "火", yinyang: "陽" }, "丁": { element: "火", yinyang: "陰" },
  "戊": { element: "土", yinyang: "陽" }, "己": { element: "土", yinyang: "陰" },
  "庚": { element: "金", yinyang: "陽" }, "辛": { element: "金", yinyang: "陰" },
  "壬": { element: "水", yinyang: "陽" }, "癸": { element: "水", yinyang: "陰" }
};

const BRANCH_PROPERTIES: Record<string, { element: string; yinyang: string }> = {
  "子": { element: "水", yinyang: "陽" }, "丑": { element: "土", yinyang: "陰" },
  "寅": { element: "木", yinyang: "陽" }, "卯": { element: "木", yinyang: "陰" },
  "辰": { element: "土", yinyang: "陽" }, "巳": { element: "火", yinyang: "陰" },
  "午": { element: "火", yinyang: "陽" }, "未": { element: "土", yinyang: "陰" },
  "申": { element: "金", yinyang: "陽" }, "酉": { element: "金", yinyang: "陰" },
  "戌": { element: "土", yinyang: "陽" }, "亥": { element: "水", yinyang: "陰" }
};

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

// 藏干資料
const HIDDEN_STEMS: Record<string, Array<{ stem: string; weight: number; type: string }>> = {
  "子": [{ stem: "癸", weight: 1.0, type: "本氣" }],
  "丑": [{ stem: "己", weight: 0.6, type: "本氣" }, { stem: "癸", weight: 0.3, type: "中氣" }, { stem: "辛", weight: 0.1, type: "餘氣" }],
  "寅": [{ stem: "甲", weight: 0.6, type: "本氣" }, { stem: "丙", weight: 0.3, type: "中氣" }, { stem: "戊", weight: 0.1, type: "餘氣" }],
  "卯": [{ stem: "乙", weight: 1.0, type: "本氣" }],
  "辰": [{ stem: "戊", weight: 0.6, type: "本氣" }, { stem: "乙", weight: 0.3, type: "中氣" }, { stem: "癸", weight: 0.1, type: "餘氣" }],
  "巳": [{ stem: "丙", weight: 0.6, type: "本氣" }, { stem: "戊", weight: 0.3, type: "中氣" }, { stem: "庚", weight: 0.1, type: "餘氣" }],
  "午": [{ stem: "丁", weight: 0.7, type: "本氣" }, { stem: "己", weight: 0.3, type: "中氣" }],
  "未": [{ stem: "己", weight: 0.6, type: "本氣" }, { stem: "丁", weight: 0.3, type: "中氣" }, { stem: "乙", weight: 0.1, type: "餘氣" }],
  "申": [{ stem: "庚", weight: 0.6, type: "本氣" }, { stem: "壬", weight: 0.3, type: "中氣" }, { stem: "戊", weight: 0.1, type: "餘氣" }],
  "酉": [{ stem: "辛", weight: 1.0, type: "本氣" }],
  "戌": [{ stem: "戊", weight: 0.6, type: "本氣" }, { stem: "辛", weight: 0.3, type: "中氣" }, { stem: "丁", weight: 0.1, type: "餘氣" }],
  "亥": [{ stem: "壬", weight: 0.7, type: "本氣" }, { stem: "甲", weight: 0.3, type: "中氣" }]
};

// 五虎遁月
const FIVE_TIGERS: Record<string, Record<string, string>> = {
  "甲": { "寅": "丙", "卯": "丁", "辰": "戊", "巳": "己", "午": "庚", "未": "辛", "申": "壬", "酉": "癸", "戌": "甲", "亥": "乙", "子": "丙", "丑": "丁" },
  "乙": { "寅": "戊", "卯": "己", "辰": "庚", "巳": "辛", "午": "壬", "未": "癸", "申": "甲", "酉": "乙", "戌": "丙", "亥": "丁", "子": "戊", "丑": "己" },
  "丙": { "寅": "庚", "卯": "辛", "辰": "壬", "巳": "癸", "午": "甲", "未": "乙", "申": "丙", "酉": "丁", "戌": "戊", "亥": "己", "子": "庚", "丑": "辛" },
  "丁": { "寅": "壬", "卯": "癸", "辰": "甲", "巳": "乙", "午": "丙", "未": "丁", "申": "戊", "酉": "己", "戌": "庚", "亥": "辛", "子": "壬", "丑": "癸" },
  "戊": { "寅": "甲", "卯": "乙", "辰": "丙", "巳": "丁", "午": "戊", "未": "己", "申": "庚", "酉": "辛", "戌": "壬", "亥": "癸", "子": "甲", "丑": "乙" },
  "己": { "寅": "丙", "卯": "丁", "辰": "戊", "巳": "己", "午": "庚", "未": "辛", "申": "壬", "酉": "癸", "戌": "甲", "亥": "乙", "子": "丙", "丑": "丁" },
  "庚": { "寅": "戊", "卯": "己", "辰": "庚", "巳": "辛", "午": "壬", "未": "癸", "申": "甲", "酉": "乙", "戌": "丙", "亥": "丁", "子": "戊", "丑": "己" },
  "辛": { "寅": "庚", "卯": "辛", "辰": "壬", "巳": "癸", "午": "甲", "未": "乙", "申": "丙", "酉": "丁", "戌": "戊", "亥": "己", "子": "庚", "丑": "辛" },
  "壬": { "寅": "壬", "卯": "癸", "辰": "甲", "巳": "乙", "午": "丙", "未": "丁", "申": "戊", "酉": "己", "戌": "庚", "亥": "辛", "子": "壬", "丑": "癸" },
  "癸": { "寅": "甲", "卯": "乙", "辰": "丙", "巳": "丁", "午": "戊", "未": "己", "申": "庚", "酉": "辛", "戌": "壬", "亥": "癸", "子": "甲", "丑": "乙" }
};

// 五鼠遁時
const FIVE_RATS: Record<string, Record<string, string>> = {
  "甲": { "子": "甲", "丑": "乙", "寅": "丙", "卯": "丁", "辰": "戊", "巳": "己", "午": "庚", "未": "辛", "申": "壬", "酉": "癸", "戌": "甲", "亥": "乙" },
  "乙": { "子": "丙", "丑": "丁", "寅": "戊", "卯": "己", "辰": "庚", "巳": "辛", "午": "壬", "未": "癸", "申": "甲", "酉": "乙", "戌": "丙", "亥": "丁" },
  "丙": { "子": "戊", "丑": "己", "寅": "庚", "卯": "辛", "辰": "壬", "巳": "癸", "午": "甲", "未": "乙", "申": "丙", "酉": "丁", "戌": "戊", "亥": "己" },
  "丁": { "子": "庚", "丑": "辛", "寅": "壬", "卯": "癸", "辰": "甲", "巳": "乙", "午": "丙", "未": "丁", "申": "戊", "酉": "己", "戌": "庚", "亥": "辛" },
  "戊": { "子": "壬", "丑": "癸", "寅": "甲", "卯": "乙", "辰": "丙", "巳": "丁", "午": "戊", "未": "己", "申": "庚", "酉": "辛", "戌": "壬", "亥": "癸" },
  "己": { "子": "甲", "丑": "乙", "寅": "丙", "卯": "丁", "辰": "戊", "巳": "己", "午": "庚", "未": "辛", "申": "壬", "酉": "癸", "戌": "甲", "亥": "乙" },
  "庚": { "子": "丙", "丑": "丁", "寅": "戊", "卯": "己", "辰": "庚", "巳": "辛", "午": "壬", "未": "癸", "申": "甲", "酉": "乙", "戌": "丙", "亥": "丁" },
  "辛": { "子": "戊", "丑": "己", "寅": "庚", "卯": "辛", "辰": "壬", "巳": "癸", "午": "甲", "未": "乙", "申": "丙", "酉": "丁", "戌": "戊", "亥": "己" },
  "壬": { "子": "庚", "丑": "辛", "寅": "壬", "卯": "癸", "辰": "甲", "巳": "乙", "午": "丙", "未": "丁", "申": "戊", "酉": "己", "戌": "庚", "亥": "辛" },
  "癸": { "子": "壬", "丑": "癸", "寅": "甲", "卯": "乙", "辰": "丙", "巳": "丁", "午": "戊", "未": "己", "申": "庚", "酉": "辛", "戌": "壬", "亥": "癸" }
};

// 關鍵節氣資料庫
const SOLAR_TERMS_DATA: Record<string, Record<string, string>> = {
  "2020": { "小寒": "2020-01-06", "立春": "2020-02-04", "驚蟄": "2020-03-05", "清明": "2020-04-04", "立夏": "2020-05-05", "芒種": "2020-06-05", "小暑": "2020-07-06", "立秋": "2020-08-07", "白露": "2020-09-07", "寒露": "2020-10-08", "立冬": "2020-11-07", "大雪": "2020-12-07" },
  "2021": { "小寒": "2021-01-05", "立春": "2021-02-03", "驚蟄": "2021-03-05", "清明": "2021-04-04", "立夏": "2021-05-05", "芒種": "2021-06-05", "小暑": "2021-07-07", "立秋": "2021-08-07", "白露": "2021-09-07", "寒露": "2021-10-08", "立冬": "2021-11-07", "大雪": "2021-12-07" },
  "2022": { "小寒": "2022-01-05", "立春": "2022-02-04", "驚蟄": "2022-03-05", "清明": "2022-04-05", "立夏": "2022-05-05", "芒種": "2022-06-06", "小暑": "2022-07-07", "立秋": "2022-08-07", "白露": "2022-09-07", "寒露": "2022-10-08", "立冬": "2022-11-07", "大雪": "2022-12-07" },
  "2023": { "小寒": "2023-01-05", "立春": "2023-02-04", "驚蟄": "2023-03-06", "清明": "2023-04-05", "立夏": "2023-05-06", "芒種": "2023-06-06", "小暑": "2023-07-07", "立秋": "2023-08-08", "白露": "2023-09-08", "寒露": "2023-10-08", "立冬": "2023-11-08", "大雪": "2023-12-07" },
  "2024": { "小寒": "2024-01-06", "立春": "2024-02-04", "驚蟄": "2024-03-05", "清明": "2024-04-04", "立夏": "2024-05-05", "芒種": "2024-06-05", "小暑": "2024-07-06", "立秋": "2024-08-07", "白露": "2024-09-07", "寒露": "2024-10-08", "立冬": "2024-11-07", "大雪": "2024-12-07" },
  "2025": { "小寒": "2025-01-05", "立春": "2025-02-03", "驚蟄": "2025-03-05", "清明": "2025-04-04", "立夏": "2025-05-05", "芒種": "2025-06-05", "小暑": "2025-07-07", "立秋": "2025-08-07", "白露": "2025-09-07", "寒露": "2025-10-08", "立冬": "2025-11-07", "大雪": "2025-12-07" },
};

const SOLAR_TERM_BRANCH: Record<string, number> = {
  "立春": 2, "驚蟄": 3, "清明": 4, "立夏": 5,
  "芒種": 6, "小暑": 7, "立秋": 8, "白露": 9,
  "寒露": 10, "立冬": 11, "大雪": 0, "小寒": 1,
};

// ============================================
// 輔助函式
// ============================================

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ApiKeyRecord {
  id: string;
  user_id: string;
  api_key: string;
  is_active: boolean;
  requests_count: number;
}

async function verifyApiKey(apiKey: string): Promise<{ valid: boolean; keyId?: string; error?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key is required. Include X-API-Key header.' };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, user_id, api_key, is_active, requests_count')
      .eq('api_key', apiKey)
      .single();

    if (fetchError || !keyData) {
      console.log('[v1-calculate] API key not found:', apiKey.substring(0, 8) + '...');
      return { valid: false, error: 'Invalid API key.' };
    }

    const key = keyData as ApiKeyRecord;

    if (!key.is_active) {
      return { valid: false, error: 'API key is inactive.' };
    }

    await supabase
      .from('api_keys')
      .update({ 
        requests_count: key.requests_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', key.id);

    console.log(`[v1-calculate] API key verified: ${key.id}`);
    return { valid: true, keyId: key.id };
  } catch (error) {
    console.error('[v1-calculate] API key verification error:', error);
    return { valid: false, error: 'API key verification failed.' };
  }
}

function getHourBranchIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;
  if (hour >= 1 && hour < 3) return 1;
  if (hour >= 3 && hour < 5) return 2;
  if (hour >= 5 && hour < 7) return 3;
  if (hour >= 7 && hour < 9) return 4;
  if (hour >= 9 && hour < 11) return 5;
  if (hour >= 11 && hour < 13) return 6;
  if (hour >= 13 && hour < 15) return 7;
  if (hour >= 15 && hour < 17) return 8;
  if (hour >= 17 && hour < 19) return 9;
  if (hour >= 19 && hour < 21) return 10;
  return 11;
}

function getLichunDate(year: number): Date {
  const yearData = SOLAR_TERMS_DATA[String(year)];
  if (yearData?.["立春"]) {
    return new Date(yearData["立春"] + "T00:00:00+08:00");
  }
  return new Date(year, 1, 4);
}

function getMonthBranchIndex(birthDate: Date, year: number): number {
  const yearData = SOLAR_TERMS_DATA[String(year)];
  if (!yearData) {
    const month = birthDate.getMonth();
    return (month + 2) % 12;
  }

  const terms = ["小寒", "立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
  
  for (let i = terms.length - 1; i >= 0; i--) {
    const termDate = new Date(yearData[terms[i]] + "T00:00:00+08:00");
    if (birthDate >= termDate) {
      return SOLAR_TERM_BRANCH[terms[i]];
    }
  }
  
  const prevYearData = SOLAR_TERMS_DATA[String(year - 1)];
  if (prevYearData?.["大雪"]) {
    const daxueDate = new Date(prevYearData["大雪"] + "T00:00:00+08:00");
    if (birthDate >= daxueDate) {
      return 0;
    }
  }
  
  return 1;
}

function calculateEquationOfTimeSeconds(dateUtc: Date): number {
  const startOfYear = new Date(Date.UTC(dateUtc.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return Math.round(eotMinutes * 60);
}

function applySolarTime(
  hour: number, 
  minute: number, 
  second: number,
  tzOffsetMinutesEast: number, 
  longitude: number | undefined, 
  mode: string
): { adjustedHour: number; dayDelta: number; offsetSeconds: number } {
  if (mode === "NONE" || longitude === undefined) {
    return { adjustedHour: hour, dayDelta: 0, offsetSeconds: 0 };
  }

  const standardMeridian = (tzOffsetMinutesEast / 60) * 15;
  const lmtOffsetSeconds = (longitude - standardMeridian) * 240;
  
  let eotSeconds = 0;
  if (mode === "TST") {
    const now = new Date();
    eotSeconds = calculateEquationOfTimeSeconds(now);
  }

  const totalOffsetSeconds = lmtOffsetSeconds + eotSeconds;
  const localTotalSeconds = hour * 3600 + minute * 60 + second;
  const adjustedTotalSeconds = localTotalSeconds + totalOffsetSeconds;

  const dayDelta = Math.floor(adjustedTotalSeconds / 86400);
  let normalizedSeconds = adjustedTotalSeconds % 86400;
  if (normalizedSeconds < 0) normalizedSeconds += 86400;

  const adjHour = Math.floor(normalizedSeconds / 3600);
  
  return { adjustedHour: adjHour, dayDelta, offsetSeconds: Math.round(totalOffsetSeconds) };
}

// ============================================
// 主計算函式
// ============================================

interface CalculateInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  tzOffsetMinutesEast: number;
  longitude?: number;
  solarTimeMode: string;
  ziMode: string;
}

function calculateBazi(input: CalculateInput) {
  const { year, month, day, hour, minute, tzOffsetMinutesEast, longitude, solarTimeMode, ziMode } = input;
  const second = input.second ?? 0;

  // 太陽時校正
  const solarResult = applySolarTime(hour, minute, second, tzOffsetMinutesEast, longitude, solarTimeMode);
  const adjHour = solarResult.adjustedHour;
  const dayDelta = solarResult.dayDelta;

  // 計算調整後的日期
  const adjustedDate = new Date(year, month - 1, day + dayDelta);
  const adjYear = adjustedDate.getFullYear();
  const adjMonth = adjustedDate.getMonth() + 1;
  const adjDay = adjustedDate.getDate();

  // 子時換日處理
  let dayPillarDate = new Date(adjYear, adjMonth - 1, adjDay);
  if (adjHour === 23 && ziMode === "EARLY") {
    dayPillarDate = new Date(adjYear, adjMonth - 1, adjDay + 1);
  }

  // 年柱
  const lichunDate = getLichunDate(adjYear);
  const birthDate = new Date(adjYear, adjMonth - 1, adjDay);
  let actualYear = adjYear;
  if (birthDate < lichunDate) {
    actualYear = adjYear - 1;
  }
  
  const yearsSince1984 = actualYear - 1984;
  let yearStemIndex = yearsSince1984 % 10;
  let yearBranchIndex = yearsSince1984 % 12;
  if (yearStemIndex < 0) yearStemIndex += 10;
  if (yearBranchIndex < 0) yearBranchIndex += 12;
  
  const yearStem = TIANGAN[yearStemIndex];
  const yearBranch = DIZHI[yearBranchIndex];

  // 月柱
  const monthBranchIndex = getMonthBranchIndex(birthDate, actualYear);
  const monthBranch = DIZHI[monthBranchIndex];
  const monthStem = FIVE_TIGERS[yearStem]?.[monthBranch] ?? TIANGAN[0];

  // 日柱
  const BASE_DATE = new Date(Date.UTC(1985, 8, 22));
  const timeDiff = dayPillarDate.getTime() - BASE_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  let jiaziIndex = daysDiff % 60;
  if (jiaziIndex < 0) jiaziIndex += 60;
  
  const dayStemIndex = jiaziIndex % 10;
  const dayBranchIndex = jiaziIndex % 12;
  const dayStem = TIANGAN[dayStemIndex];
  const dayBranch = DIZHI[dayBranchIndex];

  // 時柱
  const hourBranchIndex = getHourBranchIndex(adjHour);
  const hourBranch = DIZHI[hourBranchIndex];
  const hourStem = FIVE_RATS[dayStem]?.[hourBranch] ?? TIANGAN[0];

  // 納音
  const nayin = {
    year: NAYIN[yearStem + yearBranch] ?? "未知",
    month: NAYIN[monthStem + monthBranch] ?? "未知",
    day: NAYIN[dayStem + dayBranch] ?? "未知",
    hour: NAYIN[hourStem + hourBranch] ?? "未知"
  };

  // 藏干
  const hiddenStems = {
    year: HIDDEN_STEMS[yearBranch] ?? [],
    month: HIDDEN_STEMS[monthBranch] ?? [],
    day: HIDDEN_STEMS[dayBranch] ?? [],
    hour: HIDDEN_STEMS[hourBranch] ?? []
  };

  // 五行統計
  const wuxingScores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const allStems = [yearStem, monthStem, dayStem, hourStem];
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  
  allStems.forEach(stem => {
    const el = STEM_PROPERTIES[stem]?.element;
    if (el) wuxingScores[el] += 1;
  });
  
  allBranches.forEach(branch => {
    const el = BRANCH_PROPERTIES[branch]?.element;
    if (el) wuxingScores[el] += 0.8;
  });

  // 陰陽統計
  let yang = 0, yin = 0;
  allStems.forEach(stem => {
    if (STEM_PROPERTIES[stem]?.yinyang === "陽") yang++; else yin++;
  });
  allBranches.forEach(branch => {
    if (BRANCH_PROPERTIES[branch]?.yinyang === "陽") yang++; else yin++;
  });

  return {
    pillars: {
      year: { stem: yearStem, branch: yearBranch },
      month: { stem: monthStem, branch: monthBranch },
      day: { stem: dayStem, branch: dayBranch },
      hour: { stem: hourStem, branch: hourBranch }
    },
    nayin,
    hiddenStems,
    wuxingScores,
    yinyangRatio: { 
      yang: Math.round((yang / 8) * 100), 
      yin: Math.round((yin / 8) * 100) 
    },
    meta: {
      solarTimeMode,
      ziMode,
      dayDelta: solarResult.dayDelta,
      solarOffsetSeconds: solarResult.offsetSeconds,
      adjustedHour: adjHour,
      calculatedAt: new Date().toISOString(),
      version: RSBZS_VERSION
    }
  };
}

// ============================================
// HTTP 服務
// ============================================

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // API Key 驗證
    const apiKey = req.headers.get('x-api-key') || '';
    const keyVerification = await verifyApiKey(apiKey);
    
    if (!keyVerification.valid) {
      console.log('[v1-calculate] API key verification failed');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { code: 'UNAUTHORIZED', message: keyVerification.error }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析請求
    const body = await req.json();
    console.log('[v1-calculate] Request received:', JSON.stringify(body));

    // 輸入驗證
    const requiredFields = ['year', 'month', 'day', 'hour', 'minute', 'tzOffsetMinutesEast', 'solarTimeMode', 'ziMode'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: { code: 'VALIDATION_ERROR', message: `Missing required field: ${field}` }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 執行計算
    const result = calculateBazi(body as CalculateInput);

    const responseTime = Date.now() - startTime;
    console.log(`[v1-calculate] Calculation completed in ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        _meta: {
          responseTimeMs: responseTime,
          apiVersion: 'v1',
          sku: 'calculate'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[v1-calculate] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
