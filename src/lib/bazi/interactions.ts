/**
 * 地支互動檢測引擎（刑衝會合）
 * Level 1 架構：只負責「發現」，不負責「改分」
 */

import type { InteractionType, InteractionResult, FourPillars } from "@/types/bazi";

// ============================================
// 六衝規則表
// ============================================
const CLASH_PAIRS: Record<string, string> = {
  "子": "午", "午": "子",
  "丑": "未", "未": "丑",
  "寅": "申", "申": "寅",
  "卯": "酉", "酉": "卯",
  "辰": "戌", "戌": "辰",
  "巳": "亥", "亥": "巳",
};

const CLASH_DESCRIPTIONS: Record<string, string> = {
  "子午": "子午相衝，水火激盪，情緒起伏大",
  "午子": "子午相衝，水火激盪，情緒起伏大",
  "丑未": "丑未相衝，土土對峙，固執己見",
  "未丑": "丑未相衝，土土對峙，固執己見",
  "寅申": "寅申相衝，木金交戰，衝勁十足",
  "申寅": "寅申相衝，木金交戰，衝勁十足",
  "卯酉": "卯酉相衝，金木相剋，決斷力強",
  "酉卯": "卯酉相衝，金木相剋，決斷力強",
  "辰戌": "辰戌相衝，龍狗相爭，魄力過人",
  "戌辰": "辰戌相衝，龍狗相爭，魄力過人",
  "巳亥": "巳亥相衝，水火交濟，變動頻繁",
  "亥巳": "巳亥相衝，水火交濟，變動頻繁",
};

// ============================================
// 六合規則表
// ============================================
const COMBINATION_6_PAIRS: Record<string, { partner: string; element: string }> = {
  "子": { partner: "丑", element: "土" },
  "丑": { partner: "子", element: "土" },
  "寅": { partner: "亥", element: "木" },
  "亥": { partner: "寅", element: "木" },
  "卯": { partner: "戌", element: "火" },
  "戌": { partner: "卯", element: "火" },
  "辰": { partner: "酉", element: "金" },
  "酉": { partner: "辰", element: "金" },
  "巳": { partner: "申", element: "水" },
  "申": { partner: "巳", element: "水" },
  "午": { partner: "未", element: "太陽" },
  "未": { partner: "午", element: "太陽" },
};

// ============================================
// 三合規則表
// ============================================
const COMBINATION_3_GROUPS: Array<{
  branches: [string, string, string];
  element: string;
  name: string;
}> = [
  { branches: ["申", "子", "辰"], element: "水", name: "申子辰三合水局" },
  { branches: ["寅", "午", "戌"], element: "火", name: "寅午戌三合火局" },
  { branches: ["巳", "酉", "丑"], element: "金", name: "巳酉丑三合金局" },
  { branches: ["亥", "卯", "未"], element: "木", name: "亥卯未三合木局" },
];

// ============================================
// 六害規則表
// ============================================
const HARM_PAIRS: Record<string, string> = {
  "子": "未", "未": "子",
  "丑": "午", "午": "丑",
  "寅": "巳", "巳": "寅",
  "卯": "辰", "辰": "卯",
  "申": "亥", "亥": "申",
  "酉": "戌", "戌": "酉",
};

const HARM_DESCRIPTIONS: Record<string, string> = {
  "子未": "子未相害，骨肉分離之象",
  "未子": "子未相害，骨肉分離之象",
  "丑午": "丑午相害，官祿相害",
  "午丑": "丑午相害，官祿相害",
  "寅巳": "寅巳相害，恩將仇報",
  "巳寅": "寅巳相害，恩將仇報",
  "卯辰": "卯辰相害，勢力相害",
  "辰卯": "卯辰相害，勢力相害",
  "申亥": "申亥相害，嫉妒相害",
  "亥申": "申亥相害，嫉妒相害",
  "酉戌": "酉戌相害，嫌疑相害",
  "戌酉": "酉戌相害，嫌疑相害",
};

// ============================================
// 相刑規則表
// ============================================
const PUNISHMENT_GROUPS: Array<{
  type: string;
  branches: string[];
  name: string;
  description: string;
}> = [
  // 三刑
  { type: "無恩之刑", branches: ["寅", "巳", "申"], name: "寅巳申相刑", description: "無恩之刑，恩將仇報" },
  { type: "持勢之刑", branches: ["丑", "未", "戌"], name: "丑未戌相刑", description: "持勢之刑，倚勢凌人" },
  // 自刑
  { type: "自刑", branches: ["辰"], name: "辰辰自刑", description: "自刑，自己跟自己過不去" },
  { type: "自刑", branches: ["午"], name: "午午自刑", description: "自刑，自己跟自己過不去" },
  { type: "自刑", branches: ["酉"], name: "酉酉自刑", description: "自刑，自己跟自己過不去" },
  { type: "自刑", branches: ["亥"], name: "亥亥自刑", description: "自刑，自己跟自己過不去" },
  // 相刑（兩支）
  { type: "無禮之刑", branches: ["子", "卯"], name: "子卯相刑", description: "無禮之刑，無禮不敬" },
];

/**
 * 檢測所有地支互動
 */
export function detectInteractions(pillars: FourPillars): InteractionResult[] {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch
  ];
  
  const results: InteractionResult[] = [];
  
  // 1. 檢測六衝 (Clashes)
  detectClashes(branches, results);
  
  // 2. 檢測六合 (Six Combinations)
  detectSixCombinations(branches, results);
  
  // 3. 檢測三合 (Three Combinations)
  detectThreeCombinations(branches, results);
  
  // 4. 檢測六害 (Six Harms)
  detectHarms(branches, results);
  
  // 5. 檢測相刑 (Punishments)
  detectPunishments(branches, results);
  
  return results;
}

/**
 * 檢測六衝
 */
function detectClashes(branches: string[], results: InteractionResult[]): void {
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      
      if (CLASH_PAIRS[b1] === b2) {
        const key = `${b1}${b2}`;
        results.push({
          type: "CLASH",
          name: `${b1}${b2}相衝`,
          branches: [b1, b2],
          description: CLASH_DESCRIPTIONS[key] || "地支六衝，能量激盪不穩"
        });
      }
    }
  }
}

/**
 * 檢測六合
 */
function detectSixCombinations(branches: string[], results: InteractionResult[]): void {
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      
      const combo = COMBINATION_6_PAIRS[b1];
      if (combo && combo.partner === b2) {
        results.push({
          type: "COMBINATION_6",
          name: `${b1}${b2}六合${combo.element}`,
          branches: [b1, b2],
          description: `六合化${combo.element}，和諧融合`
        });
      }
    }
  }
}

/**
 * 檢測三合
 */
function detectThreeCombinations(branches: string[], results: InteractionResult[]): void {
  for (const group of COMBINATION_3_GROUPS) {
    const hasAll = group.branches.every(b => branches.includes(b));
    if (hasAll) {
      results.push({
        type: "COMBINATION_3",
        name: group.name,
        branches: [...group.branches],
        description: `三合${group.element}局，力量匯聚`
      });
    }
  }
}

/**
 * 檢測六害
 */
function detectHarms(branches: string[], results: InteractionResult[]): void {
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      
      if (HARM_PAIRS[b1] === b2) {
        const key = `${b1}${b2}`;
        results.push({
          type: "HARM",
          name: `${b1}${b2}相害`,
          branches: [b1, b2],
          description: HARM_DESCRIPTIONS[key] || "六害關係，暗中損害"
        });
      }
    }
  }
}

/**
 * 檢測相刑
 */
function detectPunishments(branches: string[], results: InteractionResult[]): void {
  // 檢測三刑和雙刑
  for (const group of PUNISHMENT_GROUPS) {
    if (group.branches.length === 1) {
      // 自刑：檢查是否有重複的支
      const count = branches.filter(b => b === group.branches[0]).length;
      if (count >= 2) {
        results.push({
          type: "PUNISHMENT",
          name: group.name,
          branches: [group.branches[0], group.branches[0]],
          description: group.description
        });
      }
    } else if (group.branches.length === 2) {
      // 兩支相刑
      const hasAll = group.branches.every(b => branches.includes(b));
      if (hasAll) {
        results.push({
          type: "PUNISHMENT",
          name: group.name,
          branches: [...group.branches],
          description: group.description
        });
      }
    } else if (group.branches.length === 3) {
      // 三刑：至少要有兩個才算
      const matchCount = group.branches.filter(b => branches.includes(b)).length;
      if (matchCount >= 2) {
        const matchedBranches = group.branches.filter(b => branches.includes(b));
        results.push({
          type: "PUNISHMENT",
          name: matchCount === 3 ? group.name : `${matchedBranches.join('')}相刑`,
          branches: matchedBranches,
          description: group.description
        });
      }
    }
  }
}

/**
 * 根據互動類型獲取顏色
 */
export function getInteractionColor(type: InteractionType): string {
  switch (type) {
    case "COMBINATION_3":
      return "text-amber-500";
    case "COMBINATION_6":
      return "text-green-500";
    case "CLASH":
      return "text-red-500";
    case "HARM":
      return "text-orange-500";
    case "PUNISHMENT":
      return "text-purple-500";
    default:
      return "text-muted-foreground";
  }
}

/**
 * 根據互動類型獲取圖標
 */
export function getInteractionIcon(type: InteractionType): string {
  switch (type) {
    case "COMBINATION_3":
      return "🔺"; // 三合
    case "COMBINATION_6":
      return "💑"; // 六合
    case "CLASH":
      return "⚡"; // 衝
    case "HARM":
      return "💔"; // 害
    case "PUNISHMENT":
      return "⛓️"; // 刑
    default:
      return "❓";
  }
}
