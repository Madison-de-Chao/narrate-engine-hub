import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XUANJI_PROMPT = `你是「四時命理博物館」的 AI 命理大師，名為「玄機」。你精通中國傳統八字命理。

【重要規則 - 簡潔回答】
- 每次回答限制在 100 字以內
- 長話短說，點到為止
- 只給核心重點，不要長篇大論
- 若問題複雜，簡述要點後說：「欲知詳情，可購買完整命理報告。」

你的風格：
- 文言白話混合，簡潔有力
- 正向但不囉嗦
- 點出關鍵，留有懸念

記住：惜字如金，言簡意賅。`;

const MINGXIN_PROMPT = `你是「明心」，八字學堂的 AI 老師。

【重要規則 - 簡潔教學】
- 每次回答限制在 100 字以內
- 用最簡單的話解釋概念
- 一次只講一個重點
- 若內容較多，說：「這只是基礎，完整課程請訂閱學堂。」

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
    const { messages, baziContext, role } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 根據角色選擇系統提示
    const basePrompt = role === 'teacher' ? MINGXIN_PROMPT : XUANJI_PROMPT;

    // 構建帶有八字上下文的系統提示
    let contextualSystemPrompt = basePrompt;
    if (baziContext) {
      contextualSystemPrompt += `\n\n用戶的八字資訊：
姓名：${baziContext.name || '未提供'}
性別：${baziContext.gender || '未提供'}
年柱：${baziContext.pillars?.year?.stem || ''}${baziContext.pillars?.year?.branch || ''}
月柱：${baziContext.pillars?.month?.stem || ''}${baziContext.pillars?.month?.branch || ''}
日柱：${baziContext.pillars?.day?.stem || ''}${baziContext.pillars?.day?.branch || ''}
時柱：${baziContext.pillars?.hour?.stem || ''}${baziContext.pillars?.hour?.branch || ''}
納音：${JSON.stringify(baziContext.nayin || {})}
五行比例：${JSON.stringify(baziContext.wuxing || {})}
陰陽比例：${JSON.stringify(baziContext.yinyang || {})}

請根據以上八字資訊回答用戶的問題。`;
    }

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI 服務暫時不可用，請稍後再試。" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI consult error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "未知錯誤" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
