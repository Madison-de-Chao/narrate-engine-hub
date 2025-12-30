import React from 'react';
import { motion } from 'framer-motion';
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '@/hooks/useAcademyAchievements';
import { useTheme } from '@/contexts/ThemeContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked,
  size = 'md',
  showDetails = false,
  onClick
}) => {
  const { theme } = useTheme();
  const colors = RARITY_COLORS[achievement.rarity];
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05 } : undefined}
      whileTap={unlocked ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`flex ${showDetails ? 'items-start gap-3' : 'flex-col items-center gap-2'}`}>
        {/* 徽章圖標 */}
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
            unlocked 
              ? `bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}` 
              : theme === 'dark' 
                ? 'bg-muted/50 border border-border' 
                : 'bg-gray-200 border border-gray-300'
          } transition-all duration-300`}>
            <span className={unlocked ? '' : 'grayscale opacity-50'}>
              {achievement.icon}
            </span>
          </div>
          
          {/* 解鎖閃光效果 */}
          {unlocked && achievement.rarity === 'legendary' && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-400" />
          )}
        </div>

        {/* 詳細資訊 */}
        {showDetails && (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-bold ${
                unlocked 
                  ? theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                  : 'text-muted-foreground'
              }`}>
                {achievement.name}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                unlocked
                  ? `bg-gradient-to-r ${colors.bg} text-white`
                  : theme === 'dark' ? 'bg-muted text-muted-foreground' : 'bg-gray-200 text-gray-500'
              }`}>
                {RARITY_LABELS[achievement.rarity]}
              </span>
            </div>
            <p className={`text-sm ${
              unlocked
                ? theme === 'dark' ? 'text-foreground/70' : 'text-gray-600'
                : 'text-muted-foreground/70'
            }`}>
              {achievement.description}
            </p>
            {unlocked && (
              <p className={`text-xs mt-1 ${colors.text}`}>
                稱號：{achievement.title}
              </p>
            )}
          </div>
        )}

        {/* 簡單模式下的名稱 */}
        {!showDetails && (
          <span className={`text-xs text-center ${
            unlocked 
              ? theme === 'dark' ? 'text-foreground' : 'text-gray-700'
              : 'text-muted-foreground'
          }`}>
            {achievement.name}
          </span>
        )}
      </div>
    </motion.div>
  );
};
