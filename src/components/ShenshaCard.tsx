import { Badge } from "@/components/ui/badge";
import { type ShenshaMatch } from "@/lib/shenshaRuleEngine";
import { Sparkles, AlertTriangle, Heart, Wand2 } from "lucide-react";

interface ShenshaCardProps {
  shensha: ShenshaMatch;
  showEvidence?: boolean;
}

const rarityStyles: Record<string, { bg: string; border: string; glow: string; label: string }> = {
  SSR: {
    bg: "bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    border: "border-yellow-500/50",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    label: "傳說"
  },
  SR: {
    bg: "bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-purple-500/20",
    border: "border-purple-500/50",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.25)]",
    label: "史詩"
  },
  R: {
    bg: "bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-500/20",
    border: "border-blue-500/50",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    label: "稀有"
  },
  N: {
    bg: "bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-slate-500/20",
    border: "border-slate-500/40",
    glow: "",
    label: "普通"
  }
};

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "吉神": { icon: <Sparkles className="w-4 h-4" />, color: "text-green-500" },
  "凶煞": { icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-500" },
  "桃花": { icon: <Heart className="w-4 h-4" />, color: "text-pink-500" },
  "特殊": { icon: <Wand2 className="w-4 h-4" />, color: "text-purple-500" }
};

export const ShenshaCard = ({ shensha, showEvidence = false }: ShenshaCardProps) => {
  const style = rarityStyles[shensha.rarity] || rarityStyles.N;
  const categoryInfo = categoryConfig[shensha.category] || categoryConfig["特殊"];

  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 
      ${style.bg} ${style.glow}
      border-2 ${style.border}
      transition-all duration-300
      hover:scale-[1.02] hover:shadow-lg
    `}>
      {/* 稀有度光效 */}
      {(shensha.rarity === 'SSR' || shensha.rarity === 'SR') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
      
      <div className="relative z-10">
        {/* 頂部：名稱和稀有度 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={categoryInfo.color}>{categoryInfo.icon}</span>
            <h4 className="font-bold text-lg">{shensha.name}</h4>
          </div>
          <div className="flex gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                shensha.rarity === 'SSR' ? 'bg-yellow-500/30 border-yellow-500 text-yellow-300' :
                shensha.rarity === 'SR' ? 'bg-purple-500/30 border-purple-500 text-purple-300' :
                shensha.rarity === 'R' ? 'bg-blue-500/30 border-blue-500 text-blue-300' :
                'bg-slate-500/30 border-slate-500 text-slate-300'
              }`}
            >
              {style.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {shensha.category}
            </Badge>
          </div>
        </div>

        {/* 效果描述 */}
        <p className="text-sm mb-2 text-foreground/90">{shensha.effect}</p>
        <p className="text-xs text-muted-foreground mb-3">{shensha.modernMeaning}</p>

        {/* Buff/Debuff */}
        <div className="flex flex-wrap gap-2 mb-2">
          {shensha.buff && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
              ✨ {shensha.buff}
            </Badge>
          )}
          {shensha.debuff && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
              ⚠️ {shensha.debuff}
            </Badge>
          )}
        </div>

        {/* 證據鏈（可選顯示） */}
        {showEvidence && shensha.evidence && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              📍 {shensha.evidence.whyMatched}
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
          <ShenshaCard 
            key={`${shensha.id}-${idx}`} 
            shensha={shensha} 
            showEvidence={showEvidence}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          還有 {remainingCount} 個神煞未顯示
        </p>
      )}
    </div>
  );
};
