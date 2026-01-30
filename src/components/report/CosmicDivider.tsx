import { cn } from "@/lib/utils";

interface CosmicDividerProps {
  variant?: 'simple' | 'decorative' | 'compass';
  className?: string;
}

/**
 * Cosmic Architect 風格的分隔線
 */
export const CosmicDivider = ({
  variant = 'decorative',
  className,
}: CosmicDividerProps) => {
  if (variant === 'simple') {
    return (
      <div className={cn(
        "my-6 h-px bg-gradient-to-r from-transparent via-cosmic-gold/30 to-transparent",
        className
      )} />
    );
  }

  if (variant === 'compass') {
    return (
      <div className={cn("relative my-10 flex items-center justify-center", className)}>
        {/* 左側裝飾線 */}
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
        
        {/* 羅盤圖標 */}
        <div className="mx-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-cosmic-gold">
            {/* 外圈 */}
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            {/* 十字 */}
            <line x1="16" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="16" y1="20" x2="16" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="4" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            {/* 斜線 */}
            <line x1="7" y1="7" x2="11" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="21" y1="7" x2="25" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="7" y1="25" x2="11" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="21" y1="25" x2="25" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            {/* 中心點 */}
            <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.6" />
            {/* 指北針 */}
            <polygon points="16,6 18,14 16,12 14,14" fill="currentColor" opacity="0.8" />
          </svg>
        </div>
        
        {/* 右側裝飾線 */}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cosmic-gold/20 to-cosmic-gold/40" />
      </div>
    );
  }

  // decorative variant
  return (
    <div className={cn("relative my-8 flex items-center justify-center", className)}>
      {/* 左側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cosmic-gold/30" />
      
      {/* 中央圓點 */}
      <div className="mx-4 flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-cosmic-gold/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-cosmic-gold/60 ring-1 ring-cosmic-gold/20" />
        <div className="w-1 h-1 rounded-full bg-cosmic-gold/40" />
      </div>
      
      {/* 右側裝飾線 */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cosmic-gold/30" />
    </div>
  );
};

/**
 * Cosmic 風格的章節標記
 */
interface CosmicSectionMarkerProps {
  number: string | number;
  label?: string;
  className?: string;
}

export const CosmicSectionMarker = ({
  number,
  label,
  className,
}: CosmicSectionMarkerProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* 編號 */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* 外框 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40" fill="none">
          <rect x="2" y="2" width="36" height="36" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.4" />
          <rect x="6" y="6" width="28" height="28" stroke="hsl(var(--cosmic-gold))" strokeWidth="0.5" opacity="0.2" />
        </svg>
        <span className="text-lg font-bold text-cosmic-gold font-mono">
          {String(number).padStart(2, '0')}
        </span>
      </div>

      {/* 標籤和裝飾線 */}
      {label && (
        <>
          <span className="text-xs font-mono text-cosmic-gold/60 tracking-widest uppercase">
            {label}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cosmic-gold/30 to-transparent" />
        </>
      )}
    </div>
  );
};
