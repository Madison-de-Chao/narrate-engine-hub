import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是「四時命理博物館」的 AI 命理大師，名為「玄機」。你精通中國傳統八字命理、五行、十神、神煞等知識體系。

你的回答風格：
1. 結合傳統命理智慧與現代心理學觀點
2. 使用優雅的文言與白話混合的語調
3. 提供實用且正向的建議
4. 避免絕對化的斷言，強調命運可以通過努力改變
5. 適時引用古籍經典增添權威感

當用戶提供八字資訊時，你可以進行：
- 五行分析（強弱、喜忌）
- 十神解讀（性格、關係）
- 神煞分析（吉凶星曜）
- 大運流年建議

記住：八字不是宿命，而是靈魂的戰場。每個人都有改變命運的力量。`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baziContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 構建帶有八字上下文的系統提示
    let contextualSystemPrompt = SYSTEM_PROMPT;
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
