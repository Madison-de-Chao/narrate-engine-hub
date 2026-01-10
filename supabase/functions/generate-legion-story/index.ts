import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    // 構建 AI prompt - 完整版敘事結構
    const bingfuSection = bingfuItems.length > 0 
      ? bingfuItems.map((b: { alias: string; fragment: string }) => `「${b.alias}」：${b.fragment}`).join('\n')
      : '';

    const tenGodSkill = pillarData.tenGod || '未知';
    const hiddenStems = pillarData.hiddenStems?.join('、') || '暫無';

    const userPrompt = `為「${name}」的${context.name}（人生階段：${context.stage}）撰寫軍團故事。

【本柱官方資料】
天干主將：${tgRole.role}（${stem}）
地支軍師：${dzRole.role}（${branch}）
納音戰場：${pillarData.nayin || '未知'}
十神技能：${tenGodSkill}
藏干副將：${hiddenStems}

【Buff/Debuff 效果】
主將「${tgRole.role}」
├ 天賦：${tgRole.buff}
└ 弱點：${tgRole.debuff}

軍師「${dzRole.role}」
├ 專長：${dzRole.buff}
└ 隱患：${dzRole.debuff}

【兵符（神煞）】本柱顯現的兵符：
${bingfuSection || '此柱未顯現特殊兵符'}

請依規範撰寫故事。`;

    const systemPrompt = `你是「四時八字軍團戰記」專業故事作家，負責撰寫《虹靈御所八字人生四時軍團秘笈》的軍團戰記章節。

═══════════════════════════════════════
核心創作理念
═══════════════════════════════════════
這是一個「沉浸式命盤故事」，讀者透過故事認識自己的八字命格。
所有術語（十神、神煞、藏干）必須藏在情節與對話中，絕不直接解說。
讓讀者記住「將軍的行為」而非「命理公式」。

═══════════════════════════════════════
三段式敘事結構（總字數 400-500 字）
═══════════════════════════════════════

【第一段】戰場場景＋角色登場（120-160字）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▸ 以「納音戰場」為背景，描繪視覺畫面
  例：「海中金」→ 深海珊瑚礁；「山頭火」→ 火山熔岩陣
▸ 主將「${tgRole.role}」登場：具體動作＋人格特質展現
▸ 軍師「${dzRole.role}」輔佐：描述其策略定位
▸ 首次提及用完整標註：「${tgRole.role}（${stem}天干主將）」

【第二段】事件展開＋技能與兵符（180-220字）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▸ 發生一個具體事件（戰役、談判、危機、決策等）
▸ 透過事件自然展現「十神技能」效果：
  - 比劫：盟友援護 / 食傷：創意輸出 / 財星：資源掌控
  - 官殺：責任承擔 / 印星：智慧支援
▸ 【關鍵】兵符必須融入情節：
  - 貴人符：援軍從天而降
  - 驛馬符：長途奔襲或調動
  - 華蓋符：獨處沉思獲得啟示
  - 桃花符：人際魅力化解危機
  - 羊刃符：劍氣逼人，危險邊緣的力量
▸ Buff 讓事件順利，Debuff 製造波折

【第三段】老兵對話＋兵法收尾（120-160字）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▸ 固定格式：老兵教導新兵的對話
▸ 範例：
  「小子，看清楚了——將軍身上那股衝勁，就是『偏財』技能發作。
   見著機會就往前撲，成了叫魄力，敗了叫賭性。這輩子就看他怎麼拿捏分寸。」
▸ 透過老兵口吻，解釋一個核心術語的真實含義
▸ 收尾：引用《孫子兵法》智慧呼應故事主題
  例：「知己知彼，百戰不殆」「善用兵者，避其銳氣」「上兵伐謀」

═══════════════════════════════════════
絕對禁止
═══════════════════════════════════════
✗ 結構性標題（「第一段」「【場景】」等）
✗ 列點清單（- Buff: xxx）
✗ 直接定義（「偏財的特點是...」）
✗ 作者跳出故事講解
✗ 超出字數限制

═══════════════════════════════════════
必須達成
═══════════════════════════════════════
✓ 讓讀者「看見」場景（具體視覺描寫）
✓ 讓角色「動起來」（行為而非狀態）
✓ 術語藏在對話中（老兵口吻教學）
✓ 兵符成為情節關鍵（不是裝飾）
✓ 段落間空一行

直接輸出故事正文。`;

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
