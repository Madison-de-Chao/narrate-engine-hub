import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

// 五行顏色配置
export const WUXING_COLORS = {
  木: { primary: '#22C55E', secondary: '#16A34A', glow: '#4ADE80', gradient: 'from-green-500 to-emerald-600' },
  火: { primary: '#EF4444', secondary: '#DC2626', glow: '#F87171', gradient: 'from-red-500 to-orange-600' },
  土: { primary: '#F59E0B', secondary: '#D97706', glow: '#FBBF24', gradient: 'from-amber-500 to-yellow-600' },
  金: { primary: '#E5E7EB', secondary: '#9CA3AF', glow: '#F3F4F6', gradient: 'from-gray-200 to-gray-400' },
  水: { primary: '#3B82F6', secondary: '#2563EB', glow: '#60A5FA', gradient: 'from-blue-500 to-indigo-600' },
} as const;

// 天干對應五行
const GAN_TO_WUXING: Record<string, keyof typeof WUXING_COLORS> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支對應五行
const ZHI_TO_WUXING: Record<string, keyof typeof WUXING_COLORS> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 根據角色獲取五行顏色
export const getWuxingColors = (character: string, fallbackColor?: string) => {
  const wuxing = GAN_TO_WUXING[character] || ZHI_TO_WUXING[character];
  if (wuxing && WUXING_COLORS[wuxing]) {
    return WUXING_COLORS[wuxing];
  }
  // 返回預設顏色
  return {
    primary: fallbackColor || '#8B5CF6',
    secondary: fallbackColor || '#7C3AED',
    glow: fallbackColor || '#A78BFA',
    gradient: 'from-violet-500 to-purple-600',
  };
};

interface AvatarWithPreviewProps {
  src: string | undefined;
  alt: string;
  character: string;
  title?: string;
  element?: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
  onLoadError?: (error: { character: string; src: string; alt: string }) => void;
}

export const AvatarWithPreview = ({
  src,
  alt,
  character,
  title,
  element,
  accentColor,
  size = 'md',
  showPreview = true,
  onLoadError,
}: AvatarWithPreviewProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 獲取五行顏色
  const wuxingColors = getWuxingColors(character, accentColor);
  const primaryColor = accentColor || wuxingColors.primary;
  const glowColor = wuxingColors.glow;

  // 尺寸配置
  const sizeConfig = {
    sm: { container: 'w-12 h-12', text: 'text-xl', preview: 'w-48 h-48' },
    md: { container: 'w-16 h-16', text: 'text-3xl', preview: 'w-64 h-64' },
    lg: { container: 'w-20 h-20', text: 'text-4xl', preview: 'w-80 h-80' },
  }[size];

  const handlePreviewOpen = useCallback(() => {
    if (showPreview && src && !imageError) {
      setPreviewOpen(true);
    }
  }, [showPreview, src, imageError]);

  return (
    <>
      {/* 頭像容器 */}
      <motion.div 
        className={`${sizeConfig.container} rounded-lg overflow-hidden border-2 shadow-lg relative cursor-pointer group`}
        style={{ borderColor: `${primaryColor}60` }}
        onClick={handlePreviewOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 懸停光暈效果 */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 20px ${glowColor}60, inset 0 0 15px ${glowColor}30`,
          }}
        />
        
        <AnimatePresence mode="wait">
          {src && !imageError ? (
            <>
              {/* 載入骨架動畫 - 五行主題色 */}
              {imageLoading && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
                  }}
                >
                  {/* 五行脈動光暈效果 */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ 
                      background: `radial-gradient(circle at center, ${glowColor}50 0%, ${primaryColor}20 50%, transparent 70%)` 
                    }}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ 
                      duration: 1.8, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* 五行能量環 */}
                  <motion.div
                    className="absolute inset-2 rounded-lg border-2"
                    style={{ borderColor: `${glowColor}40` }}
                    animate={{ 
                      rotate: [0, 360],
                      borderColor: [`${glowColor}40`, `${primaryColor}60`, `${glowColor}40`]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {/* 掃描線動畫 - 五行主題 */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${glowColor}60, transparent)`,
                    }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* 五行符號 */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span 
                      className="text-lg font-bold"
                      style={{ color: glowColor }}
                    >
                      {element || ''}
                    </span>
                  </motion.div>
                </motion.div>
              )}
              {/* 實際頭像 */}
              <motion.img 
                key="avatar"
                src={src} 
                alt={alt}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ 
                  opacity: imageLoading ? 0 : 1, 
                  scale: imageLoading ? 1.15 : 1 
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                  // 錯誤日誌：方便未來除錯
                  console.error(`[AvatarWithPreview] 頭像載入失敗`, {
                    character,
                    src,
                    alt,
                    element,
                    timestamp: new Date().toISOString(),
                  });
                  // 回調通知父組件
                  onLoadError?.({ character, src: src || '', alt });
                }}
              />
            </>
          ) : (
            <motion.div 
              key="fallback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}25, ${primaryColor}08)`
              }}
            >
              {/* 五行背景紋理 */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${glowColor}15 0%, transparent 50%),
                               radial-gradient(circle at 70% 70%, ${primaryColor}10 0%, transparent 50%)`
                }}
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.span 
                className={`${sizeConfig.text} font-bold relative z-10`}
                style={{ color: primaryColor }}
                animate={{ 
                  textShadow: [
                    `0 0 8px ${glowColor}40`,
                    `0 0 16px ${glowColor}70`,
                    `0 0 8px ${glowColor}40`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {character}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 預覽提示 */}
        {showPreview && src && !imageError && !imageLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="text-white text-xs">點擊預覽</span>
          </motion.div>
        )}
      </motion.div>

      {/* 大圖預覽 Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* 關閉按鈕 */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 裝飾光暈 */}
            <motion.div
              className="absolute -inset-4 rounded-2xl"
              style={{
                background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* 預覽圖片 */}
            <div 
              className={`${sizeConfig.preview} rounded-xl overflow-hidden border-4 shadow-2xl relative mx-auto`}
              style={{ 
                borderColor: `${primaryColor}80`,
                boxShadow: `0 0 60px ${glowColor}40, 0 20px 40px rgba(0,0,0,0.3)`
              }}
            >
              <img 
                src={src} 
                alt={alt}
                className="w-full h-full object-cover"
              />
              
              {/* 五行標籤 */}
              {element && (
                <div 
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                  style={{ 
                    background: `${primaryColor}90`,
                    color: element === '金' ? '#1a1a24' : '#fff'
                  }}
                >
                  {element}行
                </div>
              )}
            </div>

            {/* 角色資訊 */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mt-4"
              >
                <h3 
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {character}
                </h3>
                <p className="text-sm text-muted-foreground">{title}</p>
              </motion.div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};