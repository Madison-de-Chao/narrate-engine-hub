import ganZhiData from '@/data/gan_zhi.json';
import tenGodsData from '@/data/ten_gods.json';

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

/**
 * 計算十神
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
 * 計算地支的十神（根據藏干）
 * @param dayStem 日元（日干）
 * @param branch 目標地支
 * @returns 十神名稱（主氣的十神）
 */
export function calculateBranchTenGod(dayStem: string, branch: string): string {
  const branchProps = ganZhiData.branchProperties[branch as keyof typeof ganZhiData.branchProperties];
  
  if (!branchProps) {
    console.error('Invalid branch:', branch);
    return '未知';
  }

  // 使用地支本身的五行屬性來計算十神
  const dayProps = ganZhiData.stemProperties[dayStem as keyof typeof ganZhiData.stemProperties];
  
  if (!dayProps) {
    console.error('Invalid day stem:', dayStem);
    return '未知';
  }

  const dayElement = dayProps.element;
  const branchElement = branchProps.element;
  const dayYinyang = dayProps.yinyang;
  const branchYinyang = branchProps.yinyang;

  const sameYinyang = dayYinyang === branchYinyang;
  const sameElement = dayElement === branchElement;

  // 同五行 - 比劫
  if (sameElement) {
    return sameYinyang ? '比肩' : '劫財';
  }

  // 我生 - 食傷
  if (ELEMENT_RELATIONS.生[dayElement as keyof typeof ELEMENT_RELATIONS.生] === branchElement) {
    return sameYinyang ? '食神' : '傷官';
  }

  // 我克 - 財
  if (ELEMENT_RELATIONS.克[dayElement as keyof typeof ELEMENT_RELATIONS.克] === branchElement) {
    return sameYinyang ? '偏財' : '正財';
  }

  // 克我 - 官殺
  if (ELEMENT_RELATIONS.克[branchElement as keyof typeof ELEMENT_RELATIONS.克] === dayElement) {
    return sameYinyang ? '七殺' : '正官';
  }

  // 生我 - 印
  if (ELEMENT_RELATIONS.生[branchElement as keyof typeof ELEMENT_RELATIONS.生] === dayElement) {
    return sameYinyang ? '偏印' : '正印';
  }

  return '未知';
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
