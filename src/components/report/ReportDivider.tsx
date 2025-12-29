import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReportDividerProps {
  variant?: 'simple' | 'decorative' | 'gradient';
  className?: string;
}

export const ReportDivider = ({ 
  variant = 'decorative',
  className 
}: ReportDividerProps) => {
  if (variant === 'simple') {
    return (
      <div className={cn("my-6 border-t border-border/30", className)} />
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={cn("my-8", className)}>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    );
  }

  // decorative variant
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn("relative my-10 flex items-center justify-center", className)}
    >
      {/* 左側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-border" />
      
      {/* 中央圖案 */}
      <div className="mx-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <div className="w-2 h-2 rounded-full bg-primary/80 ring-2 ring-primary/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
      </div>
      
      {/* 右側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border/50 to-border" />
    </motion.div>
  );
};
