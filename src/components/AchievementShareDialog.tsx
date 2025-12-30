import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '@/hooks/useAcademyAchievements';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Copy, Share2, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AchievementShareDialogProps {
  achievement: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AchievementShareDialog: React.FC<AchievementShareDialogProps> = ({
  achievement,
  open,
  onOpenChange
}) => {
  const { theme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);

  if (!achievement) return null;

  const colors = RARITY_COLORS[achievement.rarity];

  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setShareImageUrl(imageUrl);
    } catch (error) {
      console.error('Failed to generate share image:', error);
      toast.error('生成分享圖片失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!shareImageUrl) return;
    
    const link = document.createElement('a');
    link.download = `成就-${achievement.name}.png`;
    link.href = shareImageUrl;
    link.click();
    toast.success('圖片已下載');
  };

  const copyImage = async () => {
    if (!shareImageUrl) return;
    
    try {
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('圖片已複製到剪貼簿');
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast.error('複製圖片失敗，請嘗試下載');
    }
  };

  // 根據稀有度獲取背景樣式
  const getBgStyle = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900';
      case 'epic':
        return 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900';
      case 'rare':
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900';
      default:
        return 'bg-gradient-to-br from-gray-800 via-gray-700 to-slate-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            分享成就
          </DialogTitle>
        </DialogHeader>

        {/* 可分享的成就卡片 */}
        <div className="relative">
          <div 
            ref={cardRef}
            className={`relative rounded-2xl overflow-hidden p-6 ${getBgStyle()}`}
          >
            {/* 裝飾背景 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30 bg-white/20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-20 bg-white/10" />
              {achievement.rarity === 'legendary' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-4 right-4 opacity-20"
                  >
                    <Sparkles className="w-8 h-8 text-amber-300" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-4 left-4 opacity-20"
                  >
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </motion.div>
                </>
              )}
            </div>

            {/* 內容 */}
            <div className="relative z-10 text-center">
              {/* 頂部標籤 */}
              <div className="flex justify-center mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colors.bg} text-white`}>
                  {RARITY_LABELS[achievement.rarity]} 成就
                </div>
              </div>

              {/* 徽章 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative inline-block mb-4"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${colors.bg} shadow-2xl ${colors.glow} text-5xl mx-auto`}>
                  {achievement.icon}
                </div>
                {achievement.rarity === 'legendary' && (
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-400" />
                )}
              </motion.div>

              {/* 成就名稱 */}
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                {achievement.name}
              </h2>

              {/* 稱號 */}
              <div className="flex justify-center mb-3">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-medium">
                    {achievement.title}
                  </span>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-white/80 text-sm mb-4">
                {achievement.description}
              </p>

              {/* 品牌標記 */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/40 text-xs">
                  虹靈御所 · 八字學堂
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3 mt-4">
          {!shareImageUrl ? (
            <Button 
              onClick={generateImage}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>生成中...</>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  生成分享圖片
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={downloadImage}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                下載
              </Button>
              <Button 
                variant="outline"
                onClick={copyImage}
                className="flex-1 gap-2"
              >
                <Copy className="w-4 h-4" />
                複製
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            下載後可分享至 LINE、Facebook、Instagram 等社群平台
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
