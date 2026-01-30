import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CosmicFrameProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'hero' | 'action';
  showCorners?: boolean;
  showStarfield?: boolean;
  showGridLines?: boolean;
  navPoint?: string;
  stardate?: string;
}

/**
 * Cosmic Architect 風格的裝飾框架
 * 參考設計：深藍星空背景 + 金色裝飾邊框 + HUD 元素
 */
export const CosmicFrame = ({
  children,
  className,
  variant = 'default',
  showCorners = true,
  showStarfield = true,
  showGridLines = false,
  navPoint,
  stardate,
}: CosmicFrameProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-cosmic-void",
        variant === 'card' && "rounded-lg border border-cosmic-gold/30",
        variant === 'hero' && "rounded-xl border-2 border-cosmic-gold/40",
        variant === 'action' && "rounded-lg border border-cosmic-accent/50 bg-cosmic-accent/10",
        className
      )}
    >
      {/* 星空背景 */}
      {showStarfield && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="stars opacity-40" />
          <div className="stars2 opacity-30" />
          <div className="stars3 opacity-20" />
          {/* 星雲效果 */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cosmic-nebula/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cosmic-nebula2/20 rounded-full blur-3xl" />
        </div>
      )}

      {/* 網格線 */}
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none cosmic-grid opacity-10" />
      )}

      {/* 四角裝飾 - SVG 風格 */}
      {showCorners && (
        <>
          <CosmicCorner position="top-left" />
          <CosmicCorner position="top-right" />
          <CosmicCorner position="bottom-left" />
          <CosmicCorner position="bottom-right" />
        </>
      )}

      {/* HUD 元素 - 頂部 */}
      {(navPoint || stardate) && (
        <div className="absolute top-2 right-3 flex items-center gap-4 text-[10px] font-mono text-cosmic-gold/60 tracking-wider pointer-events-none">
          {navPoint && <span>NAV-POINT: {navPoint}</span>}
          {stardate && <span>STARDATE {stardate}</span>}
        </div>
      )}

      {/* 內容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * 角落裝飾元件
 */
const CosmicCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <svg
      className={cn(
        "absolute w-8 h-8 pointer-events-none",
        positionClasses[position]
      )}
      viewBox="0 0 32 32"
      fill="none"
    >
      {/* 外角線 */}
      <path
        d="M0 0 L16 0 M0 0 L0 16"
        stroke="hsl(var(--cosmic-gold))"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* 內角線 */}
      <path
        d="M4 4 L12 4 M4 4 L4 12"
        stroke="hsl(var(--cosmic-gold))"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* 角點 */}
      <circle
        cx="2"
        cy="2"
        r="1.5"
        fill="hsl(var(--cosmic-gold))"
        opacity="0.5"
      />
    </svg>
  );
};

/**
 * Cosmic Architect 風格的標題區塊
 */
interface CosmicHeaderProps {
  title: string;
  subtitle?: string;
  entryNumber?: string;
  navPoint?: string;
  className?: string;
}

export const CosmicHeader = ({
  title,
  subtitle,
  entryNumber,
  navPoint,
  className,
}: CosmicHeaderProps) => {
  return (
    <div className={cn("relative py-6 px-6", className)}>
      {/* 頂部 HUD 資訊 */}
      <div className="absolute top-2 right-4 text-[10px] font-mono text-cosmic-gold/50 tracking-widest">
        {entryNumber && <span>COSMIC ARCHITECT LOG: ENTRY {entryNumber}</span>}
        {navPoint && <span className="ml-4">// {navPoint}</span>}
      </div>

      {/* 主標題 */}
      <h2 className="text-2xl md:text-3xl font-bold font-serif cosmic-title-gradient tracking-wide">
        {title}
      </h2>
      
      {/* 副標題 */}
      {subtitle && (
        <p className="mt-2 text-sm text-cosmic-text/70 tracking-wide">
          {subtitle}
        </p>
      )}

      {/* 裝飾分隔線 */}
      <div className="mt-4 h-px bg-gradient-to-r from-cosmic-gold/60 via-cosmic-gold/20 to-transparent" />
    </div>
  );
};

/**
 * Cosmic 風格的行動建議框
 */
interface CosmicActionBoxProps {
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const CosmicActionBox = ({
  title = "Action Box",
  children,
  icon,
  className,
}: CosmicActionBoxProps) => {
  return (
    <div className={cn(
      "relative p-4 rounded-lg",
      "bg-cosmic-accent/10 border border-cosmic-accent/40",
      "before:absolute before:inset-0 before:rounded-lg before:border before:border-cosmic-accent/20",
      className
    )}>
      {/* 頂部標籤 */}
      <div className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-mono text-cosmic-accent bg-cosmic-void tracking-wider">
        {title}
      </div>

      <div className="flex items-start gap-3 pt-1">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cosmic-accent/20 flex items-center justify-center text-cosmic-accent">
            {icon}
          </div>
        )}
        <div className="text-sm text-cosmic-text leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Cosmic 風格的資訊卡片
 */
interface CosmicInfoCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'info';
  className?: string;
}

export const CosmicInfoCard = ({
  title,
  children,
  icon,
  variant = 'default',
  className,
}: CosmicInfoCardProps) => {
  const variantStyles = {
    default: 'border-cosmic-gold/30 bg-cosmic-gold/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    info: 'border-cyan-500/30 bg-cyan-500/5',
  };

  const titleStyles = {
    default: 'text-cosmic-gold',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
    info: 'text-cyan-400',
  };

  return (
    <div className={cn(
      "relative p-4 rounded-lg border",
      variantStyles[variant],
      className
    )}>
      {/* 標題 */}
      <div className={cn("flex items-center gap-2 mb-3 font-semibold", titleStyles[variant])}>
        {icon}
        <span>{title}</span>
      </div>

      {/* 內容 */}
      <div className="text-sm text-cosmic-text/80 leading-relaxed">
        {children}
      </div>

      {/* 裝飾角 */}
      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-current opacity-30" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-current opacity-30" />
    </div>
  );
};
