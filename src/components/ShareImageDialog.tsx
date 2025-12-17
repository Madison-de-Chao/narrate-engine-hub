import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import logoHonglingyusuo from "@/assets/logo-honglingyusuo.png";

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
}

export const ShareImageDialog = ({ name, gender, pillars, nayin }: ShareImageDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    link.download = `${name}_八字命盤分享_${new Date().toLocaleDateString("zh-TW").replace(/\//g, "")}.png`;
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
      toast.success("圖片已複製到剪貼簿！");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("複製圖片失敗:", error);
      toast.error("複製失敗，請嘗試下載圖片");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          分享圖片
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            生成分享圖片
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 預覽卡片 */}
          <div 
            ref={cardRef} 
            className="p-6 rounded-xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-500/30"
            style={{ width: '400px', margin: '0 auto' }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={logoHonglingyusuo} alt="虹靈御所" className="h-10 object-contain" />
            </div>
            
            {/* 標題 */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-amber-300">八字人生兵法</h3>
              <p className="text-sm text-amber-200/60">四時軍團戰略命理系統</p>
            </div>
            
            {/* 命主資訊 */}
            <div className="text-center mb-4 py-3 border-y border-amber-500/20">
              <p className="text-xs text-amber-200/50 mb-1">{genderText}</p>
              <p className="text-2xl font-bold text-amber-100">{name}</p>
            </div>
            
            {/* 四柱 */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['year', 'month', 'day', 'hour'] as const).map((pillar) => (
                <div key={pillar} className="text-center">
                  <p className="text-xs text-amber-200/50 mb-1">
                    {pillar === 'year' ? '年柱' : pillar === 'month' ? '月柱' : pillar === 'day' ? '日柱' : '時柱'}
                  </p>
                  <div className="bg-stone-800/50 rounded-lg p-2 border border-amber-500/20">
                    <p className="text-lg font-bold text-amber-200">{pillars[pillar].stem}</p>
                    <p className="text-lg font-bold text-amber-300">{pillars[pillar].branch}</p>
                  </div>
                  <p className="text-xs text-amber-200/40 mt-1">{nayin[pillar]}</p>
                </div>
              ))}
            </div>
            
            {/* 底部標語 */}
            <div className="text-center pt-3 border-t border-amber-500/20">
              <p className="text-xs text-amber-200/50">你不是棋子，而是指揮官</p>
              <p className="text-xs text-amber-200/30 mt-1">© 虹靈御所｜超烜創意</p>
            </div>
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex justify-center gap-3">
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
          
          {/* 生成的圖片預覽 */}
          {imageUrl && (
            <div className="mt-4 p-2 bg-muted rounded-lg">
              <img src={imageUrl} alt="分享圖片預覽" className="w-full rounded" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
