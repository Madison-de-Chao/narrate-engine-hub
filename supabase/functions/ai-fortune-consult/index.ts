import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders, RATE_LIMITS } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// 五行相生相剋
const WUXING_GENERATES: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_CONTROLS: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

// 天干對應五行
const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 軍團角色數據
const LEGION_ROLES: Record<string, { name: string; role: string; buff: string; debuff: string }> = {
  '甲': { name: '森林將軍', role: '開創型統帥', buff: '規劃長遠', debuff: '剛愎自用' },
  '乙': { name: '花蔓軍師', role: '協調型謀士', buff: '靈活應變', debuff: '過度依附' },
  '丙': { name: '烈日戰神', role: '激勵型將領', buff: '激勵士氣', debuff: '燒盡自己' },
  '丁': { name: '誓燈法師', role: '啟蒙型導師', buff: '溫暖療癒', debuff: '情緒波動' },
  '戊': { name: '山岳守護', role: '防守型衛士', buff: '穩定防禦', debuff: '固執僵化' },
  '己': { name: '大地母親', role: '培育型守護', buff: '滋養培育', debuff: '過度犧牲' },
  '庚': { name: '天鍛騎士', role: '決斷型戰士', buff: '一擊必中', debuff: '剛硬破裂' },
  '辛': { name: '靈晶鑑定師', role: '品鑑型專家', buff: '精緻完美', debuff: '苛刻敏感' },
  '壬': { name: '龍河船長', role: '探索型航海家', buff: '靈動探索', debuff: '隨波逐流' },
  '癸': { name: '甘露天使', role: '滋潤型智者', buff: '細膩滋養', debuff: '多愁善感' }
};

const ADVISOR_ROLES: Record<string, { name: string; role: string; buff: string; debuff: string }> = {
  '子': { name: '夜行刺客', role: '暗夜潛行者', buff: '瞬間奇襲', debuff: '易動不安' },
  '丑': { name: '封藏守衛', role: '堅韌守護者', buff: '後勤補給', debuff: '遲疑不決' },
  '寅': { name: '雷虎獵人', role: '曙光先鋒', buff: '先鋒衝陣', debuff: '草率行事' },
  '卯': { name: '玉兔使者', role: '和平調停者', buff: '和諧調解', debuff: '優柔被動' },
  '辰': { name: '泥雲龍法師', role: '神秘變化師', buff: '變化萬端', debuff: '自相矛盾' },
  '巳': { name: '蛇焰術士', role: '智謀策士', buff: '謀略之眼', debuff: '多疑內耗' },
  '午': { name: '日鬃騎兵', role: '熱血衝鋒者', buff: '士氣高昂', debuff: '精力耗盡' },
  '未': { name: '牧角調和者', role: '慈愛撫育者', buff: '調和人心', debuff: '猶疑不決' },
  '申': { name: '金杖靈猴戰士', role: '機敏應變者', buff: '隨機應變', debuff: '善變浮躁' },
  '酉': { name: '鳳羽判衡者', role: '精準執法者', buff: '精準守護', debuff: '苛刻冷漠' },
  '戌': { name: '烽火戰犬統領', role: '忠誠護衛官', buff: '忠誠護主', debuff: '固執保守' },
  '亥': { name: '潮典海豚智者', role: '福慧預言者', buff: '福德智慧', debuff: '逃避散漫' }
};

const LEGION_CONTEXT: Record<string, { name: string; stage: string; domain: string }> = {
  year: { name: '祖源軍團', stage: '童年至青少年', domain: '家族傳承、祖輩影響' },
  month: { name: '社會軍團', stage: '青年至中年', domain: '事業發展、人際關係' },
  day: { name: '核心軍團', stage: '成年核心期', domain: '個人特質、婚姻感情' },
  hour: { name: '未來軍團', stage: '中年至晚年', domain: '子女關係、未來規劃' }
};

// 計算軍團關係
function calculateLegionRelations(pillars: any): string {
  const elements = {
    year: STEM_TO_ELEMENT[pillars?.year?.stem] || '木',
    month: STEM_TO_ELEMENT[pillars?.month?.stem] || '木',
    day: STEM_TO_ELEMENT[pillars?.day?.stem] || '木',
    hour: STEM_TO_ELEMENT[pillars?.hour?.stem] || '木'
  };

  const relations: string[] = [];
  const pairs = [
    { from: 'year', to: 'month', label: '年月' },
    { from: 'month', to: 'day', label: '月日' },
    { from: 'day', to: 'hour', label: '日時' }
  ];

  pairs.forEach(({ from, to, label }) => {
    const fromEl = elements[from as keyof typeof elements];
    const toEl = elements[to as keyof typeof elements];
    
    if (fromEl === toEl) {
      relations.push(`${label}比和（${fromEl}同氣）`);
    } else if (WUXING_GENERATES[fromEl] === toEl) {
      relations.push(`${label}相生（${fromEl}生${toEl}）`);
    } else if (WUXING_CONTROLS[fromEl] === toEl) {
      relations.push(`${label}相剋（${fromEl}剋${toEl}）`);
    } else if (WUXING_GENERATES[toEl] === fromEl) {
      relations.push(`${label}被生（${toEl}生${fromEl}）`);
    } else if (WUXING_CONTROLS[toEl] === fromEl) {
      relations.push(`${label}被剋（${toEl}剋${fromEl}）`);
    }
  });

  return relations.join('、');
}

// 生成軍團陣容描述
function generateLegionFormation(pillars: any): string {
  const formations: string[] = [];
  
  const pillarTypes = ['year', 'month', 'day', 'hour'] as const;
  pillarTypes.forEach(type => {
    const stem = pillars?.[type]?.stem;
    const branch = pillars?.[type]?.branch;
    if (stem && branch) {
      const commander = LEGION_ROLES[stem];
      const advisor = ADVISOR_ROLES[branch];
      const context = LEGION_CONTEXT[type];
      if (commander && advisor && context) {
        formations.push(`【${context.name}】主將「${commander.name}」(${commander.buff}) + 軍師「${advisor.name}」(${advisor.buff})`);
      }
    }
  });
  
  return formations.join('\n');
}

const XUANJI_PROMPT = `你是「四時命理博物館」的 AI 命理大師，名為「玄機」。你精通中國傳統八字命理，並擅長以四時軍團的視角解讀命盤。

【重要規則 - 簡潔回答】
- 每次回答限制在 150 字以內
- 長話短說，點到為止
- 只給核心重點，不要長篇大論
- 善用軍團比喻來解釋命理概念
- 若問題複雜，簡述要點後說：「欲知詳情，可查看完整軍團報告。」

【軍團解讀風格】
- 天干為軍團主將，代表外顯的領導風格
- 地支為軍團軍師，代表內在的謀略特質
- 納音為戰場環境，影響軍團發揮
- 藏干為隱性支援，是潛在的助力或挑戰
- 神煞為特殊裝備/兵符，賦予獨特能力

你的風格：
- 文言白話混合，簡潔有力
- 善用軍團戰略比喻
- 正向但不囉嗦
- 點出關鍵，留有懸念

記住：惜字如金，言簡意賅。`;

const MINGXIN_PROMPT = `你是「明心」，八字學堂的 AI 老師。

【重要規則 - 簡潔教學】
- 每次回答限制在 150 字以內
- 用最簡單的話解釋概念
- 善用軍團比喻讓抽象概念具體化
- 一次只講一個重點
- 若內容較多，說：「這只是基礎，完整課程請訂閱學堂。」

【軍團教學法】
- 把天干比喻成軍團主將的性格
- 把地支比喻成軍師的謀略風格
- 把五行生剋比喻成軍團間的合作與競爭
- 把十神比喻成人際關係中的角色

你的風格：
- 親切簡潔
- 舉一個小例子就好
- 不要一次講太多

記住：少即是多，點到即止。`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[ai-fortune-consult] Missing Authorization header');
      return new Response(JSON.stringify({ error: '請先登入' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[ai-fortune-consult] Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: '認證失敗，請重新登入' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ai-fortune-consult] Authenticated user: ${user.id}`);

    // Rate limiting check
    const rateLimitResult = checkRateLimit(`ai-fortune:${user.id}`, RATE_LIMITS.AI_FORTUNE_CONSULT);
    if (!rateLimitResult.allowed) {
      console.log(`[ai-fortune-consult] Rate limit exceeded for user: ${user.id}`);
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    const { messages, baziContext, role } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("AI service configuration missing");
      return new Response(
        JSON.stringify({ error: 'AI 服務暫時不可用' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 根據角色選擇系統提示
    const basePrompt = role === 'teacher' ? MINGXIN_PROMPT : XUANJI_PROMPT;

    // 構建帶有八字上下文的系統提示
    let contextualSystemPrompt = basePrompt;
    if (baziContext && baziContext.pillars) {
      const pillars = baziContext.pillars;
      
      // 生成軍團陣容
      const legionFormation = generateLegionFormation(pillars);
      
      // 計算軍團間關係
      const legionRelations = calculateLegionRelations(pillars);
      
      // 日主元素
      const dayElement = STEM_TO_ELEMENT[pillars.day?.stem] || '未知';
      const dayCommander = LEGION_ROLES[pillars.day?.stem] || { name: '未知', role: '未知' };
      
      contextualSystemPrompt += `

【用戶命盤 - 軍團視角】
姓名：${baziContext.name || '命主'}
性別：${baziContext.gender || '未提供'}

【日主分析】
日主：${pillars.day?.stem || ''}（${dayElement}）
主將：${dayCommander.name}（${dayCommander.role}）

【四時軍團陣容】
${legionFormation}

【軍團關係】
${legionRelations}

【命盤數據】
年柱：${pillars.year?.stem || ''}${pillars.year?.branch || ''} - 納音：${baziContext.nayin?.year || '未知'}
月柱：${pillars.month?.stem || ''}${pillars.month?.branch || ''} - 納音：${baziContext.nayin?.month || '未知'}
日柱：${pillars.day?.stem || ''}${pillars.day?.branch || ''} - 納音：${baziContext.nayin?.day || '未知'}
時柱：${pillars.hour?.stem || ''}${pillars.hour?.branch || ''} - 納音：${baziContext.nayin?.hour || '未知'}

【五行分布】
${JSON.stringify(baziContext.wuxing || {})}

【陰陽比例】
${JSON.stringify(baziContext.yinyang || {})}

請根據以上軍團視角的八字資訊回答用戶的問題，善用軍團比喻讓解讀更生動易懂。`;
    }

    console.log("Sending request to AI gateway with role:", role);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextualSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "請求過於頻繁，請稍後再試。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "服務額度已用完，請聯繫管理員。" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI 服務暫時不可用，請稍後再試。" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("AI gateway response received successfully");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI consult error:", error);
    return new Response(JSON.stringify({ error: "AI 服務發生錯誤，請稍後再試" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
