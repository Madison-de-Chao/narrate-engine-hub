import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legionType, pillarData, name } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // 定义军团类型的中文名称
    const legionNames: Record<string, string> = {
      family: "家族军团",
      growth: "成长军团", 
      self: "自我军团",
      future: "未来军团"
    };

    // 构建 AI 提示词
    const systemPrompt = `你是一位资深的八字命理大师，擅长用生动的军团故事来解释八字命盘。
你需要根据四柱信息创作一个约150字的军团传说故事。

故事要求：
1. 必须准确反映天干地支的五行属性和角色特质
2. 以军团战争、策略、角色互动为主题
3. 要体现该柱对命主人生的影响
4. 语言要生动、富有画面感
5. 严格控制在150字左右`;

    const userPrompt = `请为${name}创作${legionNames[legionType]}的传说故事。

四柱信息：
- 天干：${pillarData.stem}
- 地支：${pillarData.branch}
- 组合：${pillarData.stem}${pillarData.branch}

${legionType === 'family' ? '这是年柱，代表家族传承、祖辈影响、人生根基。' : ''}
${legionType === 'growth' ? '这是月柱，代表成长环境、青年时期、事业发展。' : ''}
${legionType === 'self' ? '这是日柱，代表自我本质、核心性格、夫妻关系。' : ''}
${legionType === 'future' ? '这是时柱，代表晚年运势、子女关系、人生结局。' : ''}

请创作一个150字的军团故事，要生动、富有深意。`;

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
          JSON.stringify({ error: '请求过于频繁，请稍后再试' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: '配额不足，请联系管理员' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const story = data.choices[0]?.message?.content || '故事生成失败';

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
