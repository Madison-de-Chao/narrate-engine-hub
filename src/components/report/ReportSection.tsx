import { motion } from "framer-motion";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
}, ref) => {
  return (
    <motion.section
      ref={ref}
      id={`section-${id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: order * 0.1 }}
      className={cn(
        "relative scroll-mt-36 rounded-2xl overflow-hidden",
        `bg-gradient-to-br ${bgGradient}`,
        `border-2 ${borderColor}`,
        "shadow-lg",
        className
      )}
    >
      {/* 裝飾性背景元素 */}
      {decorative && (
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
      <div className="relative px-6 py-5 border-b border-border/50 bg-gradient-to-r from-muted/50 via-transparent to-muted/50">
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

        {/* 章節序號裝飾 */}
        {order > 0 && (
          <div className="absolute top-1/2 right-6 -translate-y-1/2 text-6xl font-bold text-muted/20 font-serif pointer-events-none">
            {String(order).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* 內容區域 */}
      <div className="relative p-6">
        {children}
      </div>
    </motion.section>
  );
});

ReportSection.displayName = "ReportSection";
