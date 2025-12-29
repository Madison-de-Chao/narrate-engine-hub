import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Users, 
  Sparkles, 
  BookOpen, 
  Star, 
  Swords,
  Shield,
  TrendingUp,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';

interface MapZone {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  position: { x: number; y: number };
  size: 'lg' | 'md' | 'sm';
}

const ZONES: MapZone[] = [
  {
    id: 'legion',
    name: '四時軍團',
    subtitle: '八字人生兵法系統',
    description: '年月日時四大軍團，十天干統帥、十二地支謀士，你的靈魂戰士們集結於此',
    icon: <Swords className="w-8 h-8" />,
    color: 'from-red-600 to-amber-500',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    position: { x: 15, y: 50 },
    size: 'lg'
  },
  {
    id: 'academy',
    name: '八字學堂',
    subtitle: '命理知識殿堂',
    description: '從基礎到進階，系統化學習八字命理，解鎖古老智慧的現代應用',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'from-purple-600 to-indigo-500',
    glowColor: 'rgba(147, 51, 234, 0.5)',
    position: { x: 38, y: 50 },
    size: 'lg'
  },
  {
    id: 'gallery',
    name: '角色圖鑑',
    subtitle: 'Character Gallery',
    description: '探索十天干將領與十二地支軍師的完整圖鑑，了解每位角色的特質與關係',
    icon: <Users className="w-8 h-8" />,
    color: 'from-cyan-500 to-teal-400',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    position: { x: 62, y: 50 },
    size: 'lg'
  },
  {
    id: 'subscribe',
    name: '會員訂閱',
    subtitle: 'Premium 專屬',
    description: '解鎖完整軍團故事、進階分析報告與專屬功能，享受尊榮會員體驗',
    icon: <Star className="w-8 h-8" />,
    color: 'from-amber-500 to-yellow-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    position: { x: 85, y: 50 },
    size: 'lg'
  }
];

const NavigationMap: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneNavigate = (zoneId: string) => {
    if (zoneId === 'academy') {
      navigate('/academy');
    } else if (zoneId === 'legion') {
      navigate('/');
    } else if (zoneId === 'gallery') {
      navigate('/gallery');
    } else if (zoneId === 'subscribe') {
      navigate('/subscribe');
    } else {
      navigate(`/guide/${zoneId}`);
    }
  };

  const getSizeClasses = (size: 'lg' | 'md' | 'sm') => {
    switch (size) {
      case 'lg':
        return 'w-28 h-28 md:w-36 md:h-36';
      case 'md':
        return 'w-20 h-20 md:w-24 md:h-24';
      case 'sm':
        return 'w-16 h-16 md:w-20 md:h-20';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 頂部導航欄 */}
      <PageHeader title="八字命理導覽地圖" />

      {/* 頂部裝飾 */}
      <div className={`relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-void via-card to-background' 
          : 'bg-gradient-to-b from-paper via-white to-background'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-amber-500 to-yellow-400" />
        </div>

        {/* 頁面標題 */}
        <motion.div 
          className="relative z-10 text-center px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={`text-sm ${
            theme === 'dark' ? 'text-paper/60' : 'text-void/60'
          }`}>
            點擊區域探索不同的命理知識殿堂
          </p>
        </motion.div>
      </div>

      {/* 地圖區域 */}
      <div className="max-w-4xl mx-auto px-4">
        <div className={`relative w-full rounded-2xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-void via-card to-void border border-gold/20' 
            : 'bg-gradient-to-br from-paper via-white to-paper border border-ink/10'
        }`}>
          {/* 背景裝飾 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute inset-0 opacity-20 ${
              theme === 'dark' ? 'bg-[radial-gradient(circle_at_50%_50%,hsl(45_100%_50%/0.1)_0%,transparent_50%)]' : ''
            }`} />
            
            {/* 連接線 - 連接三個主要區域 */}
            <svg className="absolute inset-0 w-full h-full" style={{ minHeight: '500px' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.2" />
                  <stop offset="50%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* 連接第一和第二區域的線 */}
              <motion.line
                x1="15%"
                y1="50%"
                x2="38%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: hoveredZone ? 0.8 : 0.4
                }}
                transition={{ duration: 0.8 }}
              />
              {/* 連接第二和第三區域的線 */}
              <motion.line
                x1="38%"
                y1="50%"
                x2="62%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: hoveredZone ? 0.8 : 0.4
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              {/* 連接第三和第四區域的線 */}
              <motion.line
                x1="62%"
                y1="50%"
                x2="85%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: hoveredZone ? 0.8 : 0.4
                }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </svg>
          </div>

          {/* 導覽地圖區域 */}
          <div className="relative z-10 w-full pt-8" style={{ minHeight: '500px', paddingBottom: '20px' }}>
            {ZONES.map((zone, index) => {
              // 根據位置計算飛入方向
              const getEntryDirection = () => {
                const centerX = 50;
                const centerY = 50;
                const dx = zone.position.x - centerX;
                const dy = zone.position.y - centerY;
                // 從外側飛入，放大偏移量
                return {
                  x: dx * 3,
                  y: dy * 3,
                  rotate: dx > 0 ? 45 : -45
                };
              };
              const entryDir = getEntryDirection();
              
              return (
                <motion.div
                  key={zone.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${zone.position.x}%`,
                    top: `${zone.position.y}%`
                  }}
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    x: entryDir.x,
                    y: entryDir.y,
                    rotate: entryDir.rotate
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0
                  }}
                  transition={{ 
                    delay: 0.15 * index,
                    type: 'spring',
                    stiffness: 150,
                    damping: 15,
                    mass: 0.8
                  }}
                  whileHover={{ 
                    scale: 1.15, 
                    zIndex: 20,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => setHoveredZone(zone.id)}
                  onHoverEnd={() => setHoveredZone(null)}
                  onClick={() => {
                    setActiveZone(zone.id);
                  }}
                >
                  {/* 光暈效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${zone.glowColor} 0%, transparent 70%)`,
                      transform: 'scale(1.5)'
                    }}
                    animate={{
                      opacity: hoveredZone === zone.id ? 0.8 : 0,
                      scale: hoveredZone === zone.id ? 2 : 1.5
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* 脈動環 */}
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 ${
                      theme === 'dark' ? 'border-white/30' : 'border-black/20'
                    }`}
                    animate={{
                      scale: hoveredZone === zone.id ? [1, 1.3, 1] : 1,
                      opacity: hoveredZone === zone.id ? [0.5, 0, 0.5] : 0
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: hoveredZone === zone.id ? Infinity : 0 
                    }}
                  />
                  
                  {/* 第二層脈動環（點擊反饋） */}
                  <motion.div
                    className={`absolute inset-0 rounded-full border ${
                      theme === 'dark' ? 'border-gold/50' : 'border-amber-400/50'
                    }`}
                    initial={{ scale: 1, opacity: 0 }}
                    whileTap={{
                      scale: [1, 1.5],
                      opacity: [0.8, 0],
                      transition: { duration: 0.4 }
                    }}
                  />
                  
                  <motion.div 
                    className={`
                      ${getSizeClasses(zone.size)}
                      rounded-full 
                      bg-gradient-to-br ${zone.color}
                      flex flex-col items-center justify-center
                      shadow-lg
                      transition-all duration-300
                      relative
                      ${hoveredZone === zone.id ? 'shadow-2xl ring-4 ring-white/40' : ''}
                      ${theme === 'dark' ? 'shadow-black/50' : 'shadow-black/20'}
                    `}
                    whileHover={{
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}
                  >
                    <motion.div 
                      className="text-white mb-1"
                      animate={{ 
                        rotate: hoveredZone === zone.id ? [0, -10, 10, 0] : 0,
                        scale: hoveredZone === zone.id ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {zone.icon}
                    </motion.div>
                    <motion.span 
                      className="text-white text-xs md:text-sm font-bold text-center px-1 leading-tight"
                      animate={{
                        y: hoveredZone === zone.id ? -2 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {zone.name}
                    </motion.span>
                    {zone.size !== 'sm' && (
                      <motion.span 
                        className="text-white/70 text-[10px] md:text-xs text-center px-1"
                        animate={{
                          opacity: hoveredZone === zone.id ? 1 : 0.7
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {zone.subtitle}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* 區域詳情彈出框 */}
          <AnimatePresence>
            {activeZone && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`
                  absolute bottom-4 left-4 right-4 z-30
                  p-4 rounded-xl
                  ${theme === 'dark' 
                    ? 'bg-card/95 backdrop-blur-sm border border-gold/30' 
                    : 'bg-white/95 backdrop-blur-sm border border-ink/10'
                  }
                `}
              >
                {(() => {
                  const zone = ZONES.find(z => z.id === activeZone);
                  if (!zone) return null;
                  return (
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className={`
                          w-12 h-12 rounded-full bg-gradient-to-br ${zone.color}
                          flex items-center justify-center text-white shrink-0
                        `}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 0.5 }}
                      >
                        {zone.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg ${
                          theme === 'dark' ? 'text-paper' : 'text-void'
                        }`}>
                          {zone.name}
                          <span className={`ml-2 text-sm font-normal ${
                            theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                          }`}>
                            {zone.subtitle}
                          </span>
                        </h3>
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-paper/70' : 'text-void/70'
                        }`}>
                          {zone.description}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleZoneNavigate(zone.id)}
                          className={`mt-3 gap-2 ${
                            theme === 'dark' 
                              ? 'bg-gold/20 text-gold hover:bg-gold/30 border border-gold/30' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          深入探索
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveZone(null)}
                        className={theme === 'dark' ? 'text-paper/60 hover:text-paper' : 'text-void/60 hover:text-void'}
                      >
                        ✕
                      </Button>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部按鈕區 */}
        <div className="mt-6 space-y-3">
          {/* 四時軍團入口 */}
          <motion.button
            onClick={() => navigate('/')}
            className={`
              w-full py-4 px-6 rounded-xl
              flex items-center justify-center gap-3
              font-bold text-lg tracking-wider
              transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-red-600/30 via-amber-500/30 to-red-600/30 text-amber-300 border border-red-500/40 hover:border-red-400/60 hover:bg-red-500/30'
                : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white hover:from-red-500 hover:via-amber-400 hover:to-red-500'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Swords className="w-5 h-5" />
            <span>四時軍團 · 八字人生兵法</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* 八字學堂入口 */}
          <motion.button
            onClick={() => navigate('/academy')}
            className={`
              w-full py-4 px-6 rounded-xl
              flex items-center justify-center gap-3
              font-bold text-lg tracking-wider
              transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600/30 via-indigo-500/30 to-purple-600/30 text-purple-300 border border-purple-500/40 hover:border-purple-400/60 hover:bg-purple-500/30'
                : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 text-white hover:from-purple-400 hover:via-indigo-400 hover:to-purple-400'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <GraduationCap className="w-5 h-5" />
            <span>八字學堂</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* 角色圖鑑入口 */}
          <motion.button
            onClick={() => navigate('/gallery')}
            className={`
              w-full py-4 px-6 rounded-xl
              flex items-center justify-center gap-3
              font-bold text-lg tracking-wider
              transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-500/30 via-teal-400/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400/60 hover:bg-cyan-500/30'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-white hover:from-cyan-400 hover:via-teal-300 hover:to-cyan-400'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5" />
            <span>角色圖鑑</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* 會員訂閱入口 */}
          <motion.button
            onClick={() => navigate('/subscribe')}
            className={`
              w-full py-4 px-6 rounded-xl
              flex items-center justify-center gap-3
              font-bold text-lg tracking-wider
              transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400/60 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Star className="w-5 h-5" />
            <span>會員訂閱 · Premium</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NavigationMap;
