import { useState, useEffect, useCallback } from "react";

const HISTORY_KEY = "character_view_history";
const MAX_HISTORY = 12;

export interface ViewHistoryItem {
  characterId: string;
  characterType: "gan" | "zhi";
  viewedAt: number;
}

export const useCharacterViewHistory = () => {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);

  // 從 localStorage 載入歷史
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ViewHistoryItem[];
        setHistory(parsed);
      }
    } catch (e) {
      console.error("Failed to load view history:", e);
    }
  }, []);

  // 保存到 localStorage
  const saveHistory = useCallback((items: ViewHistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save view history:", e);
    }
  }, []);

  // 添加到歷史
  const addToHistory = useCallback((characterId: string, characterType: "gan" | "zhi") => {
    setHistory(prev => {
      // 移除重複項
      const filtered = prev.filter(
        item => !(item.characterId === characterId && item.characterType === characterType)
      );
      
      // 添加到最前面
      const newHistory: ViewHistoryItem[] = [
        { characterId, characterType, viewedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_HISTORY);
      
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // 清除歷史
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // 從歷史中移除
  const removeFromHistory = useCallback((characterId: string, characterType: "gan" | "zhi") => {
    setHistory(prev => {
      const filtered = prev.filter(
        item => !(item.characterId === characterId && item.characterType === characterType)
      );
      saveHistory(filtered);
      return filtered;
    });
  }, [saveHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};
