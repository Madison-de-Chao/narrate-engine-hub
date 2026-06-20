/**
 * 軍團故事重生機制 Hook
 * 管理故事生成狀態、鎖定檢查與重生資格
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/** 透過 bazi-data 閘道呼叫；strict RLS 後唯一的讀寫路徑 */
async function callGateway<T = unknown>(op: string, email: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('bazi-data', {
    body: { op, email, ...extra },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

interface StoryRegenerationState {
  creditsRemaining: number;
  totalCreditsPurchased: number;
  isLoading: boolean;
}

interface StoredStory {
  id: string;
  legion_type: string;
  story: string;
  is_locked: boolean;
  version: number;
  created_at: string;
}

export function useStoryRegeneration(userId: string | undefined) {
  const { toast } = useToast();
  const [state, setState] = useState<StoryRegenerationState>({
    creditsRemaining: 0,
    totalCreditsPurchased: 0,
    isLoading: true,
  });

  // 載入用戶重生資格
  const loadCredits = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const res = await callGateway<{ data: { credits_remaining: number; total_credits_purchased: number } | null }>(
        'get_credits',
        userId,
      );
      const data = res?.data ?? null;
      setState({
        creditsRemaining: data?.credits_remaining ?? 0,
        totalCreditsPurchased: data?.total_credits_purchased ?? 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load regeneration credits:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  // 檢查計算是否有已鎖定的故事
  const checkStoriesLocked = useCallback(async (calculationId: string): Promise<StoredStory[]> => {
    if (!userId) return [];
    try {
      const res = await callGateway<{ data: StoredStory[] }>('get_stories', userId, {
        calculation_id: calculationId,
      });
      return res?.data ?? [];
    } catch (error) {
      console.error('Failed to check stories:', error);
      return [];
    }
  }, [userId]);

  // 儲存故事（鎖定）
  const saveAndLockStories = useCallback(async (
    calculationId: string,
    stories: Record<string, string>
  ): Promise<boolean> => {
    if (!userId) {
      toast({
        title: '需要登入',
        description: '請先登入以保存軍團故事',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await callGateway('save_stories', userId, {
        calculation_id: calculationId,
        stories,
      });

      toast({
        title: '故事已保存',
        description: '軍團故事已生成並鎖定至您的帳號',
      });

      return true;
    } catch (error) {
      console.error('Failed to save stories:', error);
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('locked')) {
        toast({
          title: '故事已鎖定',
          description: '此測算的軍團故事已生成並鎖定，無法覆蓋',
          variant: 'destructive',
        });
        return false;
      }
      toast({
        title: '保存失敗',
        description: '無法保存軍團故事，請稍後再試',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  // 使用重生資格重新生成故事
  const regenerateStories = useCallback(async (
    calculationId: string
  ): Promise<boolean> => {
    if (!userId) {
      toast({
        title: '需要登入',
        description: '請先登入以重新生成故事',
        variant: 'destructive',
      });
      return false;
    }

    if (state.creditsRemaining <= 0) {
      toast({
        title: '重生資格不足',
        description: '您沒有可用的故事重生資格，請購買後再試',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await callGateway('delete_stories', userId, { calculation_id: calculationId });
      await callGateway('update_credits', userId, {
        credits_remaining: state.creditsRemaining - 1,
      });

      // 更新本地狀態
      setState(prev => ({
        ...prev,
        creditsRemaining: prev.creditsRemaining - 1,
      }));

      toast({
        title: '重生資格已使用',
        description: `剩餘 ${state.creditsRemaining - 1} 次重生機會`,
      });

      return true;
    } catch (error) {
      console.error('Failed to regenerate stories:', error);
      toast({
        title: '重生失敗',
        description: '無法重新生成故事，請稍後再試',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, state.creditsRemaining, toast]);

  // 載入已儲存的故事
  const loadStoredStories = useCallback(async (
    calculationId: string
  ): Promise<Record<string, string> | null> => {
    try {
      const stories = await checkStoriesLocked(calculationId);
      
      if (stories.length === 0) return null;

      const storyMap: Record<string, string> = {};
      stories.forEach(s => {
        storyMap[s.legion_type] = s.story;
      });

      return storyMap;
    } catch (error) {
      console.error('Failed to load stored stories:', error);
      return null;
    }
  }, [checkStoriesLocked]);

  return {
    creditsRemaining: state.creditsRemaining,
    totalCreditsPurchased: state.totalCreditsPurchased,
    isLoading: state.isLoading,
    checkStoriesLocked,
    saveAndLockStories,
    regenerateStories,
    loadStoredStories,
    refreshCredits: loadCredits,
  };
}
