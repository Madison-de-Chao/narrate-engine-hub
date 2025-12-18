import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Swords, Sparkles } from "lucide-react";
import { getCommanderAvatar } from "@/assets/commanders";
import { getAdvisorAvatar } from "@/assets/advisors";

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
  characterColor?: string;
}

export const ArmyCard = ({ type, character, role, legionColor, characterColor }: ArmyCardProps) => {
  const isCommander = type === 'commander';
  const commanderRole = role as CommanderRole;
  const advisorRole = role as AdvisorRole;
  
  // 取得角色頭像
  const avatarSrc = isCommander 
    ? getCommanderAvatar(character) 
    : getAdvisorAvatar(character);

  // 使用角色專屬顏色或預設
  const accentColor = characterColor || (isCommander ? '#8B5CF6' : '#22C55E');

  return (
    <div className={`
      relative overflow-hidden rounded-xl
      bg-gradient-to-br from-card via-card/95 to-card/90
      border-2 border-border/50
      transition-all duration-500
      hover:shadow-xl hover:border-primary/30
      group
    `}
    style={{
      boxShadow: `inset 0 0 60px ${accentColor}15`
    }}
    >
      {/* 背景裝飾 */}
      <div className={`absolute inset-0 opacity-10 ${legionColor}`} />
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" 
        style={{ background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)` }}
      />
      
      {/* 卡片頂部標籤 */}
      <div 
        className="px-4 py-2 border-b border-border/30"
        style={{ 
          background: `linear-gradient(to right, ${accentColor}30, ${accentColor}10)` 
        }}
      >
        <div className="flex items-center gap-2">
          {isCommander ? (
            <Crown className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <Shield className="w-5 h-5" style={{ color: accentColor }} />
          )}
          <span className="text-sm font-medium">
            {isCommander ? '天干 · 指揮官' : '地支 · 軍師'}
          </span>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="p-5 relative z-10">
        {/* 角色頭像與名稱 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 頭像 */}
            {avatarSrc ? (
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden border-2 shadow-lg"
                style={{ borderColor: `${accentColor}60` }}
              >
                <img 
                  src={avatarSrc} 
                  alt={`${character} ${isCommander ? '指揮官' : '軍師'}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <span 
                className="text-5xl font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {character}
              </span>
            )}
            <div>
              <p className="text-2xl font-bold" style={{ color: accentColor }}>
                {character}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
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
