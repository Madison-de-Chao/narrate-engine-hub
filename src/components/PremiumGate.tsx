import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Crown, Sparkles } from "lucide-react";

interface PremiumGateProps {
  isPremium: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
  onUpgrade?: () => void;
}

export const PremiumGate = ({
  isPremium,
  children,
  title = "進階分析",
  description = "升級至收費版解鎖完整分析內容",
  onUpgrade
}: PremiumGateProps) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-stone-900/90 to-stone-950/90">
      {/* 模糊遮罩預覽 */}
      <div className="absolute inset-0 z-0">
        <div className="blur-sm opacity-30 pointer-events-none scale-95">
          {children}
        </div>
      </div>
      
      {/* 鎖定覆蓋層 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] p-8 bg-gradient-to-b from-stone-950/80 via-stone-950/95 to-stone-950/80">
        <div className="text-center space-y-6">
          {/* 皇冠圖標 */}
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-pulse bg-amber-400/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-amber-500 to-amber-700 p-4 rounded-full">
              <Crown className="h-10 w-10 text-stone-950" />
            </div>
          </div>
          
          {/* 標題 */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-amber-300 flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              {title}
            </h3>
            <p className="text-amber-100/70 max-w-md">
              {description}
            </p>
          </div>
          
          {/* 功能列表 */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 完整軍團故事
            </span>
            <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 十神深度分析
            </span>
            <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 神煞統計
            </span>
            <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 性格深度剖析
            </span>
          </div>
          
          {/* 升級按鈕 */}
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-8 py-6 text-lg shadow-lg shadow-amber-500/30"
          >
            <Crown className="mr-2 h-5 w-5" />
            升級收費版
          </Button>
          
          <p className="text-xs text-muted-foreground">
            一次付費，終身使用完整功能
          </p>
        </div>
      </div>
    </Card>
  );
};

// 簡化版的故事預覽遮罩
export const StoryPreviewGate = ({
  isPremium,
  fullStory,
  previewStory,
  onUpgrade
}: {
  isPremium: boolean;
  fullStory: string;
  previewStory: string;
  onUpgrade?: () => void;
}) => {
  if (isPremium) {
    return <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{fullStory}</p>;
  }

  return (
    <div className="relative">
      <p className="text-foreground/90 leading-relaxed">
        {previewStory}
        <span className="text-amber-400 ml-1 cursor-pointer hover:underline" onClick={onUpgrade}>
          [升級解鎖完整故事 →]
        </span>
      </p>
    </div>
  );
};
