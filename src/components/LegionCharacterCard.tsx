import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Swords, Sparkles, TrendingUp, TrendingDown, Users } from "lucide-react";
import { getCommanderAvatar } from "@/assets/commanders";
import { getAdvisorAvatar } from "@/assets/advisors";
import type { GanCharacter, ZhiCharacter, CharacterRole, LegionMember } from "@/lib/legionTranslator/types";

// 支援所有角色類型
type CharacterType = GanCharacter | ZhiCharacter | CharacterRole;

interface LegionCharacterCardProps {
  type: 'general' | 'strategist' | 'lieutenant' | 'specialist';
  character: CharacterType;
  member?: LegionMember;
  legionColor?: string;
  index?: number;
}

// 類型守衛
function isGanCharacter(char: CharacterType): char is GanCharacter {
  return 'gan' in char;
}

function isZhiCharacter(char: CharacterType): char is ZhiCharacter {
  return 'zhi' in char;
}

export const LegionCharacterCard = ({ 
  type, 
  character, 
  member,
  legionColor,
  index = 0
}: LegionCharacterCardProps) => {
  const isGeneral = type === 'general';
  const isStrategist = type === 'strategist';
  const isLieutenant = type === 'lieutenant';
  
  // 取得角色 ID
  const characterId = isGanCharacter(character) 
    ? character.gan 
    : isZhiCharacter(character) 
      ? character.zhi 
      : character.id;
  
  // 取得角色頭像（只有主將和軍師有頭像）
  const avatarSrc = isGeneral || isLieutenant
    ? getCommanderAvatar(characterId) 
    : isStrategist 
      ? getAdvisorAvatar(characterId)
      : null;

  const accentColor = character.color || '#8B5CF6';
  
  // 根據角色類型確定標籤
  const roleLabel = {
    general: { icon: Crown, label: '天干 · 主將', subtitle: '軍團統帥' },
    strategist: { icon: Shield, label: '地支 · 軍師', subtitle: '謀略顧問' },
    lieutenant: { icon: Swords, label: '藏干 · 副將', subtitle: '隱性支援' },
    specialist: { icon: Users, label: '藏干 · 奇謀', subtitle: '特殊兵種' }
  }[type];
  
  const RoleIcon = roleLabel.icon;
  
  // 計算 buff/debuff 值
  const buffValue = member?.buffDebuffs?.[0]?.buffValue ?? character.buffValue;
  const debuffValue = member?.buffDebuffs?.[0]?.debuffValue ?? character.debuffValue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-border/50 group cursor-pointer transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10"
      style={{
        boxShadow: `inset 0 0 60px ${accentColor}15`
      }}
    >
      {/* 背景裝飾 */}
      <div className={`absolute inset-0 opacity-10 ${legionColor || ''}`} />
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" 
        style={{ background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)` }}
      />
      
      {/* 卡片頂部標籤 */}
      <div 
        className="px-4 py-2.5 border-b border-border/30"
        style={{ 
          background: `linear-gradient(to right, ${accentColor}30, ${accentColor}10)` 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RoleIcon className="w-5 h-5" style={{ color: accentColor }} />
            <span className="text-sm font-medium">{roleLabel.label}</span>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: `${accentColor}50`, color: accentColor }}
          >
            {character.element} · {character.yinYang}
          </Badge>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="p-5 relative z-10">
        {/* 角色頭像與名稱 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 頭像 */}
            {avatarSrc ? (
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden border-2 shadow-lg"
                style={{ borderColor: `${accentColor}60` }}
              >
                <img 
                  src={avatarSrc} 
                  alt={`${characterId} ${roleLabel.subtitle}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center border-2"
                style={{ 
                  borderColor: `${accentColor}60`,
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`
                }}
              >
                <span 
                  className="text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  {characterId}
                </span>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold" style={{ color: accentColor }}>
                {characterId}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {character.title}
              </p>
              {character.archetypes && character.archetypes.length > 0 && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {character.archetypes[0]}
                </p>
              )}
            </div>
          </div>
          
          {/* 能力值顯示 */}
          <div className="flex flex-col gap-1 text-right">
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{buffValue}</span>
            </div>
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>{debuffValue}</span>
            </div>
          </div>
        </div>

        {/* 角色描述 */}
        <div className="space-y-2.5 text-sm mb-4">
          <p className="text-foreground/80 leading-relaxed line-clamp-2">
            {character.description}
          </p>
          
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[4rem]">行動風格</span>
            <span className="text-foreground">{character.actionStyle}</span>
          </div>
          
          {/* 性格關鍵字 */}
          {character.personality && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {character.personality.slice(0, 4).map((trait, idx) => (
                <Badge 
                  key={idx}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                  style={{ 
                    background: `${accentColor}15`,
                    borderColor: `${accentColor}30`
                  }}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Buff/Debuff 標籤 */}
        <div className="flex gap-2 pt-4 border-t border-border/30">
          <div 
            className="flex-1 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-medium">增益效果</span>
            </div>
            <p className="text-xs text-green-300/90 leading-relaxed">
              {character.buff}
            </p>
          </div>
          <div 
            className="flex-1 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-red-400 font-medium">減益效果</span>
            </div>
            <p className="text-xs text-red-300/90 leading-relaxed">
              {character.debuff}
            </p>
          </div>
        </div>
        
        {/* 地支專屬：藏干資訊 */}
        {isZhiCharacter(character) && character.hiddenStems && (
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>藏干：</span>
              <span className="text-foreground/70">
                {character.hiddenStems.join('、')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 懸停效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {/* Hover 發光效果 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 0 40px ${accentColor}40, inset 0 0 40px ${accentColor}10`
        }}
      />
    </motion.div>
  );
};
