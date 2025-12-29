import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Scroll, 
  Shield, 
  BarChart3, 
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Crown,
  BookOpen,
  ListTree,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TocSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface ReportTableOfContentsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  expandedSections?: Record<string, boolean>;
  className?: string;
}

const tocSections: TocSection[] = [
  { id: 'summary', label: '命盤總覽', icon: LayoutDashboard, description: '核心指標與運勢概覽' },
  { id: 'bazi', label: '傳統八字排盤', icon: Scroll, description: '四柱干支與藏干分析' },
  { id: 'legion', label: '四時軍團故事', icon: Shield, description: '四柱敘事與兵法智慧' },
  { id: 'tenGods', label: '十神關係分析', icon: Crown, description: '命局關係與格局' },
  { id: 'shensha', label: '神煞統計分析', icon: Sparkles, description: '吉凶神煞解讀' },
  { id: 'personality', label: '性格深度分析', icon: User, description: '性格特質與傾向' },
  { id: 'nayin', label: '納音五行詳解', icon: BookOpen, description: '音律五行解讀' },
  { id: 'analysis', label: '五行陰陽分析', icon: BarChart3, description: '能量分布與平衡' },
  { id: 'logs', label: '計算日誌', icon: FileText, description: '計算過程記錄' },
];

export const ReportTableOfContents = ({
  activeSection,
  onSectionClick,
  expandedSections,
  className
}: ReportTableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeIndex = tocSections.findIndex(s => s.id === activeSection);
  const progressPercent = ((activeIndex + 1) / tocSections.length) * 100;

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* 浮動目錄按鈕 (移動端) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 md:hidden",
          className
        )}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "rounded-full w-14 h-14 shadow-lg",
            "bg-primary hover:bg-primary/90",
            "shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
          )}
        >
          <ListTree className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* 移動端目錄面板 */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* 目錄面板 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden max-h-[70vh] overflow-y-auto rounded-t-3xl bg-card border-t border-border shadow-2xl"
            >
              {/* 頭部 */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-md p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTree className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">報告目錄</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* 進度指示器 */}
                <div className="mt-3 relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  已閱讀 {activeIndex + 1} / {tocSections.length} 章節
                </p>
              </div>

              {/* 章節列表 */}
              <div className="p-4 space-y-2">
                {tocSections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = section.id === activeSection;
                  const isPassed = index < activeIndex;
                  const isExpanded = expandedSections?.[section.id];

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all",
                        "flex items-center gap-3",
                        isActive && "bg-primary/10 border border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.2)]",
                        !isActive && isPassed && "bg-muted/50 border border-transparent",
                        !isActive && !isPassed && "bg-card border border-border/50 hover:border-primary/30"
                      )}
                    >
                      {/* 序號圓圈 */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        isActive && "bg-primary text-primary-foreground",
                        isPassed && "bg-primary/20 text-primary",
                        !isActive && !isPassed && "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>

                      {/* 內容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "w-4 h-4 shrink-0",
                            isActive && "text-primary",
                            isPassed && "text-primary/60",
                            !isActive && !isPassed && "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium truncate",
                            isActive && "text-foreground",
                            isPassed && "text-foreground/80",
                            !isActive && !isPassed && "text-muted-foreground"
                          )}>
                            {section.label}
                          </span>
                        </div>
                        {section.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {section.description}
                          </p>
                        )}
                      </div>

                      {/* 展開狀態指示 */}
                      {expandedSections && (
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isExpanded ? "bg-green-500" : "bg-muted-foreground/30"
                        )} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 桌面端側邊目錄 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40",
          "w-64 max-h-[70vh] overflow-y-auto",
          className
        )}
      >
        <div className="p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg">
          {/* 頭部 */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <ListTree className="w-5 h-5 text-primary" />
            <h3 className="font-bold">報告目錄</h3>
          </div>

          {/* 進度環 */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={100}
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progressPercent }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>

          {/* 章節列表 */}
          <div className="space-y-1">
            {tocSections.map((section, index) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              const isPassed = index < activeIndex;
              const isExpanded = expandedSections?.[section.id];

              return (
                <motion.button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "w-full p-2 rounded-lg text-left transition-all text-sm",
                    "flex items-center gap-2",
                    isActive && "bg-primary/10 text-primary font-medium",
                    isPassed && "text-muted-foreground",
                    !isActive && !isPassed && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {/* 進度指示線 */}
                  <div className={cn(
                    "w-0.5 h-4 rounded-full shrink-0",
                    isActive && "bg-primary",
                    isPassed && "bg-primary/40",
                    !isActive && !isPassed && "bg-muted"
                  )} />

                  <Icon className="w-4 h-4 shrink-0" />
                  
                  <span className="truncate flex-1">{section.label}</span>

                  {/* 展開狀態 */}
                  {expandedSections && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isExpanded ? "bg-green-500" : "bg-muted-foreground/30"
                    )} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
};
