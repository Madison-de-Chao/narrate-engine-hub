import { Badge } from "@/components/ui/badge";
import { type ShenshaMatch } from "@/lib/shenshaRuleEngine";
import { Sparkles, AlertTriangle, Heart, Wand2, Crown, Gem, Star, Circle } from "lucide-react";

interface ShenshaCardProps {
  shensha: ShenshaMatch;
  showEvidence?: boolean;
}

const rarityStyles: Record<string, { 
  borderColor: string;
  glowColor: string;
  label: string;
  icon: React.ReactNode;
  textColor: string;
  badgeClass: string;
}> = {
  SSR: {
    borderColor: "border-amber-400/60",
    glowColor: "rgba(251,191,36,0.4)",
    label: "傳說",
    icon: <Crown className="w-3.5 h-3.5" />,
    textColor: "text-amber-300",
    badgeClass: "bg-amber-500/20 border-amber-400 text-amber-200"
  },
  SR: {
    borderColor: "border-violet-400/60",
    glowColor: "rgba(167,139,250,0.35)",
    label: "史詩",
    icon: <Gem className="w-3.5 h-3.5" />,
    textColor: "text-violet-300",
    badgeClass: "bg-violet-500/20 border-violet-400 text-violet-200"
  },
  R: {
    borderColor: "border-sky-400/50",
    glowColor: "rgba(56,189,248,0.25)",
    label: "稀有",
    icon: <Star className="w-3.5 h-3.5" />,
    textColor: "text-sky-300",
    badgeClass: "bg-sky-500/20 border-sky-400 text-sky-200"
  },
  N: {
    borderColor: "border-slate-500/40",
    glowColor: "rgba(148,163,184,0.15)",
    label: "普通",
    icon: <Circle className="w-3.5 h-3.5" />,
    textColor: "text-slate-300",
    badgeClass: "bg-slate-500/20 border-slate-500 text-slate-300"
  }
};

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  "吉神": { 
    icon: <Sparkles className="w-4 h-4" />, 
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15"
  },
  "凶煞": { 
    icon: <AlertTriangle className="w-4 h-4" />, 
    color: "text-rose-400",
    bgColor: "bg-rose-500/15"
  },
  "桃花": { 
    icon: <Heart className="w-4 h-4 fill-current" />, 
    color: "text-pink-400",
    bgColor: "bg-pink-500/15"
  },
  "特殊": { 
    icon: <Wand2 className="w-4 h-4" />, 
    color: "text-violet-400",
    bgColor: "bg-violet-500/15"
  }
};

export const ShenshaCard = ({ shensha, showEvidence = false }: ShenshaCardProps) => {
  const style = rarityStyles[shensha.rarity] || rarityStyles.N;
  const categoryInfo = categoryConfig[shensha.category] || categoryConfig["特殊"];
  const isHighRarity = shensha.rarity === 'SSR' || shensha.rarity === 'SR';

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl p-4 
        bg-card/60 backdrop-blur-sm
        border-2 ${style.borderColor}
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        group
      `}
      style={{
        boxShadow: `0 0 0 1px transparent`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${style.glowColor}, inset 0 0 20px ${style.glowColor.replace(')', ', 0.1)')}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px transparent`;
      }}
    >
      {/* SSR 邊框動畫 */}
      {shensha.rarity === 'SSR' && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-[-50%] animate-[spin_4s_linear_infinite]"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.4), transparent, rgba(253,224,71,0.4), transparent)'
            }}
          />
          <div className="absolute inset-[2px] rounded-xl bg-card/95" />
        </div>
      )}
      
      <div className="relative z-10">
        {/* 頂部：名稱和稀有度 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${categoryInfo.bgColor}`}>
              <span className={categoryInfo.color}>{categoryInfo.icon}</span>
            </div>
            <h4 className={`font-bold text-lg ${style.textColor}`}>
              {shensha.name}
            </h4>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs font-semibold flex items-center gap-1 ${style.badgeClass}`}
          >
            {style.icon}
            {style.label}
          </Badge>
        </div>

        {/* 效果描述 */}
        <p className="text-sm mb-2 text-foreground/90 leading-relaxed">{shensha.effect}</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{shensha.modernMeaning}</p>

        {/* Buff/Debuff */}
        <div className="flex flex-wrap gap-2">
          {shensha.buff && (
            <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 text-xs transition-colors">
              <Sparkles className="w-3 h-3 mr-1" />
              {shensha.buff}
            </Badge>
          )}
          {shensha.debuff && (
            <Badge className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 text-xs transition-colors">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {shensha.debuff}
            </Badge>
          )}
        </div>

        {/* 證據鏈 */}
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
