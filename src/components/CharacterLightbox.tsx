import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, X, Sparkles, Shield, Droplets, Mountain, Flame, TreeDeciduous, Heart, Maximize2, Grid3X3, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { GanCharacter, ZhiCharacter } from "@/lib/legionTranslator/types";
import { commanderFullbodyAvatars } from "@/assets/commanders-fullbody";
import { advisorFullbodyAvatars } from "@/assets/advisors-fullbody";

const ELEMENT_CONFIG = {
  木: { icon: TreeDeciduous, color: '#22C55E', gradient: 'from-green-500/30 to-emerald-900/60' },
  火: { icon: Flame, color: '#EF4444', gradient: 'from-red-500/30 to-orange-900/60' },
  土: { icon: Mountain, color: '#F59E0B', gradient: 'from-amber-500/30 to-yellow-900/60' },
  金: { icon: Sparkles, color: '#9CA3AF', gradient: 'from-gray-300/30 to-gray-800/60' },
  水: { icon: Droplets, color: '#3B82F6', gradient: 'from-blue-500/30 to-indigo-900/60' },
} as const;

type ElementType = keyof typeof ELEMENT_CONFIG;
type CharacterType = GanCharacter | ZhiCharacter;

interface CharacterLightboxProps {
  characters: CharacterType[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  getAvatarSrc: (char: CharacterType) => string;
  isFavorite?: (id: string, type: 'gan' | 'zhi') => boolean;
  onFavoriteClick?: (char: CharacterType) => void;
  isLoggedIn?: boolean;
  onCharacterView?: (char: CharacterType) => void;
}

export function CharacterLightbox({
  characters,
  currentIndex,
  isOpen,
  onNavigate,
  onClose,
  getAvatarSrc,
  isFavorite,
  onFavoriteClick,
  isLoggedIn = false,
  onCharacterView,
}: CharacterLightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const currentChar = characters[currentIndex];
  
  // 觸控滑動支援
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const getCharType = (char: CharacterType): 'gan' | 'zhi' => 'gan' in char ? 'gan' : 'zhi';

  // 獲取全身動態圖
  const getFullbodyAvatar = (char: CharacterType): string | null => {
    if ('gan' in char) {
      return commanderFullbodyAvatars[char.gan] || null;
    }
    return advisorFullbodyAvatars[char.id] || null;
  };

  // 使用全身圖或頭像
  const displayImage = currentChar 
    ? (getFullbodyAvatar(currentChar) || getAvatarSrc(currentChar))
    : '';

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setImageLoaded(false);
      const newIndex = currentIndex - 1;
      onNavigate(newIndex);
      // 記錄瀏覽歷史
      if (onCharacterView && characters[newIndex]) {
        onCharacterView(characters[newIndex]);
      }
    }
  }, [currentIndex, onNavigate, onCharacterView, characters]);

  const handleNext = useCallback(() => {
    if (currentIndex < characters.length - 1) {
      setImageLoaded(false);
      const newIndex = currentIndex + 1;
      onNavigate(newIndex);
      // 記錄瀏覽歷史
      if (onCharacterView && characters[newIndex]) {
        onCharacterView(characters[newIndex]);
      }
    }
  }, [currentIndex, characters.length, onNavigate, onCharacterView, characters]);

  const handleThumbnailClick = useCallback((index: number) => {
    if (index !== currentIndex) {
      setImageLoaded(false);
      onNavigate(index);
      // 記錄瀏覽歷史
      if (onCharacterView && characters[index]) {
        onCharacterView(characters[index]);
      }
    }
  }, [currentIndex, onNavigate, onCharacterView, characters]);

  // 觸控事件處理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchMoveRef.current = null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // 如果水平滑動大於垂直滑動，阻止默認行為並更新偏移
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      touchMoveRef.current = { x: touch.clientX, y: touch.clientY };
      
      // 限制滑動範圍並添加阻尼效果
      const maxOffset = 150;
      const dampedOffset = deltaX > 0 
        ? Math.min(deltaX * 0.5, maxOffset)
        : Math.max(deltaX * 0.5, -maxOffset);
      
      // 邊界阻尼：如果已經是第一個/最後一個，減少偏移
      if ((currentIndex === 0 && deltaX > 0) || 
          (currentIndex === characters.length - 1 && deltaX < 0)) {
        setSwipeOffset(dampedOffset * 0.3);
      } else {
        setSwipeOffset(dampedOffset);
      }
    }
  }, [currentIndex, characters.length]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      setSwipeOffset(0);
      setIsSwiping(false);
      touchStartRef.current = null;
      return;
    }
    
    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // 滑動閾值：距離超過 50px 或速度超過 0.3px/ms
    const threshold = 50;
    const velocityThreshold = 0.3;
    
    if (Math.abs(deltaX) > threshold || velocity > velocityThreshold) {
      if (deltaX > 0 && currentIndex > 0) {
        handlePrev();
      } else if (deltaX < 0 && currentIndex < characters.length - 1) {
        handleNext();
      }
    }
    
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartRef.current = null;
    touchMoveRef.current = null;
  }, [currentIndex, characters.length, handlePrev, handleNext]);

  // 滾動當前縮圖到可視區域
  useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const thumbnails = thumbnailsRef.current.querySelectorAll('[data-thumbnail]');
      const currentThumbnail = thumbnails[currentIndex] as HTMLElement;
      if (currentThumbnail) {
        currentThumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex, showThumbnails]);

  // 鍵盤導航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
      if (e.key === 'g' || e.key === 'G') setShowThumbnails(prev => !prev);
      if (e.key === 'i' || e.key === 'I') setShowInfoPanel(prev => !prev);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!currentChar) return null;

  const config = ELEMENT_CONFIG[currentChar.element as ElementType];
  const ElementIcon = config?.icon || Sparkles;
  const charType = getCharType(currentChar);
  const isFav = isFavorite?.(currentChar.id, charType);
  const hasFullbody = !!getFullbodyAvatar(currentChar);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-7xl w-[98vw] h-[95vh] p-0 overflow-hidden bg-transparent border-0"
        onPointerDownOutside={onClose}
      >
        <div className={`relative w-full h-full bg-gradient-to-br ${config?.gradient || 'from-stone-800 to-stone-950'} rounded-lg overflow-hidden flex flex-col`}>
          {/* 背景裝飾 */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: config?.color }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: config?.color }} />
          </div>

          {/* 頂部工具列 */}
          <div className="relative z-50 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Badge 
                className="gap-1"
                style={{ 
                  backgroundColor: `${config?.color}30`,
                  color: config?.color,
                  borderColor: config?.color
                }}
              >
                <ElementIcon className="w-3 h-3" />
                {currentChar.element}
              </Badge>
              <span className="text-white font-medium">{currentChar.id}</span>
              <span className="text-white/60">{currentChar.title}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                title="切換資訊面板 (I)"
              >
                {showInfoPanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                title="切換縮圖列 (G)"
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              {isLoggedIn && onFavoriteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onFavoriteClick(currentChar)}
                  className={`rounded-full ${isFav ? 'text-red-500' : 'text-white/50 hover:text-red-400'}`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 主要內容區 */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
            {/* 導航按鈕 */}
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}
            {currentIndex < characters.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className={`absolute top-1/2 -translate-y-1/2 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 transition-all duration-300 ${
                  showInfoPanel ? 'right-4 lg:right-[calc(24rem+1rem)]' : 'right-4'
                }`}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* 圖像區 - 支援觸控滑動 */}
            <div 
              ref={imageContainerRef}
              className="flex-1 flex items-center justify-center p-2 lg:p-4 relative min-h-0 touch-pan-y overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChar.id}
                  initial={{ opacity: 0, scale: 0.95, x: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: isSwiping ? swipeOffset : 0 
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: isSwiping ? 0 : 0.25,
                    x: { duration: isSwiping ? 0 : 0.2, ease: 'easeOut' }
                  }}
                  className="relative h-full w-full flex items-center justify-center select-none"
                >
                  {/* Loading 骨架 */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-64 h-96 rounded-2xl animate-pulse"
                        style={{ backgroundColor: `${config?.color}30` }}
                      />
                    </div>
                  )}
                  
                  <img
                    src={displayImage}
                    alt={currentChar.title}
                    onLoad={() => setImageLoaded(true)}
                    draggable={false}
                    className={`object-contain drop-shadow-2xl transition-opacity duration-300 pointer-events-none ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${hasFullbody ? 'max-h-[85vh] lg:max-h-[90vh] w-auto rounded-2xl' : 'max-h-[50vh] rounded-full max-w-[300px]'}`}
                    style={{
                      filter: hasFullbody ? 'none' : `drop-shadow(0 0 30px ${config?.color}50)`,
                    }}
                  />
                  
                  {/* 全身圖標籤 */}
                  {hasFullbody && (
                    <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white/80 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      全身動態
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* 滑動提示 - 僅在移動端顯示 */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs flex items-center gap-2 lg:hidden">
                <ChevronLeft className="w-4 h-4" />
                <span>左右滑動切換</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 資訊區 - 可收合 */}
            <AnimatePresence>
              {showInfoPanel && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="lg:w-96 p-4 lg:p-6 bg-black/40 backdrop-blur-md overflow-y-auto overflow-x-hidden"
                >
                  <motion.div
                    key={`info-${currentChar.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 min-w-[280px] lg:min-w-[340px]"
                  >
                    {/* 頭部 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-white/70 border-white/20">
                          {'gan' in currentChar ? '天干主將' : '地支軍師'}
                        </Badge>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-white">
                        {currentChar.id}
                      </h2>
                      <p className="text-lg text-white/80">{currentChar.title}</p>
                    </div>

                    {/* 描述 */}
                    <p className="text-sm text-white/70 leading-relaxed">
                      {currentChar.description}
                    </p>

                    {/* 性格特質 */}
                    <div>
                      <h3 className="text-xs font-medium text-white/50 mb-2">性格特質</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentChar.personality.map((trait, idx) => (
                          <Badge 
                            key={idx}
                            variant="secondary"
                            className="bg-white/10 text-white/80 border-0 text-xs"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Buff/Debuff */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <h3 className="text-xs font-medium text-green-400/80 mb-1">增益效果</h3>
                        <div className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0">✦</span>
                          <span>{currentChar.buff}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <h3 className="text-xs font-medium text-red-400/80 mb-1">減益效果</h3>
                        <div className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-red-400 flex-shrink-0">✧</span>
                          <span>{currentChar.debuff}</span>
                        </div>
                      </div>
                    </div>

                    {/* 頁碼 */}
                    <div className="text-center text-white/40 text-xs pt-2 border-t border-white/10">
                      {currentIndex + 1} / {characters.length}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 縮圖預覽列 */}
          <AnimatePresence>
            {showThumbnails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-40 bg-black/50 backdrop-blur-sm border-t border-white/10"
              >
                <ScrollArea className="w-full" ref={thumbnailsRef}>
                  <div className="flex gap-2 p-3">
                    {characters.map((char, idx) => {
                      const charConfig = ELEMENT_CONFIG[char.element as ElementType];
                      const isActive = idx === currentIndex;
                      const thumbnail = getFullbodyAvatar(char) || getAvatarSrc(char);
                      
                      return (
                        <motion.button
                          key={char.id}
                          data-thumbnail
                          onClick={() => handleThumbnailClick(idx)}
                          className={`relative flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                            isActive 
                              ? 'ring-2 ring-offset-2 ring-offset-black/50 scale-110' 
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ 
                            ['--tw-ring-color' as string]: isActive ? charConfig?.color : undefined,
                          }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={thumbnail}
                            alt={char.title}
                            className="w-full h-full object-cover"
                          />
                          {/* 五行標識 */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{ backgroundColor: charConfig?.color }}
                          />
                          {/* 當前指示器 */}
                          {isActive && (
                            <motion.div
                              layoutId="activeThumbnail"
                              className="absolute inset-0 border-2 rounded-lg pointer-events-none"
                              style={{ borderColor: charConfig?.color }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
