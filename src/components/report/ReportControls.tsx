import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, ChevronsDownUp, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportControlsProps {
  expandedCount: number;
  totalCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  className?: string;
}

export const ReportControls = ({
  expandedCount,
  totalCount,
  onExpandAll,
  onCollapseAll,
  className
}: ReportControlsProps) => {
  const allExpanded = expandedCount === totalCount;
  const allCollapsed = expandedCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between gap-4 p-3 rounded-xl",
        "bg-card/80 backdrop-blur-md border border-border/50 shadow-md",
        className
      )}
    >
      {/* 狀態指示 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>
            已展開 <span className="font-bold text-foreground">{expandedCount}</span> / {totalCount} 章節
          </span>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          disabled={allCollapsed}
          className={cn(
            "gap-2 transition-all",
            allCollapsed && "opacity-50"
          )}
        >
          <Minimize2 className="w-4 h-4" />
          <span className="hidden sm:inline">全部收合</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          disabled={allExpanded}
          className={cn(
            "gap-2 transition-all",
            allExpanded && "opacity-50"
          )}
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">全部展開</span>
        </Button>
      </div>
    </motion.div>
  );
};
