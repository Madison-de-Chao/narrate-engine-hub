import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Scroll, 
  Shield, 
  BarChart3, 
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Crown,
  BookOpen,
  ListTree,
  LucideIcon,
  GripVertical,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TocSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface Position {
  x: number;
  y: number;
}

interface ReportTableOfContentsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  expandedSections?: Record<string, boolean>;
  className?: string;
}

// 免費版章節
const freeSections: TocSection[] = [
  { id: 'summary', label: '基本資料', icon: LayoutDashboard, description: '核心指標總覽' },
  { id: 'bazi', label: '傳統排盤', icon: Scroll, description: '四柱干支分析' },
  { id: 'legion', label: '四時軍團', icon: Shield, description: '軍團配置與故事' },
];

// 訂閱解鎖章節
const premiumSections: TocSection[] = [
  { id: 'tenGods', label: '十神解釋', icon: Crown, description: '命局關係解讀' },
  { id: 'shensha', label: '神煞分析', icon: Sparkles, description: '吉凶星曜解讀' },
  { id: 'personality', label: '性格分析', icon: User, description: '性格特質傾向' },
  { id: 'nayin', label: '納音分析', icon: BookOpen, description: '音律五行解讀' },
  { id: 'analysis', label: '五行分析', icon: BarChart3, description: '能量分布平衡' },
];

// 合併所有目錄章節（不含計算日誌）
const tocSections: TocSection[] = [...freeSections, ...premiumSections];

// 預設位置 - 固定在左側邊緣，確保不遮擋置中內容
const DEFAULT_POSITION: Position = { x: 16, y: 0 };

// 吸附閾值（像素）
const SNAP_THRESHOLD = 60;

// 螢幕邊緣邊距
const EDGE_MARGIN = 8;

// 計算吸附位置
const calculateSnapPosition = (position: Position, containerWidth: number, containerHeight: number): Position => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // 計算四個角落和四個邊緣中點的位置
  const snapPoints = [
    // 四個角落
    { x: EDGE_MARGIN, y: -(windowHeight / 2) + containerHeight / 2 + EDGE_MARGIN }, // 左上
    { x: windowWidth - containerWidth - EDGE_MARGIN, y: -(windowHeight / 2) + containerHeight / 2 + EDGE_MARGIN }, // 右上
    { x: EDGE_MARGIN, y: (windowHeight / 2) - containerHeight / 2 - EDGE_MARGIN }, // 左下
    { x: windowWidth - containerWidth - EDGE_MARGIN, y: (windowHeight / 2) - containerHeight / 2 - EDGE_MARGIN }, // 右下
    // 四個邊緣中點
    { x: EDGE_MARGIN, y: 0 }, // 左中
    { x: windowWidth - containerWidth - EDGE_MARGIN, y: 0 }, // 右中
    { x: (windowWidth - containerWidth) / 2, y: -(windowHeight / 2) + containerHeight / 2 + EDGE_MARGIN }, // 上中
    { x: (windowWidth - containerWidth) / 2, y: (windowHeight / 2) - containerHeight / 2 - EDGE_MARGIN }, // 下中
  ];

  // 找到最近的吸附點
  let closestPoint = position;
  let minDistance = SNAP_THRESHOLD;

  for (const point of snapPoints) {
    const distance = Math.sqrt(
      Math.pow(position.x - point.x, 2) + Math.pow(position.y - point.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  }

  return closestPoint;
};

// 從 localStorage 讀取位置
const getSavedPosition = (): Position => {
  try {
    const saved = localStorage.getItem('toc-position');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved position:', e);
  }
  return DEFAULT_POSITION;
};

// 保存位置到 localStorage
const savePosition = (position: Position) => {
  try {
    localStorage.setItem('toc-position', JSON.stringify(position));
  } catch (e) {
    console.error('Failed to save position:', e);
  }
};

export const ReportTableOfContents = ({
  activeSection,
  onSectionClick,
  expandedSections,
  className
}: ReportTableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // 預設收合，減少遮擋
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [showResetButton, setShowResetButton] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 載入保存的位置
  useEffect(() => {
    const savedPosition = getSavedPosition();
    setPosition(savedPosition);
    // 如果位置不是預設位置，顯示重置按鈕
    if (savedPosition.x !== DEFAULT_POSITION.x || savedPosition.y !== DEFAULT_POSITION.y) {
      setShowResetButton(true);
    }
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    // 計算新位置
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    
    // 確保位置在視窗範圍內
    const containerWidth = isCollapsed ? 56 : 256;
    const containerHeight = 400; // 估計高度
    
    const maxX = window.innerWidth - containerWidth - EDGE_MARGIN;
    const maxY = window.innerHeight - containerHeight;
    
    const clampedPosition = {
      x: Math.max(EDGE_MARGIN, Math.min(maxX, newPosition.x)),
      y: Math.max(-window.innerHeight / 2 + 100, Math.min(maxY / 2, newPosition.y))
    };
    
    // 應用吸附邏輯
    const snappedPosition = calculateSnapPosition(clampedPosition, containerWidth, containerHeight);
    
    setPosition(snappedPosition);
    savePosition(snappedPosition);
    setShowResetButton(true);
  }, [position, isCollapsed]);

  const handleResetPosition = () => {
    setPosition(DEFAULT_POSITION);
    savePosition(DEFAULT_POSITION);
    setShowResetButton(false);
  };

  const activeIndex = tocSections.findIndex(s => s.id === activeSection);
  const progressPercent = ((activeIndex + 1) / tocSections.length) * 100;

  const handleSectionClick = (sectionId: string) => {
    if (isDragging) return; // 拖曳時不觸發點擊
    onSectionClick(sectionId);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* 拖曳約束容器 */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-30" />

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
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
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

      {/* 桌面端側邊目錄 - 支援拖曳和收合 */}
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: position.x, y: position.y }}
        animate={{ 
          opacity: 1, 
          x: position.x,
          y: position.y,
          width: isCollapsed ? 56 : 256
        }}
        transition={{ 
          duration: isDragging ? 0 : 0.3, 
          ease: "easeInOut",
          opacity: { duration: 0.3 }
        }}
        style={{ 
          position: 'fixed',
          left: 0,
          top: '50%',
          translateY: '-50%'
        }}
        className={cn(
          "hidden md:block z-40",
          "max-h-[80vh] overflow-hidden",
          isDragging && "cursor-grabbing",
          className
        )}
      >
        <div className={cn(
          "rounded-2xl bg-cosmic-deep/95 backdrop-blur-md border border-cosmic-gold/30 shadow-lg transition-all duration-300",
          isCollapsed ? "p-2" : "p-4",
          isDragging && "shadow-2xl border-cosmic-gold/60",
          "shadow-[0_0_30px_rgba(200,170,100,0.1)]"
        )}>
          {/* 拖曳手把 */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className={cn(
              "absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab",
              "hover:bg-muted/50 rounded-t-2xl transition-colors",
              isDragging && "cursor-grabbing bg-primary/10"
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* 收合/展開按鈕 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute -right-3 top-12 z-10 rounded-full w-6 h-6 p-0",
              "bg-card border border-border shadow-md hover:bg-primary hover:text-primary-foreground",
              "transition-all duration-200"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </Button>

          {/* 重置位置按鈕 */}
          <AnimatePresence>
            {showResetButton && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPosition}
                  title="重置位置"
                  className={cn(
                    "absolute -right-3 top-20 z-10 rounded-full w-6 h-6 p-0",
                    "bg-card border border-border shadow-md hover:bg-accent hover:text-accent-foreground",
                    "transition-all duration-200"
                  )}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isCollapsed ? (
              // 收合狀態 - 只顯示圖標
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-1 pt-8"
              >
                {/* 迷你進度環 */}
                <div className="relative w-10 h-10 mb-2">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={88}
                      initial={{ strokeDashoffset: 88 }}
                      animate={{ strokeDashoffset: 88 - (progressPercent * 0.88) }}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold">{Math.round(progressPercent)}%</span>
                  </div>
                </div>

                {/* 章節圖標列表 */}
                <div className="space-y-1 overflow-y-auto max-h-[calc(80vh-100px)] scrollbar-thin">
                  {tocSections.map((section, index) => {
                    const Icon = section.icon;
                    const isActive = section.id === activeSection;
                    const isPassed = index < activeIndex;

                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={section.label}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isActive && "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]",
                          isPassed && "bg-primary/20 text-primary",
                          !isActive && !isPassed && "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // 展開狀態 - 完整目錄
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-8"
              >
                {/* 頭部 */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                  <ListTree className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">報告目錄</h3>
                  <span className="ml-auto text-xs text-muted-foreground">可拖曳</span>
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
                        animate={{ strokeDashoffset: 100 - progressPercent }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                  </div>
                </div>

                {/* 章節列表 */}
                <div className="space-y-1 overflow-y-auto max-h-[calc(80vh-200px)] pr-1 scrollbar-thin">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};