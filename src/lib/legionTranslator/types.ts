/**
 * 命理角色轉譯模組 - 類型定義
 * 基於《虹靈御所八字人生兵法》規格
 */

// ==================== 五行與陰陽 ====================

export type WuxingElement = '木' | '火' | '土' | '金' | '水';
export type YinYang = '陽' | '陰';

// ==================== 四柱軍團結構 ====================

export type PillarKey = 'year' | 'month' | 'day' | 'hour';

export interface LegionInfo {
  id: PillarKey;
  name: string;
  theme: string;
  domain: string;
  focus: string;
  lifeStage: string;
}

// 四柱軍團對應
export const LEGION_DEFINITIONS: Record<PillarKey, LegionInfo> = {
  year: {
    id: 'year',
    name: '家族軍團',
    theme: '先天與家族背景',
    domain: '祖上傳承、原生家庭影響',
    focus: '根基力量',
    lifeStage: '人生起點'
  },
  month: {
    id: 'month',
    name: '成長軍團',
    theme: '成長環境與資源',
    domain: '童年教育、社會人脈',
    focus: '養分與考驗',
    lifeStage: '成長過程'
  },
  day: {
    id: 'day',
    name: '本我軍團',
    theme: '個體的核心本命',
    domain: '本我性格、靈魂意志',
    focus: '自我意識',
    lifeStage: '人生主角'
  },
  hour: {
    id: 'hour',
    name: '未來軍團',
    theme: '未來發展與傳承',
    domain: '理想抱負、子女後代',
    focus: '長遠影響',
    lifeStage: '目標實現'
  }
};

// ==================== 角色定位 ====================

export type RolePosition = 'general' | 'strategist' | 'lieutenant' | 'specialist';

export interface RolePositionInfo {
  id: RolePosition;
  name: string;
  source: string;
  description: string;
  archetypes: string[];
}

export const ROLE_POSITIONS: Record<RolePosition, RolePositionInfo> = {
  general: {
    id: 'general',
    name: '主將',
    source: '天干',
    description: '外顯的將領，代表該柱所掌管領域的主導力量',
    archetypes: ['將軍', '首領', '戰神', '族長', '領袖']
  },
  strategist: {
    id: 'strategist',
    name: '軍師',
    source: '地支',
    description: '深層底蘊與幕後智囊，掌握資源、人脈與背景',
    archetypes: ['策士', '法師', '長老', '智者', '謀主']
  },
  lieutenant: {
    id: 'lieutenant',
    name: '副將',
    source: '藏干主星',
    description: '隱性的支援力量，輔助主將發揮作用',
    archetypes: ['騎士', '護衛', '統領', '衛士', '輔佐']
  },
  specialist: {
    id: 'specialist',
    name: '奇謀',
    source: '藏干副星',
    description: '潛在的奇計妙策，非常規情境下激發的隱藏力量',
    archetypes: ['刺客', '游擊', '使者', '奇兵', '密探']
  }
};

// ==================== Buff/Debuff 系統 ====================

export interface BuffDebuff {
  buff: string;
  buffValue: number;
  debuff: string;
  debuffValue: number;
}

export interface ElementBuffDebuff extends BuffDebuff {
  element: WuxingElement;
  strengthDesc: string;
  weaknessDesc: string;
}

// 五行 Buff/Debuff
export const WUXING_BUFFS: Record<WuxingElement, ElementBuffDebuff> = {
  木: {
    element: '木',
    buff: '創新生長之力，帶來理想規劃與拓展能力',
    buffValue: 20,
    debuff: '急躁和過度理想化',
    debuffValue: -10,
    strengthDesc: '創新規劃、拓展開創、理想遠大',
    weaknessDesc: '急躁衝動、過度理想、缺乏現實感'
  },
  火: {
    element: '火',
    buff: '熱情衝鋒之力，帶來高昂士氣、快速行動',
    buffValue: 25,
    debuff: '衝動用事、精力耗竭',
    debuffValue: -15,
    strengthDesc: '熱情高昂、行動迅速、感染力強',
    weaknessDesc: '衝動魯莽、精力耗盡、缺乏耐心'
  },
  土: {
    element: '土',
    buff: '穩固承載之力，帶來穩定防禦、包容性強',
    buffValue: 20,
    debuff: '保守固執、停滯不前',
    debuffValue: -10,
    strengthDesc: '穩定可靠、包容萬物、持久耐力',
    weaknessDesc: '保守固執、行動遲緩、抗拒改變'
  },
  金: {
    element: '金',
    buff: '執行決斷之力，帶來紀律精準、果斷執行',
    buffValue: 22,
    debuff: '過於嚴苛、缺乏變通',
    debuffValue: -12,
    strengthDesc: '紀律嚴明、決斷果敢、執行精準',
    weaknessDesc: '嚴苛無情、不知變通、過於剛硬'
  },
  水: {
    element: '水',
    buff: '智略流動之力，帶來智慧洞察、隱忍適應',
    buffValue: 20,
    debuff: '多疑不定、漂泊無根',
    debuffValue: -10,
    strengthDesc: '智慧深邃、適應力強、洞察敏銳',
    weaknessDesc: '多疑善變、漂泊不定、優柔寡斷'
  }
};

// 十神 Buff/Debuff
export interface TenGodBuffDebuff extends BuffDebuff {
  tenGod: string;
  category: '比劫' | '食傷' | '財星' | '官殺' | '印星';
  skillType: string;
}

export const TEN_GOD_BUFFS: Record<string, TenGodBuffDebuff> = {
  比肩: {
    tenGod: '比肩',
    category: '比劫',
    skillType: '盟友支援',
    buff: '隊友盟軍眾多，增強自信與助力',
    buffValue: 15,
    debuff: '內部競爭或意見分歧',
    debuffValue: -8
  },
  劫財: {
    tenGod: '劫財',
    category: '比劫',
    skillType: '競爭合作',
    buff: '行動力強，敢於競爭爭取',
    buffValue: 18,
    debuff: '破財風險，樹敵過多',
    debuffValue: -12
  },
  食神: {
    tenGod: '食神',
    category: '食傷',
    skillType: '創意輸出',
    buff: '創造力豐富，表達力佳，人緣好',
    buffValue: 20,
    debuff: '懶散不切實際，貪圖享樂',
    debuffValue: -10
  },
  傷官: {
    tenGod: '傷官',
    category: '食傷',
    skillType: '叛逆創新',
    buff: '思維敏捷，敢於挑戰傳統',
    buffValue: 22,
    debuff: '傲慢不羈，易惹官非',
    debuffValue: -15
  },
  正財: {
    tenGod: '正財',
    category: '財星',
    skillType: '資源掌控',
    buff: '務實可靠，善於理財持家',
    buffValue: 18,
    debuff: '小氣保守，過於計較',
    debuffValue: -8
  },
  偏財: {
    tenGod: '偏財',
    category: '財星',
    skillType: '機遇把握',
    buff: '善抓機會，人脈廣，慷慨大方',
    buffValue: 20,
    debuff: '投機取巧，財來財去',
    debuffValue: -12
  },
  正官: {
    tenGod: '正官',
    category: '官殺',
    skillType: '責任規範',
    buff: '正直有責任感，受人敬重',
    buffValue: 18,
    debuff: '保守壓抑，過於拘謹',
    debuffValue: -10
  },
  七殺: {
    tenGod: '七殺',
    category: '官殺',
    skillType: '壓力挑戰',
    buff: '危機中有生機，膽識過人',
    buffValue: 25,
    debuff: '壓力過大，容易衝動極端',
    debuffValue: -18
  },
  正印: {
    tenGod: '正印',
    category: '印星',
    skillType: '後援保護',
    buff: '貴人運強，學習力佳，得人庇護',
    buffValue: 20,
    debuff: '依賴心強，缺乏行動力',
    debuffValue: -10
  },
  偏印: {
    tenGod: '偏印',
    category: '印星',
    skillType: '洞察靈感',
    buff: '靈感豐富，直覺敏銳，獨特見解',
    buffValue: 18,
    debuff: '孤僻多疑，鑽牛角尖',
    debuffValue: -12
  }
};

// ==================== 角色完整定義 ====================

export interface CharacterRole {
  // 基本資訊
  id: string;
  title: string;
  description: string;
  
  // 屬性
  element: WuxingElement;
  yinYang: YinYang;
  color: string;
  
  // 角色定位
  position: RolePosition;
  archetypes: string[];
  
  // Buff/Debuff
  buff: string;
  buffValue: number;
  debuff: string;
  debuffValue: number;
  
  // 性格與風格
  personality: string[];
  actionStyle: string;
  
  // 故事元素
  storyKeywords: string[];
  scenarioTemplate: string;
}

// 天干角色定義（主將）
export interface GanCharacter extends CharacterRole {
  gan: string;
}

// 地支角色定義（軍師）
export interface ZhiCharacter extends CharacterRole {
  zhi: string;
  timePeriod: string;
  season: '春季' | '夏季' | '秋季' | '冬季';
  hiddenStems: string[];
}

// ==================== 納音戰場 ====================

export interface NayinBattlefield {
  name: string;
  element: WuxingElement;
  environment: string;
  advantages: string[];
  challenges: string[];
  buffCondition: string;
  debuffCondition: string;
  storyContext: string;
}

// ==================== 神煞兵符 ====================

export type ShenshaType = '吉神' | '凶神' | '特殊';
export type ShenshaRarity = '普通' | '稀有' | '史詩' | '傳說';

export interface ShenshaBingfu {
  name: string;
  alias: string;
  type: ShenshaType;
  category: string;
  
  // 效果
  effect: string;
  buff: string;
  buffValue: number;
  debuff: string;
  debuffValue: number;
  
  // 觸發
  trigger: string;
  pillarMeaning: Record<PillarKey, string>;
  
  // 視覺
  color: string;
  rarity: ShenshaRarity;
  
  // 故事
  narrativeTemplate: string;
}

// ==================== 軍團完整結構 ====================

export interface LegionMember {
  role: RolePosition;
  character: CharacterRole;
  tenGod?: string;
  buffDebuffs: BuffDebuff[];
}

export interface Legion {
  pillarKey: PillarKey;
  info: LegionInfo;
  
  // 角色
  general: LegionMember;
  strategist: LegionMember;
  lieutenant?: LegionMember;
  specialists: LegionMember[];
  
  // 戰場
  battlefield: NayinBattlefield;
  
  // 神煞兵符
  bingfus: ShenshaBingfu[];
  
  // 計算後的總效果
  totalBuff: number;
  totalDebuff: number;
  
  // 內部關係
  internalHarmony: number; // -100 到 100，負數為衝突，正數為和諧
  harmonyDescription: string;
}

// ==================== 完整命盤軍團 ====================

export interface FullLegionArmy {
  // 四大軍團
  familyLegion: Legion;      // 年柱 - 家族軍團
  growthLegion: Legion;      // 月柱 - 成長軍團
  selfLegion: Legion;        // 日柱 - 本我軍團
  futureLegion: Legion;      // 時柱 - 未來軍團
  
  // 軍團間關係
  interLegionRelations: InterLegionRelation[];
  
  // 整體評估
  overallStrength: number;
  overallBalance: WuxingBalance;
  strategicAdvice: string[];
}

export interface InterLegionRelation {
  fromLegion: PillarKey;
  toLegion: PillarKey;
  relationType: '相生' | '相剋' | '合' | '沖' | '刑' | '害' | '中立';
  effect: string;
  narrativeDescription: string;
}

export interface WuxingBalance {
  distribution: Record<WuxingElement, number>;
  dominant: WuxingElement | null;
  lacking: WuxingElement | null;
  isBalanced: boolean;
  analysisText: string;
}

// ==================== 敘事生成 ====================

export interface NarrativeSection {
  title: string;
  content: string;
}

export interface LegionNarrative {
  opening: NarrativeSection;
  legionStories: Record<PillarKey, NarrativeSection>;
  relationships: NarrativeSection;
  conclusion: NarrativeSection;
  strategicFormula: string;
}

// ==================== 輸入輸出 ====================

export interface BaziInput {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourStem: string;
  hourBranch: string;
}

export interface TranslationResult {
  input: BaziInput;
  army: FullLegionArmy;
  narrative: LegionNarrative;
  timestamp: string;
}
