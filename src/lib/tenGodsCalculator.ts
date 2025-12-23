import ganZhiData from '@/data/gan_zhi.json';
import tenGodsData from '@/data/ten_gods.json';
import hiddenStemsData from '@/data/hidden_stems.json';

// 五行生克關係
const ELEMENT_RELATIONS = {
  生: {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木'
  },
  克: {
    '木': '土',
    '土': '水',
    '水': '火',
    '火': '金',
    '金': '木'
  }
};

// 地支藏干數據類型
interface HiddenStemEntry {
  stem: string;
  weight: number;
  ratio: number;
  type: '本氣' | '中氣' | '餘氣';
}

interface HiddenStemsDataset {
  hiddenStems: Record<string, { stems: HiddenStemEntry[] }>;
}

const hiddenStems = hiddenStemsData as HiddenStemsDataset;

/**
 * 獲取地支的本氣（主氣）藏干
 * @param branch 地支
 * @returns 本氣藏干天干
 */
function getMainHiddenStem(branch: string): string | null {
  const data = hiddenStems.hiddenStems[branch];
  if (!data || !data.stems || data.stems.length === 0) {
    return null;
  }
  // 本氣是第一個藏干（type 為 '本氣'）
  const mainStem = data.stems.find(s => s.type === '本氣') || data.stems[0];
  return mainStem.stem;
}

/**
 * 計算十神（天干對天干）
 * @param dayStem 日元（日干）
 * @param targetStem 目標天干
 * @returns 十神名稱
 */
export function calculateTenGod(dayStem: string, targetStem: string): string {
  // 如果是日元本身，返回「日元」
  if (dayStem === targetStem) {
    return '日元';
  }

  const dayProps = ganZhiData.stemProperties[dayStem as keyof typeof ganZhiData.stemProperties];
  const targetProps = ganZhiData.stemProperties[targetStem as keyof typeof ganZhiData.stemProperties];

  if (!dayProps || !targetProps) {
    console.error('Invalid stem:', dayStem, targetStem);
    return '未知';
  }

  const dayElement = dayProps.element;
  const targetElement = targetProps.element;
  const dayYinyang = dayProps.yinyang;
  const targetYinyang = targetProps.yinyang;

  const sameYinyang = dayYinyang === targetYinyang;
  const sameElement = dayElement === targetElement;

  // 同五行 - 比劫
  if (sameElement) {
    return sameYinyang ? '比肩' : '劫財';
  }

  // 我生 - 食傷
  if (ELEMENT_RELATIONS.生[dayElement as keyof typeof ELEMENT_RELATIONS.生] === targetElement) {
    return sameYinyang ? '食神' : '傷官';
  }

  // 我克 - 財
  if (ELEMENT_RELATIONS.克[dayElement as keyof typeof ELEMENT_RELATIONS.克] === targetElement) {
    return sameYinyang ? '偏財' : '正財';
  }

  // 克我 - 官殺
  if (ELEMENT_RELATIONS.克[targetElement as keyof typeof ELEMENT_RELATIONS.克] === dayElement) {
    return sameYinyang ? '七殺' : '正官';
  }

  // 生我 - 印
  if (ELEMENT_RELATIONS.生[targetElement as keyof typeof ELEMENT_RELATIONS.生] === dayElement) {
    return sameYinyang ? '偏印' : '正印';
  }

  return '未知';
}

/**
 * 計算地支的十神（正統做法：使用藏干本氣）
 * 
 * 修正說明：
 * - 舊版本使用地支本身的五行屬性（如子水、午火）
 * - 正統八字學應使用地支藏干的「本氣」來判定十神
 * - 例如：寅的本氣是甲木，所以寅的十神由甲與日干的關係決定
 * 
 * @param dayStem 日元（日干）
 * @param branch 目標地支
 * @returns 十神名稱（本氣的十神）
 */
export function calculateBranchTenGod(dayStem: string, branch: string): string {
  // 獲取地支的本氣藏干
  const mainHiddenStem = getMainHiddenStem(branch);
  
  if (!mainHiddenStem) {
    console.error('Cannot find main hidden stem for branch:', branch);
    return '未知';
  }

  // 使用本氣藏干計算十神
  return calculateTenGod(dayStem, mainHiddenStem);
}

/**
 * 計算地支所有藏干的十神
 * @param dayStem 日元（日干）
 * @param branch 目標地支
 * @returns 所有藏干的十神列表
 */
export function calculateBranchAllTenGods(dayStem: string, branch: string): Array<{
  stem: string;
  tenGod: string;
  type: string;
  weight: number;
}> {
  const data = hiddenStems.hiddenStems[branch];
  if (!data || !data.stems) {
    return [];
  }

  return data.stems.map(entry => ({
    stem: entry.stem,
    tenGod: calculateTenGod(dayStem, entry.stem),
    type: entry.type,
    weight: entry.weight
  }));
}

/**
 * 計算四柱的十神
 */
export function calculateFourPillarsTenGods(
  dayStem: string,
  yearStem: string,
  monthStem: string,
  hourStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
) {
  return {
    year: {
      stem: calculateTenGod(dayStem, yearStem),
      branch: calculateBranchTenGod(dayStem, yearBranch)
    },
    month: {
      stem: calculateTenGod(dayStem, monthStem),
      branch: calculateBranchTenGod(dayStem, monthBranch)
    },
    day: {
      stem: '日元',
      branch: calculateBranchTenGod(dayStem, dayBranch)
    },
    hour: {
      stem: calculateTenGod(dayStem, hourStem),
      branch: calculateBranchTenGod(dayStem, hourBranch)
    }
  };
}

/**
 * 獲取十神的詳細資訊
 */
export function getTenGodInfo(tenGod: string) {
  const info = tenGodsData.tenGodsRules[tenGod as keyof typeof tenGodsData.tenGodsRules];
  return info || null;
}
