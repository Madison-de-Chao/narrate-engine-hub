import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '@/hooks/useAcademyAchievements';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Trophy } from 'lucide-react';

interface AchievementUnlockToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({
  achievement,
  onClose
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const colors = RARITY_COLORS[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div className={`relative rounded-2xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-card border border-border' 
            : 'bg-white shadow-2xl'
        }`}>
          {/* 頂部漸變裝飾 */}
          <div className={`h-2 bg-gradient-to-r ${colors.bg}`} />
          
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* 徽章 */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow} text-3xl`}
              >
                {achievement.icon}
              </motion.div>

              {/* 內容 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-xs font-medium ${colors.text}`}>
                    成就解鎖！
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${colors.bg} text-white`}>
                    {RARITY_LABELS[achievement.rarity]}
                  </span>
                </div>
                
                <h3 className={`font-bold text-lg ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {achievement.name}
                </h3>
                
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-foreground/70' : 'text-gray-600'
                }`}>
                  {achievement.description}
                </p>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-sm mt-2 font-medium ${colors.text}`}
                >
                  獲得稱號：「{achievement.title}」
                </motion.p>
              </div>

              {/* 關閉按鈕 */}
              <button
                onClick={onClose}
                className={`p-1 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-muted text-muted-foreground' 
                    : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 閃光動畫 */}
          {achievement.rarity === 'legendary' && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
