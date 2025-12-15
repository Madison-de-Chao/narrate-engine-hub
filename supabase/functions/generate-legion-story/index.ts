import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { 
  getTianganRole, 
  getDizhiRole, 
  getLegionContext, 
  aiPrompts,
  generateLocalStory 
} from '../_shared/storyData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legionType, pillarData, name, calculationId, useLocalOnly } = await req.json();
    
    console.log(`Generating story for ${name}, legion: ${legionType}, pillar: ${pillarData.stem}${pillarData.branch}`);
    console.log(`Shensha for this pillar: ${pillarData.shensha?.join('、') || '無'}`);
    
    // 獲取角色資料（使用共用模組）
    const context = getLegionContext(legionType);
    const tianganRole = getTianganRole(pillarData.stem);
    const dizhiRole = getDizhiRole(pillarData.branch);

    console.log(`Commander: ${tianganRole.role}, Strategist: ${dizhiRole.role}`);

    // 如果只需要本地生成（用於快速預覽）
    if (useLocalOnly) {
      const localStory = generateLocalStory({
        name,
        legionType,
        stem: pillarData.stem,
        branch: pillarData.branch,
        nayin: pillarData.nayin,
        shensha: pillarData.shensha
      });
      
      return new Response(
        JSON.stringify({ story: localStory, source: 'local' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.error('LOVABLE_API_KEY is not configured, falling back to local story');
      // 回退到本地故事
      const localStory = generateLocalStory({
        name,
        legionType,
        stem: pillarData.stem,
        branch: pillarData.branch,
        nayin: pillarData.nayin,
        shensha: pillarData.shensha
      });
      return new Response(
        JSON.stringify({ story: localStory, source: 'local' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 構建 AI 提示詞（使用共用模組）
    const systemPrompt = aiPrompts.systemPrompt;
    
    // 構建神煞資訊字串
    const shenshaInfo = pillarData.shensha && pillarData.shensha.length > 0 
      ? pillarData.shensha.join('、') 
      : '無特殊神煞';
    
    const userPrompt = aiPrompts.buildUserPrompt({
      name,
      context,
      tianganRole,
      dizhiRole,
      pillarData
    }) + `\n\n【此柱神煞】\n${shenshaInfo}\n（請在故事中適當融入這些神煞的影響力）`;

    // 調用 Lovable AI
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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
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
      
      // 其他錯誤回退到本地故事
      console.log('Falling back to local story due to AI error');
      const localStory = generateLocalStory({
        name,
        legionType,
        stem: pillarData.stem,
        branch: pillarData.branch,
        nayin: pillarData.nayin,
        shensha: pillarData.shensha
      });
      return new Response(
        JSON.stringify({ story: localStory, source: 'local' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const story = data.choices[0]?.message?.content || '故事生成失敗';

    console.log(`Story generated successfully, length: ${story.length}`);

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
      } else {
        console.log('Story saved to database');
      }
    }

    return new Response(
      JSON.stringify({ story, source: 'ai' }),
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
