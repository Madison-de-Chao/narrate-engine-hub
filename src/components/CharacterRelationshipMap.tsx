import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreeDeciduous, Flame, Mountain, Sparkles, Droplets, X, ArrowRight, Zap, Shield, Users, Play, Pause } from 'lucide-react';
import { GAN_CHARACTERS, ZHI_CHARACTERS } from '@/lib/legionTranslator/characterData';
import type { GanCharacter, ZhiCharacter } from '@/lib/legionTranslator/types';
import { commanderAvatars } from '@/assets/commanders';
import { advisorAvatars } from '@/assets/advisors';

type CharacterType = GanCharacter | ZhiCharacter;

const ELEMENT_CONFIG = {
  木: { 
    icon: TreeDeciduous, 
    color: '#22C55E', 
    bgClass: 'from-green-500/30 to-emerald-600/20',
    generates: '火',
    controls: '土',
    generatedBy: '水',
    controlledBy: '金',
  },
  火: { 
    icon: Flame, 
    color: '#EF4444', 
    bgClass: 'from-red-500/30 to-orange-600/20',
    generates: '土',
    controls: '金',
    generatedBy: '木',
    controlledBy: '水',
  },
  土: { 
    icon: Mountain, 
    color: '#F59E0B', 
    bgClass: 'from-amber-500/30 to-yellow-600/20',
    generates: '金',
    controls: '水',
    generatedBy: '火',
    controlledBy: '木',
  },
  金: { 
    icon: Sparkles, 
    color: '#9CA3AF', 
    bgClass: 'from-gray-300/30 to-gray-500/20',
    generates: '水',
    controls: '木',
    generatedBy: '土',
    controlledBy: '火',
  },
  水: { 
    icon: Droplets, 
    color: '#3B82F6', 
    bgClass: 'from-blue-500/30 to-indigo-600/20',
    generates: '木',
    controls: '火',
    generatedBy: '金',
    controlledBy: '土',
  },
} as const;

type ElementType = keyof typeof ELEMENT_CONFIG;

// 五行順序（用於圓形佈局）
const ELEMENT_ORDER: ElementType[] = ['木', '火', '土', '金', '水'];

// 角色按五行分組
function groupCharactersByElement(characters: Record<string, CharacterType>): Record<ElementType, CharacterType[]> {
  const groups: Record<ElementType, CharacterType[]> = {
    木: [], 火: [], 土: [], 金: [], 水: []
  };
  
  Object.values(characters).forEach(char => {
    if (groups[char.element as ElementType]) {
      groups[char.element as ElementType].push(char);
    }
  });
  
  return groups;
}

interface CharacterRelationshipMapProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterClick?: (char: CharacterType) => void;
}

export function CharacterRelationshipMap({ 
  isOpen, 
  onClose,
  onCharacterClick 
}: CharacterRelationshipMapProps) {
  const [activeElement, setActiveElement] = useState<ElementType | null>(null);
  const [showMode, setShowMode] = useState<'generate' | 'control'>('generate');
  const [characterType, setCharacterType] = useState<'gan' | 'zhi' | 'all'>('all');
  const [hoveredChar, setHoveredChar] = useState<CharacterType | null>(null);
  
  // 動畫演示模式
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'element' | 'transition'>('element');
  
  // 動畫效果 - 自動循環展示五行關係
  useEffect(() => {
    if (!isAnimating || !isOpen) return;
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => {
        if (prev === 'element') {
          return 'transition';
        } else {
          // 切換到下一個元素
          setAnimationIndex(idx => (idx + 1) % ELEMENT_ORDER.length);
          return 'element';
        }
      });
    }, 1200);
    
    return () => clearInterval(interval);
  }, [isAnimating, isOpen]);
  
  // 動畫時設置當前活動元素
  useEffect(() => {
    if (isAnimating) {
      setActiveElement(ELEMENT_ORDER[animationIndex]);
    }
  }, [isAnimating, animationIndex]);
  
  // 關閉時重置動畫
  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
      setAnimationIndex(0);
    }
  }, [isOpen]);

  // 根據選擇的類型獲取角色
  const characters = useMemo(() => {
    if (characterType === 'gan') return groupCharactersByElement(GAN_CHARACTERS);
    if (characterType === 'zhi') return groupCharactersByElement(ZHI_CHARACTERS);
    
    // 合併兩種類型
    const ganGroups = groupCharactersByElement(GAN_CHARACTERS);
    const zhiGroups = groupCharactersByElement(ZHI_CHARACTERS);
    const combined: Record<ElementType, CharacterType[]> = {
      木: [], 火: [], 土: [], 金: [], 水: []
    };
    
    ELEMENT_ORDER.forEach(element => {
      combined[element] = [...ganGroups[element], ...zhiGroups[element]];
    });
    
    return combined;
  }, [characterType]);

  // 獲取角色頭像
  const getAvatarSrc = useCallback((char: CharacterType) => {
    if ('gan' in char) {
      return commanderAvatars[char.gan as keyof typeof commanderAvatars];
    }
    return advisorAvatars[char.id as keyof typeof advisorAvatars];
  }, []);

  // 計算五行元素的位置（圓形佈局）
  const getElementPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // 從頂部開始
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // 獲取關係說明
  const getRelationshipInfo = (element: ElementType) => {
    const config = ELEMENT_CONFIG[element];
    return {
      generates: {
        target: config.generates,
        label: `${element}生${config.generates}`,
        desc: `${element}滋養${config.generates}，提供能量與支持`
      },
      controls: {
        target: config.controls,
        label: `${element}剋${config.controls}`,
        desc: `${element}制約${config.controls}，形成制衡`
      },
      generatedBy: {
        source: config.generatedBy,
        label: `${config.generatedBy}生${element}`,
        desc: `${element}受${config.generatedBy}滋養`
      },
      controlledBy: {
        source: config.controlledBy,
        label: `${config.controlledBy}剋${element}`,
        desc: `${element}被${config.controlledBy}制約`
      }
    };
  };

  const containerSize = 380;
  const elementRadius = 140;
  const elementNodeSize = 64;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background to-background/95 border-border/50">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">角色五行關係圖譜</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* 控制選項 */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Tabs value={characterType} onValueChange={(v) => setCharacterType(v as typeof characterType)}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs gap-1">
                  <Users className="w-3 h-3" />
                  全部
                </TabsTrigger>
                <TabsTrigger value="gan" className="text-xs gap-1">
                  <Shield className="w-3 h-3" />
                  天干
                </TabsTrigger>
                <TabsTrigger value="zhi" className="text-xs gap-1">
                  <Zap className="w-3 h-3" />
                  地支
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={showMode === 'generate' ? 'default' : 'outline'}
                onClick={() => setShowMode('generate')}
                className="gap-1.5 text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                相生
              </Button>
              <Button
                size="sm"
                variant={showMode === 'control' ? 'default' : 'outline'}
                onClick={() => setShowMode('control')}
                className="gap-1.5 text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                相剋
              </Button>
            </div>
            
            {/* 動畫演示按鈕 */}
            <Button
              size="sm"
              variant={isAnimating ? 'default' : 'outline'}
              onClick={() => {
                setIsAnimating(!isAnimating);
                if (!isAnimating) {
                  setAnimationIndex(0);
                  setActiveElement(ELEMENT_ORDER[0]);
                }
              }}
              className="gap-1.5 text-xs"
            >
              {isAnimating ? (
                <>
                  <Pause className="w-3 h-3" />
                  停止演示
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  自動演示
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row min-h-0">
          {/* 左側：五行關係圖 */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div 
              className="relative"
              style={{ width: containerSize, height: containerSize }}
              onMouseLeave={() => setActiveElement(null)}
            >
              {/* 中心裝飾 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 rounded-full border border-border/30 bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">五行</span>
                </div>
              </div>

              {/* SVG 連接線 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arrow-gen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <polygon points="0 1, 8 4, 0 7" fill="#22c55e" opacity="0.8" />
                  </marker>
                  <marker id="arrow-ctrl" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <polygon points="0 1, 8 4, 0 7" fill="#ef4444" opacity="0.8" />
                  </marker>
                  <marker id="arrow-gen-active" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
                    <polygon points="0 1, 10 5, 0 9" fill="#4ade80" />
                  </marker>
                  <marker id="arrow-ctrl-active" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
                    <polygon points="0 1, 10 5, 0 9" fill="#f87171" />
                  </marker>
                </defs>

                {ELEMENT_ORDER.map((element, idx) => {
                  const fromPos = getElementPosition(idx, 5, elementRadius);
                  const config = ELEMENT_CONFIG[element];
                  const targetElement = showMode === 'generate' ? config.generates : config.controls;
                  const targetIdx = ELEMENT_ORDER.indexOf(targetElement);
                  const toPos = getElementPosition(targetIdx, 5, elementRadius);
                  
                  const isActive = activeElement === element;
                  const isTarget = activeElement && ELEMENT_CONFIG[activeElement][showMode === 'generate' ? 'generates' : 'controls'] === element;
                  
                  const centerX = containerSize / 2;
                  const centerY = containerSize / 2;
                  
                  // 計算曲線控制點
                  const midX = (fromPos.x + toPos.x) / 2;
                  const midY = (fromPos.y + toPos.y) / 2;
                  const controlX = showMode === 'generate' 
                    ? midX * 0.5 
                    : midX * 0.3;
                  const controlY = showMode === 'generate' 
                    ? midY * 0.5 
                    : midY * 0.3;

                  // 計算路徑 ID 用於動畫
                  const pathId = `path-${showMode}-${element}`;
                  const pathD = `M ${centerX + fromPos.x} ${centerY + fromPos.y} Q ${centerX + controlX} ${centerY + controlY} ${centerX + toPos.x} ${centerY + toPos.y}`;
                  
                  return (
                    <g key={`${showMode}-${element}`}>
                      <motion.path
                        id={pathId}
                        d={pathD}
                        stroke={showMode === 'generate' 
                          ? (isActive ? '#4ade80' : '#22c55e') 
                          : (isActive ? '#f87171' : '#ef4444')}
                        strokeWidth={isActive || isTarget ? 3 : 1.5}
                        strokeOpacity={isActive || isTarget ? 1 : 0.35}
                        fill="none"
                        strokeDasharray={isActive || isTarget ? '0' : '6 4'}
                        markerEnd={isActive 
                          ? `url(#arrow-${showMode === 'generate' ? 'gen' : 'ctrl'}-active)` 
                          : `url(#arrow-${showMode === 'generate' ? 'gen' : 'ctrl'})`}
                        initial={false}
                        animate={{
                          strokeOpacity: isActive || isTarget ? 1 : 0.35,
                          strokeWidth: isActive || isTarget ? 3 : 1.5,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* 流動粒子動畫 - 僅在活動時顯示 */}
                      {isActive && isAnimating && animationPhase === 'transition' && (
                        <>
                          <circle r="6" fill={showMode === 'generate' ? '#4ade80' : '#f87171'}>
                            <animateMotion
                              dur="0.8s"
                              repeatCount="1"
                              path={pathD}
                            />
                            <animate
                              attributeName="opacity"
                              values="0;1;1;0"
                              dur="0.8s"
                              repeatCount="1"
                            />
                          </circle>
                          <circle r="4" fill="white" opacity="0.8">
                            <animateMotion
                              dur="0.8s"
                              repeatCount="1"
                              path={pathD}
                              begin="0.1s"
                            />
                            <animate
                              attributeName="opacity"
                              values="0;0.8;0.8;0"
                              dur="0.8s"
                              repeatCount="1"
                              begin="0.1s"
                            />
                          </circle>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 五行節點 */}
              {ELEMENT_ORDER.map((element, idx) => {
                const pos = getElementPosition(idx, 5, elementRadius);
                const config = ELEMENT_CONFIG[element];
                const ElementIcon = config.icon;
                const isActive = activeElement === element;
                const chars = characters[element];

                return (
                  <motion.div
                    key={element}
                    className="absolute cursor-pointer"
                    style={{
                      left: containerSize / 2 + pos.x - elementNodeSize / 2,
                      top: containerSize / 2 + pos.y - elementNodeSize / 2,
                      width: elementNodeSize,
                      height: elementNodeSize,
                      zIndex: isActive ? 20 : 10,
                    }}
                    onMouseEnter={() => {
                      if (!isAnimating) {
                        setActiveElement(element);
                      }
                    }}
                    onClick={() => {
                      // 點擊時停止動畫並選中該元素
                      setIsAnimating(false);
                      setActiveElement(element);
                    }}
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div
                      className={`w-full h-full rounded-full bg-gradient-to-br ${config.bgClass} flex flex-col items-center justify-center border-2 transition-all duration-200`}
                      style={{
                        borderColor: config.color,
                        boxShadow: isActive 
                          ? `0 0 24px ${config.color}60, 0 4px 16px ${config.color}40` 
                          : `0 4px 12px ${config.color}20`
                      }}
                    >
                      <ElementIcon className="w-5 h-5" style={{ color: config.color }} />
                      <span className="text-lg font-bold" style={{ color: config.color }}>{element}</span>
                    </div>
                    
                    {/* 角色數量標籤 */}
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {chars.length}
                    </div>

                    {/* 波動效果 */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{ border: `2px solid ${config.color}` }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* 中心關係說明 */}
              <AnimatePresence mode="wait">
                {activeElement && (
                  <motion.div
                    key={activeElement}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 25 }}
                  >
                    <div 
                      className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                        showMode === 'generate' ? 'bg-emerald-500' : 'bg-red-500'
                      } text-white`}
                    >
                      {getRelationshipInfo(activeElement)[showMode === 'generate' ? 'generates' : 'controls'].label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 右側：角色列表 */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/20">
            <ScrollArea className="h-[300px] lg:h-[500px]">
              <div className="p-4 space-y-4">
                {activeElement ? (
                  <>
                    {/* 當前選中的五行 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = ELEMENT_CONFIG[activeElement];
                          const Icon = config.icon;
                          return (
                            <>
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${config.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: config.color }} />
                              </div>
                              <span className="font-bold" style={{ color: config.color }}>
                                {activeElement}行角色
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {characters[activeElement].length}位
                              </Badge>
                            </>
                          );
                        })()}
                      </div>

                      {/* 角色列表 */}
                      <div className="grid grid-cols-2 gap-2">
                        {characters[activeElement].map(char => (
                          <motion.button
                            key={char.id}
                            className="relative p-2 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all text-left group"
                            onClick={() => onCharacterClick?.(char)}
                            onMouseEnter={() => setHoveredChar(char)}
                            onMouseLeave={() => setHoveredChar(null)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={getAvatarSrc(char)}
                                alt={char.title}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{char.id}</p>
                                <p className="text-xs text-muted-foreground truncate">{char.title}</p>
                              </div>
                            </div>
                            {'gan' in char && (
                              <Badge variant="outline" className="absolute top-1 right-1 text-[10px] px-1">
                                將
                              </Badge>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* 關係說明 */}
                    <div className="space-y-2 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground">五行關係</p>
                      {(() => {
                        const info = getRelationshipInfo(activeElement);
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-emerald-500">
                              <ArrowRight className="w-4 h-4" />
                              <span>{info.generates.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-500">
                              <ArrowRight className="w-4 h-4" />
                              <span>{info.controls.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                              <ArrowRight className="w-4 h-4 rotate-180" />
                              <span>{info.generatedBy.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-400">
                              <ArrowRight className="w-4 h-4 rotate-180" />
                              <span>{info.controlledBy.label}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">懸停五行節點</p>
                    <p className="text-xs mt-1">查看相關角色與關係</p>
                  </div>
                )}

                {/* 角色詳情預覽 */}
                <AnimatePresence>
                  {hoveredChar && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-3 rounded-lg bg-card border border-border"
                    >
                      <p className="text-sm font-medium mb-1">{hoveredChar.id} - {hoveredChar.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{hoveredChar.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {hoveredChar.personality.map((trait, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 底部圖例 */}
        <div className="px-6 py-3 border-t border-border/50 bg-muted/10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-500 rounded" />
            <span>相生（滋養生助）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-500 rounded" />
            <span>相剋（制約平衡）</span>
          </div>
          <div className="text-muted-foreground/60">
            木→火→土→金→水→木（相生） | 木→土→水→火→金→木（相剋）
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
