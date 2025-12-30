import { useState, useEffect, useCallback, useMemo } from 'react';

// localStorage keys
const VIEWED_STORAGE_KEY = 'bazi-academy-viewed';
const ACHIEVEMENTS_UNLOCKED_KEY = 'bazi-academy-achievements-unlocked';

// 區域概念數量配置
const ZONE_CONCEPT_COUNTS: Record<string, number> = {
  bazi: 4,
  legion: 4,
  tenGods: 5,
  shensha: 4,
  wuxing: 5,
  nayin: 3,
  personality: 2,
  fortune: 2
};

// 成就定義
export interface Achievement {
  id: string;
  name: string;
  title: string; // 稱號
  description: string;
  icon: string;
  requirement: {
    type: 'zone_complete' | 'zones_complete' | 'total_concepts';
    zoneId?: string;
    count?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // 單區域完成成就
  {
    id: 'bazi-master',
    name: '命盤初心者',
    title: '四柱學徒',
    description: '完成命盤核心區域的所有概念學習',
    icon: '🎯',
    requirement: { type: 'zone_complete', zoneId: 'bazi' },
    rarity: 'common'
  },
  {
    id: 'legion-commander',
    name: '軍團統帥',
    title: '戰場指揮官',
    description: '完成四時軍團區域的所有概念學習',
    icon: '⚔️',
    requirement: { type: 'zone_complete', zoneId: 'legion' },
    rarity: 'common'
  },
  {
    id: 'ten-gods-sage',
    name: '十神賢者',
    title: '殿堂聖者',
    description: '完成十神殿堂區域的所有概念學習',
    icon: '👥',
    requirement: { type: 'zone_complete', zoneId: 'tenGods' },
    rarity: 'rare'
  },
  {
    id: 'shensha-explorer',
    name: '神煞探險家',
    title: '星曜獵人',
    description: '完成神煞迷宮區域的所有概念學習',
    icon: '✨',
    requirement: { type: 'zone_complete', zoneId: 'shensha' },
    rarity: 'rare'
  },
  {
    id: 'wuxing-harmony',
    name: '五行調和者',
    title: '元素大師',
    description: '完成五行殿區域的所有概念學習',
    icon: '🌟',
    requirement: { type: 'zone_complete', zoneId: 'wuxing' },
    rarity: 'rare'
  },
  {
    id: 'nayin-scholar',
    name: '納音學者',
    title: '甲子博士',
    description: '完成納音寶庫區域的所有概念學習',
    icon: '📚',
    requirement: { type: 'zone_complete', zoneId: 'nayin' },
    rarity: 'rare'
  },
  {
    id: 'personality-analyst',
    name: '性格分析師',
    title: '心靈導師',
    description: '完成性格分析區域的所有概念學習',
    icon: '🔮',
    requirement: { type: 'zone_complete', zoneId: 'personality' },
    rarity: 'epic'
  },
  {
    id: 'fortune-prophet',
    name: '運勢預言家',
    title: '命運先知',
    description: '完成運勢預測區域的所有概念學習',
    icon: '🌙',
    requirement: { type: 'zone_complete', zoneId: 'fortune' },
    rarity: 'epic'
  },
  // 多區域完成成就
  {
    id: 'foundation-builder',
    name: '基礎奠基者',
    title: '入門修行者',
    description: '完成 2 個區域的學習',
    icon: '🏗️',
    requirement: { type: 'zones_complete', count: 2 },
    rarity: 'common'
  },
  {
    id: 'dedicated-learner',
    name: '勤學不倦',
    title: '命理學徒',
    description: '完成 4 個區域的學習',
    icon: '📖',
    requirement: { type: 'zones_complete', count: 4 },
    rarity: 'rare'
  },
  {
    id: 'knowledge-seeker',
    name: '知識追求者',
    title: '八字行者',
    description: '完成 6 個區域的學習',
    icon: '🎓',
    requirement: { type: 'zones_complete', count: 6 },
    rarity: 'epic'
  },
  {
    id: 'grand-master',
    name: '八字大師',
    title: '命理宗師',
    description: '完成所有 8 個區域的學習',
    icon: '👑',
    requirement: { type: 'zones_complete', count: 8 },
    rarity: 'legendary'
  },
  // 概念數量成就
  {
    id: 'curious-mind',
    name: '好奇求知',
    title: '初探者',
    description: '學習 5 個概念',
    icon: '💡',
    requirement: { type: 'total_concepts', count: 5 },
    rarity: 'common'
  },
  {
    id: 'eager-student',
    name: '勤奮學子',
    title: '求學者',
    description: '學習 15 個概念',
    icon: '📝',
    requirement: { type: 'total_concepts', count: 15 },
    rarity: 'rare'
  },
  {
    id: 'encyclopedia',
    name: '命理百科',
    title: '博學者',
    description: '學習所有 29 個概念',
    icon: '🏆',
    requirement: { type: 'total_concepts', count: 29 },
    rarity: 'legendary'
  }
];

// 稀有度顏色配置
export const RARITY_COLORS = {
  common: {
    bg: 'from-gray-400 to-gray-500',
    border: 'border-gray-400',
    text: 'text-gray-600',
    glow: 'shadow-gray-400/30'
  },
  rare: {
    bg: 'from-blue-400 to-blue-600',
    border: 'border-blue-400',
    text: 'text-blue-500',
    glow: 'shadow-blue-400/30'
  },
  epic: {
    bg: 'from-purple-400 to-purple-600',
    border: 'border-purple-400',
    text: 'text-purple-500',
    glow: 'shadow-purple-400/30'
  },
  legendary: {
    bg: 'from-amber-400 to-amber-600',
    border: 'border-amber-400',
    text: 'text-amber-500',
    glow: 'shadow-amber-400/50'
  }
};

export const RARITY_LABELS = {
  common: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說'
};

// Helper functions
const getViewed = (): string[] => {
  try {
    const stored = localStorage.getItem(VIEWED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getUnlockedAchievements = (): string[] => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_UNLOCKED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUnlockedAchievements = (unlocked: string[]): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_UNLOCKED_KEY, JSON.stringify(unlocked));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
};

export const useAcademyAchievements = () => {
  const [viewed, setViewed] = useState<string[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // 載入資料
  useEffect(() => {
    setViewed(getViewed());
    setUnlockedIds(getUnlockedAchievements());
  }, []);

  // 重新載入已查看概念（供外部調用）
  const refreshViewed = useCallback(() => {
    setViewed(getViewed());
  }, []);

  // 計算區域完成狀態
  const zoneCompletionStatus = useMemo(() => {
    const status: Record<string, { viewed: number; total: number; completed: boolean }> = {};
    
    Object.entries(ZONE_CONCEPT_COUNTS).forEach(([zoneId, total]) => {
      const viewedInZone = viewed.filter(v => v.startsWith(`${zoneId}-`)).length;
      status[zoneId] = {
        viewed: viewedInZone,
        total,
        completed: viewedInZone >= total
      };
    });
    
    return status;
  }, [viewed]);

  // 計算完成的區域數量
  const completedZonesCount = useMemo(() => {
    return Object.values(zoneCompletionStatus).filter(s => s.completed).length;
  }, [zoneCompletionStatus]);

  // 計算總學習概念數
  const totalViewedConcepts = viewed.length;

  // 檢查成就是否達成
  const checkAchievementUnlocked = useCallback((achievement: Achievement): boolean => {
    const { requirement } = achievement;
    
    switch (requirement.type) {
      case 'zone_complete':
        return requirement.zoneId ? zoneCompletionStatus[requirement.zoneId]?.completed || false : false;
      case 'zones_complete':
        return completedZonesCount >= (requirement.count || 0);
      case 'total_concepts':
        return totalViewedConcepts >= (requirement.count || 0);
      default:
        return false;
    }
  }, [zoneCompletionStatus, completedZonesCount, totalViewedConcepts]);

  // 檢查並更新成就
  const checkAndUpdateAchievements = useCallback(() => {
    let newUnlocked: Achievement | null = null;
    const currentUnlocked = [...unlockedIds];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!currentUnlocked.includes(achievement.id) && checkAchievementUnlocked(achievement)) {
        currentUnlocked.push(achievement.id);
        newUnlocked = achievement; // 記錄最新解鎖的成就
      }
    });
    
    if (currentUnlocked.length > unlockedIds.length) {
      setUnlockedIds(currentUnlocked);
      saveUnlockedAchievements(currentUnlocked);
      if (newUnlocked) {
        setNewlyUnlocked(newUnlocked);
      }
    }
  }, [unlockedIds, checkAchievementUnlocked]);

  // 當 viewed 變化時檢查成就
  useEffect(() => {
    if (viewed.length > 0) {
      checkAndUpdateAchievements();
    }
  }, [viewed, checkAndUpdateAchievements]);

  // 清除新解鎖提示
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  // 獲取已解鎖的成就
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  }, [unlockedIds]);

  // 獲取當前使用的稱號（最高稀有度的已解鎖成就）
  const currentTitle = useMemo(() => {
    const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
    for (const rarity of rarityOrder) {
      const achievement = unlockedAchievements.find(a => a.rarity === rarity);
      if (achievement) return achievement.title;
    }
    return '初學者';
  }, [unlockedAchievements]);

  // 獲取下一個可達成的成就
  const nextAchievement = useMemo(() => {
    return ACHIEVEMENTS.find(a => !unlockedIds.includes(a.id) && !checkAchievementUnlocked(a));
  }, [unlockedIds, checkAchievementUnlocked]);

  return {
    viewed,
    refreshViewed,
    zoneCompletionStatus,
    completedZonesCount,
    totalViewedConcepts,
    unlockedAchievements,
    unlockedIds,
    newlyUnlocked,
    clearNewlyUnlocked,
    currentTitle,
    nextAchievement,
    allAchievements: ACHIEVEMENTS
  };
};
