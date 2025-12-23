import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Swords,
  GraduationCap,
  Map,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapZone {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const ZONES: MapZone[] = [
  {
    id: 'legion',
    name: '四時軍團',
    subtitle: '八字人生兵法系統',
    icon: <Swords className="w-4 h-4" />,
    color: 'from-red-600 to-amber-500',
    route: '/'
  },
  {
    id: 'academy',
    name: '八字學堂',
    subtitle: '命理知識殿堂',
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'from-purple-600 to-indigo-500',
    route: '/academy'
  }
];

export const NavigationMapDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-void hover:from-amber-300 hover:to-amber-200'
              : 'bg-gradient-to-r from-ink to-slate-800 text-paper hover:from-slate-800 hover:to-slate-700'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">導覽地圖</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className={`w-72 p-2 z-[100] ${
          theme === 'dark' 
            ? 'bg-card border-gold/30' 
            : 'bg-white border-ink/10'
        }`}
      >
        {/* 標題 */}
        <div className={`px-3 py-2 mb-1 ${
          theme === 'dark' ? 'text-paper/60' : 'text-void/60'
        }`}>
          <span className="text-xs font-medium tracking-wider">八字命理導覽</span>
        </div>
        
        {/* 區域列表 */}
        {ZONES.map((zone, index) => {
          // 根據索引計算飛入方向
          const directions = [
            { x: -30, y: 0 },   // 從左
            { x: 30, y: 0 },    // 從右
            { x: 0, y: -20 },   // 從上
            { x: 0, y: 20 },    // 從下
            { x: -20, y: -20 }, // 從左上
            { x: 20, y: -20 },  // 從右上
            { x: -20, y: 20 },  // 從左下
            { x: 20, y: 20 },   // 從右下
          ];
          const direction = directions[index % directions.length];
          
          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: direction.x, y: direction.y }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
            >
              <DropdownMenuItem
                onClick={() => navigate(zone.route)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${theme === 'dark' 
                    ? 'hover:bg-gold/10 focus:bg-gold/10' 
                    : 'hover:bg-ink/5 focus:bg-ink/5'
                  }
                `}
              >
                <motion.div 
                  className={`
                    w-9 h-9 rounded-full bg-gradient-to-br ${zone.color}
                    flex items-center justify-center text-white shrink-0
                    shadow-sm
                  `}
                  animate={{
                    scale: hoveredZone === zone.id ? 1.1 : 1,
                    rotate: hoveredZone === zone.id ? [0, -5, 5, 0] : 0,
                    boxShadow: hoveredZone === zone.id 
                      ? '0 4px 12px rgba(0,0,0,0.2)' 
                      : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {zone.icon}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.div 
                    className={`font-medium text-sm ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}
                    animate={{
                      x: hoveredZone === zone.id ? 4 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {zone.name}
                  </motion.div>
                  <motion.div 
                    className={`text-xs ${
                      theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                    }`}
                    animate={{
                      x: hoveredZone === zone.id ? 4 : 0
                    }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                  >
                    {zone.subtitle}
                  </motion.div>
                </div>
                
                <motion.div
                  animate={{ 
                    x: hoveredZone === zone.id ? 0 : -4,
                    opacity: hoveredZone === zone.id ? 1 : 0,
                    scale: hoveredZone === zone.id ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ExternalLink className={`w-3.5 h-3.5 ${
                    theme === 'dark' ? 'text-gold' : 'text-amber-600'
                  }`} />
                </motion.div>
              </DropdownMenuItem>
            </motion.div>
          );
        })}
        
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-gold/20' : 'bg-ink/10'} />
        
        {/* 完整地圖連結 */}
        <DropdownMenuItem
          onClick={() => navigate('/map')}
          className={`
            flex items-center justify-center gap-2 px-3 py-3 rounded-lg cursor-pointer
            transition-all duration-200 mt-1
            ${theme === 'dark' 
              ? 'bg-gold/10 hover:bg-gold/20 text-gold' 
              : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
            }
          `}
        >
          <Map className="w-4 h-4" />
          <span className="font-medium text-sm">查看完整導覽地圖</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
