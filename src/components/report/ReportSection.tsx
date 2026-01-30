import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown } from "lucide-react";

interface ReportSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  borderColor?: string;
  children: ReactNode;
  className?: string;
  decorative?: boolean;
  order?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** 外部控制展開狀態 */
  expanded?: boolean;
  /** 展開狀態變化回調 */
  onExpandedChange?: (expanded: boolean) => void;
  /** Cosmic Architect 風格的 NAV-POINT */
  navPoint?: string;
}

export const ReportSection = forwardRef<HTMLDivElement, ReportSectionProps>(({
  id,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  bgGradient = "from-cosmic-deep via-cosmic-void to-cosmic-deep",
  borderColor = "border-cosmic-gold/30",
  children,
  className,
  decorative = true,
  order = 0,
  collapsible = true,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  navPoint,
}, ref) => {
  // 支援受控與非受控模式
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  // 同步外部狀態
  useEffect(() => {
    if (expanded !== undefined) {
      setInternalExpanded(expanded);
    }
  }, [expanded]);

  const handleToggle = () => {
    if (!collapsible) return;
    const newState = !isExpanded;
    setInternalExpanded(newState);
    onExpandedChange?.(newState);
  };

  return (
    <motion.section
      ref={ref}
      id={`section-${id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: order * 0.05 }}
      className={cn(
        "relative scroll-mt-36 rounded-xl overflow-hidden",
        `bg-gradient-to-br ${bgGradient}`,
        `border ${borderColor}`,
        "shadow-lg",
        className
      )}
    >
      {/* 星空背景 */}
      {decorative && isExpanded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="stars opacity-30" />
          <div className="stars2 opacity-20" />
          {/* 星雲效果 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cosmic-nebula/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cosmic-nebula2/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Cosmic 四角裝飾 */}
      {decorative && (
        <>
          <svg className="absolute top-0 left-0 w-6 h-6 pointer-events-none" viewBox="0 0 24 24" fill="none">
            <path d="M0 0 L12 0 M0 0 L0 12" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.5" />
            <circle cx="2" cy="2" r="1" fill="hsl(var(--cosmic-gold))" opacity="0.4" />
          </svg>
          <svg className="absolute top-0 right-0 w-6 h-6 pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none">
            <path d="M0 0 L12 0 M0 0 L0 12" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.5" />
            <circle cx="2" cy="2" r="1" fill="hsl(var(--cosmic-gold))" opacity="0.4" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none -rotate-90" viewBox="0 0 24 24" fill="none">
            <path d="M0 0 L12 0 M0 0 L0 12" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.5" />
            <circle cx="2" cy="2" r="1" fill="hsl(var(--cosmic-gold))" opacity="0.4" />
          </svg>
          <svg className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none rotate-180" viewBox="0 0 24 24" fill="none">
            <path d="M0 0 L12 0 M0 0 L0 12" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.5" />
            <circle cx="2" cy="2" r="1" fill="hsl(var(--cosmic-gold))" opacity="0.4" />
          </svg>
        </>
      )}

      {/* NAV-POINT 標記 */}
      {navPoint && (
        <div className="absolute top-2 right-4 text-[9px] font-mono text-cosmic-gold/40 tracking-widest pointer-events-none">
          // {navPoint}
        </div>
      )}

      {/* 章節標題 - Cosmic 風格 */}
      <button
        onClick={handleToggle}
        disabled={!collapsible}
        className={cn(
          "relative w-full px-6 py-5",
          "border-b border-cosmic-gold/20",
          "bg-gradient-to-r from-cosmic-void/50 via-transparent to-cosmic-void/50",
          "flex items-center justify-between text-left",
          collapsible && "cursor-pointer hover:bg-cosmic-gold/5 transition-colors"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "bg-gradient-to-br from-cosmic-gold/20 to-cosmic-gold/5",
                "border border-cosmic-gold/30"
              )}
            >
              <Icon className={cn("w-5 h-5", iconColor)} />
            </motion.div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif cosmic-title-gradient tracking-wide">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-cosmic-text/60 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 章節序號裝飾 - Cosmic 風格 */}
          {order > 0 && (
            <div className="relative hidden sm:flex items-center justify-center w-10 h-10">
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 40 40" fill="none">
                <rect x="2" y="2" width="36" height="36" stroke="hsl(var(--cosmic-gold))" strokeWidth="0.5" />
              </svg>
              <span className="text-lg font-bold text-cosmic-gold/50 font-mono">
                {String(order).padStart(2, '0')}
              </span>
            </div>
          )}
          
          {/* 收合按鈕 */}
          {collapsible && (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-cosmic-gold/10 border border-cosmic-gold/20",
                "hover:bg-cosmic-gold/20 transition-colors"
              )}
            >
              <ChevronDown className="w-5 h-5 text-cosmic-gold/70" />
            </motion.div>
          )}
        </div>
      </button>

      {/* 內容區域 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
});

ReportSection.displayName = "ReportSection";
