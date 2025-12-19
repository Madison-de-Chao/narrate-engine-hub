import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface WuxingElement {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  position: { x: number; y: number };
  character: string;
  generates: string;
  controls: string;
}

const ELEMENTS: WuxingElement[] = [
  { 
    id: 'wood', 
    name: '木', 
    color: '#22c55e', 
    bgColor: 'from-green-500 to-emerald-400',
    position: { x: 50, y: 8 }, 
    character: '仁',
    generates: 'fire',
    controls: 'earth'
  },
  { 
    id: 'fire', 
    name: '火', 
    color: '#ef4444', 
    bgColor: 'from-red-500 to-orange-400',
    position: { x: 88, y: 38 }, 
    character: '禮',
    generates: 'earth',
    controls: 'metal'
  },
  { 
    id: 'earth', 
    name: '土', 
    color: '#eab308', 
    bgColor: 'from-yellow-500 to-amber-400',
    position: { x: 73, y: 88 }, 
    character: '信',
    generates: 'metal',
    controls: 'water'
  },
  { 
    id: 'metal', 
    name: '金', 
    color: '#a1a1aa', 
    bgColor: 'from-zinc-400 to-slate-300',
    position: { x: 27, y: 88 }, 
    character: '義',
    generates: 'water',
    controls: 'wood'
  },
  { 
    id: 'water', 
    name: '水', 
    color: '#3b82f6', 
    bgColor: 'from-blue-500 to-cyan-400',
    position: { x: 12, y: 38 }, 
    character: '智',
    generates: 'wood',
    controls: 'fire'
  }
];

const GENERATE_LABELS: Record<string, string> = {
  'wood-fire': '木生火',
  'fire-earth': '火生土',
  'earth-metal': '土生金',
  'metal-water': '金生水',
  'water-wood': '水生木'
};

const CONTROL_LABELS: Record<string, string> = {
  'wood-earth': '木剋土',
  'earth-water': '土剋水',
  'water-fire': '水剋火',
  'fire-metal': '火剋金',
  'metal-wood': '金剋木'
};

interface WuxingCycleDiagramProps {
  className?: string;
}

export const WuxingCycleDiagram: React.FC<WuxingCycleDiagramProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showMode, setShowMode] = useState<'generate' | 'control'>('generate');
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationIndex, setAnimationIndex] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationIndex(prev => (prev + 1) % ELEMENTS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getElementById = (id: string) => ELEMENTS.find(e => e.id === id);

  const getElementPosition = (id: string, containerSize: number) => {
    const element = getElementById(id);
    if (!element) return { x: 0, y: 0 };
    return {
      x: (element.position.x / 100) * containerSize,
      y: (element.position.y / 100) * containerSize
    };
  };

  const getGeneratePath = (from: string, to: string, size: number) => {
    const fromPos = getElementPosition(from, size);
    const toPos = getElementPosition(to, size);
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const controlX = midX + (centerX - midX) * 0.4;
    const controlY = midY + (centerY - midY) * 0.4;
    
    return `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
  };

  const getControlPath = (from: string, to: string, size: number) => {
    const fromPos = getElementPosition(from, size);
    const toPos = getElementPosition(to, size);
    return `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
  };

  const containerSize = 280;
  const elementSize = 56;

  const currentAnimatingElement = ELEMENTS[animationIndex];
  const targetElement = showMode === 'generate' 
    ? currentAnimatingElement.generates 
    : currentAnimatingElement.controls;

  return (
    <div className={`${className}`}>
      {/* 標題與控制 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
          五行關係圖
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMode('generate')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showMode === 'generate'
                ? theme === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-emerald-500 text-white'
                : theme === 'dark'
                  ? 'bg-card text-paper/60 hover:text-paper border border-transparent'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            相生
          </button>
          <button
            onClick={() => setShowMode('control')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showMode === 'control'
                ? theme === 'dark'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-red-500 text-white'
                : theme === 'dark'
                  ? 'bg-card text-paper/60 hover:text-paper border border-transparent'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            相剋
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-card text-paper/60 hover:text-paper border border-gold/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAnimating ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* 圖表容器 */}
      <div 
        className={`relative mx-auto rounded-2xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-card via-void to-card border border-gold/20' 
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-lg'
        }`}
        style={{ width: containerSize, height: containerSize }}
        onMouseLeave={() => {
          setActiveElement(null);
          setIsAnimating(true);
        }}
      >
        {/* 背景裝飾 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-28 h-28 rounded-full opacity-10 ${
            theme === 'dark' ? 'border-2 border-gold' : 'border-2 border-amber-500'
          }`} />
        </div>

        {/* SVG 連接線 */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <defs>
            <marker
              id="arrowhead-gen"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#22c55e" />
            </marker>
            <marker
              id="arrowhead-ctrl"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#ef4444" />
            </marker>
            <marker
              id="arrowhead-gen-active"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0 1, 10 5, 0 9" fill="#4ade80" />
            </marker>
            <marker
              id="arrowhead-ctrl-active"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0 1, 10 5, 0 9" fill="#f87171" />
            </marker>
          </defs>

          {/* 相生線 */}
          {showMode === 'generate' && ELEMENTS.map(element => {
            const isActive = isAnimating 
              ? element.id === currentAnimatingElement.id
              : element.id === activeElement;
            
            return (
              <motion.path
                key={`gen-${element.id}`}
                d={getGeneratePath(element.id, element.generates, containerSize)}
                stroke={isActive ? "#4ade80" : "#22c55e"}
                strokeWidth={isActive ? 3 : 1.5}
                strokeOpacity={isActive ? 1 : 0.4}
                fill="none"
                strokeDasharray={isActive ? "0" : "6 4"}
                markerEnd={isActive ? "url(#arrowhead-gen-active)" : "url(#arrowhead-gen)"}
                initial={false}
                animate={{
                  strokeOpacity: isActive ? 1 : 0.4,
                  strokeWidth: isActive ? 3 : 1.5
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* 相剋線 */}
          {showMode === 'control' && ELEMENTS.map(element => {
            const isActive = isAnimating 
              ? element.id === currentAnimatingElement.id
              : element.id === activeElement;
            
            return (
              <motion.path
                key={`ctrl-${element.id}`}
                d={getControlPath(element.id, element.controls, containerSize)}
                stroke={isActive ? "#f87171" : "#ef4444"}
                strokeWidth={isActive ? 3 : 1.5}
                strokeOpacity={isActive ? 1 : 0.4}
                fill="none"
                strokeDasharray={isActive ? "0" : "6 4"}
                markerEnd={isActive ? "url(#arrowhead-ctrl-active)" : "url(#arrowhead-ctrl)"}
                initial={false}
                animate={{
                  strokeOpacity: isActive ? 1 : 0.4,
                  strokeWidth: isActive ? 3 : 1.5
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* 五行元素 */}
        {ELEMENTS.map(element => {
          const pos = getElementPosition(element.id, containerSize);
          const isSource = isAnimating && element.id === currentAnimatingElement.id;
          const isTarget = isAnimating && element.id === targetElement;
          const isHovered = element.id === activeElement;
          const isActive = isSource || isTarget || isHovered;

          return (
            <motion.div
              key={element.id}
              className="absolute cursor-pointer"
              style={{
                left: pos.x - elementSize / 2,
                top: pos.y - elementSize / 2,
                width: elementSize,
                height: elementSize,
                zIndex: isActive ? 10 : 5
              }}
              onMouseEnter={() => {
                setIsAnimating(false);
                setActiveElement(element.id);
              }}
              animate={{
                scale: isActive ? 1.12 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div
                className={`w-full h-full rounded-full bg-gradient-to-br ${element.bgColor} flex flex-col items-center justify-center text-white transition-all duration-300`}
                style={{
                  boxShadow: isActive 
                    ? `0 0 24px ${element.color}90, 0 4px 16px ${element.color}50` 
                    : `0 4px 12px ${element.color}30`
                }}
              >
                <span className="text-xl font-bold">{element.name}</span>
                <span className="text-[10px] opacity-80">{element.character}</span>
              </div>

              {/* 波動效果 */}
              <AnimatePresence>
                {isSource && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ 
                      border: `2px solid ${showMode === 'generate' ? '#22c55e' : '#ef4444'}` 
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* 中心說明標籤 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          <AnimatePresence mode="wait">
            {isAnimating && (
              <motion.div
                key={`${currentAnimatingElement.id}-${showMode}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                  showMode === 'generate'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {showMode === 'generate' 
                  ? GENERATE_LABELS[`${currentAnimatingElement.id}-${currentAnimatingElement.generates}`]
                  : CONTROL_LABELS[`${currentAnimatingElement.id}-${currentAnimatingElement.controls}`]
                }
              </motion.div>
            )}
            {!isAnimating && activeElement && (
              <motion.div
                key={`hover-${activeElement}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                  showMode === 'generate'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {(() => {
                  const el = getElementById(activeElement);
                  if (!el) return '';
                  return showMode === 'generate'
                    ? GENERATE_LABELS[`${el.id}-${el.generates}`]
                    : CONTROL_LABELS[`${el.id}-${el.controls}`];
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 圖例 */}
      <div className={`mt-4 flex justify-center gap-6 text-sm ${
        theme === 'dark' ? 'text-paper/70' : 'text-void/70'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-emerald-500 rounded" />
          <span>相生（滋養）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-red-500 rounded" />
          <span>相剋（制約）</span>
        </div>
      </div>

      {/* 互動提示 */}
      <p className={`mt-2 text-center text-xs ${
        theme === 'dark' ? 'text-paper/50' : 'text-void/50'
      }`}>
        懸停元素查看關係，點擊按鈕切換模式
      </p>
    </div>
  );
};
