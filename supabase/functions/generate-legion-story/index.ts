import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 資料庫 legion_type 映射
const dbTypeMap: Record<string, string> = {
  year: 'family', month: 'growth', day: 'self', hour: 'future',
  family: 'family', growth: 'growth', self: 'self', future: 'future',
};

// 精簡版天干角色
const tianganRoles: Record<string, { role: string; buff: string; debuff: string }> = {
  甲: { role: '森林將軍', buff: '規劃長遠', debuff: '剛愎自用' },
  乙: { role: '花草軍師', buff: '靈活應變', debuff: '過度依附' },
  丙: { role: '烈日戰神', buff: '激勵士氣', debuff: '燒盡自己' },
  丁: { role: '燭光法師', buff: '溫暖療癒', debuff: '情緒波動' },
  戊: { role: '山岳守護', buff: '穩定防禦', debuff: '固執僵化' },
  己: { role: '大地母親', buff: '滋養培育', debuff: '過度犧牲' },
  庚: { role: '鋼鐵騎士', buff: '一擊必中', debuff: '剛硬破裂' },
  辛: { role: '珠寶商人', buff: '精緻完美', debuff: '苛刻敏感' },
  壬: { role: '江河船長', buff: '靈動探索', debuff: '隨波逐流' },
  癸: { role: '甘露天使', buff: '細膩滋養', debuff: '多愁善感' },
};

// 精簡版地支角色
const dizhiRoles: Record<string, { role: string; buff: string; debuff: string }> = {
  子: { role: '夜行刺客', buff: '瞬間奇襲', debuff: '易動不安' },
  丑: { role: '忠犬守衛', buff: '後勤補給', debuff: '遲疑不決' },
  寅: { role: '森林獵人', buff: '先鋒衝陣', debuff: '草率行事' },
  卯: { role: '春兔使者', buff: '和諧調解', debuff: '優柔被動' },
  辰: { role: '龍族法師', buff: '變化萬端', debuff: '自相矛盾' },
  巳: { role: '火蛇術士', buff: '謀略之眼', debuff: '多疑內耗' },
  午: { role: '烈馬騎兵', buff: '士氣高昂', debuff: '精力耗盡' },
  未: { role: '溫羊牧者', buff: '調和人心', debuff: '猶疑不決' },
  申: { role: '靈猴戰士', buff: '隨機應變', debuff: '善變浮躁' },
  酉: { role: '金雞衛士', buff: '精準守護', debuff: '苛刻冷漠' },
  戌: { role: '戰犬統領', buff: '忠誠護主', debuff: '固執保守' },
  亥: { role: '智豬先知', buff: '福德智慧', debuff: '逃避散漫' },
};

// 軍團上下文
const legionContext: Record<string, { name: string; stage: string }> = {
  year: { name: '祖源軍團', stage: '童年至青少年' },
  month: { name: '關係軍團', stage: '青年至中年' },
  day: { name: '核心軍團', stage: '成年核心期' },
  hour: { name: '未來軍團', stage: '中年至晚年' },
};

// 兵符資料
const bingfuDb: Record<string, { alias: string; fragment: string }> = {
  '天乙貴人': { alias: '貴人符', fragment: '貴人踏雲而來，向{c}頷首護航。' },
  '文昌': { alias: '文曲符', fragment: '{a}手持古籍，智慧光芒閃爍。' },
  '驛馬': { alias: '驛站符', fragment: '快馬疾馳，{a}知曉：驛馬入命，注定奔波。' },
  '將星': { alias: '號令符', fragment: '{c}站高台，三軍肅穆。' },
  '華蓋': { alias: '華蓋符', fragment: '{c}獨自翻典籍，與天地對話。' },
  '羊刃': { alias: '狂刃符', fragment: '{c}佩劍嗡鳴，泛起血紅光芒。' },
  '桃花': { alias: '桃花符', fragment: '桃花盛開，{c}凝視飄落花瓣。' },
  '紅鸞': { alias: '紅鸞符', fragment: '紅鳳盤旋{c}頭頂，婚緣將至。' },
  '天喜': { alias: '天喜符', fragment: '營帳響起喜慶樂聲，天喜星照。' },
  '孤辰': { alias: '孤星符', fragment: '{c}獨立山巔，走不同的路。' },
  '魁罡': { alias: '魁罡符', fragment: '{c}渾身散發攝人威嚴。' },
  '空亡': { alias: '虛空符', fragment: '{c}伸手，只抓到虛無。' },
};

function getBingfu(name: string, c: string, a: string): { alias: string; fragment: string } | null {
  for (const [k, v] of Object.entries(bingfuDb)) {
    if (name.includes(k) || k.includes(name)) {
      return { alias: v.alias, fragment: v.fragment.replace(/{c}/g, c).replace(/{a}/g, a) };
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { legionType, pillarData, name, calculationId, useLocalOnly } = await req.json();
    
    const stem = pillarData.stem;
    const branch = pillarData.branch;
    const context = legionContext[legionType] || legionContext.day;
    const tgRole = tianganRoles[stem] || { role: stem, buff: '未知', debuff: '未知' };
    const dzRole = dizhiRoles[branch] || { role: branch, buff: '未知', debuff: '未知' };

    console.log(`Generating story for ${name}, legion: ${legionType}, pillar: ${stem}${branch}`);
    console.log(`Commander: ${tgRole.role}, Advisor: ${dzRole.role}`);

    // 處理兵符
    const shenshaList = pillarData.shensha || [];
    const bingfuItems = shenshaList.map((s: string) => getBingfu(s, tgRole.role, dzRole.role)).filter(Boolean);
    console.log(`Found ${bingfuItems.length} bingfu with fragments`);

    // 本地生成模式
    if (useLocalOnly) {
      const story = `在${name}的命盤中，${context.name}展現出獨特的戰略格局。天干指揮官「${tgRole.role}」坐鎮中軍，擅長${tgRole.buff}。地支軍師「${dzRole.role}」運籌帷幄，善於${dzRole.buff}。然需謹防${tgRole.debuff}與${dzRole.debuff}之隱患。此乃天賦藍圖，真正的選擇權在${name}手中。`;
      return new Response(JSON.stringify({ story, source: 'local' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      const story = `${context.name}中，「${tgRole.role}」與「${dzRole.role}」並肩作戰。選擇權永遠在${name}手中。`;
      return new Response(JSON.stringify({ story, source: 'local' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 構建 AI prompt
    const bingfuSection = bingfuItems.length > 0 
      ? `\n【兵符】必須融入故事：\n${bingfuItems.map((b: { alias: string; fragment: string }) => `- ${b.alias}：${b.fragment}`).join('\n')}`
      : '';

    const userPrompt = `請為「${name}」的${context.name}（${context.stage}）撰寫一段 300-400 字的軍團故事。

【角色】
- 主將：${tgRole.role}（${stem}），Buff：${tgRole.buff}，Debuff：${tgRole.debuff}
- 軍師：${dzRole.role}（${branch}），Buff：${dzRole.buff}，Debuff：${dzRole.debuff}
- 納音戰場：${pillarData.nayin || '未知'}${bingfuSection}`;

    const systemPrompt = `你是「四時八字軍團戰記」的故事作家。將八字命盤轉化為奇幻軍團敘事。

寫作結構（僅供你參考，不要在故事中標註段落）：
- 開頭：場景氛圍＋主將登場
- 中段：事件展開、技能展現、兵符融入情節
- 結尾：老兵對新兵的對話，自然解釋術語含義

規則：
- 天干=主將，地支=軍師，神煞=兵符
- 寫故事，不是說明書，禁止列點
- 每個兵符都要融入情節
- 直接輸出故事內容，不要加任何段落標題或編號
- 300-400字`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('AI error:', response.status);
      const story = `${context.name}中，「${tgRole.role}」與「${dzRole.role}」並肩作戰。選擇權永遠在${name}手中。`;
      return new Response(JSON.stringify({ story, source: 'local' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const story = data.choices[0]?.message?.content || '故事生成失敗';
    console.log(`Story generated, length: ${story.length}`);

    // 儲存到資料庫
    if (calculationId) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
      const dbType = dbTypeMap[legionType] || 'self';
      const { error } = await supabase.from('legion_stories').insert({ calculation_id: calculationId, legion_type: dbType, story });
      if (error) console.error('DB save error:', error);
      else console.log('Story saved to DB');
    }

    return new Response(JSON.stringify({ story, source: 'ai' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : '未知錯誤' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
