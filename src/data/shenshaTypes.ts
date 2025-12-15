/**
 * 神煞規則類型定義
 */

// 單條規則定義
export interface ShenshaRule {
  anchor: 'dayStem' | 'yearBranch' | 'monthBranch' | 'dayBranch' | 'hourBranch' | 'anyBranch' | 'combo' | 'dayPillar';
  anchorType?: 'triad' | 'direct' | 'group' | 'xunkong' | 'specific';
  rule_ref: string;
  matchTarget?: 'anyBranch' | 'anyStem' | 'anyStemOrBranch';
  table?: Record<string, string | string[]> | string[];
  combo?: ComboCondition[];
  notes?: string;
}

// 複合條件定義
export interface ComboCondition {
  anchor: string;
  table?: Record<string, string[]>;
  in?: string[];
  target?: 'year' | 'month' | 'day' | 'hour' | 'any';
  targets?: string[];
  minMatch?: number;
  any?: boolean;
}

// 神煞規則檔案定義
export interface ShenshaRuleDefinition {
  name: string;
  enabled: boolean;
  priority: number;
  category: '吉神' | '凶煞' | '桃花' | '特殊';
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
  rules: ShenshaRule[];
}

// 神煞匹配結果
export interface ShenshaMatch {
  name: string;
  category: '吉神' | '凶煞' | '桃花' | '特殊';
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  priority: number;
  effect: string;
  modernMeaning: string;
  buff: string | null;
  debuff: string | null;
  evidence: ShenshaEvidence;
}

// 證據鏈
export interface ShenshaEvidence {
  anchor_basis: string;      // 錨點依據
  anchor_value: string;      // 錨點值
  why_matched: string;       // 命中原因
  rule_ref: string;          // 規則來源
  matched_pillar: string;    // 命中柱位
  matched_value: string;     // 命中值
}

// 八字輸入
export interface BaziChart {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}

// 稀有度配置
export const RARITY_CONFIG: Record<string, { color: string; weight: number; label: string }> = {
  'SSR': { color: '#FFD700', weight: 100, label: '傳說' },
  'SR': { color: '#9966FF', weight: 50, label: '稀有' },
  'R': { color: '#66B2FF', weight: 20, label: '精良' },
  'N': { color: '#AAAAAA', weight: 10, label: '普通' }
};

// 分類配置
export const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  '吉神': { color: '#22C55E', icon: '✨' },
  '凶煞': { color: '#EF4444', icon: '⚠️' },
  '桃花': { color: '#EC4899', icon: '🌸' },
  '特殊': { color: '#8B5CF6', icon: '🔮' }
};
