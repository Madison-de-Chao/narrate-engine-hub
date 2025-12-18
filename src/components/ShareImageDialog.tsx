import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Loader2, Copy, Check, MessageCircle, Facebook } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoHonglingyusuo from "@/assets/logo-honglingyusuo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareImageDialogProps {
  name: string;
  gender: string;
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  legionStories?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
}

// 軍團配置
const legionConfig = {
  year: { name: "祖源軍團", icon: "👑", color: "text-amber-400" },
  month: { name: "關係軍團", icon: "🤝", color: "text-emerald-400" },
  day: { name: "核心軍團", icon: "⭐", color: "text-purple-400" },
  hour: { name: "未來軍團", icon: "🚀", color: "text-orange-400" },
};

export const ShareImageDialog = ({ name, gender, pillars, nayin, legionStories }: ShareImageDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLegion, setSelectedLegion] = useState<'simple' | 'year' | 'month' | 'day' | 'hour'>('simple');
  const cardRef = useRef<HTMLDivElement>(null);

  const genderText = gender === 'male' ? '乾造' : '坤造';

  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a0f",
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      setImageUrl(dataUrl);
      toast.success("分享圖片生成成功！");
    } catch (error) {
      console.error("生成分享圖片失敗:", error);
      toast.error("生成圖片失敗，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    const suffix = selectedLegion === 'simple' ? '' : `_${legionConfig[selectedLegion].name}`;
    link.download = `${name}_八字命盤${suffix}_${new Date().toLocaleDateString("zh-TW").replace(/\//g, "")}.png`;
    link.href = imageUrl;
    link.click();
    toast.success("圖片下載成功！");
  };

  const copyImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      toast.success("圖片已複製到剪貼簿！可直接貼到 Instagram");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("複製圖片失敗:", error);
      toast.error("複製失敗，請嘗試下載圖片");
    }
  };

  const shareToLine = () => {
    const text = `✨ ${name}的八字命盤 ✨\n\n四柱：${pillars.year.stem}${pillars.year.branch} ${pillars.month.stem}${pillars.month.branch} ${pillars.day.stem}${pillars.day.branch} ${pillars.hour.stem}${pillars.hour.branch}\n\n🔮 虹靈御所 - 八字人生兵法\n你不是棋子，而是指揮官`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank', 'width=600,height=600');
    toast.success("已開啟 LINE 分享");
  };

  const shareToFacebook = () => {
    const text = `✨ ${name}的八字命盤 ✨\n\n四柱：${pillars.year.stem}${pillars.year.branch} ${pillars.month.stem}${pillars.month.branch} ${pillars.day.stem}${pillars.day.branch} ${pillars.hour.stem}${pillars.hour.branch}\n\n🔮 虹靈御所 - 八字人生兵法\n你不是棋子，而是指揮官`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
    window.open(fbUrl, '_blank', 'width=600,height=600');
    toast.success("已開啟 Facebook 分享");
  };

  const getStoryText = (story: string | undefined) => {
    if (!story) return "故事生成中...";
    return story;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          分享圖片
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            生成分享圖片
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-4 pr-4">
            {/* 選擇分享類型 */}
            <Tabs value={selectedLegion} onValueChange={(v) => setSelectedLegion(v as typeof selectedLegion)}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="simple">簡易版</TabsTrigger>
                <TabsTrigger value="year">👑年</TabsTrigger>
                <TabsTrigger value="month">🤝月</TabsTrigger>
                <TabsTrigger value="day">⭐日</TabsTrigger>
                <TabsTrigger value="hour">🚀時</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 預覽卡片 */}
            <div 
              ref={cardRef} 
              className="p-5 rounded-xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-500/30"
              style={{ width: '420px', margin: '0 auto' }}
            >
              {/* Logo */}
              <div className="flex justify-center mb-3">
                <img src={logoHonglingyusuo} alt="虹靈御所" className="h-8 object-contain" />
              </div>
              
              {/* 標題 */}
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-amber-300">八字人生兵法</h3>
                <p className="text-xs text-amber-200/60">四時軍團戰略命理系統</p>
              </div>
              
              {/* 命主資訊 */}
              <div className="text-center mb-3 py-2 border-y border-amber-500/20">
                <p className="text-xs text-amber-200/50 mb-0.5">{genderText}</p>
                <p className="text-xl font-bold text-amber-100">{name}</p>
              </div>
              
              {/* 四柱 */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {(['year', 'month', 'day', 'hour'] as const).map((pillar) => (
                  <div key={pillar} className={`text-center ${selectedLegion === pillar ? 'ring-2 ring-amber-400 rounded-lg' : ''}`}>
                    <p className="text-xs text-amber-200/50 mb-0.5">
                      {pillar === 'year' ? '年柱' : pillar === 'month' ? '月柱' : pillar === 'day' ? '日柱' : '時柱'}
                    </p>
                    <div className="bg-stone-800/50 rounded-lg p-1.5 border border-amber-500/20">
                      <p className="text-base font-bold text-amber-200">{pillars[pillar].stem}</p>
                      <p className="text-base font-bold text-amber-300">{pillars[pillar].branch}</p>
                    </div>
                    <p className="text-xs text-amber-200/40 mt-0.5">{nayin[pillar]}</p>
                  </div>
                ))}
              </div>

              {/* 軍團故事（非簡易版時顯示完整故事） */}
              {selectedLegion !== 'simple' && legionStories && (
                <div className={`p-3 rounded-lg bg-gradient-to-br from-stone-800/60 to-stone-900/60 border border-amber-500/20 mb-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{legionConfig[selectedLegion].icon}</span>
                    <span className={`font-bold ${legionConfig[selectedLegion].color}`}>
                      {legionConfig[selectedLegion].name}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/80 leading-relaxed whitespace-pre-wrap">
                    {getStoryText(legionStories[selectedLegion])}
                  </p>
                </div>
              )}
              
              {/* 底部標語 */}
              <div className="text-center pt-2 border-t border-amber-500/20">
                <p className="text-xs text-amber-200/50">你不是棋子，而是指揮官</p>
                <p className="text-xs text-amber-200/30 mt-0.5">© 虹靈御所｜超烜創意</p>
              </div>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                onClick={generateImage} 
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    生成圖片
                  </>
                )}
              </Button>
              
              {imageUrl && (
                <>
                  <Button onClick={downloadImage} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    下載
                  </Button>
                  <Button onClick={copyImage} variant="outline" className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? '已複製' : '複製'}
                  </Button>
                </>
              )}
            </div>

            {/* 社群分享按鈕 */}
            {imageUrl && (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">一鍵分享到社群</p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={shareToLine} 
                    className="gap-2 bg-[#00B900] hover:bg-[#00A000] text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    LINE
                  </Button>
                  <Button 
                    onClick={shareToFacebook} 
                    className="gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={copyImage} 
                    variant="outline"
                    className="gap-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground/60">
                  IG 分享：點擊複製圖片後，貼到 Instagram 貼文或限時動態
                </p>
              </div>
            )}
            
            {/* 生成的圖片預覽 */}
            {imageUrl && (
              <div className="mt-4 p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 text-center">生成結果預覽</p>
                <img src={imageUrl} alt="分享圖片預覽" className="w-full rounded" />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
