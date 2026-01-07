import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

interface ReportProgressProps {
  sections: Array<{
    id: string;
    label: string;
    completed?: boolean;
    isPremium?: boolean;
  }>;
  activeSection: string;
  onSectionClick?: (sectionId: string) => void;
  hasAccess?: boolean;
  className?: string;
}

export const ReportProgress = ({
  sections,
  activeSection,
  onSectionClick,
  hasAccess = false,
  className
}: ReportProgressProps) => {
  const activeIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <div className={cn("hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-50", className)}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative p-3 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg"
      >
        {/* 進度線 */}
        <div className="absolute left-1/2 top-6 bottom-6 -translate-x-1/2 w-0.5 bg-border/30" />
        <motion.div
          className="absolute left-1/2 top-6 -translate-x-1/2 w-0.5 bg-primary origin-top"
          initial={{ scaleY: 0 }}
          animate={{ 
            scaleY: activeIndex >= 0 ? (activeIndex + 1) / sections.length : 0 
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            height: `calc(100% - 48px)` 
          }}
        />

        {/* 進度點 */}
        <div className="relative space-y-4">
          {sections.map((section, index) => {
            const isActive = section.id === activeSection;
            const isPassed = index < activeIndex;
            const isLocked = section.isPremium && !hasAccess;
            
            return (
              <motion.button
                key={section.id}
                onClick={() => onSectionClick?.(section.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full transition-all",
                  "border-2",
                  isActive && "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.5)]",
                  isPassed && !isLocked && "border-primary/60 bg-primary/20 text-primary",
                  isLocked && "border-amber-500/50 bg-amber-500/10 text-amber-500",
                  !isActive && !isPassed && !isLocked && "border-border bg-muted/50 text-muted-foreground hover:border-primary/50"
                )}
              >
                {isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : isPassed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}

                {/* Tooltip */}
                <div className={cn(
                  "absolute right-full mr-3 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap",
                  "bg-popover border border-border shadow-md",
                  "opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity",
                  isActive && "opacity-100"
                )}>
                  {section.label}
                  {isLocked && " 🔒"}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
