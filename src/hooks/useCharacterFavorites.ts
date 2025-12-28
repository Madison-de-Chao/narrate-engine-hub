import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  character_id: string;
  character_type: 'gan' | 'zhi';
  created_at: string;
}

export const useCharacterFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // 獲取當前用戶
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 獲取收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('character_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites((data || []).map(item => ({
        ...item,
        character_type: item.character_type as 'gan' | 'zhi'
      })));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 檢查是否已收藏
  const isFavorite = useCallback((characterId: string, characterType: 'gan' | 'zhi') => {
    return favorites.some(
      f => f.character_id === characterId && f.character_type === characterType
    );
  }, [favorites]);

  // 切換收藏狀態
  const toggleFavorite = useCallback(async (
    characterId: string, 
    characterType: 'gan' | 'zhi',
    characterName?: string
  ) => {
    if (!userId) {
      toast({
        title: "請先登入",
        description: "收藏功能需要登入後才能使用",
        variant: "destructive",
      });
      return false;
    }

    const isCurrentlyFavorite = isFavorite(characterId, characterType);

    try {
      if (isCurrentlyFavorite) {
        // 移除收藏
        const { error } = await supabase
          .from('character_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('character_id', characterId)
          .eq('character_type', characterType);

        if (error) throw error;

        setFavorites(prev => prev.filter(
          f => !(f.character_id === characterId && f.character_type === characterType)
        ));

        toast({
          title: "已取消收藏",
          description: characterName ? `已將 ${characterName} 從收藏中移除` : "已從收藏中移除",
        });
      } else {
        // 添加收藏
        const { data, error } = await supabase
          .from('character_favorites')
          .insert({
            user_id: userId,
            character_id: characterId,
            character_type: characterType,
          })
          .select()
          .single();

        if (error) throw error;

        const newFavorite: Favorite = {
          ...data,
          character_type: data.character_type as 'gan' | 'zhi'
        };
        setFavorites(prev => [newFavorite, ...prev]);

        toast({
          title: "收藏成功",
          description: characterName ? `已將 ${characterName} 加入收藏` : "已加入收藏",
        });
      }
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "操作失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
      return false;
    }
  }, [userId, isFavorite, toast]);

  // 獲取收藏的角色ID列表
  const getFavoriteIds = useCallback((characterType?: 'gan' | 'zhi') => {
    if (characterType) {
      return favorites
        .filter(f => f.character_type === characterType)
        .map(f => f.character_id);
    }
    return favorites.map(f => f.character_id);
  }, [favorites]);

  return {
    favorites,
    loading,
    isLoggedIn: !!userId,
    isFavorite,
    toggleFavorite,
    getFavoriteIds,
    refreshFavorites: fetchFavorites,
  };
};
