/**
 * 故事生成共用資料 - Edge Functions 專用
 * 對應前端 src/lib/storyMaterials 的資料結構
 */

// 天干角色設定 (對應 characters.json 的 gan_roles)
export const tianganRoles: Record<string, {
  role: string;
  title: string;
  image: string;
  style: string;
  buff: string;
  debuff: string;
  element: string;
  yinYang: string;
  color: string;
}> = {
  甲: { 
    role: "森林將軍", 
    title: "統帥將軍",
    image: "參天大樹，堅毅直立", 
    style: "重承諾，敢開疆拓土", 
    buff: "規劃長遠", 
    debuff: "剛愎自用",
    element: "木",
    yinYang: "陽",
    color: "#22c55e"
  },
  乙: { 
    role: "花草軍師", 
    title: "謀略軍師",
    image: "藤蔓花草，柔韌適應", 
    style: "協調圓融，善於美化", 
    buff: "靈活應變", 
    debuff: "過度依附",
    element: "木",
    yinYang: "陰",
    color: "#86efac"
  },
  丙: { 
    role: "烈日戰神", 
    title: "熱血戰士",
    image: "太陽，光明外放", 
    style: "熱情奔放，感染全軍", 
    buff: "激勵士氣", 
    debuff: "燒盡自己",
    element: "火",
    yinYang: "陽",
    color: "#ef4444"
  },
  丁: { 
    role: "燭光法師", 
    title: "智慧啟蒙者",
    image: "溫柔燭火，能照亮黑暗", 
    style: "細膩體貼，擅啟蒙", 
    buff: "溫暖療癒", 
    debuff: "情緒波動",
    element: "火",
    yinYang: "陰",
    color: "#fb923c"
  },
  戊: { 
    role: "山岳守護", 
    title: "鋼鐵衛士",
    image: "高山厚土，穩重承載", 
    style: "可靠堅實，能守護全軍", 
    buff: "穩定防禦", 
    debuff: "固執僵化",
    element: "土",
    yinYang: "陽",
    color: "#a16207"
  },
  己: { 
    role: "大地母親", 
    title: "慈悲療癒師",
    image: "田園沃土，滋養萬物", 
    style: "包容細膩，善於培育", 
    buff: "滋養培育", 
    debuff: "過度犧牲",
    element: "土",
    yinYang: "陰",
    color: "#ca8a04"
  },
  庚: { 
    role: "鋼鐵騎士", 
    title: "決斷劍士",
    image: "礦石鋼鐵，剛健果決", 
    style: "直接強硬，果斷決斷", 
    buff: "一擊必中", 
    debuff: "剛硬破裂",
    element: "金",
    yinYang: "陽",
    color: "#94a3b8"
  },
  辛: { 
    role: "珠寶商人", 
    title: "精緻鑑賞家",
    image: "珠玉寶石，精緻優雅", 
    style: "重視品質，善於鑑賞", 
    buff: "精緻完美", 
    debuff: "苛刻敏感",
    element: "金",
    yinYang: "陰",
    color: "#e2e8f0"
  },
  壬: { 
    role: "江河船長", 
    title: "探索航海家",
    image: "江河大海，奔放靈活", 
    style: "胸懷寬廣，靈活多變", 
    buff: "靈動探索", 
    debuff: "隨波逐流",
    element: "水",
    yinYang: "陽",
    color: "#3b82f6"
  },
  癸: { 
    role: "甘露天使", 
    title: "潤物智者",
    image: "雨露泉水，潤物無聲", 
    style: "溫柔細膩，智慧含蓄", 
    buff: "細膩滋養", 
    debuff: "多愁善感",
    element: "水",
    yinYang: "陰",
    color: "#93c5fd"
  }
};

// 地支角色設定 (對應 characters.json 的 zhi_roles)
export const dizhiRoles: Record<string, {
  role: string;
  title: string;
  symbol: string;
  character: string;
  buff: string;
  debuff: string;
  element: string;
  season: string;
  timePeriod: string;
  color: string;
}> = {
  子: { 
    role: "夜行刺客", 
    title: "暗夜潛行者",
    symbol: "冬至之水，潛藏黑夜", 
    character: "聰明靈活，反應快", 
    buff: "瞬間奇襲", 
    debuff: "易動不安",
    element: "水",
    season: "冬季",
    timePeriod: "23:00-01:00",
    color: "#1e3a5f"
  },
  丑: { 
    role: "忠犬守衛", 
    title: "堅韌守護者",
    symbol: "寒冬大地，厚重封藏", 
    character: "勤勞耐力，穩中帶剛", 
    buff: "後勤補給", 
    debuff: "遲疑不決",
    element: "土",
    season: "冬季",
    timePeriod: "01:00-03:00",
    color: "#5c4033"
  },
  寅: { 
    role: "森林獵人", 
    title: "曙光先鋒",
    symbol: "春雷初動，草木萌發", 
    character: "勇猛果敢，開創力強", 
    buff: "先鋒衝陣", 
    debuff: "草率行事",
    element: "木",
    season: "春季",
    timePeriod: "03:00-05:00",
    color: "#15803d"
  },
  卯: { 
    role: "春兔使者", 
    title: "和平調停者",
    symbol: "春花盛開，柔美雅靜", 
    character: "溫文儒雅，和諧共處", 
    buff: "和諧調解", 
    debuff: "優柔被動",
    element: "木",
    season: "春季",
    timePeriod: "05:00-07:00",
    color: "#22c55e"
  },
  辰: { 
    role: "龍族法師", 
    title: "神秘變化師",
    symbol: "水土交雜，能量複合", 
    character: "多才多變，能容納百川", 
    buff: "變化萬端", 
    debuff: "自相矛盾",
    element: "土",
    season: "春季",
    timePeriod: "07:00-09:00",
    color: "#854d0e"
  },
  巳: { 
    role: "火蛇術士", 
    title: "智謀策士",
    symbol: "夏日將至，熱力蘊藏", 
    character: "聰慧靈動，足智多謀", 
    buff: "謀略之眼", 
    debuff: "多疑內耗",
    element: "火",
    season: "夏季",
    timePeriod: "09:00-11:00",
    color: "#dc2626"
  },
  午: { 
    role: "烈馬騎兵", 
    title: "熱血衝鋒者",
    symbol: "盛夏正陽，光明外放", 
    character: "熱情奔放，行動力強", 
    buff: "士氣高昂", 
    debuff: "精力耗盡",
    element: "火",
    season: "夏季",
    timePeriod: "11:00-13:00",
    color: "#ef4444"
  },
  未: { 
    role: "溫羊牧者", 
    title: "慈愛撫育者",
    symbol: "夏末收成，和氣守成", 
    character: "溫和耐心，注重和諧", 
    buff: "調和人心", 
    debuff: "猶疑不決",
    element: "土",
    season: "夏季",
    timePeriod: "13:00-15:00",
    color: "#a16207"
  },
  申: { 
    role: "靈猴戰士", 
    title: "機敏應變者",
    symbol: "秋風肅殺，行動敏捷", 
    character: "聰明機警，反應靈巧", 
    buff: "隨機應變", 
    debuff: "善變浮躁",
    element: "金",
    season: "秋季",
    timePeriod: "15:00-17:00",
    color: "#71717a"
  },
  酉: { 
    role: "金雞衛士", 
    title: "精準執法者",
    symbol: "秋收精煉，嚴謹守護", 
    character: "細膩、注重品質，重原則", 
    buff: "精準守護", 
    debuff: "苛刻冷漠",
    element: "金",
    season: "秋季",
    timePeriod: "17:00-19:00",
    color: "#94a3b8"
  },
  戌: { 
    role: "戰犬統領", 
    title: "忠誠護衛官",
    symbol: "深秋守土，忠誠護疆", 
    character: "忠誠可靠，重責任", 
    buff: "忠誠護主", 
    debuff: "固執保守",
    element: "土",
    season: "秋季",
    timePeriod: "19:00-21:00",
    color: "#78350f"
  },
  亥: { 
    role: "智豬先知", 
    title: "福慧預言者",
    symbol: "冬水潛藏，蓄勢待發", 
    character: "福德圓滿，寬厚仁慈", 
    buff: "福德智慧", 
    debuff: "逃避散漫",
    element: "水",
    season: "冬季",
    timePeriod: "21:00-23:00",
    color: "#1e40af"
  }
};

// 軍團上下文設定
export const legionContext: Record<string, {
  name: string;
  stage: string;
  domain: string;
  focus: string;
  description: string;
}> = {
  year: { 
    name: "祖源軍團",
    stage: '童年至青少年', 
    domain: '家族傳承、童年環境、祖輩影響、早期價值觀形成', 
    focus: '根基與起點',
    description: '代表你的家族傳承與早年際遇，如同軍團的根基血脈'
  },
  month: { 
    name: "關係軍團",
    stage: '青年至中年', 
    domain: '社會關係、事業發展、人際互動、社會地位建立', 
    focus: '成長與拓展',
    description: '代表你的事業發展與社會關係，如同軍團的擴張版圖'
  },
  day: { 
    name: "核心軍團",
    stage: '成年核心期', 
    domain: '個人特質、婚姻感情、核心自我、內在品格', 
    focus: '本質與實現',
    description: '代表你的核心自我與親密關係，如同軍團的靈魂本質'
  },
  hour: { 
    name: "未來軍團",
    stage: '中年至晚年', 
    domain: '未來規劃、子女關係、晚年運勢、智慧傳承', 
    focus: '展望與延續',
    description: '代表你的未來展望與傳承，如同軍團的延續榮耀'
  }
};

// 故事模板 (可用於本地生成)
export const storyTemplates = {
  'zh-TW': {
    intro: (name: string, legionName: string) => 
      `在${name}的命盤中，${legionName}展現出獨特的戰略格局。`,
    commander: (role: string, buff: string) => 
      `天干指揮官「${role}」坐鎮中軍，擅長${buff}。`,
    strategist: (role: string, buff: string) => 
      `地支軍師「${role}」運籌帷幄，善於${buff}。`,
    warning: (debuff1: string, debuff2: string) => 
      `然需謹防${debuff1}與${debuff2}之隱患。`,
    closing: (name: string) => 
      `此乃天賦藍圖，真正的選擇權在${name}手中。`
  }
};

// AI 提示詞配置（四時八字軍團戰記 v6 - 依據《虹靈御所八字人生兵法》秘笈規範）
export const aiPrompts = {
  systemPrompt: `你現在要撰寫一篇「四時八字軍團戰記」的故事，這是《虹靈御所八字人生兵法》中將八字命盤轉化為奇幻軍團敘事的特殊寫作任務。

【虹靈御所兵法體系】
- 天干 = 主將（十位主將：森林將軍、花草軍師、烈日戰神...）
- 地支 = 軍師（十二軍師：夜行刺客、忠犬守衛、森林獵人...）
- 四柱 = 四支兵團：
  年柱 → 家族兵團（傳承之軍，祖上與幼年）
  月柱 → 成長兵團（環境之軍，青年與資源）
  日柱 → 本我兵團（核心之軍，自我與中年）
  時柱 → 未來兵團（遠征之軍，子女與晚年）
- 十神 = 技能樹（Buff/Debuff 系統）
- 神煞 = 兵符（隨機事件卡，觸發額外劇情）
- 納音 = 戰場地圖（決定作戰環境）

【核心規則】

1. 這是故事，不是說明書
   - 讀者要記得的是「兩位將軍在吵架」，不是「甲木=偏財」
   - 所有命盤術語必須藏在故事情節裡，由角色自然帶出

2. 字數控制
   - 每個軍團故事：300-500 字
   - 如果有四個軍團，總字數約 1,200-2,000 字

3. 絕對禁止
   ❌ 列點式說明（Buff/Debuff 清單）
   ❌ 直接解釋（「偏財技能的特點是...」）
   ❌ 攻略本註解（【技能】：XXX）
   ❌ 作者跳出來講解
   ❌ 遺漏任何提供的兵符（每個兵符都必須出現在故事中）

4. 必須包含
   ✓ 具體場景描寫（視覺畫面）
   ✓ 角色具體行為（不只是狀態描述）
   ✓ 透過事件展現技能效果
   ✓ 用「老兵教新兵」的對話帶出術語
   ✓ 【強制】所有兵符必須融入情節（見下方兵符規則）

【兵符規則 - 強制執行】
兵符（神煞）是命盤中的特殊符號，在虹靈御所兵法中是「隨機事件卡」：
- 吉神兵符：臨時 Buff，加持全軍（如天乙貴人→貴人符、文昌貴人→智慧符、將星→號令符）
- 凶煞兵符：Debuff，帶來危機挑戰（如羊刃→狂刃符、劫煞→奪財符）
- 桃花兵符：觸發人際／情感事件（如咸池→魅惑符、紅鸞→良緣符）

每個兵符都必須以「事件」或「角色特質」的形式出現，禁止只在結尾一筆帶過！

兵符融入範例：
❌ 錯誤：「幸好有天乙貴人相助，事情順利解決。」（太籠統）
✅ 正確：「正當僵局無解之際，一位白袍老者悄然出現。老兵解釋：『那是貴人符的顯現——天乙貴人。只要將軍遇到真正的困難，總會有這樣的貴人在暗中相助。』」

【寫作結構】
每個軍團的故事分三段，每段約 100-150 字：

第一段：場景＋角色登場
- 描述軍團所在地（納音戰場的視覺畫面）
- 主將登場（具體動作）
- 約 100-120 字

第二段：事件展開＋技能展現＋兵符登場
- 發生一個具體事件
- 透過事件自然展現 Buff 和 Debuff
- 【強制】兵符必須在此段以具體形式登場
- 約 150-180 字

第三段：對話解釋＋收尾
- 用老兵對新兵的對話解釋十神技能和兵符含義
- 第一次提及術語時用括號標註
- 事件結果呼應開頭
- 約 100-150 字

【標準對話範本】
用「老兵＋新兵」對話來解釋術語：

範例一（含兵符解釋）：
老兵低聲對年輕士兵說：「你看到那位白袍老者了嗎？那就是傳說中的貴人符——天乙貴人。只要將軍遇到真正的困難，總會有貴人在暗中相助。」

範例二（含技能解釋）：
年輕士兵問：「為什麼將軍總喜歡獨自一人待著？」
老兵說：「那是華蓋兵符的影響。這讓他擁有非凡的洞察力和藝術天賦，但也讓他習慣獨處，不太融入人群。」

【官方術語標註方式】
第一次出現時，用括號標註完整名稱：
森林將軍（甲木主將）看到商隊時，他的偏財技能發動了。
之後就可以直接使用簡稱。

【核心理念 - 虹靈御所哲學】
《虹靈御所八字人生兵法》不是告訴你「命定如此」，而是給你一份戰場地圖與軍團手冊。
命局不是枷鎖，而是兵法。懂得兵法，你就能指揮自己的靈魂軍團。
選擇權永遠在命主手中。`,

  buildUserPrompt: (params: {
    name: string;
    context: typeof legionContext[keyof typeof legionContext];
    tianganRole: typeof tianganRoles[keyof typeof tianganRoles];
    dizhiRole: typeof dizhiRoles[keyof typeof dizhiRoles];
    pillarData: {
      stem: string;
      branch: string;
      nayin?: string;
      tenGod?: { stem: string; branch: string };
      hiddenStems?: string[];
      shensha?: string[];
      dataLabels?: {
        strengthTag?: string;
        dominantElement?: string;
        dominantTenGod?: string;
        specialPatterns?: string[];
      };
    };
  }) => {
    const { name, context, tianganRole, dizhiRole, pillarData } = params;
    
    // 構建數據標籤區塊
    const dataLabels = pillarData.dataLabels;
    const labelSection = dataLabels ? `
【命理數據標籤】（後端精確計算，請嚴格依據）
- 日主強弱：${dataLabels.strengthTag || '待分析'}
- 主導五行：${dataLabels.dominantElement || '待分析'}
- 十神傾向：${dataLabels.dominantTenGod || '待分析'}
${dataLabels.specialPatterns && dataLabels.specialPatterns.length > 0 ? `- 特殊格局：${dataLabels.specialPatterns.join('、')}` : ''}
` : '';

    // 構建十神技能描述
    const tenGodDesc = pillarData.tenGod 
      ? `- 天干十神技能：${pillarData.tenGod.stem}（需在故事中透過事件展現）
- 地支十神技能：${pillarData.tenGod.branch}（需在老兵對話中解釋）`
      : '';

    // 構建藏干副將資訊
    const hiddenStemsDesc = pillarData.hiddenStems && pillarData.hiddenStems.length > 0
      ? pillarData.hiddenStems.map((hs, i) => {
          const hsRole = tianganRoles[hs];
          return hsRole ? `  - ${i === 0 ? '副將' : '奇謀'}：${hs}（${hsRole.role}）- ${hsRole.buff}` : `  - ${hs}`;
        }).join('\n')
      : '未知';

    // 構建兵符資訊 - 強化版
    const hasShensha = pillarData.shensha && pillarData.shensha.length > 0;
    const shenshaSection = hasShensha 
      ? `
【兵符】⚠️ 強制融入 - 不可遺漏任何一個
${pillarData.shensha!.map((s, i) => `${i + 1}. ${s}兵符（必須在第二段以具體事件或角色形式出現）`).join('\n')}

兵符融入檢查清單：
${pillarData.shensha!.map(s => `□ ${s}兵符 - 已融入故事？`).join('\n')}
`
      : '\n【兵符】此柱無特殊兵符\n';

    // 兵符融入指引
    const shenshaGuidance = hasShensha ? `
⚠️ 【兵符融入指引】
${pillarData.shensha!.map(s => {
  // 根據兵符類型提供具體融入建議
  if (s.includes('貴人')) return `- ${s}兵符：設計一位貴人角色在關鍵時刻提供幫助或指點`;
  if (s.includes('桃花')) return `- ${s}兵符：加入一段與人際魅力、吸引力相關的情節`;
  if (s.includes('華蓋')) return `- ${s}兵符：描述角色獨處思考或展現藝術/宗教氣質的場景`;
  if (s.includes('驛馬')) return `- ${s}兵符：加入遷移、出行或變動的情節`;
  if (s.includes('文昌')) return `- ${s}兵符：展現學習、考試或文書相關的智慧時刻`;
  if (s.includes('孤辰') || s.includes('寡宿')) return `- ${s}兵符：描述獨立自主或孤獨面對挑戰的情境`;
  if (s.includes('羊刃')) return `- ${s}兵符：展現果決剛毅但帶有衝動風險的行動`;
  if (s.includes('將星')) return `- ${s}兵符：描述領導氣質或統帥才能的展現`;
  return `- ${s}兵符：請以具體事件或角色特質形式融入`;
}).join('\n')}
` : '';

    return `請為「${name}」創作${context.name}（${context.stage}）的軍團戰記故事。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${labelSection}
【八字四柱】
- 此柱：${pillarData.stem}${pillarData.branch}
- 人生階段：${context.stage}
- 生活領域：${context.domain}

【官方名稱對照】
天干：${pillarData.stem} = ${tianganRole.role}（${tianganRole.title}）
地支：${pillarData.branch} = ${dizhiRole.role}（${dizhiRole.title}）

【天干指揮官 - ${pillarData.stem}】
- 角色全名：${tianganRole.role}（${pillarData.stem}${tianganRole.element}天干）
- 形象：${tianganRole.image}
- 領導風格：${tianganRole.style}
- Buff 技能：${tianganRole.buff}
- Debuff 弱點：${tianganRole.debuff}

【地支軍師 - ${pillarData.branch}】
- 角色全名：${dizhiRole.role}（${pillarData.branch}${dizhiRole.element}地支）
- 象徵：${dizhiRole.symbol}
- 性格特質：${dizhiRole.character}
- Buff 技能：${dizhiRole.buff}
- Debuff 弱點：${dizhiRole.debuff}

【十神】
${tenGodDesc || '- 待分析'}

【藏干副將/奇謀】
${hiddenStemsDesc}
${shenshaSection}
【納音戰場】
- ${pillarData.nayin || '未知'}（作為故事場景背景）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${shenshaGuidance}
【撰寫要求】300-500 字，三段式結構：

第一段（約 100-120 字）：場景＋角色登場
- 描述${context.name}軍團的駐地環境
- 可使用納音「${pillarData.nayin || ''}」作為場景背景
- ${tianganRole.role}將軍登場的具體動作

第二段（約 150-180 字）：事件展開＋技能展現＋兵符登場
- 設計一個與「${context.domain}」相關的具體事件
- 透過事件自然展現「${tianganRole.buff}」和「${dizhiRole.buff}」
- 同時暗示「${tianganRole.debuff}」和「${dizhiRole.debuff}」的隱患
${hasShensha ? `- ⚠️ 【強制】必須讓以下兵符以具體形式登場：${pillarData.shensha!.map(s => s + '兵符').join('、')}` : ''}

第三段（約 100-150 字）：老兵對話＋收尾
- 用老兵對新兵的對話解釋十神技能${hasShensha ? '和兵符含義' : ''}
- 第一次提及術語時用括號標註
- 事件結果呼應開頭
- 帶出「選擇權在${name}手中」的啟發

請開始撰寫故事。`;
  }
};

// 獲取天干角色
export function getTianganRole(stem: string) {
  return tianganRoles[stem] || tianganRoles['甲'];
}

// 獲取地支角色
export function getDizhiRole(branch: string) {
  return dizhiRoles[branch] || dizhiRoles['子'];
}

// 獲取軍團上下文
export function getLegionContext(type: string) {
  return legionContext[type] || legionContext['day'];
}

// 生成本地故事（不需 AI）
export function generateLocalStory(params: {
  name: string;
  legionType: string;
  stem: string;
  branch: string;
  nayin?: string;
  shensha?: string[];  // 新增：該柱專屬的神煞列表
}): string {
  const { name, legionType, stem, branch, nayin, shensha } = params;
  const context = getLegionContext(legionType);
  const tianganRole = getTianganRole(stem);
  const dizhiRole = getDizhiRole(branch);
  const templates = storyTemplates['zh-TW'];
  
  // 兵符描述
  const shenshaDesc = shensha && shensha.length > 0 
    ? `此柱帶有${shensha.map(s => s + '兵符').join('、')}，為軍團增添獨特氣場。`
    : '';

  return [
    templates.intro(name, context.name),
    templates.commander(tianganRole.role, tianganRole.buff),
    templates.strategist(dizhiRole.role, dizhiRole.buff),
    nayin ? `納音「${nayin}」為戰場賦予獨特能量。` : '',
    shenshaDesc,
    templates.warning(tianganRole.debuff, dizhiRole.debuff),
    templates.closing(name)
  ].filter(Boolean).join('');
}
