import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReportDividerProps {
  variant?: 'simple' | 'decorative' | 'gradient' | 'compass';
  className?: string;
}

export const ReportDivider = ({ 
  variant = 'decorative',
  className 
}: ReportDividerProps) => {
  if (variant === 'simple') {
    return (
      <div className={cn("my-6 h-px bg-gradient-to-r from-transparent via-cosmic-gold/30 to-transparent", className)} />
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={cn("my-8", className)}>
        <div className="h-px bg-gradient-to-r from-transparent via-cosmic-gold/50 to-transparent" />
      </div>
    );
  }

  if (variant === 'compass') {
    return (
      <div className={cn("relative my-10 flex items-center justify-center", className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
        <div className="mx-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-cosmic-gold">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="14" y1="4" x2="14" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            <line x1="14" y1="18" x2="14" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            <line x1="4" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            <line x1="18" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.5" />
            <polygon points="14,5 15,11 14,10 13,11" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
      </div>
    );
  }

  // decorative variant - Cosmic style
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn("relative my-10 flex items-center justify-center", className)}
    >
      {/* 左側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
      
      {/* 中央圖案 - Cosmic 風格 */}
      <div className="mx-4 flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-cosmic-gold/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-cosmic-gold/60 ring-1 ring-cosmic-gold/20" />
        <div className="w-1 h-1 rounded-full bg-cosmic-gold/40" />
      </div>
      
      {/* 右側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
    </motion.div>
  );
};
