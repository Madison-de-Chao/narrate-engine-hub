import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CosmicLegionCardProps {
  title: string;
  pillarLabel: string;
  stemBranch: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  index?: number;
}

/**
 * Cosmic Architect 風格的軍團卡片
 * 對應參考圖中的四柱軍團展示
 */
export const CosmicLegionCard = ({
  title,
  pillarLabel,
  stemBranch,
  description,
  icon,
  children,
  className,
  index = 0,
}: CosmicLegionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative group",
        "bg-cosmic-void/80 backdrop-blur-sm",
        "border border-cosmic-gold/30 rounded-lg",
        "overflow-hidden",
        className
      )}
    >
      {/* 頂部光線效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cosmic-gold/60 to-transparent" />
      
      {/* 底部光線效果 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-cosmic-gold/40 to-transparent" />

      {/* 角落裝飾 */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-cosmic-gold/40" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-cosmic-gold/40" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-cosmic-gold/40" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-cosmic-gold/40" />

      {/* 卡片內容 */}
      <div className="relative p-5">
        {/* 標題區 */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-cosmic-gold tracking-wide">
            {title}
          </h3>
          <p className="text-[10px] font-mono text-cosmic-text/50 tracking-widest mt-1">
            {pillarLabel}
          </p>
        </div>

        {/* 圖標區 */}
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* 外環 */}
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="hsl(var(--cosmic-gold))" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4" />
            </svg>
            {/* 內環 */}
            <div className="absolute inset-2 rounded-full border border-cosmic-gold/20" />
            {/* 圖標 */}
            {icon}
          </div>
        </div>

        {/* 干支顯示 */}
        <div className="text-center mb-4">
          <p className="text-2xl font-bold font-serif text-cosmic-text tracking-widest">
            {stemBranch}
          </p>
        </div>

        {/* 描述 */}
        <div className="text-center">
          <p className="text-sm text-cosmic-gold/80 leading-relaxed">
            {description}
          </p>
        </div>

        {/* 額外內容 */}
        {children && (
          <div className="mt-4 pt-4 border-t border-cosmic-gold/20">
            {children}
          </div>
        )}
      </div>

      {/* Hover 效果 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cosmic-gold/5 to-transparent" />
      </div>
    </motion.div>
  );
};

/**
 * 軍團卡片容器 - 四列佈局
 */
interface CosmicLegionGridProps {
  children: ReactNode;
  className?: string;
}

export const CosmicLegionGrid = ({
  children,
  className,
}: CosmicLegionGridProps) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * 軍團底部總結語
 */
interface CosmicLegionQuoteProps {
  quote: string;
  className?: string;
}

export const CosmicLegionQuote = ({
  quote,
  className,
}: CosmicLegionQuoteProps) => {
  return (
    <div className={cn(
      "relative mt-8 py-4 px-6 text-center",
      "border-t border-b border-cosmic-gold/20",
      className
    )}>
      <p className="text-lg font-serif text-cosmic-gold/90 tracking-wide leading-relaxed">
        「{quote}」
      </p>
    </div>
  );
};
