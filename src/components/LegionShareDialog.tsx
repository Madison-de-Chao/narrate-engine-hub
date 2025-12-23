import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  Shield,
  Swords,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface PillarData {
  stem: string;
  branch: string;
  nayin?: string;
}

interface LegionShareDialogProps {
  name: string;
  gender: string;
  birthDate?: string;
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
  };
  wuxingScores?: Record<string, number>;
  legionStories?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  children?: React.ReactNode;
}

const WUXING_CONFIG: Record<string, { name: string; color: string; bgColor: string }> = {
  木: { name: '木', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  火: { name: '火', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  土: { name: '土', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  金: { name: '金', color: 'text-amber-200', bgColor: 'bg-amber-500/20' },
  水: { name: '水', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
};

const LEGION_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; gradient: string }> = {
  year: { 
    name: '先鋒軍團', 
    icon: <Shield className="w-4 h-4" />, 
    color: 'text-emerald-400',
    gradient: 'from-emerald-900/80 to-emerald-950/90'
  },
  month: { 
    name: '中軍主力', 
    icon: <Swords className="w-4 h-4" />, 
    color: 'text-amber-400',
    gradient: 'from-amber-900/80 to-amber-950/90'
  },
  day: { 
    name: '本命親衛', 
    icon: <Crown className="w-4 h-4" />, 
    color: 'text-rose-400',
    gradient: 'from-rose-900/80 to-rose-950/90'
  },
  hour: { 
    name: '後衛奇兵', 
    icon: <Sparkles className="w-4 h-4" />, 
    color: 'text-violet-400',
    gradient: 'from-violet-900/80 to-violet-950/90'
  },
};

const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export function LegionShareDialog({
  name,
  gender,
  birthDate,
  pillars,
  wuxingScores = {},
  legionStories = {},
  children,
}: LegionShareDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'elegant' | 'epic' | 'minimal'>('elegant');
  const previewRef = useRef<HTMLDivElement>(null);

  const dayStem = pillars.day.stem;
  const dayElement = STEM_TO_ELEMENT[dayStem] || '土';

  const generateImage = useCallback(async () => {
    if (!previewRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
      toast.success('分享圖片已生成！');
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('生成圖片失敗，請重試');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadImage = useCallback(() => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `${name}-命理軍團-${new Date().toISOString().split('T')[0]}.png`;
    link.href = generatedImage;
    link.click();
    toast.success('圖片已下載！');
  }, [generatedImage, name]);

  const copyImage = useCallback(async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('圖片已複製到剪貼簿！');
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast.error('複製失敗，請嘗試下載');
    }
  }, [generatedImage]);

  const shareToSocial = useCallback((platform: 'line' | 'facebook') => {
    const shareText = `${name}的命理軍團分析 - 四柱八字軍團解析`;
    const url = window.location.href;
    
    if (platform === 'line') {
      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    }
  }, [name]);

  const renderElegantStyle = () => (
    <div 
      ref={previewRef}
      className="w-[400px] min-h-[560px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-300">命理軍團</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
          {name}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {gender === 'male' ? '男命' : '女命'} {birthDate && `· ${birthDate}`}
        </p>
      </div>

      {/* Four Pillars */}
      <div className="relative z-10 grid grid-cols-4 gap-2 mb-6">
        {(['year', 'month', 'day', 'hour'] as const).map((key) => {
          const pillar = pillars[key];
          const config = LEGION_CONFIG[key];
          const stemElement = STEM_TO_ELEMENT[pillar.stem];
          const stemColor = WUXING_CONFIG[stemElement]?.color || 'text-white';
          
          return (
            <div key={key} className={`bg-gradient-to-b ${config.gradient} rounded-xl p-3 border border-white/10`}>
              <div className={`text-xs ${config.color} mb-2 flex items-center justify-center gap-1`}>
                {config.icon}
                <span>{key === 'year' ? '年' : key === 'month' ? '月' : key === 'day' ? '日' : '時'}</span>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stemColor}`}>{pillar.stem}</div>
                <div className="text-xl text-slate-300">{pillar.branch}</div>
              </div>
              {pillar.nayin && (
                <div className="text-xs text-center text-slate-500 mt-2 truncate">
                  {pillar.nayin}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Master */}
      <div className="relative z-10 text-center mb-6 p-4 bg-slate-800/50 rounded-xl border border-white/10">
        <div className="text-sm text-slate-400 mb-1">日主元素</div>
        <div className={`text-3xl font-bold ${WUXING_CONFIG[dayElement]?.color || 'text-white'}`}>
          {dayStem} · {dayElement}
        </div>
      </div>

      {/* Wuxing Distribution */}
      {Object.keys(wuxingScores).length > 0 && (
        <div className="relative z-10 mb-4">
          <div className="text-xs text-slate-400 mb-2 text-center">五行分布</div>
          <div className="flex justify-center gap-2">
            {Object.entries(wuxingScores).map(([element, score]) => (
              <div key={element} className={`${WUXING_CONFIG[element]?.bgColor} px-3 py-1.5 rounded-lg`}>
                <span className={`text-sm font-medium ${WUXING_CONFIG[element]?.color}`}>
                  {element} {score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 text-center pt-4 border-t border-white/10">
        <p className="text-xs text-slate-500">紅翎域所 · 命理軍團分析</p>
      </div>
    </div>
  );

  const renderEpicStyle = () => (
    <div 
      ref={previewRef}
      className="w-[400px] min-h-[600px] bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Epic background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBsMjAgMjBNMjAgMjBMMCAyME0yMCAyMEwyMCAwTTIwIDIwTDAgME0yMCAyMEw0MCAwTTIwIDIwTDQwIDQwTTIwIDIwTDAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-amber-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Dragon emblem decoration */}
      <div className="absolute top-4 left-4 right-4 flex justify-between text-amber-600/30">
        <Crown className="w-8 h-8" />
        <Crown className="w-8 h-8" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8 pt-8">
        <div className="text-sm tracking-[0.5em] text-amber-500/80 mb-2">命理軍團</div>
        <h2 className="text-3xl font-bold text-amber-100 tracking-wider">
          {name}
        </h2>
        <div className="mt-2 flex justify-center gap-4 text-sm text-amber-600">
          <span>{gender === 'male' ? '乾造' : '坤造'}</span>
          {birthDate && <span>{birthDate}</span>}
        </div>
      </div>

      {/* Four Pillars - Epic Style */}
      <div className="relative z-10 grid grid-cols-4 gap-3 mb-8">
        {(['year', 'month', 'day', 'hour'] as const).map((key) => {
          const pillar = pillars[key];
          const config = LEGION_CONFIG[key];
          const stemElement = STEM_TO_ELEMENT[pillar.stem];
          const stemColor = WUXING_CONFIG[stemElement]?.color || 'text-amber-100';
          
          return (
            <div key={key} className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-xl" />
              <div className="relative bg-stone-900/50 rounded-xl p-4 border border-amber-500/20 backdrop-blur-sm">
                <div className={`text-xs text-center mb-3 ${config.color}`}>
                  {config.name.slice(0, 2)}
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${stemColor} mb-1`}>{pillar.stem}</div>
                  <div className="text-2xl text-amber-100/80">{pillar.branch}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Master Badge */}
      <div className="relative z-10 flex justify-center mb-6">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 rounded-full border border-amber-500/30">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="text-lg font-bold text-amber-200">
            日主 {dayStem}{dayElement}
          </span>
        </div>
      </div>

      {/* Wuxing */}
      {Object.keys(wuxingScores).length > 0 && (
        <div className="relative z-10 grid grid-cols-5 gap-2 mb-6">
          {['木', '火', '土', '金', '水'].map((element) => {
            const score = wuxingScores[element] || 0;
            const config = WUXING_CONFIG[element];
            return (
              <div key={element} className="text-center">
                <div className={`text-2xl font-bold ${config?.color}`}>{element}</div>
                <div className="text-sm text-amber-100/60">{score}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 text-center pt-6 border-t border-amber-500/20">
        <p className="text-sm text-amber-600/60 tracking-wider">紅翎域所 · 命理軍團</p>
      </div>
    </div>
  );

  const renderMinimalStyle = () => (
    <div 
      ref={previewRef}
      className="w-[360px] min-h-[480px] bg-white rounded-2xl p-6 text-slate-900 relative overflow-hidden"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {gender === 'male' ? '男命' : '女命'} {birthDate && `· ${birthDate}`}
        </p>
      </div>

      {/* Four Pillars - Minimal */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(['year', 'month', 'day', 'hour'] as const).map((key) => {
          const pillar = pillars[key];
          return (
            <div key={key} className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-2">
                {key === 'year' ? '年柱' : key === 'month' ? '月柱' : key === 'day' ? '日柱' : '時柱'}
              </div>
              <div className="text-xl font-bold text-slate-800">{pillar.stem}</div>
              <div className="text-lg text-slate-600">{pillar.branch}</div>
            </div>
          );
        })}
      </div>

      {/* Day Master */}
      <div className="text-center mb-6 p-4 bg-slate-100 rounded-xl">
        <div className="text-sm text-slate-400 mb-1">日主</div>
        <div className="text-2xl font-bold text-slate-800">{dayStem} · {dayElement}</div>
      </div>

      {/* Wuxing */}
      {Object.keys(wuxingScores).length > 0 && (
        <div className="flex justify-center gap-3 mb-6">
          {Object.entries(wuxingScores).map(([element, score]) => (
            <div key={element} className="text-center">
              <div className="text-lg font-medium text-slate-700">{element}</div>
              <div className="text-sm text-slate-400">{score}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-400">紅翎域所 · 命理分析</p>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            分享圖片
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            生成分享圖片
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as typeof selectedStyle)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="elegant">典雅風格</TabsTrigger>
            <TabsTrigger value="epic">史詩風格</TabsTrigger>
            <TabsTrigger value="minimal">簡約風格</TabsTrigger>
          </TabsList>

          <div className="mt-6 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStyle}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="elegant" className="mt-0">
                  {renderElegantStyle()}
                </TabsContent>
                <TabsContent value="epic" className="mt-0">
                  {renderEpicStyle()}
                </TabsContent>
                <TabsContent value="minimal" className="mt-0">
                  {renderMinimalStyle()}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Button
            onClick={generateImage}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成圖片
              </>
            )}
          </Button>

          {generatedImage && (
            <>
              <Button variant="outline" onClick={downloadImage} className="gap-2">
                <Download className="w-4 h-4" />
                下載
              </Button>
              <Button variant="outline" onClick={copyImage} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已複製' : '複製'}
              </Button>
            </>
          )}
        </div>

        {/* Social Share */}
        {generatedImage && (
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareToSocial('line')}
              className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              分享到 LINE
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareToSocial('facebook')}
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              分享到 Facebook
            </Button>
          </div>
        )}

        {/* Preview */}
        {generatedImage && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2 text-center">預覽</p>
            <div className="flex justify-center">
              <img 
                src={generatedImage} 
                alt="Generated share image" 
                className="max-w-full rounded-lg shadow-lg"
                style={{ maxHeight: '300px' }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
