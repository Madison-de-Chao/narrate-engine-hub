import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";

/**
 * 八字計算公開 API v2.1 - 完整版（含 API Key 驗證）
 * 
 * 包含完整的十神和神煞計算邏輯（隱藏於後端）
 * 
 * POST /bazi-api
 * 
 * Headers:
 *   X-API-Key: your-api-key (必填)
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
 *     "shensha": [...],
 *     "shenshaDetails": [...]  // 完整神煞資訊
 *   }
 * }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Supabase client for API key verification
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ApiKeyRecord {
  id: string;
  user_id: string;
  api_key: string | null;
  api_key_hash: string | null;
  is_active: boolean;
  requests_count: number;
}

// SHA-256 hash function for API key verification
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify API key and update usage (supports both hashed and legacy plaintext keys)
async function verifyApiKey(apiKey: string): Promise<{ valid: boolean; keyId?: string; error?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key is required. Include X-API-Key header.' };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, try to find by hash (new secure method)
    const apiKeyHash = await hashApiKey(apiKey);
    let { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, user_id, api_key, api_key_hash, is_active, requests_count')
      .eq('api_key_hash', apiKeyHash)
      .eq('is_active', true)
      .single();

    // If not found by hash, try legacy plaintext lookup (for migration period)
    if (fetchError || !keyData) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('api_keys')
        .select('id, user_id, api_key, api_key_hash, is_active, requests_count')
        .eq('api_key', apiKey)
        .single();
      
      if (legacyError || !legacyData) {
        console.log('[bazi-api] API key not found:', apiKey.substring(0, 8) + '...');
        return { valid: false, error: 'Invalid API key.' };
      }
      
      keyData = legacyData;
      
      // Migrate legacy key to hashed storage
      console.log('[bazi-api] Migrating legacy API key to hashed storage:', keyData.id);
      const { error: migrateError } = await supabase
        .from('api_keys')
        .update({ 
          api_key_hash: apiKeyHash,
          api_key_prefix: apiKey.substring(0, 7),
          api_key: null // Clear plaintext after migration
        })
        .eq('id', keyData.id);
      
      if (migrateError) {
        console.error('[bazi-api] Failed to migrate API key:', migrateError);
      }
    }

    const key = keyData as ApiKeyRecord;

    if (!key.is_active) {
      console.log('[bazi-api] API key is inactive:', key.id);
      return { valid: false, error: 'API key is inactive.' };
    }

    // Update usage statistics
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        requests_count: key.requests_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', key.id);

    if (updateError) {
      console.error('[bazi-api] Failed to update API key usage:', updateError);
    }

    console.log(`[bazi-api] API key verified: ${key.id}, requests: ${key.requests_count + 1}`);
    return { valid: true, keyId: key.id };
  } catch (error) {
    console.error('[bazi-api] API key verification error:', error);
    return { valid: false, error: 'API key verification failed.' };
  }
}

// Log API request
async function logApiRequest(
  keyId: string | null,
  endpoint: string,
  requestBody: Record<string, unknown> | null,
  responseStatus: number,
  responseTimeMs: number,
  ipAddress: string | null
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from('api_request_logs').insert({
      api_key_id: keyId,
      endpoint,
      request_body: requestBody,
      response_status: responseStatus,
      response_time_ms: responseTimeMs,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('[bazi-api] Failed to log request:', error);
  }
}

// ========== 天干地支資料 ==========
const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 天干五行陰陽屬性
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

// 地支五行陰陽屬性
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

// ========== 五行生克關係 ==========
const ELEMENT_GENERATES: Record<string, string> = {
  "木": "火", "火": "土", "土": "金", "金": "水", "水": "木"
};

const ELEMENT_CONTROLS: Record<string, string> = {
  "木": "土", "土": "水", "水": "火", "火": "金", "金": "木"
};

// ========== 神煞規則定義（完整版） ==========
interface ShenshaRule {
  anchor: string;
  anchorType?: string;
  rule_ref: string;
  table: Record<string, string | string[]> | string[];
  matchTarget?: string;
  notes?: string;
}

interface ShenshaRuleDefinition {
  name: string;
  enabled: boolean;
  priority: number;
  category: "吉神" | "凶煞" | "桃花" | "特殊";
  rarity: "SSR" | "SR" | "R" | "N";
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
  rules: ShenshaRule[];
}

interface ShenshaMatch {
  name: string;
  category: string;
  rarity: string;
  priority: number;
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
  evidence: {
    anchor_basis: string;
    anchor_value: string;
    why_matched: string;
    rule_ref: string;
    matched_pillar: string;
    matched_value: string;
  };
}

// 完整神煞規則庫
const SHENSHA_RULES: ShenshaRuleDefinition[] = [
  // 吉神
  {
    name: "天乙貴人",
    enabled: true, priority: 10, category: "吉神", rarity: "SSR",
    effect: "逢凶化吉，貴人扶持，化解災難",
    modernMeaning: "關鍵時刻的重要人脈，權威人士的支持",
    buff: "危機化貴人", debuff: null,
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取貴人支",
      table: {
        "甲": ["丑", "未"], "乙": ["子", "申"], "丙": ["亥", "酉"], "丁": ["酉", "亥"],
        "戊": ["丑", "未"], "己": ["子", "申"], "庚": ["丑", "未"], "辛": ["子", "申"],
        "壬": ["亥", "酉"], "癸": ["酉", "亥"]
      }
    }]
  },
  {
    name: "文昌貴人",
    enabled: true, priority: 15, category: "吉神", rarity: "SR",
    effect: "利於學業考試，文章才華出眾",
    modernMeaning: "學習能力強，考試運佳，適合從事文字工作",
    buff: "學業加成", debuff: null,
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取文昌位",
      table: {
        "甲": ["巳"], "乙": ["午"], "丙": ["申"], "丁": ["酉"],
        "戊": ["申"], "己": ["酉"], "庚": ["亥"], "辛": ["子"],
        "壬": ["寅"], "癸": ["卯"]
      }
    }]
  },
  {
    name: "太極貴人",
    enabled: true, priority: 18, category: "吉神", rarity: "SR",
    effect: "悟性高，有靈性，適合研究玄學",
    modernMeaning: "直覺敏銳，適合哲學研究或靈性發展",
    buff: "靈感增強", debuff: null,
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取太極位",
      table: {
        "甲": ["子", "午"], "乙": ["子", "午"], "丙": ["卯", "酉"], "丁": ["卯", "酉"],
        "戊": ["辰", "戌", "丑", "未"], "己": ["辰", "戌", "丑", "未"],
        "庚": ["寅", "亥"], "辛": ["寅", "亥"], "壬": ["巳", "申"], "癸": ["巳", "申"]
      }
    }]
  },
  {
    name: "天德貴人",
    enabled: true, priority: 20, category: "吉神", rarity: "SR",
    effect: "逢凶化吉，品德高尚",
    modernMeaning: "品格端正，容易獲得他人尊重",
    buff: "品德守護", debuff: null,
    rules: [{
      anchor: "monthBranch",
      rule_ref: "傳統對照-月支取天德位",
      table: {
        "寅": ["丁"], "卯": ["申"], "辰": ["壬"], "巳": ["辛"],
        "午": ["亥"], "未": ["甲"], "申": ["癸"], "酉": ["寅"],
        "戌": ["丙"], "亥": ["乙"], "子": ["巳"], "丑": ["庚"]
      },
      matchTarget: "anyStemOrBranch"
    }]
  },
  {
    name: "月德貴人",
    enabled: true, priority: 22, category: "吉神", rarity: "SR",
    effect: "化解災厄，福德深厚",
    modernMeaning: "有福報庇佑，災厄易化解",
    buff: "福德護身", debuff: null,
    rules: [{
      anchor: "monthBranch",
      rule_ref: "傳統對照-月支取月德位",
      table: {
        "寅": ["丙"], "午": ["丙"], "戌": ["丙"],
        "申": ["壬"], "子": ["壬"], "辰": ["壬"],
        "亥": ["甲"], "卯": ["甲"], "未": ["甲"],
        "巳": ["庚"], "酉": ["庚"], "丑": ["庚"]
      },
      matchTarget: "anyStem"
    }]
  },
  {
    name: "華蓋",
    enabled: true, priority: 25, category: "吉神", rarity: "SR",
    effect: "才華橫溢，藝術天賦，但性格孤高",
    modernMeaning: "有藝術天賦，適合創作，但需注意人際關係",
    buff: "藝術天賦", debuff: "孤獨傾向",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取華蓋位",
      table: {
        "寅": ["戌"], "午": ["戌"], "戌": ["戌"],
        "申": ["辰"], "子": ["辰"], "辰": ["辰"],
        "亥": ["未"], "卯": ["未"], "未": ["未"],
        "巳": ["丑"], "酉": ["丑"], "丑": ["丑"]
      }
    }]
  },
  {
    name: "學堂",
    enabled: true, priority: 28, category: "吉神", rarity: "R",
    effect: "利於學習，聰明好學",
    modernMeaning: "學習運好，適合進修或研究",
    buff: "學習加成", debuff: null,
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取學堂位",
      table: {
        "甲": ["亥"], "乙": ["午"], "丙": ["寅"], "丁": ["酉"],
        "戊": ["寅"], "己": ["酉"], "庚": ["巳"], "辛": ["子"],
        "壬": ["申"], "癸": ["卯"]
      }
    }]
  },
  {
    name: "金輿",
    enabled: true, priority: 35, category: "吉神", rarity: "R",
    effect: "有貴人相助，出行順利",
    modernMeaning: "交通順利，有車馬之便",
    buff: "出行順利", debuff: null,
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取金輿位",
      table: {
        "甲": ["辰"], "乙": ["巳"], "丙": ["未"], "丁": ["申"],
        "戊": ["未"], "己": ["申"], "庚": ["戌"], "辛": ["亥"],
        "壬": ["丑"], "癸": ["寅"]
      }
    }]
  },
  // 凶煞
  {
    name: "羊刃",
    enabled: true, priority: 40, category: "凶煞", rarity: "SR",
    effect: "性格剛烈，容易衝動，需防意外",
    modernMeaning: "性格果斷但需控制情緒，注意安全",
    buff: "決斷力強", debuff: "意外風險",
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取羊刃位",
      table: {
        "甲": ["卯"], "乙": ["辰"], "丙": ["午"], "丁": ["未"],
        "戊": ["午"], "己": ["未"], "庚": ["酉"], "辛": ["戌"],
        "壬": ["子"], "癸": ["丑"]
      }
    }]
  },
  {
    name: "劫煞",
    enabled: true, priority: 42, category: "凶煞", rarity: "R",
    effect: "防小人暗害，財物損失",
    modernMeaning: "注意財務安全，防範詐騙",
    buff: null, debuff: "財物損失",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取劫煞位",
      table: {
        "寅": ["巳"], "午": ["巳"], "戌": ["巳"],
        "申": ["亥"], "子": ["亥"], "辰": ["亥"],
        "亥": ["寅"], "卯": ["寅"], "未": ["寅"],
        "巳": ["申"], "酉": ["申"], "丑": ["申"]
      }
    }]
  },
  {
    name: "亡神",
    enabled: true, priority: 44, category: "凶煞", rarity: "R",
    effect: "精神不振，容易抑鬱",
    modernMeaning: "注意心理健康，避免過度思慮",
    buff: null, debuff: "精神困擾",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取亡神位",
      table: {
        "寅": ["巳"], "午": ["巳"], "戌": ["巳"],
        "申": ["亥"], "子": ["亥"], "辰": ["亥"],
        "亥": ["寅"], "卯": ["寅"], "未": ["寅"],
        "巳": ["申"], "酉": ["申"], "丑": ["申"]
      }
    }]
  },
  {
    name: "災煞",
    enabled: true, priority: 46, category: "凶煞", rarity: "R",
    effect: "防災禍疾病",
    modernMeaning: "注意健康，避免危險活動",
    buff: null, debuff: "災禍風險",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取災煞位",
      table: {
        "寅": ["子"], "午": ["子"], "戌": ["子"],
        "申": ["午"], "子": ["午"], "辰": ["午"],
        "亥": ["酉"], "卯": ["酉"], "未": ["酉"],
        "巳": ["卯"], "酉": ["卯"], "丑": ["卯"]
      }
    }]
  },
  {
    name: "白虎",
    enabled: true, priority: 50, category: "凶煞", rarity: "R",
    effect: "血光之災，意外傷害",
    modernMeaning: "注意安全，避免衝突",
    buff: null, debuff: "意外傷害",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取白虎位",
      table: {
        "子": ["申"], "丑": ["酉"], "寅": ["戌"], "卯": ["亥"],
        "辰": ["子"], "巳": ["丑"], "午": ["寅"], "未": ["卯"],
        "申": ["辰"], "酉": ["巳"], "戌": ["午"], "亥": ["未"]
      }
    }]
  },
  {
    name: "喪門",
    enabled: true, priority: 52, category: "凶煞", rarity: "R",
    effect: "孝服之事，親人不順",
    modernMeaning: "注意家人健康，避免悲傷事件",
    buff: null, debuff: "親人不順",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取喪門位",
      table: {
        "子": ["寅"], "丑": ["卯"], "寅": ["辰"], "卯": ["巳"],
        "辰": ["午"], "巳": ["未"], "午": ["申"], "未": ["酉"],
        "申": ["戌"], "酉": ["亥"], "戌": ["子"], "亥": ["丑"]
      }
    }]
  },
  // 桃花類
  {
    name: "桃花",
    enabled: true, priority: 30, category: "桃花", rarity: "SR",
    effect: "異性緣分，感情機會，魅力吸引",
    modernMeaning: "人緣好，異性緣佳，但需注意感情糾紛",
    buff: "魅力加成", debuff: "情感糾葛",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取桃花位",
      table: {
        "申": ["酉"], "子": ["酉"], "辰": ["酉"],
        "寅": ["卯"], "午": ["卯"], "戌": ["卯"],
        "巳": ["午"], "酉": ["午"], "丑": ["午"],
        "亥": ["子"], "卯": ["子"], "未": ["子"]
      }
    }]
  },
  {
    name: "紅鸞",
    enabled: true, priority: 32, category: "桃花", rarity: "SR",
    effect: "婚姻喜慶，戀愛機會",
    modernMeaning: "感情運佳，適合談戀愛或結婚",
    buff: "感情順利", debuff: null,
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取紅鸞位",
      table: {
        "子": ["卯"], "丑": ["寅"], "寅": ["丑"], "卯": ["子"],
        "辰": ["亥"], "巳": ["戌"], "午": ["酉"], "未": ["申"],
        "申": ["未"], "酉": ["午"], "戌": ["巳"], "亥": ["辰"]
      }
    }]
  },
  {
    name: "天喜",
    enabled: true, priority: 34, category: "桃花", rarity: "SR",
    effect: "喜慶之事，添丁發財",
    modernMeaning: "有喜慶事件，可能有新生命或好消息",
    buff: "喜事臨門", debuff: null,
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取天喜位",
      table: {
        "子": ["酉"], "丑": ["申"], "寅": ["未"], "卯": ["午"],
        "辰": ["巳"], "巳": ["辰"], "午": ["卯"], "未": ["寅"],
        "申": ["丑"], "酉": ["子"], "戌": ["亥"], "亥": ["戌"]
      }
    }]
  },
  {
    name: "咸池",
    enabled: true, priority: 36, category: "桃花", rarity: "R",
    effect: "異性緣強，但需防感情困擾",
    modernMeaning: "魅力出眾，但需注意感情問題",
    buff: "魅力加成", debuff: "感情困擾",
    rules: [{
      anchor: "dayStem",
      rule_ref: "傳統對照-日干取咸池位",
      table: {
        "甲": ["酉"], "乙": ["戌"], "丙": ["子"], "丁": ["丑"],
        "戊": ["子"], "己": ["丑"], "庚": ["卯"], "辛": ["辰"],
        "壬": ["午"], "癸": ["未"]
      }
    }]
  },
  // 特殊類
  {
    name: "驛馬",
    enabled: true, priority: 38, category: "特殊", rarity: "SR",
    effect: "奔波勞碌，但利於外出發展",
    modernMeaning: "適合出差旅行，有外地發展機會",
    buff: "出行順利", debuff: "奔波勞累",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取驛馬位",
      table: {
        "寅": ["申"], "午": ["申"], "戌": ["申"],
        "申": ["寅"], "子": ["寅"], "辰": ["寅"],
        "亥": ["巳"], "卯": ["巳"], "未": ["巳"],
        "巳": ["亥"], "酉": ["亥"], "丑": ["亥"]
      }
    }]
  },
  {
    name: "空亡",
    enabled: true, priority: 43, category: "特殊", rarity: "R",
    effect: "空虛落空，事難成就",
    modernMeaning: "所計劃之事易落空，需腳踏實地",
    buff: "靈感異常", debuff: "計劃落空",
    rules: [{
      anchor: "dayPillar",
      anchorType: "xunkong",
      rule_ref: "傳統對照-日柱定旬空亡位",
      table: {
        "甲子旬": ["戌", "亥"],
        "甲戌旬": ["申", "酉"],
        "甲申旬": ["午", "未"],
        "甲午旬": ["辰", "巳"],
        "甲辰旬": ["寅", "卯"],
        "甲寅旬": ["子", "丑"]
      }
    }]
  },
  {
    name: "魁罡",
    enabled: true, priority: 12, category: "特殊", rarity: "SSR",
    effect: "聰明剛毅，具有領導才能和威嚴",
    modernMeaning: "領導力強，決斷果敢，但人際需要柔和",
    buff: "帝王之氣", debuff: "孤高易傷",
    rules: [{
      anchor: "dayPillar",
      anchorType: "specific",
      rule_ref: "傳統對照-特定日柱組合",
      table: ["庚辰", "庚戌", "壬辰", "戊戌"]
    }]
  },
  {
    name: "孤辰",
    enabled: true, priority: 48, category: "特殊", rarity: "R",
    effect: "孤獨性格，適合獨立發展",
    modernMeaning: "獨立性強，適合自主創業",
    buff: "獨立能力", debuff: "孤獨傾向",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取孤辰位",
      table: {
        "寅": ["巳"], "卯": ["巳"], "辰": ["巳"],
        "巳": ["申"], "午": ["申"], "未": ["申"],
        "申": ["亥"], "酉": ["亥"], "戌": ["亥"],
        "亥": ["寅"], "子": ["寅"], "丑": ["寅"]
      }
    }]
  },
  {
    name: "寡宿",
    enabled: true, priority: 49, category: "特殊", rarity: "R",
    effect: "感情不順，晚婚傾向",
    modernMeaning: "感情路較曲折，適合晚婚",
    buff: null, debuff: "感情不順",
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取寡宿位",
      table: {
        "寅": ["丑"], "卯": ["丑"], "辰": ["丑"],
        "巳": ["辰"], "午": ["辰"], "未": ["辰"],
        "申": ["未"], "酉": ["未"], "戌": ["未"],
        "亥": ["戌"], "子": ["戌"], "丑": ["戌"]
      }
    }]
  },
  {
    name: "將星",
    enabled: true, priority: 26, category: "吉神", rarity: "SR",
    effect: "具有領導才能，適合管理職位",
    modernMeaning: "管理能力強，適合擔任主管",
    buff: "領導加成", debuff: null,
    rules: [{
      anchor: "yearBranch",
      rule_ref: "傳統對照-年支取將星位",
      table: {
        "寅": ["午"], "午": ["午"], "戌": ["午"],
        "申": ["子"], "子": ["子"], "辰": ["子"],
        "亥": ["卯"], "卯": ["卯"], "未": ["卯"],
        "巳": ["酉"], "酉": ["酉"], "丑": ["酉"]
      }
    }]
  }
];

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

function getSolarTermDate(year: number, termName: string): Date {
  const yearData = SOLAR_TERMS_DATA[String(year)];
  if (yearData && yearData[termName]) {
    return new Date(yearData[termName] + "T00:00:00Z");
  }
  const termDates: Record<string, [number, number]> = {
    "小寒": [1, 6], "立春": [2, 4], "驚蟄": [3, 6], "清明": [4, 5],
    "立夏": [5, 6], "芒種": [6, 6], "小暑": [7, 7], "立秋": [8, 8],
    "白露": [9, 8], "寒露": [10, 8], "立冬": [11, 8], "大雪": [12, 7],
  };
  const [month, day] = termDates[termName] || [1, 1];
  return new Date(Date.UTC(year, month - 1, day));
}

// 獲取日柱所在旬
function getXun(dayStem: string, dayBranch: string): string {
  const stemIndex = TIANGAN.indexOf(dayStem);
  const branchIndex = DIZHI.indexOf(dayBranch);
  const xunIndex = ((stemIndex - branchIndex + 60) % 10) / 2;
  const xunNames = ['甲子旬', '甲戌旬', '甲申旬', '甲午旬', '甲辰旬', '甲寅旬'];
  return xunNames[Math.floor(xunIndex)] || '甲子旬';
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
  
  const TERM_ORDER = ["小寒", "立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
  let currentBranchIndex = 1;
  
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
  
  const yearStemIdx = TIANGAN.indexOf(yearStem);
  const monthStemStartIdx = [2, 4, 6, 8, 0][yearStemIdx % 5];
  const monthStemIdx = (monthStemStartIdx + (currentBranchIndex - 2 + 12) % 12) % 10;
  
  return {
    stem: TIANGAN[monthStemIdx],
    branch: DIZHI[currentBranchIndex]
  };
}

function calculateDayPillar(birthLocal: Date, hour: number): { stem: string; branch: string } {
  const y = birthLocal.getUTCFullYear();
  const m = birthLocal.getUTCMonth() + 1;
  const d = birthLocal.getUTCDate();
  
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  
  const adjustedJdn = hour >= 23 ? jdn + 1 : jdn;
  const refJdn = 2451911;
  const cycleIndex = ((adjustedJdn - refJdn) % 60 + 60) % 60;
  
  return {
    stem: TIANGAN[cycleIndex % 10],
    branch: DIZHI[cycleIndex % 12]
  };
}

function calculateHourPillar(dayStem: string, hour: number): { stem: string; branch: string } {
  const hourBranchIndex = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11][hour];
  
  const dayStemIdx = TIANGAN.indexOf(dayStem);
  const hourStemStartIdx = [0, 2, 4, 6, 8][dayStemIdx % 5];
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
  
  const stemWeight = 1.0;
  Object.values(pillars).forEach(pillar => {
    const element = WUXING_MAP[pillar.stem];
    if (element) scores[element] += stemWeight;
  });
  
  const branchWeights = [0.6, 0.3, 0.1];
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

// ========== 十神計算（完整版） ==========

function calculateTenGod(dayStem: string, targetStem: string): string {
  if (dayStem === targetStem) return "比肩";
  
  const dayProps = STEM_PROPERTIES[dayStem];
  const targetProps = STEM_PROPERTIES[targetStem];
  
  if (!dayProps || !targetProps) return "未知";
  
  const dayElement = dayProps.element;
  const targetElement = targetProps.element;
  const samePolarity = dayProps.yinyang === targetProps.yinyang;
  
  // 同五行
  if (dayElement === targetElement) {
    return samePolarity ? "比肩" : "劫財";
  }
  
  // 我生 - 食傷
  if (ELEMENT_GENERATES[dayElement] === targetElement) {
    return samePolarity ? "食神" : "傷官";
  }
  
  // 我克 - 財
  if (ELEMENT_CONTROLS[dayElement] === targetElement) {
    return samePolarity ? "偏財" : "正財";
  }
  
  // 克我 - 官殺
  if (ELEMENT_CONTROLS[targetElement] === dayElement) {
    return samePolarity ? "七殺" : "正官";
  }
  
  // 生我 - 印
  if (ELEMENT_GENERATES[targetElement] === dayElement) {
    return samePolarity ? "偏印" : "正印";
  }
  
  return "未知";
}

function calculateBranchTenGod(dayStem: string, branch: string): string {
  const dayProps = STEM_PROPERTIES[dayStem];
  const branchProps = BRANCH_PROPERTIES[branch];
  
  if (!dayProps || !branchProps) return "未知";
  
  const dayElement = dayProps.element;
  const branchElement = branchProps.element;
  const samePolarity = dayProps.yinyang === branchProps.yinyang;
  
  if (dayElement === branchElement) {
    return samePolarity ? "比肩" : "劫財";
  }
  
  if (ELEMENT_GENERATES[dayElement] === branchElement) {
    return samePolarity ? "食神" : "傷官";
  }
  
  if (ELEMENT_CONTROLS[dayElement] === branchElement) {
    return samePolarity ? "偏財" : "正財";
  }
  
  if (ELEMENT_CONTROLS[branchElement] === dayElement) {
    return samePolarity ? "七殺" : "正官";
  }
  
  if (ELEMENT_GENERATES[branchElement] === dayElement) {
    return samePolarity ? "偏印" : "正印";
  }
  
  return "未知";
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
      branch: calculateBranchTenGod(dayStem, pillars.year.branch)
    },
    month: {
      stem: calculateTenGod(dayStem, pillars.month.stem),
      branch: calculateBranchTenGod(dayStem, pillars.month.branch)
    },
    day: {
      stem: "日元",
      branch: calculateBranchTenGod(dayStem, pillars.day.branch)
    },
    hour: {
      stem: calculateTenGod(dayStem, pillars.hour.stem),
      branch: calculateBranchTenGod(dayStem, pillars.hour.branch)
    }
  };
}

// ========== 神煞計算（完整規則引擎） ==========

function calculateShenshaComplete(pillars: {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}): ShenshaMatch[] {
  const matches: ShenshaMatch[] = [];
  const allBranches = [
    { value: pillars.year.branch, pillar: '年支' },
    { value: pillars.month.branch, pillar: '月支' },
    { value: pillars.day.branch, pillar: '日支' },
    { value: pillars.hour.branch, pillar: '時支' }
  ];
  const allStems = [
    { value: pillars.year.stem, pillar: '年干' },
    { value: pillars.month.stem, pillar: '月干' },
    { value: pillars.day.stem, pillar: '日干' },
    { value: pillars.hour.stem, pillar: '時干' }
  ];

  for (const ruleDef of SHENSHA_RULES) {
    if (!ruleDef.enabled) continue;

    for (const rule of ruleDef.rules) {
      let matched = false;
      let evidence = {
        anchor_basis: "",
        anchor_value: "",
        why_matched: "",
        rule_ref: rule.rule_ref,
        matched_pillar: "",
        matched_value: ""
      };

      switch (rule.anchor) {
        case "dayStem": {
          const dayStem = pillars.day.stem;
          if (!rule.table || Array.isArray(rule.table)) break;
          
          const targetValues = rule.table[dayStem];
          if (!targetValues) break;
          
          const targets = Array.isArray(targetValues) ? targetValues : [targetValues];
          
          for (const branch of allBranches) {
            if (targets.includes(branch.value)) {
              matched = true;
              evidence = {
                anchor_basis: `日干=${dayStem}`,
                anchor_value: dayStem,
                why_matched: `查表得[${targets.join('/')}]，四柱${branch.pillar}=${branch.value}命中`,
                rule_ref: rule.rule_ref,
                matched_pillar: branch.pillar,
                matched_value: branch.value
              };
              break;
            }
          }
          break;
        }

        case "yearBranch":
        case "monthBranch": {
          const anchorBranch = rule.anchor === "yearBranch" ? pillars.year.branch : pillars.month.branch;
          const anchorName = rule.anchor === "yearBranch" ? "年支" : "月支";
          
          if (!rule.table || Array.isArray(rule.table)) break;
          
          const targetValues = rule.table[anchorBranch];
          if (!targetValues) break;
          
          const targets = Array.isArray(targetValues) ? targetValues : [targetValues];
          const matchTarget = rule.matchTarget || "anyBranch";
          
          // 檢查地支
          if (matchTarget === "anyBranch" || matchTarget === "anyStemOrBranch") {
            for (const branch of allBranches) {
              if (targets.includes(branch.value)) {
                matched = true;
                evidence = {
                  anchor_basis: `${anchorName}=${anchorBranch}`,
                  anchor_value: anchorBranch,
                  why_matched: `查表得[${targets.join('/')}]，${branch.pillar}=${branch.value}命中`,
                  rule_ref: rule.rule_ref,
                  matched_pillar: branch.pillar,
                  matched_value: branch.value
                };
                break;
              }
            }
          }
          
          // 檢查天干
          if (!matched && (matchTarget === "anyStem" || matchTarget === "anyStemOrBranch")) {
            for (const stem of allStems) {
              if (targets.includes(stem.value)) {
                matched = true;
                evidence = {
                  anchor_basis: `${anchorName}=${anchorBranch}`,
                  anchor_value: anchorBranch,
                  why_matched: `查表得[${targets.join('/')}]，${stem.pillar}=${stem.value}命中`,
                  rule_ref: rule.rule_ref,
                  matched_pillar: stem.pillar,
                  matched_value: stem.value
                };
                break;
              }
            }
          }
          break;
        }

        case "dayPillar": {
          const dayPillar = `${pillars.day.stem}${pillars.day.branch}`;
          
          // 特定日柱（魁罡）
          if (rule.anchorType === "specific") {
            if (Array.isArray(rule.table) && rule.table.includes(dayPillar)) {
              matched = true;
              evidence = {
                anchor_basis: `日柱=${dayPillar}`,
                anchor_value: dayPillar,
                why_matched: `日柱${dayPillar}為特定組合`,
                rule_ref: rule.rule_ref,
                matched_pillar: "日柱",
                matched_value: dayPillar
              };
            }
          }
          
          // 旬空亡
          if (rule.anchorType === "xunkong" && !Array.isArray(rule.table)) {
            const xun = getXun(pillars.day.stem, pillars.day.branch);
            const emptyBranches = rule.table[xun];
            if (emptyBranches) {
              const targets = Array.isArray(emptyBranches) ? emptyBranches : [emptyBranches];
              for (const branch of allBranches) {
                if (targets.includes(branch.value)) {
                  matched = true;
                  evidence = {
                    anchor_basis: `日柱${dayPillar}(${xun})`,
                    anchor_value: xun,
                    why_matched: `${xun}空亡[${targets.join('/')}]，${branch.pillar}=${branch.value}落空`,
                    rule_ref: rule.rule_ref,
                    matched_pillar: branch.pillar,
                    matched_value: branch.value
                  };
                  break;
                }
              }
            }
          }
          break;
        }
      }

      if (matched) {
        matches.push({
          name: ruleDef.name,
          category: ruleDef.category,
          rarity: ruleDef.rarity,
          priority: ruleDef.priority,
          effect: ruleDef.effect,
          modernMeaning: ruleDef.modernMeaning,
          buff: ruleDef.buff,
          debuff: ruleDef.debuff,
          evidence
        });
        break;
      }
    }
  }

  return matches.sort((a, b) => a.priority - b.priority);
}

// ========== 主函數 ==========

serve(async (req) => {
  const startTime = Date.now();
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null;
  let apiKeyId: string | null = null;
  let requestBody: Record<string, unknown> | null = null;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST.',
        usage: {
          method: 'POST',
          headers: {
            'X-API-Key': 'your-api-key (必填)'
          },
          body: {
            name: '姓名 (必填)',
            gender: 'male 或 female (必填)',
            birthDate: 'YYYY-MM-DD (必填)',
            birthTime: 'HH:MM (必填)',
            timezoneOffsetMinutes: '時區偏移分鐘數，預設480 (UTC+8)'
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key') || '';
    const keyVerification = await verifyApiKey(apiKey);

    if (!keyVerification.valid) {
      const responseTime = Date.now() - startTime;
      await logApiRequest(null, '/bazi-api', null, 401, responseTime, ipAddress);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: keyVerification.error,
          hint: 'Include X-API-Key header with a valid API key'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    apiKeyId = keyVerification.keyId || null;

    // Rate limiting check (by API key)
    const rateLimitResult = checkRateLimit(`bazi-api:${apiKeyId}`, RATE_LIMITS.BAZI_API);
    if (!rateLimitResult.allowed) {
      console.log(`[bazi-api] Rate limit exceeded for API key: ${apiKeyId}`);
      const responseTime = Date.now() - startTime;
      await logApiRequest(apiKeyId, '/bazi-api', null, 429, responseTime, ipAddress);
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    const body = await req.json();
    requestBody = body;
    const { name, gender, birthDate, birthTime, timezoneOffsetMinutes = 480 } = body;

    if (!name || !gender || !birthDate || !birthTime) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields', required: ['name', 'gender', 'birthDate', 'birthTime'] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!['male', 'female'].includes(gender)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid gender. Must be "male" or "female".' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid birthDate format. Use YYYY-MM-DD.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const [hourStr, minuteStr] = birthTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr) || 0;

    if (isNaN(hour) || hour < 0 || hour > 23) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid birthTime format. Use HH:MM (00:00-23:59).' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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

    const pillars = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };

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

    // 十神（完整版）
    const tenGods = calculateTenGods(pillars);

    // 神煞（完整規則引擎）
    const shenshaMatches = calculateShenshaComplete(pillars);
    const shensha = shenshaMatches.map(m => m.name);

    // 藏干詳情
    const hiddenStems = {
      year: DIZHI_CANGGAN[yearPillar.branch] || [],
      month: DIZHI_CANGGAN[monthPillar.branch] || [],
      day: DIZHI_CANGGAN[dayPillar.branch] || [],
      hour: DIZHI_CANGGAN[hourPillar.branch] || []
    };

    console.log(`[bazi-api] Result: ${yearPillar.stem}${yearPillar.branch} ${monthPillar.stem}${monthPillar.branch} ${dayPillar.stem}${dayPillar.branch} ${hourPillar.stem}${hourPillar.branch}`);
    console.log(`[bazi-api] Shensha found: ${shensha.length}`);

    const responseTime = Date.now() - startTime;
    await logApiRequest(apiKeyId, '/bazi-api', requestBody, 200, responseTime, ipAddress);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          input: { name, gender, birthDate, birthTime, timezoneOffsetMinutes: tzOffset },
          pillars,
          baziString: `${yearPillar.stem}${yearPillar.branch} ${monthPillar.stem}${monthPillar.branch} ${dayPillar.stem}${dayPillar.branch} ${hourPillar.stem}${hourPillar.branch}`,
          nayin,
          hiddenStems,
          wuxingScores,
          yinyangRatio,
          tenGods,
          shensha,
          shenshaDetails: shenshaMatches,
          dayMaster: {
            stem: dayPillar.stem,
            element: WUXING_MAP[dayPillar.stem],
            yinyang: YINYANG_MAP[dayPillar.stem]
          }
        },
        meta: {
          version: "2.1.0",
          timestamp: new Date().toISOString(),
          note: "十神和神煞計算邏輯已完整隱藏於後端"
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    console.error('[bazi-api] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    await logApiRequest(apiKeyId, '/bazi-api', requestBody, 500, responseTime, ipAddress);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
