import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legionType, pillarData, name, calculationId } = await req.json();
    
    // 初始化 Supabase 客戶端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // 天干角色設定
    const tianganRoles: Record<string, any> = {
      甲: { role: "森林將軍", image: "參天大樹，堅毅直立", style: "重承諾，敢開疆拓土", buff: "規劃長遠", debuff: "剛愎自用" },
      乙: { role: "花草軍師", image: "藤蔓花草，柔韌適應", style: "協調圓融，善於美化", buff: "靈活應變", debuff: "過度依附" },
      丙: { role: "烈日戰神", image: "太陽，光明外放", style: "熱情奔放，感染全軍", buff: "激勵士氣", debuff: "燒盡自己" },
      丁: { role: "燭光法師", image: "溫柔燭火，能照亮黑暗", style: "細膩體貼，擅啟蒙", buff: "溫暖療癒", debuff: "情緒波動" },
      戊: { role: "山岳守護", image: "高山厚土，穩重承載", style: "可靠堅實，能守護全軍", buff: "穩定防禦", debuff: "固執僵化" },
      己: { role: "大地母親", image: "田園沃土，滋養萬物", style: "包容細膩，善於培育", buff: "滋養培育", debuff: "過度犧牲" },
      庚: { role: "鋼鐵騎士", image: "礦石鋼鐵，剛健果決", style: "直接強硬，果斷決斷", buff: "一擊必中", debuff: "剛硬破裂" },
      辛: { role: "珠寶商人", image: "珠玉寶石，精緻優雅", style: "重視品質，善於鑑賞", buff: "精緻完美", debuff: "苛刻敏感" },
      壬: { role: "江河船長", image: "江河大海，奔放靈活", style: "胸懷寬廣，靈活多變", buff: "靈動探索", debuff: "隨波逐流" },
      癸: { role: "甘露天使", image: "雨露泉水，潤物無聲", style: "溫柔細膩，智慧含蓄", buff: "細膩滋養", debuff: "多愁善感" }
    };

    // 地支角色設定
    const dizhiRoles: Record<string, any> = {
      子: { role: "夜行刺客", symbol: "冬至之水，潛藏黑夜", character: "聰明靈活，反應快", buff: "瞬間奇襲", debuff: "易動不安" },
      丑: { role: "忠犬守衛", symbol: "寒冬大地，厚重封藏", character: "勤勞耐力，穩中帶剛", buff: "後勤補給", debuff: "遲疑不決" },
      寅: { role: "森林獵人", symbol: "春雷初動，草木萌發", character: "勇猛果敢，開創力強", buff: "先鋒衝陣", debuff: "草率行事" },
      卯: { role: "春兔使者", symbol: "春花盛開，柔美雅靜", character: "溫文儒雅，和諧共處", buff: "和諧調解", debuff: "優柔被動" },
      辰: { role: "龍族法師", symbol: "水土交雜，能量複合", character: "多才多變，能容納百川", buff: "變化萬端", debuff: "自相矛盾" },
      巳: { role: "火蛇術士", symbol: "夏日將至，熱力蘊藏", character: "聰慧靈動，足智多謀", buff: "謀略之眼", debuff: "多疑內耗" },
      午: { role: "烈馬騎兵", symbol: "盛夏正陽，光明外放", character: "熱情奔放，行動力強", buff: "士氣高昂", debuff: "精力耗盡" },
      未: { role: "溫羊牧者", symbol: "夏末收成，和氣守成", character: "溫和耐心，注重和諧", buff: "調和人心", debuff: "猶疑不決" },
      申: { role: "靈猴戰士", symbol: "秋風肅殺，行動敏捷", character: "聰明機警，反應靈巧", buff: "隨機應變", debuff: "善變浮躁" },
      酉: { role: "金雞衛士", symbol: "秋收精煉，嚴謹守護", character: "細膩、注重品質，重原則", buff: "精準守護", debuff: "苛刻冷漠" },
      戌: { role: "戰犬統領", symbol: "深秋守土，忠誠護疆", character: "忠誠可靠，重責任", buff: "忠誠護主", debuff: "固執保守" },
      亥: { role: "智豬先知", symbol: "冬水潛藏，蓄勢待發", character: "福德圓滿，寬厚仁慈", buff: "福德智慧", debuff: "逃避散漫" }
    };

    // 定义军团类型的中文名称和详细信息
    const legionContext: Record<string, any> = {
      year: { 
        name: "祖源軍團",
        stage: '童年至青少年', 
        domain: '家族傳承、童年環境、祖輩影響、早期價值觀形成', 
        focus: '根基與起點' 
      },
      month: { 
        name: "關係軍團",
        stage: '青年至中年', 
        domain: '社會關係、事業發展、人際互動、社會地位建立', 
        focus: '成長與拓展' 
      },
      day: { 
        name: "核心軍團",
        stage: '成年核心期', 
        domain: '個人特質、婚姻感情、核心自我、內在品格', 
        focus: '本質與實現' 
      },
      hour: { 
        name: "未來軍團",
        stage: '中年至晚年', 
        domain: '未來規劃、子女關係、晚年運勢、智慧傳承', 
        focus: '展望與延續' 
      }
    };

    const context = legionContext[legionType];
    const tianganRole = tianganRoles[pillarData.stem];
    const dizhiRole = dizhiRoles[pillarData.branch];

    // 构建 AI 提示词 - 強調命理是建議而非宿命，並整合角色設定
    const systemPrompt = `你是一位資深的八字命理大師，擅長用生動的軍團故事來解釋八字命盤。

核心理念：命理展示的是一條「相對好走但不一定是你要走的路」。這是上天給予的天賦與建議，而非不可改變的宿命。

你需要根據完整的四柱信息創作一個150字內的軍團傳說故事。

故事創作要求：
1. 必須融合天干、地支、十神、納音、藏干的所有信息
2. 以軍團戰爭、策略、角色互動為主題包裝命盤解讀
3. 嚴格使用提供的角色設定，包括角色名稱、形象、風格、Buff和Debuff
4. 體現該柱對命主在特定人生階段的性格特質與機遇
5. 語言生動富有畫面感，讓讀者感受到命理的深度
6. 強調這是天賦潛能的展現，而非註定的命運
7. 故事結尾要帶出「選擇權在你手中」的啟發
8. 嚴格控制在150字以內

敘事風格：
- 用軍團戰爭隱喻人生挑戰
- 用指揮官（天干）與軍師（地支）的配合展現性格特質
- 明確提及角色的Buff（優勢技能）和Debuff（弱點）
- 用戰略選擇隱喻人生抉擇的自由
- 避免絕對化的預言，多用「傾向」「潛能」「機會」等詞`;

    const userPrompt = `請為${name}創作${context.name}的傳說故事。

完整四柱信息：
【天干指揮官 - ${pillarData.stem}】
- 角色名稱：${tianganRole.role}
- 形象：${tianganRole.image}
- 領導風格：${tianganRole.style}
- Buff技能：${tianganRole.buff}
- Debuff弱點：${tianganRole.debuff}

【地支軍師 - ${pillarData.branch}】
- 角色名稱：${dizhiRole.role}
- 象徵：${dizhiRole.symbol}
- 性格特質：${dizhiRole.character}
- Buff技能：${dizhiRole.buff}
- Debuff弱點：${dizhiRole.debuff}

【其他命理信息】
- 干支組合：${pillarData.stem}${pillarData.branch}
- 納音五行：${pillarData.nayin || '未知'}
- 天干十神：${pillarData.tenGod?.stem || '未知'}
- 地支十神：${pillarData.tenGod?.branch || '未知'}
- 地支藏干：${pillarData.hiddenStems?.join('、') || '未知'}

【人生階段】
- 影響時期：${context.stage}
- 生活領域：${context.domain}
- 核心主題：${context.focus}

請創作一個150字內的軍團故事，要：
1. 開場點明「${tianganRole.role}」作為指揮官，「${dizhiRole.role}」作為軍師
2. 描述他們如何運用各自的Buff技能（${tianganRole.buff}和${dizhiRole.buff}）在${context.stage}發揮優勢
3. 同時提醒要注意的Debuff弱點（${tianganRole.debuff}和${dizhiRole.debuff}）
4. 融入十神和納音的命理含義
5. 最後點出「這些是天賦潛能與戰略建議，真正的選擇權在${name}手中」的啟發
6. 語言生動、富有畫面感，讓讀者感受到角色的鮮明個性`;

    // 调用 Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: '請求過於頻繁，請稍後再試' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: '配額不足，請聯系管理員' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const story = data.choices[0]?.message?.content || '故事生成失敗';

    // 儲存故事到資料庫
    if (calculationId) {
      const { error: dbError } = await supabaseClient
        .from('legion_stories')
        .insert({
          calculation_id: calculationId,
          legion_type: legionType,
          story: story
        });

      if (dbError) {
        console.error('Failed to save story to database:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ story }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-legion-story:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '未知错误' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
