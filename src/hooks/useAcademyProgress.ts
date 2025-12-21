import { useState, useEffect, useCallback } from 'react';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizScore?: number;
  completedAt?: string;
}

export interface ZoneProgress {
  zoneId: string;
  lessons: LessonProgress[];
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export interface AcademyProgress {
  zones: Record<string, ZoneProgress>;
  totalZones: number;
  completedZones: number;
  overallPercentage: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'bazi_academy_progress';

// 每個區域的課程定義
const ZONE_LESSONS: Record<string, string[]> = {
  bazi: ['四柱基礎', '天干詳解', '地支詳解', '八字排盤'],
  legion: ['年柱軍團', '月柱軍團', '日柱軍團', '時柱軍團'],
  tenGods: ['比劫印星', '食傷財星', '官殺體系', '十神綜合'],
  shensha: ['吉神總覽', '凶煞總覽', '神煞搭配', '神煞應用'],
  wuxing: ['五行基礎', '相生關係', '相剋關係', '五行平衡'],
  nayin: ['納音概念', '六十甲子', '納音五行', '納音應用'],
  personality: ['性格解讀', '優勢潛能', '成長課題', '綜合分析'],
  fortune: ['大運概念', '流年判讀', '運勢週期', '趨吉避凶'],
};

export const useAcademyProgress = () => {
  const [progress, setProgress] = useState<AcademyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化進度
  const initializeProgress = useCallback((): AcademyProgress => {
    const zones: Record<string, ZoneProgress> = {};
    
    Object.entries(ZONE_LESSONS).forEach(([zoneId, lessons]) => {
      zones[zoneId] = {
        zoneId,
        lessons: lessons.map(lessonId => ({
          lessonId,
          completed: false,
        })),
        totalLessons: lessons.length,
        completedLessons: 0,
        percentage: 0,
      };
    });

    return {
      zones,
      totalZones: Object.keys(ZONE_LESSONS).length,
      completedZones: 0,
      overallPercentage: 0,
      lastUpdated: new Date().toISOString(),
    };
  }, []);

  // 載入進度
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AcademyProgress;
        // 確保新增的區域也被初始化
        Object.keys(ZONE_LESSONS).forEach(zoneId => {
          if (!parsed.zones[zoneId]) {
            parsed.zones[zoneId] = {
              zoneId,
              lessons: ZONE_LESSONS[zoneId].map(lessonId => ({
                lessonId,
                completed: false,
              })),
              totalLessons: ZONE_LESSONS[zoneId].length,
              completedLessons: 0,
              percentage: 0,
            };
          }
        });
        setProgress(parsed);
      } else {
        setProgress(initializeProgress());
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      setProgress(initializeProgress());
    } finally {
      setLoading(false);
    }
  }, [initializeProgress]);

  // 儲存進度
  const saveProgress = useCallback((newProgress: AcademyProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  // 計算百分比
  const recalculateProgress = useCallback((zones: Record<string, ZoneProgress>): AcademyProgress => {
    let totalCompleted = 0;
    let totalLessons = 0;
    let completedZones = 0;

    Object.values(zones).forEach(zone => {
      const completedInZone = zone.lessons.filter(l => l.completed).length;
      zone.completedLessons = completedInZone;
      zone.percentage = Math.round((completedInZone / zone.totalLessons) * 100);
      totalCompleted += completedInZone;
      totalLessons += zone.totalLessons;
      if (zone.percentage === 100) completedZones++;
    });

    return {
      zones,
      totalZones: Object.keys(zones).length,
      completedZones,
      overallPercentage: Math.round((totalCompleted / totalLessons) * 100),
      lastUpdated: new Date().toISOString(),
    };
  }, []);

  // 完成課程
  const completeLesson = useCallback((zoneId: string, lessonId: string, quizScore?: number) => {
    if (!progress) return;

    const newZones = { ...progress.zones };
    const zone = newZones[zoneId];
    
    if (zone) {
      const lessonIndex = zone.lessons.findIndex(l => l.lessonId === lessonId);
      if (lessonIndex !== -1) {
        zone.lessons[lessonIndex] = {
          ...zone.lessons[lessonIndex],
          completed: true,
          quizScore,
          completedAt: new Date().toISOString(),
        };
      }
    }

    const newProgress = recalculateProgress(newZones);
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [progress, recalculateProgress, saveProgress]);

  // 取得區域進度
  const getZoneProgress = useCallback((zoneId: string): ZoneProgress | undefined => {
    return progress?.zones[zoneId];
  }, [progress]);

  // 取得課程進度
  const getLessonProgress = useCallback((zoneId: string, lessonId: string): LessonProgress | undefined => {
    return progress?.zones[zoneId]?.lessons.find(l => l.lessonId === lessonId);
  }, [progress]);

  // 檢查課程是否完成
  const isLessonCompleted = useCallback((zoneId: string, lessonId: string): boolean => {
    return getLessonProgress(zoneId, lessonId)?.completed ?? false;
  }, [getLessonProgress]);

  // 重置所有進度
  const resetProgress = useCallback(() => {
    const newProgress = initializeProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [initializeProgress, saveProgress]);

  // 取得區域課程列表
  const getZoneLessons = useCallback((zoneId: string): string[] => {
    return ZONE_LESSONS[zoneId] || [];
  }, []);

  return {
    progress,
    loading,
    completeLesson,
    getZoneProgress,
    getLessonProgress,
    isLessonCompleted,
    resetProgress,
    getZoneLessons,
    ZONE_LESSONS,
  };
};
