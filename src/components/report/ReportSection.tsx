import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, ReactNode, useState } from "react";
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
}

export const ReportSection = forwardRef<HTMLDivElement, ReportSectionProps>(({
  id,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  bgGradient = "from-card via-card to-card",
  borderColor = "border-border",
  children,
  className,
  decorative = true,
  order = 0,
  collapsible = true,
  defaultExpanded = true,
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.section
      ref={ref}
      id={`section-${id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: order * 0.05 }}
      className={cn(
        "relative scroll-mt-36 rounded-2xl overflow-hidden",
        `bg-gradient-to-br ${bgGradient}`,
        `border-2 ${borderColor}`,
        "shadow-lg",
        className
      )}
    >
      {/* 裝飾性背景元素 */}
      {decorative && isExpanded && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          {/* 四角裝飾 */}
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/30 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/30 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary/30 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary/30 pointer-events-none" />
        </>
      )}

      {/* 章節標題 */}
      <button
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        disabled={!collapsible}
        className={cn(
          "relative w-full px-6 py-5 border-b border-border/50 bg-gradient-to-r from-muted/50 via-transparent to-muted/50",
          "flex items-center justify-between text-left",
          collapsible && "cursor-pointer hover:bg-muted/30 transition-colors"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-primary/20 to-primary/5",
                "border border-primary/30 shadow-lg"
              )}
            >
              <Icon className={cn("w-5 h-5", iconColor)} />
            </motion.div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 章節序號裝飾 */}
          {order > 0 && (
            <span className="text-3xl font-bold text-muted/30 font-serif hidden sm:block">
              {String(order).padStart(2, '0')}
            </span>
          )}
          
          {/* 收合按鈕 */}
          {collapsible && (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-muted/50 hover:bg-muted transition-colors"
              )}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
