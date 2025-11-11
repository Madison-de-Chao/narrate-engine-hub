import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 天干地支数据
const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 纳音五行表
const NAYIN: { [key: string]: string } = {
  "甲子": "海中金", "乙丑": "海中金",
  "丙寅": "炉中火", "丁卯": "炉中火",
  "戊辰": "大林木", "己巳": "大林木",
  "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "剑锋金", "癸酉": "剑锋金",
  "甲戌": "山头火", "乙亥": "山头火",
  "丙子": "涧下水", "丁丑": "涧下水",
  "戊寅": "城头土", "己卯": "城头土",
  "庚辰": "白蜡金", "辛巳": "白蜡金",
  "壬午": "杨柳木", "癸未": "杨柳木",
  "甲申": "泉中水", "乙酉": "泉中水",
  "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹雳火", "己丑": "霹雳火",
  "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "长流水", "癸巳": "长流水",
  "甲午": "砂中金", "乙未": "砂中金",
  "丙申": "山下火", "丁酉": "山下火",
  "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土",
  "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "佛灯火", "乙巳": "佛灯火",
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

// 五行映射
const WUXING_MAP: { [key: string]: string } = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水",
  "寅": "木", "卯": "木",
  "巳": "火", "午": "火",
  "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金",
  "子": "水", "亥": "水"
};

// 计算年柱
function calculateYearPillar(year: number, lichunDate: Date, birthDate: Date): { stem: string, branch: string } {
  let adjustedYear = year;
  if (birthDate < lichunDate) {
    adjustedYear = year - 1;
  }
  
  const stemIndex = (adjustedYear - 4) % 10;
  const branchIndex = (adjustedYear - 4) % 12;
  
  return {
    stem: TIANGAN[stemIndex < 0 ? stemIndex + 10 : stemIndex],
    branch: DIZHI[branchIndex < 0 ? branchIndex + 12 : branchIndex]
  };
}

// 计算月柱（五虎遁月）
function calculateMonthPillar(yearStem: string, month: number): { stem: string, branch: string } {
  const stemStartMap: { [key: string]: number } = {
    "甲": 2, "己": 2,  // 丙寅开始
    "乙": 4, "庚": 4,  // 戊寅开始
    "丙": 6, "辛": 6,  // 庚寅开始
    "丁": 8, "壬": 8,  // 壬寅开始
    "戊": 0, "癸": 0   // 甲寅开始
  };
  
  const startStem = stemStartMap[yearStem] || 0;
  const stemIndex = (startStem + month - 1) % 10;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[(month + 1) % 12]  // 寅月开始
  };
}

// 计算日柱（基准日算法）
function calculateDayPillar(birthDate: Date): { stem: string, branch: string } {
  // 基准日：1985年9月22日 = 甲子日
  const baseDate = new Date(1985, 8, 22);
  const baseDayOffset = 0; // 甲子日的偏移量
  
  const diffTime = birthDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const totalDays = baseDayOffset + diffDays;
  const stemIndex = ((totalDays % 10) + 10) % 10;
  const branchIndex = ((totalDays % 12) + 12) % 12;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[branchIndex]
  };
}

// 计算时柱（五鼠遁时）
function calculateHourPillar(dayStem: string, hour: number): { stem: string, branch: string } {
  const stemStartMap: { [key: string]: number } = {
    "甲": 0, "己": 0,  // 甲子开始
    "乙": 2, "庚": 2,  // 丙子开始
    "丙": 4, "辛": 4,  // 戊子开始
    "丁": 6, "壬": 6,  // 庚子开始
    "戊": 8, "癸": 8   // 壬子开始
  };
  
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const startStem = stemStartMap[dayStem] || 0;
  const stemIndex = (startStem + hourBranch) % 10;
  
  return {
    stem: TIANGAN[stemIndex],
    branch: DIZHI[hourBranch]
  };
}

// 计算五行分数
function calculateWuxingScores(pillars: any): any {
  const scores: any = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const weightMap: any = {
    "木": "wood", "火": "fire", "土": "earth", "金": "metal", "水": "water"
  };
  
  // 天干权重更高
  [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem].forEach(gan => {
    const element = weightMap[WUXING_MAP[gan]];
    if (element) scores[element] += 1.5;
  });
  
  // 地支权重较低
  [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch].forEach(zhi => {
    const element = weightMap[WUXING_MAP[zhi]];
    if (element) scores[element] += 1.0;
  });
  
  return scores;
}

// 计算阴阳比例
function calculateYinYangRatio(pillars: any): any {
  let yin = 0;
  let yang = 0;
  
  const yangGan = ["甲", "丙", "戊", "庚", "壬"];
  const yangZhi = ["子", "寅", "辰", "午", "申", "戌"];
  
  [pillars.year, pillars.month, pillars.day, pillars.hour].forEach((pillar: any) => {
    if (yangGan.includes(pillar.stem)) yang++; else yin++;
    if (yangZhi.includes(pillar.branch)) yang++; else yin++;
  });
  
  const total = yin + yang;
  return {
    yin: Math.round((yin / total) * 100),
    yang: Math.round((yang / total) * 100)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { name, gender, birthDate, birthTime, location, useSolarTime } = await req.json();

    if (!name || !gender || !birthDate || !birthTime) {
      throw new Error('Missing required fields');
    }

    // 解析出生日期和时间
    const birth = new Date(birthDate);
    const [hourStr] = birthTime.split(':');
    const hour = parseInt(hourStr);
    birth.setHours(hour);

    // 获取立春时间（这里简化处理，实际应查表）
    const lichun = new Date(birth.getFullYear(), 1, 4, 20, 32);

    // 计算四柱
    const yearPillar = calculateYearPillar(birth.getFullYear(), lichun, birth);
    const monthPillar = calculateMonthPillar(yearPillar.stem, birth.getMonth() + 1);
    const dayPillar = calculateDayPillar(birth);
    const hourPillar = calculateHourPillar(dayPillar.stem, hour);

    const pillars = {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };

    // 计算纳音
    const nayin = {
      year: NAYIN[yearPillar.stem + yearPillar.branch] || "未知",
      month: NAYIN[monthPillar.stem + monthPillar.branch] || "未知",
      day: NAYIN[dayPillar.stem + dayPillar.branch] || "未知",
      hour: NAYIN[hourPillar.stem + hourPillar.branch] || "未知"
    };

    // 计算五行分数和阴阳比例
    const wuxingScores = calculateWuxingScores(pillars);
    const yinyangRatio = calculateYinYangRatio(pillars);

    // 保存到数据库
    const { data: calculation, error: insertError } = await supabase
      .from('bazi_calculations')
      .insert({
        user_id: user.id,
        name,
        gender,
        birth_date: birth.toISOString(),
        birth_time: birthTime,
        location: location || null,
        use_solar_time: useSolarTime !== false,
        year_stem: yearPillar.stem,
        year_branch: yearPillar.branch,
        month_stem: monthPillar.stem,
        month_branch: monthPillar.branch,
        day_stem: dayPillar.stem,
        day_branch: dayPillar.branch,
        hour_stem: hourPillar.stem,
        hour_branch: hourPillar.branch,
        year_nayin: nayin.year,
        month_nayin: nayin.month,
        day_nayin: nayin.day,
        hour_nayin: nayin.hour,
        wuxing_scores: wuxingScores,
        yinyang_ratio: yinyangRatio,
        hidden_stems: {},
        ten_gods: {},
        shensha: [],
        legion_analysis: {},
        legion_stories: {}
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        calculation: {
          id: calculation.id,
          pillars,
          nayin,
          wuxingScores,
          yinyangRatio
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in calculate-bazi function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});