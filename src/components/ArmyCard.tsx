import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Swords, Sparkles } from "lucide-react";

interface CommanderRole {
  role: string;
  image: string;
  style: string;
  weakness: string;
  buff: string;
  debuff: string;
}

interface AdvisorRole {
  role: string;
  symbol: string;
  character: string;
  hiddenStems: string;
  weakness: string;
  buff: string;
  debuff: string;
}

interface ArmyCardProps {
  type: 'commander' | 'advisor';
  character: string;
  role: CommanderRole | AdvisorRole;
  legionColor: string;
}

export const ArmyCard = ({ type, character, role, legionColor }: ArmyCardProps) => {
  const isCommander = type === 'commander';
  const commanderRole = role as CommanderRole;
  const advisorRole = role as AdvisorRole;

  return (
    <div className={`
      relative overflow-hidden rounded-xl
      bg-gradient-to-br from-card via-card/95 to-card/90
      border-2 border-border/50
      transition-all duration-500
      hover:shadow-xl hover:border-primary/30
      group
    `}>
      {/* 背景裝飾 */}
      <div className={`absolute inset-0 opacity-10 ${legionColor}`} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-2xl" />
      
      {/* 卡片頂部標籤 */}
      <div className={`
        px-4 py-2 
        ${isCommander ? 'bg-gradient-to-r from-primary/30 to-primary/10' : 'bg-gradient-to-r from-secondary/30 to-secondary/10'}
        border-b border-border/30
      `}>
        <div className="flex items-center gap-2">
          {isCommander ? (
            <Crown className="w-5 h-5 text-primary" />
          ) : (
            <Shield className="w-5 h-5 text-secondary" />
          )}
          <span className="text-sm font-medium">
            {isCommander ? '天干 · 指揮官' : '地支 · 軍師'}
          </span>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="p-5 relative z-10">
        {/* 角色名稱 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {character}
            </span>
            <div>
              <p className={`text-lg font-bold ${isCommander ? 'text-primary' : 'text-secondary'}`}>
                {isCommander ? commanderRole.role : advisorRole.role}
              </p>
            </div>
          </div>
          <Swords className="w-8 h-8 text-muted-foreground/30" />
        </div>

        {/* 角色描述 */}
        <div className="space-y-3 text-sm">
          {isCommander ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">形象</span>
                <span className="text-foreground">{commanderRole.image}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">風格</span>
                <span className="text-foreground">{commanderRole.style}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">弱點</span>
                <span className="text-amber-500">{commanderRole.weakness}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">象徵</span>
                <span className="text-foreground">{advisorRole.symbol}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">性格</span>
                <span className="text-foreground">{advisorRole.character}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[3rem]">藏干</span>
                <span className="text-foreground/80 text-xs">{advisorRole.hiddenStems}</span>
              </div>
            </>
          )}
        </div>

        {/* Buff/Debuff 標籤 */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
          <Badge 
            className={`
              flex-1 justify-center py-1.5
              bg-green-500/20 hover:bg-green-500/30 
              text-green-400 border-green-500/40
              transition-colors
            `}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {isCommander ? commanderRole.buff : advisorRole.buff}
          </Badge>
          <Badge 
            className={`
              flex-1 justify-center py-1.5
              bg-red-500/20 hover:bg-red-500/30
              text-red-400 border-red-500/40
              transition-colors
            `}
          >
            ⚠️ {isCommander ? commanderRole.debuff : advisorRole.debuff}
          </Badge>
        </div>
      </div>

      {/* 懸停效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
