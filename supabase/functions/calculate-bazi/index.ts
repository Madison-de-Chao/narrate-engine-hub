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

// 计算月柱（五虎遁月） - 此函數已廢棄，應使用 baziCalculator.ts 中的實現
// 保留此處僅作為參考
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

// 五行生克关系
const ELEMENT_RELATIONS = {
  生: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
  克: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
};

// 计算天干十神
function calculateTenGodForStem(dayStem: string, targetStem: string): string {
  if (dayStem === targetStem) return '比肩';
  
  const dayElement = WUXING_MAP[dayStem];
  const targetElement = WUXING_MAP[targetStem];
  const dayYang = ["甲", "丙", "戊", "庚", "壬"].includes(dayStem);
  const targetYang = ["甲", "丙", "戊", "庚", "壬"].includes(targetStem);
  const sameYinyang = dayYang === targetYang;
  
  if (dayElement === targetElement) {
    return sameYinyang ? '比肩' : '劫財';
  }
  if (ELEMENT_RELATIONS.生[dayElement as keyof typeof ELEMENT_RELATIONS.生] === targetElement) {
    return sameYinyang ? '食神' : '傷官';
  }
  if (ELEMENT_RELATIONS.克[dayElement as keyof typeof ELEMENT_RELATIONS.克] === targetElement) {
    return sameYinyang ? '偏財' : '正財';
  }
  if (ELEMENT_RELATIONS.克[targetElement as keyof typeof ELEMENT_RELATIONS.克] === dayElement) {
    return sameYinyang ? '七殺' : '正官';
  }
  if (ELEMENT_RELATIONS.生[targetElement as keyof typeof ELEMENT_RELATIONS.生] === dayElement) {
    return sameYinyang ? '偏印' : '正印';
  }
  return '未知';
}

// 计算地支十神
function calculateTenGodForBranch(dayStem: string, branch: string): string {
  const dayElement = WUXING_MAP[dayStem];
  const branchElement = WUXING_MAP[branch];
  const dayYang = ["甲", "丙", "戊", "庚", "壬"].includes(dayStem);
  const branchYang = ["子", "寅", "辰", "午", "申", "戌"].includes(branch);
  const sameYinyang = dayYang === branchYang;
  
  if (dayElement === branchElement) {
    return sameYinyang ? '比肩' : '劫財';
  }
  if (ELEMENT_RELATIONS.生[dayElement as keyof typeof ELEMENT_RELATIONS.生] === branchElement) {
    return sameYinyang ? '食神' : '傷官';
  }
  if (ELEMENT_RELATIONS.克[dayElement as keyof typeof ELEMENT_RELATIONS.克] === branchElement) {
    return sameYinyang ? '偏財' : '正財';
  }
  if (ELEMENT_RELATIONS.克[branchElement as keyof typeof ELEMENT_RELATIONS.克] === dayElement) {
    return sameYinyang ? '七殺' : '正官';
  }
  if (ELEMENT_RELATIONS.生[branchElement as keyof typeof ELEMENT_RELATIONS.生] === dayElement) {
    return sameYinyang ? '偏印' : '正印';
  }
  return '未知';
}

// 简化版神煞计算
function calculateShenshaSimple(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): string[] {
  const shensha: string[] = [];
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  
  // 天乙贵人查法（简化版）
  const tianYiMap: { [key: string]: string[] } = {
    "甲": ["丑", "未"], "戊": ["丑", "未"],
    "乙": ["子", "申"], "己": ["子", "申"],
    "丙": ["亥", "酉"], "丁": ["亥", "酉"],
    "庚": ["丑", "未"], "辛": ["寅", "午"],
    "壬": ["卯", "巳"], "癸": ["卯", "巳"]
  };
  
  if (tianYiMap[dayStem] && tianYiMap[dayStem].some(b => allBranches.includes(b))) {
    shensha.push('天乙貴人');
  }
  
  // 文昌贵人查法
  const wenChangMap: { [key: string]: string[] } = {
    "甲": ["巳"], "乙": ["午"], "丙": ["申"], "丁": ["酉"],
    "戊": ["申"], "己": ["酉"], "庚": ["亥"], "辛": ["子"],
    "壬": ["寅"], "癸": ["卯"]
  };
  
  if (wenChangMap[dayStem] && wenChangMap[dayStem].some(b => allBranches.includes(b))) {
    shensha.push('文昌貴人');
  }
  
  // 桃花（咸池）查法
  const taoHuaMap: { [key: string]: string } = {
    "申": "酉", "子": "酉", "辰": "酉",
    "亥": "子", "卯": "子", "未": "子",
    "寅": "卯", "午": "卯", "戌": "卯",
    "巳": "午", "酉": "午", "丑": "午"
  };
  
  if (allBranches.includes(taoHuaMap[yearBranch])) {
    shensha.push('桃花');
  }
  
  return shensha;
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

    // 支援訪客模式：嘗試獲取用戶，但不強制要求
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        user = authUser;
      } catch (error) {
        console.log('Auth check failed, continuing as guest:', error);
      }
    }

    const { name, gender, birthDate, birthTime, location, useSolarTime, timezoneOffsetMinutes } = await req.json();

    if (!name || !gender || !birthDate || !birthTime) {
      throw new Error('Missing required fields');
    }

    // 解析出生日期和时间 - 使用UTC创建，传入时区偏移
    const birth = new Date(birthDate);
    const [hourStr, minuteStr] = birthTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr) || 0;
    const tzOffset = timezoneOffsetMinutes || 480; // 默認UTC+8
    
    // 使用edge function版本的计算（简化版，但保留原有逻辑）
    // 注意：這裡仍使用簡化的算法，主要問題在於沒有準確的節氣數據
    // 未來應該導入solar_terms.json到edge function
    const birthUtc = new Date(Date.UTC(
      birth.getUTCFullYear(),
      birth.getUTCMonth(),
      birth.getUTCDate(),
      hour,
      minute
    ) - tzOffset * 60 * 1000);

    // 获取立春时间（简化处理，实际应查solar_terms.json）
    const lichunYear = birth.getUTCFullYear();
    const lichun = new Date(Date.UTC(lichunYear, 1, 4, 5, 30)); // UTC时间的立春大约在2月4日5:30

    // 计算四柱
    const yearPillar = calculateYearPillar(lichunYear, lichun, birthUtc);
    const monthPillar = calculateMonthPillar(yearPillar.stem, birthUtc.getUTCMonth() + 1);
    const dayPillar = calculateDayPillar(birthUtc);
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
    
    // 计算十神
    const tenGods = {
      year: {
        stem: calculateTenGodForStem(dayPillar.stem, yearPillar.stem),
        branch: calculateTenGodForBranch(dayPillar.stem, yearPillar.branch)
      },
      month: {
        stem: calculateTenGodForStem(dayPillar.stem, monthPillar.stem),
        branch: calculateTenGodForBranch(dayPillar.stem, monthPillar.branch)
      },
      day: {
        stem: "日元",
        branch: calculateTenGodForBranch(dayPillar.stem, dayPillar.branch)
      },
      hour: {
        stem: calculateTenGodForStem(dayPillar.stem, hourPillar.stem),
        branch: calculateTenGodForBranch(dayPillar.stem, hourPillar.branch)
      }
    };
    
    // 计算神煞
    const shensha = calculateShenshaSimple(
      dayPillar.stem,
      yearPillar.branch,
      monthPillar.branch,
      dayPillar.branch,
      hourPillar.branch
    );

    // 僅在有登入用戶時保存到數據庫
    let calculationId = null;
    if (user) {
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
          ten_gods: tenGods,
          shensha: shensha,
          legion_analysis: {},
          legion_stories: {}
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        // 不中斷流程，繼續返回計算結果
      } else {
        calculationId = calculation?.id;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        calculation: {
          id: calculationId,
          pillars,
          nayin,
          wuxingScores,
          yinyangRatio,
          tenGods,
          shensha
        },
        isGuest: !user
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