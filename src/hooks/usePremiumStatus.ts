import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumStatus {
  isPremium: boolean;
  tier: 'free' | 'monthly' | 'yearly' | 'lifetime';
  loading: boolean;
  expiresAt: Date | null;
}

export const usePremiumStatus = (userId?: string): PremiumStatus => {
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState<'free' | 'monthly' | 'yearly' | 'lifetime'>('free');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!userId) {
        setIsPremium(false);
        setTier('free');
        setExpiresAt(null);
        setLoading(false);
        return;
      }

      try {
        // 從資料庫查詢訂閱狀態
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = 找不到記錄，這是正常的
          console.error('檢查付費狀態失敗:', error);
        }

        if (data) {
          const isActive = data.status === 'active';
          const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
          
          setIsPremium(isActive && notExpired);
          setTier(data.plan as 'free' | 'monthly' | 'yearly' | 'lifetime');
          setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
        } else {
          setIsPremium(false);
          setTier('free');
          setExpiresAt(null);
        }
      } catch (error) {
        console.error('檢查付費狀態失敗:', error);
        setIsPremium(false);
        setTier('free');
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [userId]);

  return {
    isPremium,
    tier,
    loading,
    expiresAt
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

// 免費版可見的章節（基本資料、傳統排盤、四時軍團）
export const FREE_SECTIONS = ['summary', 'bazi', 'legion'] as const;

// 付費版才可見的章節（十神、神煞、性格、納音、五行分析）
export const PREMIUM_SECTIONS = ['tenGods', 'shensha', 'personality', 'nayin', 'analysis'] as const;

// 計算日誌不列入報告，但在結果頁面顯示
export const UTILITY_SECTIONS = ['logs'] as const;

export type SectionId = typeof FREE_SECTIONS[number] | typeof PREMIUM_SECTIONS[number] | typeof UTILITY_SECTIONS[number];

export const isSectionFree = (sectionId: string): boolean => {
  return (FREE_SECTIONS as readonly string[]).includes(sectionId);
};

export const isSectionUtility = (sectionId: string): boolean => {
  return (UTILITY_SECTIONS as readonly string[]).includes(sectionId);
};

// 訂閱方案名稱對照
export const PLAN_NAMES: Record<string, string> = {
  free: '免費版',
  monthly: '月訂閱',
  yearly: '年訂閱',
  lifetime: '終身版'
};
