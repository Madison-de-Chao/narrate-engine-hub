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

    // 构建 AI 提示词 - 強調命理是建議而非宿命
    const systemPrompt = `你是一位資深的八字命理大師，擅長用生動的軍團故事來解釋八字命盤。

核心理念：命理展示的是一條「相對好走但不一定是你要走的路」。這是上天給予的天賦與建議，而非不可改變的宿命。

你需要根據完整的四柱信息創作一個150字內的軍團傳說故事。

故事創作要求：
1. 必須融合天干、地支、十神、納音、藏干的所有信息
2. 以軍團戰爭、策略、角色互動為主題包裝命盤解讀
3. 體現該柱對命主在特定人生階段的性格特質與機遇
4. 語言生動富有畫面感，讓讀者感受到命理的深度
5. 強調這是天賦潛能的展現，而非註定的命運
6. 故事結尾要帶出「選擇權在你手中」的啟發
7. 嚴格控制在150字以內

敘事風格：
- 用軍團戰爭隱喻人生挑戰
- 用指揮官（天干）與軍師（地支）的配合展現性格特質
- 用戰略選擇隱喻人生抉擇的自由
- 避免絕對化的預言，多用「傾向」「潛能」「機會」等詞`;

    const userPrompt = `請為${name}創作${context.name}的傳說故事。

完整四柱信息：
【基礎信息】
- 天干（指揮官）：${pillarData.stem}
- 地支（軍師）：${pillarData.branch}
- 干支組合：${pillarData.stem}${pillarData.branch}
- 納音五行：${pillarData.nayin || '未知'}

【十神關係】
- 天干十神：${pillarData.tenGod?.stem || '未知'}
- 地支十神：${pillarData.tenGod?.branch || '未知'}

【藏干信息】
- 地支藏干：${pillarData.hiddenStems?.join('、') || '未知'}

【人生階段】
- 影響時期：${context.stage}
- 生活領域：${context.domain}
- 核心主題：${context.focus}

請創作一個150字內的軍團故事，要：
1. 巧妙融入以上所有命理元素
2. 用軍團戰爭隱喻${name}在${context.stage}的性格與機遇
3. 展現${pillarData.stem}指揮官與${pillarData.branch}軍師的配合特質
4. 體現十神關係帶來的能量特徵
5. 最後點出「這些是天賦潛能，真正的選擇權在你手中」的啟發
6. 語言生動、富有深意、給人啟發而非束縛`;

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
