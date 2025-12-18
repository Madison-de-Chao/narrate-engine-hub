import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumStatus {
  isPremium: boolean;
  tier: 'free' | 'premium';
  loading: boolean;
}

export const usePremiumStatus = (userId?: string): PremiumStatus => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!userId) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        // 目前先使用 localStorage 儲存（未來可改用資料庫）
        const storedStatus = localStorage.getItem(`premium_${userId}`);
        if (storedStatus === 'true') {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error('檢查付費狀態失敗:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [userId]);

  return {
    isPremium,
    tier: isPremium ? 'premium' : 'free',
    loading
  };
};

// 用於故事截斷的工具函數
export const truncateStoryForFree = (story: string | undefined, maxChars: number = 60): string => {
  if (!story) return "故事生成中...";
  if (story.length <= maxChars) return story;
  // 找到最接近的句號或逗號作為截斷點
  const truncated = story.slice(0, maxChars);
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？')
  );
  const cutPoint = lastPunctuation > 20 ? lastPunctuation + 1 : maxChars;
  return story.slice(0, cutPoint) + "...";
};

// 免費版可見的章節
export const FREE_SECTIONS = ['summary', 'bazi', 'legion'] as const;

// 付費版才可見的章節
export const PREMIUM_SECTIONS = ['tenGods', 'shensha', 'personality', 'nayin', 'analysis', 'logs'] as const;

export type SectionId = typeof FREE_SECTIONS[number] | typeof PREMIUM_SECTIONS[number];

export const isSectionFree = (sectionId: string): boolean => {
  return (FREE_SECTIONS as readonly string[]).includes(sectionId);
};
