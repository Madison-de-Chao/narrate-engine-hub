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
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

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
    id: 'bazi',
    name: '命盤核心',
    subtitle: '四柱八字',
    description: '年月日時四柱，天干地支交織的命運密碼',
    icon: <Compass className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-400',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    position: { x: 50, y: 35 },
    size: 'lg'
  },
  {
    id: 'tenGods',
    name: '十神殿堂',
    subtitle: '性格與關係',
    description: '比劫、食傷、財星、官殺、印綬，解讀人生角色',
    icon: <Users className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-400',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    position: { x: 20, y: 25 },
    size: 'md'
  },
  {
    id: 'shensha',
    name: '神煞迷宮',
    subtitle: '吉凶星曜',
    description: '天乙貴人、華蓋、桃花等神煞的神秘指引',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-400',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    position: { x: 80, y: 25 },
    size: 'md'
  },
  {
    id: 'wuxing',
    name: '五行殿',
    subtitle: '金木水火土',
    description: '五行生剋制化，宇宙能量的平衡之道',
    icon: <Star className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    position: { x: 15, y: 55 },
    size: 'md'
  },
  {
    id: 'nayin',
    name: '納音寶庫',
    subtitle: '六十甲子',
    description: '海中金、爐中火...六十納音的深層意涵',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-orange-500 to-red-400',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    position: { x: 85, y: 55 },
    size: 'md'
  },
  {
    id: 'legion',
    name: '四時軍團',
    subtitle: '命運戰場',
    description: '年月日時四大軍團，你的靈魂戰士們',
    icon: <Swords className="w-5 h-5" />,
    color: 'from-red-500 to-rose-400',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    position: { x: 35, y: 70 },
    size: 'md'
  },
  {
    id: 'personality',
    name: '性格分析',
    subtitle: '內在探索',
    description: '從命盤解讀你的性格特質與潛能',
    icon: <Shield className="w-5 h-5" />,
    color: 'from-indigo-500 to-violet-400',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    position: { x: 65, y: 70 },
    size: 'md'
  },
  {
    id: 'fortune',
    name: '運勢預測',
    subtitle: '流年大運',
    description: '大運流年的起伏變化與人生節奏',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'from-sky-500 to-blue-400',
    glowColor: 'rgba(14, 165, 233, 0.4)',
    position: { x: 50, y: 85 },
    size: 'sm'
  }
];

const NavigationMap: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneNavigate = (zoneId: string) => {
    navigate(`/guide/${zoneId}`);
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
      {/* 頂部裝飾 */}
      <div className={`relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-void via-card to-background' 
          : 'bg-gradient-to-b from-paper via-white to-background'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-amber-500 to-yellow-400" />
        </div>

        {/* 返回按鈕 */}
        <div className="relative z-10 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={`gap-2 ${
              theme === 'dark' ? 'text-paper/70 hover:text-paper' : 'text-void/70 hover:text-void'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Button>
        </div>

        {/* 頁面標題 */}
        <motion.div 
          className="relative z-10 text-center px-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
              八字命理導覽地圖
            </span>
          </h1>
          <p className={`mt-2 text-sm ${
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
            
            {/* 連接線 */}
            <svg className="absolute inset-0 w-full h-full" style={{ minHeight: '500px' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.1" />
                  <stop offset="50%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={theme === 'dark' ? 'hsl(45, 100%, 50%)' : 'hsl(45, 90%, 45%)'} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {ZONES.filter(z => z.id !== 'bazi').map(zone => (
                <motion.line
                  key={zone.id}
                  x1="50%"
                  y1="35%"
                  x2={`${zone.position.x}%`}
                  y2={`${zone.position.y}%`}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    opacity: hoveredZone === zone.id || hoveredZone === 'bazi' ? 1 : 0.4
                  }}
                  transition={{ duration: 0.5, delay: 0.1 * ZONES.indexOf(zone) }}
                />
              ))}
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

          {/* AI 諮詢入口 */}
          <motion.button
            onClick={() => navigate('/')}
            className={`
              w-full py-4 px-6 rounded-xl
              flex items-center justify-center gap-3
              font-bold text-lg tracking-wider
              transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400/60 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white hover:from-amber-400 hover:via-amber-300 hover:to-amber-400'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-5 h-5" />
            <span>開始八字測算</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NavigationMap;
