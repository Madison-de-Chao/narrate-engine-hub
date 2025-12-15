/**
 * 故事素材管理系統 - 類型定義
 * 參考 StoryMaterialsManager-2.ts 設計
 */

// 天干角色設定
export interface GanRole {
  title: string;
  description: string;
  personality: string;
  color: string;
  element: '木' | '火' | '土' | '金' | '水';
  yin_yang: '陽' | '陰';
  // 軍團故事用的擴展屬性
  image?: string;
  style?: string;
  buff?: string;
  debuff?: string;
}

// 地支角色設定
export interface ZhiRole {
  title: string;
  description: string;
  personality: string;
  color: string;
  element: '木' | '火' | '土' | '金' | '水';
  time_period: string;
  season: '春季' | '夏季' | '秋季' | '冬季';
  // 軍團故事用的擴展屬性
  symbol?: string;
  character?: string;
  buff?: string;
  debuff?: string;
}

// 角色資料集
export interface CharacterData {
  gan_roles: Record<string, GanRole>;
  zhi_roles: Record<string, ZhiRole>;
}

// 神煞效果
export interface ShenshaEffect {
  name: string;
  alias: string;
  type: '吉神' | '凶神' | '特殊';
  category: string;
  effect: string;
  description: string;
  buff?: string;
  debuff?: string;
  trigger?: string;
  pillar_meaning?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  color: string;
  rarity: '普通' | '稀有' | '史詩' | '傳說';
}

// 神煞組合效果
export interface ShenshaCombination {
  id: string;
  name: string;
  required: string[];
  effect: string;
  description: string;
}

// 神煞資料集
export interface ShenshaData {
  shensha_effects: Record<string, ShenshaEffect>;
  combinations?: ShenshaCombination[];
  summary?: {
    total: number;
    by_type: Record<string, number>;
  };
}

// 故事模板 - 多語言支持
export interface StoryTemplateSection {
  title: string;
  intro: string;
  commander: string;
  strategist: string;
  lieutenants: string;
  shensha: string;
  ten_god: string;
  advice: string;
}

export interface StoryTemplates {
  'army-narrative': {
    'zh-TW': StoryTemplateSection;
    'zh-CN': StoryTemplateSection;
    'en': StoryTemplateSection;
  };
  'fortune-analysis': {
    'zh-TW': Partial<StoryTemplateSection>;
    'en': Partial<StoryTemplateSection>;
  };
  'life-prediction': {
    'zh-TW': Record<string, string>;
  };
}

// AI 提示詞配置
export interface AIPromptConfig {
  system: string;
  user_template: string;
}

export interface AIPrompts {
  openai: {
    'army-narrative': AIPromptConfig;
    'fortune-analysis': AIPromptConfig;
  };
  claude: {
    'army-narrative': AIPromptConfig;
  };
}

// 建議模板
export interface AdviceTemplates {
  by_ten_god: Record<string, string[]>;
  by_element: Record<string, string[]>;
}

// 提示詞資料集
export interface PromptsData {
  story_templates: StoryTemplates;
  ai_prompts: AIPrompts;
  advice_templates: AdviceTemplates;
}

// 軍團上下文
export interface LegionContext {
  name: string;
  stage: string;
  domain: string;
  focus: string;
}

// 納音戰場
export interface NayinBattlefield {
  name: string;
  element: '金' | '木' | '水' | '火' | '土';
  environment: string;
  advantages: string[];
  challenges: string[];
  storyContext?: string;
}

// 兵符卡（神煞卡）
export interface BingfuCard {
  id: string;
  name: string;
  type: 'shensha';
  effect: string;
  description: string;
  powerLevel: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  conditions: string[];
  narrativeTemplate?: string;
}

// 故事生成請求
export interface StoryGenerationRequest {
  pillarKey: 'year' | 'month' | 'day' | 'hour';
  stem: string;
  branch: string;
  nayin?: string;
  tenGod?: {
    stem: string;
    branch: string;
  };
  hiddenStems?: string[];
  shensha?: string[];
  language?: 'zh-TW' | 'zh-CN' | 'en';
}

// 故事生成結果
export interface StoryGenerationResult {
  title: string;
  story: string;
  commander: {
    name: string;
    role: GanRole;
  };
  strategist: {
    name: string;
    role: ZhiRole;
  };
  context: LegionContext;
  advice?: string;
}

// 支持的語言
export type SupportedLanguage = 'zh-TW' | 'zh-CN' | 'en';

// 故事類型
export type StoryType = 'army-narrative' | 'fortune-analysis' | 'life-prediction';
