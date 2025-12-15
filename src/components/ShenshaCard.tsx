import { Badge } from "@/components/ui/badge";
import { type ShenshaMatch } from "@/lib/shenshaRuleEngine";
import { Sparkles, AlertTriangle, Heart, Wand2, Crown, Gem, Star, Circle } from "lucide-react";

interface ShenshaCardProps {
  shensha: ShenshaMatch;
  showEvidence?: boolean;
}

const rarityStyles: Record<string, { 
  bg: string; 
  border: string; 
  glow: string; 
  label: string;
  icon: React.ReactNode;
  textGradient: string;
  badgeClass: string;
}> = {
  SSR: {
    bg: "bg-gradient-to-br from-amber-500/25 via-yellow-400/15 to-orange-500/25",
    border: "border-amber-400/60",
    glow: "shadow-[0_0_25px_rgba(251,191,36,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
    label: "傳說",
    icon: <Crown className="w-3.5 h-3.5" />,
    textGradient: "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent",
    badgeClass: "bg-gradient-to-r from-amber-500/40 to-yellow-500/40 border-amber-400 text-amber-200 animate-pulse"
  },
  SR: {
    bg: "bg-gradient-to-br from-violet-500/25 via-purple-400/15 to-fuchsia-500/25",
    border: "border-violet-400/60",
    glow: "shadow-[0_0_20px_rgba(167,139,250,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
    label: "史詩",
    icon: <Gem className="w-3.5 h-3.5" />,
    textGradient: "bg-gradient-to-r from-violet-300 via-purple-200 to-violet-300 bg-clip-text text-transparent",
    badgeClass: "bg-gradient-to-r from-violet-500/40 to-purple-500/40 border-violet-400 text-violet-200"
  },
  R: {
    bg: "bg-gradient-to-br from-sky-500/20 via-blue-400/10 to-cyan-500/20",
    border: "border-sky-400/50",
    glow: "shadow-[0_0_15px_rgba(56,189,248,0.25)]",
    label: "稀有",
    icon: <Star className="w-3.5 h-3.5" />,
    textGradient: "text-sky-300",
    badgeClass: "bg-sky-500/30 border-sky-400 text-sky-200"
  },
  N: {
    bg: "bg-gradient-to-br from-slate-500/15 via-gray-500/10 to-slate-600/15",
    border: "border-slate-500/40",
    glow: "",
    label: "普通",
    icon: <Circle className="w-3.5 h-3.5" />,
    textGradient: "text-slate-300",
    badgeClass: "bg-slate-500/30 border-slate-500 text-slate-300"
  }
};

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  "吉神": { 
    icon: <Sparkles className="w-4 h-4" />, 
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20"
  },
  "凶煞": { 
    icon: <AlertTriangle className="w-4 h-4" />, 
    color: "text-rose-400",
    bgColor: "bg-rose-500/20"
  },
  "桃花": { 
    icon: <Heart className="w-4 h-4 fill-current" />, 
    color: "text-pink-400",
    bgColor: "bg-pink-500/20"
  },
  "特殊": { 
    icon: <Wand2 className="w-4 h-4" />, 
    color: "text-violet-400",
    bgColor: "bg-violet-500/20"
  }
};

export const ShenshaCard = ({ shensha, showEvidence = false }: ShenshaCardProps) => {
  const style = rarityStyles[shensha.rarity] || rarityStyles.N;
  const categoryInfo = categoryConfig[shensha.category] || categoryConfig["特殊"];
  const isHighRarity = shensha.rarity === 'SSR' || shensha.rarity === 'SR';

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 
      ${style.bg} ${style.glow}
      border-2 ${style.border}
      ${shensha.rarity === 'SSR' ? 'animate-rainbow-border animate-glow-pulse' : ''}
      transition-all duration-300 ease-out
      hover:scale-[1.02] hover:-translate-y-0.5
      group
    `}>
      {/* SSR 彩虹邊框動畫 */}
      {shensha.rarity === 'SSR' && (
        <div className="absolute inset-0 rounded-xl opacity-60">
          <div className="absolute inset-[-2px] rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 animate-[spin_3s_linear_infinite] blur-sm" />
        </div>
      )}
      
      {/* 光掃效果 */}
      {isHighRarity && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}
      
      {/* 粒子裝飾（SSR） */}
      {shensha.rarity === 'SSR' && (
        <>
          <div className="absolute top-2 right-4 w-1 h-1 bg-amber-300 rounded-full animate-ping" />
          <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
        </>
      )}
      
      <div className="relative z-10">
        {/* 頂部：名稱和稀有度 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${categoryInfo.bgColor}`}>
              <span className={categoryInfo.color}>{categoryInfo.icon}</span>
            </div>
            <h4 className={`font-bold text-lg ${isHighRarity ? style.textGradient : 'text-foreground'}`}>
              {shensha.name}
            </h4>
          </div>
          <div className="flex gap-1.5">
            <Badge 
              variant="outline" 
              className={`text-xs font-semibold flex items-center gap-1 ${style.badgeClass}`}
            >
              {style.icon}
              {style.label}
            </Badge>
          </div>
        </div>

        {/* 效果描述 */}
        <p className="text-sm mb-2 text-foreground/90 leading-relaxed">{shensha.effect}</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{shensha.modernMeaning}</p>

        {/* Buff/Debuff */}
        <div className="flex flex-wrap gap-2">
          {shensha.buff && (
            <Badge className="bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border-emerald-500/50 text-xs transition-colors">
              <Sparkles className="w-3 h-3 mr-1" />
              {shensha.buff}
            </Badge>
          )}
          {shensha.debuff && (
            <Badge className="bg-rose-500/25 hover:bg-rose-500/35 text-rose-300 border-rose-500/50 text-xs transition-colors">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {shensha.debuff}
            </Badge>
          )}
        </div>

        {/* 證據鏈（可選顯示） */}
        {showEvidence && shensha.evidence && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-primary/70">📍</span>
              <span>{shensha.evidence.whyMatched}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 神煞卡片列表組件
interface ShenshaCardListProps {
  shenshaList: ShenshaMatch[];
  maxDisplay?: number;
  showEvidence?: boolean;
}

export const ShenshaCardList = ({ 
  shenshaList, 
  maxDisplay = 6, 
  showEvidence = false 
}: ShenshaCardListProps) => {
  const displayList = shenshaList.slice(0, maxDisplay);
  const remainingCount = shenshaList.length - maxDisplay;

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {displayList.map((shensha, idx) => (
          <div 
            key={`${shensha.id}-${idx}`}
            className="animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <ShenshaCard 
              shensha={shensha} 
              showEvidence={showEvidence}
            />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <p className="text-xs text-center text-muted-foreground py-2">
          還有 {remainingCount} 個神煞未顯示
        </p>
      )}
    </div>
  );
};
