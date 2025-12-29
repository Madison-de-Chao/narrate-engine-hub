import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Sparkles, Shield, Droplets, Mountain, Flame, TreeDeciduous, Heart, Maximize2 } from "lucide-react";
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
}

export function CharacterLightbox({
  characters,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  getAvatarSrc,
  isFavorite,
  onFavoriteClick,
  isLoggedIn = false,
}: CharacterLightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentChar = characters[currentIndex];

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
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < characters.length - 1) {
      setImageLoaded(false);
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, characters.length, onNavigate]);

  // 鍵盤導航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
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
        className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-transparent border-0"
        onPointerDownOutside={onClose}
      >
        <div className={`relative w-full h-full bg-gradient-to-br ${config?.gradient || 'from-stone-800 to-stone-950'} rounded-lg overflow-hidden`}>
          {/* 背景裝飾 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: config?.color }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: config?.color }} />
          </div>

          {/* 關閉按鈕 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>

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
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* 主要內容區 */}
          <div className="relative z-10 flex flex-col lg:flex-row h-full">
            {/* 圖像區 */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChar.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-h-full flex items-center justify-center"
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
                    className={`max-h-[70vh] w-auto object-contain drop-shadow-2xl transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${hasFullbody ? 'rounded-2xl' : 'rounded-full max-w-[300px]'}`}
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
            </div>

            {/* 資訊區 */}
            <div className="lg:w-96 p-6 lg:p-8 bg-black/40 backdrop-blur-md overflow-y-auto">
              <motion.div
                key={`info-${currentChar.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* 頭部 */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
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
                      <Badge variant="outline" className="text-white/70 border-white/20">
                        {'gan' in currentChar ? '天干主將' : '地支軍師'}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {currentChar.id}
                    </h2>
                    <p className="text-xl text-white/80">{currentChar.title}</p>
                  </div>
                  
                  {/* 收藏按鈕 */}
                  {isLoggedIn && onFavoriteClick && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFavoriteClick(currentChar)}
                      className={`rounded-full ${isFav ? 'text-red-500' : 'text-white/50 hover:text-red-400'}`}
                    >
                      <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                </div>

                {/* 描述 */}
                <p className="text-white/70 leading-relaxed">
                  {currentChar.description}
                </p>

                {/* 性格特質 */}
                <div>
                  <h3 className="text-sm font-medium text-white/50 mb-2">性格特質</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentChar.personality.map((trait, idx) => (
                      <Badge 
                        key={idx}
                        variant="secondary"
                        className="bg-white/10 text-white/80 border-0"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Buff/Debuff */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-green-400/70 mb-2">增益效果</h3>
                    <div className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-green-400 flex-shrink-0">✦</span>
                      <span>{currentChar.buff}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-400/70 mb-2">減益效果</h3>
                    <div className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-red-400 flex-shrink-0">✧</span>
                      <span>{currentChar.debuff}</span>
                    </div>
                  </div>
                </div>

                {/* 頁碼 */}
                <div className="text-center text-white/40 text-sm pt-4 border-t border-white/10">
                  {currentIndex + 1} / {characters.length}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
