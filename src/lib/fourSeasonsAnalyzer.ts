/**
 * 四時軍團分析器
 * 參考 utils-3.ts 的 FourSeasonsTeam 邏輯
 */

// 季節類型
export type SeasonCycle = '春' | '夏' | '秋' | '冬';

// 四時軍團分析結果
export interface FourSeasonsTeam {
  team: SeasonCycle;
  teamName: string;
  seasonByPillar: Record<'year' | 'month' | 'day' | 'hour', SeasonCycle>;
  distribution: Record<SeasonCycle, string>;
  raw: Record<SeasonCycle, number>;
  keywords: string[];
  strengths: string[];
  blindspots: string[];
  tips: string[];
}

// 季節分布結果
export interface SeasonDistribution {
  seasonByPillar: Record<'year' | 'month' | 'day' | 'hour', SeasonCycle>;
  raw: Record<SeasonCycle, number>;
  percentage: Record<SeasonCycle, string>;
  total: number;
}

// 地支對應季節（方局歸屬）
const BRANCH_TO_SEASON: Record<string, SeasonCycle> = {
  '寅': '春', '卯': '春', '辰': '春',
  '巳': '夏', '午': '夏', '未': '夏',
  '申': '秋', '酉': '秋', '戌': '秋',
  '亥': '冬', '子': '冬', '丑': '冬'
};

// 辰戌丑未四季末土月（本氣為土，需特殊處理）
const EARTH_TRANSITION_BRANCHES = ['辰', '戌', '丑', '未'];

// 地支的本氣五行
const BRANCH_NATIVE_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 判斷是否為季末土月
export function isEarthTransitionBranch(branch: string): boolean {
  return EARTH_TRANSITION_BRANCHES.includes(branch);
}

// 獲取地支本氣五行
export function getBranchNativeElement(branch: string): string {
  return BRANCH_NATIVE_ELEMENT[branch] ?? '土';
}

// 四時軍團特質配置
const FOUR_SEASONS_PROFILES: Record<SeasonCycle, {
  name: string;
  keywords: string[];
  strengths: string[];
  blindspots: string[];
  tips: string[];
}> = {
  '春': {
    name: '春生軍團',
    keywords: ['生發', '創新', '學習', '規劃'],
    strengths: [
      '啟動力強，適合開創新局',
      '善於連結資源與人脈',
      '成長導向，學習能力強',
      '創意豐富，點子多'
    ],
    blindspots: [
      '容易虎頭蛇尾',
      '規劃過多執行不足',
      '耐心略弱，急於求成'
    ],
    tips: [
      '鎖定1-2個關鍵目標，避免分心',
      '設定里程碑與定期回顧節奏',
      '與執行型夥伴配對互補'
    ]
  },
  '夏': {
    name: '夏旺軍團',
    keywords: ['熱情', '行動', '表達', '領導'],
    strengths: [
      '爆發力強，行動迅速',
      '影響力高，擅長溝通號召',
      '敢於承擔，領導力強',
      '熱情洋溢，感染力強'
    ],
    blindspots: [
      '衝動決策，三思不足',
      '忽略細節，大而化之',
      '能量易過載，容易耗盡'
    ],
    tips: [
      '先做風險清單再行動',
      '安排恢復與休息時間',
      '以數據與清單補足細節'
    ]
  },
  '秋': {
    name: '秋收軍團',
    keywords: ['條理', '效率', '規範', '決斷'],
    strengths: [
      '結構化能力強，善於整理',
      '優化流程，注重效率',
      '注重品質，精益求精',
      '善於收斂與交付成果'
    ],
    blindspots: [
      '過度嚴格，對人對己',
      '創意不足，墨守成規',
      '對變動不安，適應較慢'
    ],
    tips: [
      '保留探索與嘗試空間',
      '用原型驗證取代一次到位',
      '與創意型夥伴合作互補'
    ]
  },
  '冬': {
    name: '冬藏軍團',
    keywords: ['內省', '沉穩', '專注', '研究'],
    strengths: [
      '深入研究，洞察力強',
      '韌性高，能持久努力',
      '能長期專注，不受干擾',
      '風險意識強，謹慎穩健'
    ],
    blindspots: [
      '行動慢熱，啟動較慢',
      '不易求助，獨自承擔',
      '容易自我懷疑，過度思考'
    ],
    tips: [
      '以小步快跑取代完美主義',
      '建立定期分享與互動機制',
      '設定求助與協作節點'
    ]
  }
};

/**
 * 根據地支獲取對應季節
 */
export function getSeasonByBranch(branch: string): SeasonCycle {
  return BRANCH_TO_SEASON[branch] ?? '春';
}

// 土能量分數（用於季末土月特殊處理）
export interface EarthEnergyScore {
  hasEarthMonth: boolean;        // 是否為季末土月
  earthBranches: string[];       // 哪些柱位是土月
  earthEnergy: number;           // 土能量總分
  seasonalEarthNote: string;     // 土月解讀提示
}

/**
 * 計算四柱的季節分布
 * 權重：月支 2，其餘 1
 * 特殊處理：辰戌丑未季末土月
 */
export function calculateSeasonDistribution(pillars: {
  year: { branch: string };
  month: { branch: string };
  day: { branch: string };
  hour: { branch: string };
}): SeasonDistribution & { earthEnergy?: EarthEnergyScore } {
  const dist: Record<SeasonCycle, number> = { '春': 0, '夏': 0, '秋': 0, '冬': 0 };
  
  const seasonYear = getSeasonByBranch(pillars.year.branch);
  const seasonMonth = getSeasonByBranch(pillars.month.branch);
  const seasonDay = getSeasonByBranch(pillars.day.branch);
  const seasonHour = getSeasonByBranch(pillars.hour.branch);
  
  // 權重：月支 2，其餘 1（月令最重要）
  // 若為季末土月，權重降為 1.5（因本氣為土，季節能量較弱）
  const monthWeight = isEarthTransitionBranch(pillars.month.branch) ? 1.5 : 2;
  
  dist[seasonYear] += 1;
  dist[seasonMonth] += monthWeight;
  dist[seasonDay] += 1;
  dist[seasonHour] += 1;
  
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  const percentage: Record<SeasonCycle, string> = { '春': '0', '夏': '0', '秋': '0', '冬': '0' };
  
  (Object.keys(dist) as SeasonCycle[]).forEach(k => {
    percentage[k] = total ? ((dist[k] / total) * 100).toFixed(1) : '0';
  });
  
  // 計算土能量（辰戌丑未）
  const earthBranches: string[] = [];
  let earthEnergy = 0;
  
  const allBranches = [
    { branch: pillars.year.branch, pillar: 'year', weight: 1 },
    { branch: pillars.month.branch, pillar: 'month', weight: 2 },
    { branch: pillars.day.branch, pillar: 'day', weight: 1 },
    { branch: pillars.hour.branch, pillar: 'hour', weight: 1 }
  ];
  
  allBranches.forEach(({ branch, pillar, weight }) => {
    if (isEarthTransitionBranch(branch)) {
      earthBranches.push(pillar);
      earthEnergy += weight;
    }
  });
  
  const earthEnergyScore: EarthEnergyScore = {
    hasEarthMonth: isEarthTransitionBranch(pillars.month.branch),
    earthBranches,
    earthEnergy,
    seasonalEarthNote: earthBranches.length > 0 
      ? `命盤帶有${earthBranches.length}個季末土月（${earthBranches.map(p => {
          const branchMap: Record<string, string> = { year: pillars.year.branch, month: pillars.month.branch, day: pillars.day.branch, hour: pillars.hour.branch };
          return branchMap[p];
        }).join('、')}），土氣較旺，主穩重調和，但需注意可能影響季節能量的純粹度。`
      : ''
  };
  
  return {
    seasonByPillar: { 
      year: seasonYear, 
      month: seasonMonth, 
      day: seasonDay, 
      hour: seasonHour 
    },
    raw: dist,
    percentage,
    total,
    earthEnergy: earthEnergyScore
  };
}

/**
 * 獲取四時軍團分析結果
 * 軍團以「月支所屬季節」為主
 */
export function getFourSeasonsTeam(pillars: {
  year: { branch: string };
  month: { branch: string };
  day: { branch: string };
  hour: { branch: string };
}): FourSeasonsTeam {
  const dist = calculateSeasonDistribution(pillars);
  
  // 軍團以「月支所屬季節」為主（月令決定格局）
  const team = dist.seasonByPillar.month;
  const profile = FOUR_SEASONS_PROFILES[team];
  
  return {
    team,
    teamName: profile.name,
    seasonByPillar: dist.seasonByPillar,
    distribution: dist.percentage,
    raw: dist.raw,
    keywords: profile.keywords,
    strengths: profile.strengths,
    blindspots: profile.blindspots,
    tips: profile.tips
  };
}

/**
 * 獲取季節的中文完整名稱
 */
export function getSeasonFullName(season: SeasonCycle): string {
  const names: Record<SeasonCycle, string> = {
    '春': '春季（木旺）',
    '夏': '夏季（火旺）',
    '秋': '秋季（金旺）',
    '冬': '冬季（水旺）'
  };
  return names[season];
}

/**
 * 獲取季節對應的五行
 */
export function getSeasonElement(season: SeasonCycle): string {
  const elements: Record<SeasonCycle, string> = {
    '春': '木',
    '夏': '火',
    '秋': '金',
    '冬': '水'
  };
  return elements[season];
}

/**
 * 獲取季節對應的顏色
 */
export function getSeasonColor(season: SeasonCycle): string {
  const colors: Record<SeasonCycle, string> = {
    '春': '#22c55e', // 綠色
    '夏': '#ef4444', // 紅色
    '秋': '#f59e0b', // 金色
    '冬': '#3b82f6'  // 藍色
  };
  return colors[season];
}
