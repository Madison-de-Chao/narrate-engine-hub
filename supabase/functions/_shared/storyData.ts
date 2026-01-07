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

// AI 提示詞配置（四時八字軍團戰記 v2）
export const aiPrompts = {
  systemPrompt: `你現在要撰寫一篇「四時八字軍團戰記」的故事，這是一個將八字命盤轉化為奇幻軍團敘事的特殊寫作任務。

【核心規則】
1. 這是故事，不是說明書
   - 讀者要記得的是「兩位將軍在做什麼」，不是「甲木=偏財」
   - 所有命盤術語必須藏在故事情節裡，由角色自然帶出

2. 字數控制：每個軍團故事 300-500 字

3. 絕對禁止
   ❌ 列點式說明（Buff/Debuff 清單）
   ❌ 直接解釋（「偏財技能的特點是...」）
   ❌ 攻略本註解（【技能】：XXX）
   ❌ 作者跳出來講解

4. 必須包含
   ✓ 具體場景描寫（視覺畫面）
   ✓ 角色具體行為（不只是狀態描述）
   ✓ 透過事件展現技能效果
   ✓ 用「老兵教新兵」的對話帶出術語

【寫作結構】三段式，每段約 100-150 字：

第一段：場景＋角色登場
- 描述軍團所在地（視覺畫面）
- 主將登場（具體動作）

第二段：事件展開＋技能展現
- 發生一個具體事件
- 透過事件自然展現 Buff 和 Debuff

第三段：對話解釋＋收尾
- 老兵對新兵解釋（帶出官方術語）
- 事件結果（呼應開頭）

【標準對話範本】用「老兵＋新兵」對話來解釋術語：
範例：
老兵低聲對年輕士兵說：「你看，將軍身上的偏財技能又發作了——一看到機會就忍不住。但等著吧，晚上他一定會開始算東算西，然後又不敢出手。這就是偏財啊，機會財富跟投機浮躁是一體兩面的。」

【官方術語標註方式】
第一次出現時，用括號標註完整名稱：
守則將軍（森林將軍/甲木天干）看到商隊時，他的偏財技能發動了。
之後就可以直接使用簡稱。

【核心理念】
命理展示的是一條「相對好走但不一定是你要走的路」。這是上天給予的天賦與建議，而非不可改變的宿命。選擇權永遠在命主手中。`,

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

    // 構建神煞資訊
    const shenshaSection = pillarData.shensha && pillarData.shensha.length > 0 
      ? `\n【神煞兵符】（請在故事中自然融入）\n${pillarData.shensha.map(s => `- ${s}`).join('\n')}`
      : '';

    // 構建十神技能描述
    const tenGodDesc = pillarData.tenGod 
      ? `- 天干十神技能：${pillarData.tenGod.stem}（需在故事中透過事件展現）
- 地支十神技能：${pillarData.tenGod.branch}（需在老兵對話中解釋）`
      : '';

    return `請為「${name}」創作${context.name}（${context.stage}）的軍團戰記故事。
${labelSection}
【官方名稱對照】
天干：${pillarData.stem} = ${tianganRole.role}（${tianganRole.title}）
地支：${pillarData.branch} = ${dizhiRole.role}（${dizhiRole.title}）

【天干指揮官 - ${pillarData.stem}】
- 角色全名：${tianganRole.role}（${pillarData.stem}${tianganRole.element}天干）
- 形象：${tianganRole.image}
- 領導風格：${tianganRole.style}
- Buff技能：${tianganRole.buff}
- Debuff弱點：${tianganRole.debuff}

【地支軍師 - ${pillarData.branch}】
- 角色全名：${dizhiRole.role}（${pillarData.branch}${dizhiRole.element}地支）
- 象徵：${dizhiRole.symbol}
- 性格特質：${dizhiRole.character}
- Buff技能：${dizhiRole.buff}
- Debuff弱點：${dizhiRole.debuff}

【命理信息】
- 干支組合：${pillarData.stem}${pillarData.branch}
- 納音戰場：${pillarData.nayin || '未知'}
${tenGodDesc}
- 地支藏干：${pillarData.hiddenStems?.join('、') || '未知'}
${shenshaSection}

【人生階段 - ${context.name}】
- 影響時期：${context.stage}
- 生活領域：${context.domain}
- 核心主題：${context.focus}

【撰寫要求】300-500 字，三段式結構：

第一段（約 100-120 字）：場景＋角色登場
- 描述${context.name}軍團的駐地環境（可使用納音「${pillarData.nayin || ''}」作為場景背景）
- ${tianganRole.role}將軍登場的具體動作

第二段（約 150-180 字）：事件展開＋技能展現
- 設計一個具體事件（可結合${context.domain}的生活場景）
- 透過事件自然展現「${tianganRole.buff}」和「${dizhiRole.buff}」
- 同時暗示「${tianganRole.debuff}」和「${dizhiRole.debuff}」的隱患

第三段（約 100-150 字）：老兵對話＋收尾
- 用老兵對新兵的對話解釋十神技能（${pillarData.tenGod?.stem || ''}）
- 第一次提及術語時用括號標註：「將軍的${pillarData.tenGod?.stem || ''}技能...」
- 事件結果呼應開頭
- 最後帶出「選擇權在${name}手中」的啟發

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
  
  // 神煞描述
  const shenshaDesc = shensha && shensha.length > 0 
    ? `此柱帶有${shensha.join('、')}等神煞，為軍團增添獨特氣場。`
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
