/**
 * 軍團故事重生機制 Hook
 * 管理故事生成狀態、鎖定檢查與重生資格
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('story_regeneration_credits')
        .select('credits_remaining, total_credits_purchased')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

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
    try {
      const { data, error } = await supabase
        .from('legion_stories')
        .select('id, legion_type, story, is_locked, version, created_at')
        .eq('calculation_id', calculationId)
        .order('legion_type');

      if (error) throw error;
      return (data as StoredStory[]) || [];
    } catch (error) {
      console.error('Failed to check stories:', error);
      return [];
    }
  }, []);

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
      // 檢查是否已有故事
      const existingStories = await checkStoriesLocked(calculationId);
      
      if (existingStories.length > 0 && existingStories.some(s => s.is_locked)) {
        toast({
          title: '故事已鎖定',
          description: '此測算的軍團故事已生成並鎖定，無法覆蓋',
          variant: 'destructive',
        });
        return false;
      }

      // 插入新故事
      const storyRecords = Object.entries(stories).map(([legionType, story]) => ({
        calculation_id: calculationId,
        user_id: userId,
        legion_type: legionType,
        story,
        is_locked: true,
        version: 1,
      }));

      const { error } = await supabase
        .from('legion_stories')
        .insert(storyRecords);

      if (error) throw error;

      toast({
        title: '故事已保存',
        description: '軍團故事已生成並鎖定至您的帳號',
      });

      return true;
    } catch (error) {
      console.error('Failed to save stories:', error);
      toast({
        title: '保存失敗',
        description: '無法保存軍團故事，請稍後再試',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, checkStoriesLocked, toast]);

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
      // 刪除舊故事（不保留舊版本）
      const { error: deleteError } = await supabase
        .from('legion_stories')
        .delete()
        .eq('calculation_id', calculationId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // 扣除重生資格
      const { error: creditError } = await supabase
        .from('story_regeneration_credits')
        .update({ 
          credits_remaining: state.creditsRemaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (creditError) throw creditError;

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
