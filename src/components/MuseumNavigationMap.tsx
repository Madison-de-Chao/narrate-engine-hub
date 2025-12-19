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
  ExternalLink
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
  position: { x: number; y: number };
  size: 'lg' | 'md' | 'sm';
}

interface MuseumNavigationMapProps {
  onZoneClick?: (zoneId: string) => void;
  onAiConsultClick?: () => void;
}

const ZONES: MapZone[] = [
  {
    id: 'bazi',
    name: '命盤核心',
    subtitle: '四柱八字',
    description: '年月日時四柱，天干地支交織的命運密碼',
    icon: <Compass className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-400',
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
    position: { x: 50, y: 85 },
    size: 'sm'
  }
];

export const MuseumNavigationMap: React.FC<MuseumNavigationMapProps> = ({
  onZoneClick,
  onAiConsultClick
}) => {
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
    <div className={`relative w-full rounded-2xl overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-void via-card to-void border border-gold/20' 
        : 'bg-gradient-to-br from-paper via-white to-paper border border-ink/10'
    }`}>
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 星空/網格背景 */}
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
          {/* 從中心向外的連接線 */}
          {ZONES.filter(z => z.id !== 'bazi').map(zone => (
            <line
              key={zone.id}
              x1="50%"
              y1="35%"
              x2={`${zone.position.x}%`}
              y2={`${zone.position.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="transition-all duration-300"
              style={{
                opacity: hoveredZone === zone.id || hoveredZone === 'bazi' ? 0.8 : 0.3
              }}
            />
          ))}
        </svg>
      </div>

      {/* 標題 */}
      <div className="relative z-10 text-center pt-8 pb-4 px-4">
        <h2 className={`text-2xl md:text-3xl font-bold tracking-wider ${
          theme === 'dark' ? 'text-paper' : 'text-void'
        }`}>
          <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
            八字命理導覽地圖
          </span>
        </h2>
        <p className={`mt-2 text-sm ${
          theme === 'dark' ? 'text-paper/60' : 'text-void/60'
        }`}>
          點擊區域探索不同的命理知識殿堂
        </p>
      </div>

      {/* 導覽地圖區域 */}
      <div className="relative z-10 w-full" style={{ minHeight: '450px', paddingBottom: '20px' }}>
        {ZONES.map(zone => (
          <motion.div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.1 * ZONES.indexOf(zone),
              type: 'spring',
              stiffness: 200
            }}
            whileHover={{ scale: 1.1, zIndex: 20 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredZone(zone.id)}
            onHoverEnd={() => setHoveredZone(null)}
            onClick={() => {
              setActiveZone(zone.id);
              onZoneClick?.(zone.id);
            }}
          >
            <div className={`
              ${getSizeClasses(zone.size)}
              rounded-full 
              bg-gradient-to-br ${zone.color}
              flex flex-col items-center justify-center
              shadow-lg
              transition-all duration-300
              ${hoveredZone === zone.id ? 'shadow-2xl ring-4 ring-white/30' : ''}
              ${theme === 'dark' ? 'shadow-black/50' : 'shadow-black/20'}
            `}>
              <div className="text-white mb-1">
                {zone.icon}
              </div>
              <span className="text-white text-xs md:text-sm font-bold text-center px-1 leading-tight">
                {zone.name}
              </span>
              {zone.size !== 'sm' && (
                <span className="text-white/70 text-[10px] md:text-xs text-center px-1">
                  {zone.subtitle}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 區域詳情彈出框 */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
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
                  <div className={`
                    w-12 h-12 rounded-full bg-gradient-to-br ${zone.color}
                    flex items-center justify-center text-white shrink-0
                  `}>
                    {zone.icon}
                  </div>
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
                      variant="link"
                      onClick={() => handleZoneNavigate(zone.id)}
                      className={`mt-2 p-0 h-auto gap-1 ${
                        theme === 'dark' ? 'text-gold hover:text-gold/80' : 'text-amber-600 hover:text-amber-500'
                      }`}
                    >
                      深入了解
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

      {/* AI 諮詢入口 */}
      <div className="relative z-10 px-4 pb-6">
        <motion.button
          onClick={onAiConsultClick}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageCircle className="w-5 h-5" />
          <span>AI 命理大師諮詢</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
