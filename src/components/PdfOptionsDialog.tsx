import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Users, Sparkles, Scroll, BookOpen, List } from "lucide-react";

export interface PdfOptions {
  includeCover: boolean;
  includeTableOfContents: boolean;
  includePillars: boolean;
  includeShensha: boolean;
  includeLegionDetails: boolean;
  includeYearStory: boolean;
  includeMonthStory: boolean;
  includeDayStory: boolean;
  includeHourStory: boolean;
}

interface PdfOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: PdfOptions) => void;
  isDownloading: boolean;
  hasLegionStories: {
    year: boolean;
    month: boolean;
    day: boolean;
    hour: boolean;
  };
}

const defaultOptions: PdfOptions = {
  includeCover: true,
  includeTableOfContents: true,
  includePillars: true,
  includeShensha: true,
  includeLegionDetails: true,
  includeYearStory: true,
  includeMonthStory: true,
  includeDayStory: true,
  includeHourStory: true,
};

export function PdfOptionsDialog({
  open,
  onOpenChange,
  onGenerate,
  isDownloading,
  hasLegionStories,
}: PdfOptionsDialogProps) {
  const [options, setOptions] = useState<PdfOptions>(defaultOptions);

  const handleOptionChange = (key: keyof PdfOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = () => {
    setOptions({
      includeCover: true,
      includeTableOfContents: true,
      includePillars: true,
      includeShensha: true,
      includeLegionDetails: true,
      includeYearStory: hasLegionStories.year,
      includeMonthStory: hasLegionStories.month,
      includeDayStory: hasLegionStories.day,
      includeHourStory: hasLegionStories.hour,
    });
  };

  const handleDeselectAll = () => {
    setOptions({
      includeCover: true, // 封面永遠包含
      includeTableOfContents: false,
      includePillars: false,
      includeShensha: false,
      includeLegionDetails: false,
      includeYearStory: false,
      includeMonthStory: false,
      includeDayStory: false,
      includeHourStory: false,
    });
  };

  const selectedCount = Object.values(options).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            自訂 PDF 報告內容
          </DialogTitle>
          <DialogDescription>
            選擇您想要包含在報告中的章節
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 快捷按鈕 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1"
            >
              全選
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="flex-1"
            >
              最小化
            </Button>
          </div>

          {/* 基礎章節 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">基礎章節</h4>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Checkbox
                id="cover"
                checked={options.includeCover}
                disabled
                className="opacity-50"
              />
              <Label htmlFor="cover" className="flex items-center gap-2 flex-1 cursor-not-allowed opacity-50">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>封面頁</span>
                <span className="text-xs text-muted-foreground ml-auto">(必須包含)</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="toc"
                checked={options.includeTableOfContents}
                onCheckedChange={(checked) => handleOptionChange("includeTableOfContents", checked as boolean)}
              />
              <Label htmlFor="toc" className="flex items-center gap-2 flex-1 cursor-pointer">
                <List className="h-4 w-4 text-amber-400" />
                <span>目錄頁</span>
                <span className="text-xs text-muted-foreground ml-auto">章節導覽</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="pillars"
                checked={options.includePillars}
                onCheckedChange={(checked) => handleOptionChange("includePillars", checked as boolean)}
              />
              <Label htmlFor="pillars" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Users className="h-4 w-4 text-blue-400" />
                <span>四柱詳解</span>
                <span className="text-xs text-muted-foreground ml-auto">天干地支分析</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="shensha"
                checked={options.includeShensha}
                onCheckedChange={(checked) => handleOptionChange("includeShensha", checked as boolean)}
              />
              <Label htmlFor="shensha" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>神煞分析</span>
              <span className="text-xs text-muted-foreground ml-auto">吉凶神煞解讀</span>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="legionDetails"
                checked={options.includeLegionDetails}
                onCheckedChange={(checked) => handleOptionChange("includeLegionDetails", checked as boolean)}
              />
              <Label htmlFor="legionDetails" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Users className="h-4 w-4 text-amber-400" />
                <span>軍團角色詳解</span>
                <span className="text-xs text-muted-foreground ml-auto">主將與軍師資料</span>
              </Label>
            </div>
          </div>

          {/* 軍團故事 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">軍團故事</h4>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="yearStory"
                checked={options.includeYearStory}
                disabled={!hasLegionStories.year}
                onCheckedChange={(checked) => handleOptionChange("includeYearStory", checked as boolean)}
              />
              <Label 
                htmlFor="yearStory" 
                className={`flex items-center gap-2 flex-1 ${hasLegionStories.year ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                <Scroll className="h-4 w-4 text-yellow-400" />
                <span>👑 祖源軍團故事</span>
                {!hasLegionStories.year && (
                  <span className="text-xs text-muted-foreground ml-auto">(尚未生成)</span>
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="monthStory"
                checked={options.includeMonthStory}
                disabled={!hasLegionStories.month}
                onCheckedChange={(checked) => handleOptionChange("includeMonthStory", checked as boolean)}
              />
              <Label 
                htmlFor="monthStory" 
                className={`flex items-center gap-2 flex-1 ${hasLegionStories.month ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                <Scroll className="h-4 w-4 text-green-400" />
                <span>🤝 關係軍團故事</span>
                {!hasLegionStories.month && (
                  <span className="text-xs text-muted-foreground ml-auto">(尚未生成)</span>
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="dayStory"
                checked={options.includeDayStory}
                disabled={!hasLegionStories.day}
                onCheckedChange={(checked) => handleOptionChange("includeDayStory", checked as boolean)}
              />
              <Label 
                htmlFor="dayStory" 
                className={`flex items-center gap-2 flex-1 ${hasLegionStories.day ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                <Scroll className="h-4 w-4 text-purple-400" />
                <span>⭐ 核心軍團故事</span>
                {!hasLegionStories.day && (
                  <span className="text-xs text-muted-foreground ml-auto">(尚未生成)</span>
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              <Checkbox
                id="hourStory"
                checked={options.includeHourStory}
                disabled={!hasLegionStories.hour}
                onCheckedChange={(checked) => handleOptionChange("includeHourStory", checked as boolean)}
              />
              <Label 
                htmlFor="hourStory" 
                className={`flex items-center gap-2 flex-1 ${hasLegionStories.hour ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                <Scroll className="h-4 w-4 text-orange-400" />
                <span>🚀 未來軍團故事</span>
                {!hasLegionStories.hour && (
                  <span className="text-xs text-muted-foreground ml-auto">(尚未生成)</span>
                )}
              </Label>
            </div>
          </div>

          {/* 已選擇數量 */}
          <div className="text-sm text-muted-foreground text-center pt-2 border-t border-border/50">
            已選擇 <span className="text-primary font-medium">{selectedCount}</span> 個章節
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            取消
          </Button>
          <Button
            onClick={() => onGenerate(options)}
            disabled={isDownloading || selectedCount === 0}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                生成中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                生成 PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
