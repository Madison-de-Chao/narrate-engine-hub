import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Shield, Zap, Droplets, Mountain, Flame, TreeDeciduous,
  TrendingUp, TrendingDown, User, Clock, Leaf, ArrowRight, Circle,
  ChevronRight, Home
} from "lucide-react";
import type { GanCharacter, ZhiCharacter } from "@/lib/legionTranslator/types";
import { GAN_CHARACTERS, ZHI_CHARACTERS } from "@/lib/legionTranslator/characterData";
import { commanderAvatars } from "@/assets/commanders";
import { advisorAvatars } from "@/assets/advisors";

// 五行配置
const ELEMENT_CONFIG = {
  木: { icon: TreeDeciduous, color: '#22C55E', gradient: 'from-green-500 to-emerald-600' },
  火: { icon: Flame, color: '#EF4444', gradient: 'from-red-500 to-orange-600' },
  土: { icon: Mountain, color: '#F59E0B', gradient: 'from-amber-500 to-yellow-600' },
  金: { icon: Sparkles, color: '#9CA3AF', gradient: 'from-gray-300 to-gray-400' },
  水: { icon: Droplets, color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
} as const;

// 五行相生關係
const GENERATING_CYCLE: Record<string, string> = {
  '木': '火', // 木生火
  '火': '土', // 火生土
  '土': '金', // 土生金
  '金': '水', // 金生水
  '水': '木', // 水生木
};

// 五行相剋關係
const OVERCOMING_CYCLE: Record<string, string> = {
  '木': '土', // 木剋土
  '土': '水', // 土剋水
  '水': '火', // 水剋火
  '火': '金', // 火剋金
  '金': '木', // 金剋木
};

// 獲取生我的元素
const getGeneratingMe = (element: string): string => {
  return Object.entries(GENERATING_CYCLE).find(([_, v]) => v === element)?.[0] || '';
};

// 獲取剋我的元素
const getOvercomingMe = (element: string): string => {
  return Object.entries(OVERCOMING_CYCLE).find(([_, v]) => v === element)?.[0] || '';
};

type ElementType = keyof typeof ELEMENT_CONFIG;

interface CharacterDetailDialogProps {
  character: GanCharacter | ZhiCharacter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarSrc?: string;
  onCharacterClick?: (char: GanCharacter | ZhiCharacter) => void;
  getAvatarSrc?: (char: GanCharacter | ZhiCharacter) => string | undefined;
}

export const CharacterDetailDialog = ({
  character,
  open,
  onOpenChange,
  avatarSrc,
  onCharacterClick,
  getAvatarSrc,
}: CharacterDetailDialogProps) => {
  // 瀏覽路徑追蹤
  const [breadcrumbs, setBreadcrumbs] = useState<(GanCharacter | ZhiCharacter)[]>([]);
  
  // 當對話框關閉時重置麵包屑
  useEffect(() => {
    if (!open) {
      setBreadcrumbs([]);
    }
  }, [open]);

  // 當角色變化時更新麵包屑
  useEffect(() => {
    if (character && open) {
      setBreadcrumbs(prev => {
        // 檢查是否已經在麵包屑中（用戶點擊返回）
        const existingIndex = prev.findIndex(c => c.id === character.id);
        if (existingIndex >= 0) {
          // 回到該位置，移除之後的所有項目
          return prev.slice(0, existingIndex + 1);
        }
        // 添加新角色到麵包屑
        return [...prev, character];
      });
    }
  }, [character, open]);

  if (!character) return null;

  const elementConfig = ELEMENT_CONFIG[character.element as ElementType];
  const ElementIcon = elementConfig?.icon || Sparkles;
  const isZhi = 'zhi' in character;

  // 計算五行關係
  const relations = useMemo(() => {
    if (!character) return null;
    const element = character.element;
    return {
      generates: GENERATING_CYCLE[element], // 我生
      generatedBy: getGeneratingMe(element), // 生我
      overcomes: OVERCOMING_CYCLE[element], // 我剋
      overcomedBy: getOvercomingMe(element), // 剋我
    };
  }, [character]);

  // 獲取相關角色
  const getRelatedCharacters = (element: string) => {
    const ganChars = Object.values(GAN_CHARACTERS).filter(c => c.element === element);
    const zhiChars = Object.values(ZHI_CHARACTERS).filter(c => c.element === element);
    return [...ganChars, ...zhiChars];
  };

  // 獲取角色頭像
  const getCharacterAvatar = (char: GanCharacter | ZhiCharacter): string | undefined => {
    if ('gan' in char) {
      return commanderAvatars[char.gan as keyof typeof commanderAvatars];
    }
    return advisorAvatars[char.id as keyof typeof advisorAvatars];
  };

  // 處理麵包屑點擊
  const handleBreadcrumbClick = (char: GanCharacter | ZhiCharacter, index: number) => {
    if (index < breadcrumbs.length - 1) {
      // 不是當前角色，導航回去
      onCharacterClick?.(char);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          {/* 麵包屑導航 */}
          {breadcrumbs.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-10 px-4 py-2 bg-background/95 backdrop-blur-sm border-b flex items-center gap-1 overflow-x-auto"
            >
              <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {breadcrumbs.map((crumb, index) => {
                const crumbConfig = ELEMENT_CONFIG[crumb.element as ElementType];
                const isLast = index === breadcrumbs.length - 1;
                const crumbAvatar = getCharacterAvatar(crumb);
                return (
                  <div key={`${crumb.id}-${index}`} className="flex items-center gap-1 flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <button
                      onClick={() => handleBreadcrumbClick(crumb, index)}
                      disabled={isLast}
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md text-xs font-medium transition-all ${
                        isLast 
                          ? 'bg-accent/50 cursor-default ring-1 ring-inset' 
                          : 'hover:bg-accent cursor-pointer hover:scale-105'
                      }`}
                      style={{ 
                        color: crumbConfig?.color,
                        ['--tw-ring-color' as string]: isLast ? `${crumbConfig?.color}40` : undefined,
                      }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ring-1"
                        style={{ 
                          background: `${crumbConfig?.color}20`,
                          ['--tw-ring-color' as string]: `${crumbConfig?.color}60`
                        }}
                      >
                        {crumbAvatar ? (
                          <img 
                            src={crumbAvatar} 
                            alt={crumb.id} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span 
                            className="w-full h-full flex items-center justify-center text-[10px] font-bold"
                            style={{ color: crumbConfig?.color }}
                          >
                            {crumb.id.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="max-w-[50px] truncate">{crumb.id}</span>
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* 頭部區域 */}
          <div 
            className={`relative h-48 bg-gradient-to-br ${elementConfig?.gradient} overflow-hidden`}
          >
            {/* 背景裝飾 */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(0,0,0,0.1) 0%, transparent 40%)`
              }}
            />
            
            {/* 頭像 */}
            <div className="absolute bottom-0 left-6 translate-y-1/2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-28 h-28 rounded-xl border-4 border-background overflow-hidden shadow-2xl"
                style={{ 
                  boxShadow: `0 0 30px ${elementConfig?.color}60`
                }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt={character.title} className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `${elementConfig?.color}30` }}
                  >
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: elementConfig?.color }}
                    >
                      {character.id}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* 標籤 */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge 
                className="backdrop-blur-sm"
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff'
                }}
              >
                <ElementIcon className="w-3 h-3 mr-1" />
                {character.element}行
              </Badge>
              <Badge 
                className="backdrop-blur-sm"
                style={{ 
                  background: character.yinYang === '陽' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,40,0.9)',
                  color: character.yinYang === '陽' ? '#1a1a24' : '#fff'
                }}
              >
                {character.yinYang}
              </Badge>
            </div>

            {/* 標題 */}
            <div className="absolute bottom-4 right-6 text-right">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                {character.id}
              </h2>
              <p className="text-white/80 text-lg">{character.title}</p>
            </div>
          </div>

          {/* 內容區域 */}
          <div className="p-6 pt-20 space-y-6">
            {/* 描述 */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground leading-relaxed"
            >
              {character.description}
            </motion.p>

            {/* 地支專屬信息 */}
            {isZhi && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-4"
              >
                {(character as ZhiCharacter).timePeriod && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>時辰：{(character as ZhiCharacter).timePeriod}</span>
                  </div>
                )}
                {(character as ZhiCharacter).season && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Leaf className="w-4 h-4" />
                    <span>季節：{(character as ZhiCharacter).season}</span>
                  </div>
                )}
              </motion.div>
            )}

            <Separator />

            {/* 性格特質 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <User className="w-5 h-5" style={{ color: elementConfig?.color }} />
                性格特質
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.personality.map((trait, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {trait}
                  </Badge>
                ))}
              </div>
              {character.actionStyle && (
                <p className="mt-3 text-sm text-muted-foreground italic">
                  「{character.actionStyle}」
                </p>
              )}
            </motion.div>

            <Separator />

            {/* 增益減益 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* 增益 */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">增益效果</span>
                  <Badge className="ml-auto bg-green-500 text-white">
                    +{character.buffValue}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{character.buff}</p>
              </div>

              {/* 減益 */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-600 dark:text-red-400">減益效果</span>
                  <Badge className="ml-auto bg-red-500 text-white">
                    {character.debuffValue}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{character.debuff}</p>
              </div>
            </motion.div>

            <Separator />

            {/* 五行關係 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Zap className="w-5 h-5" style={{ color: elementConfig?.color }} />
                五行關係
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* 我生 */}
                {relations?.generates && (
                  <RelationCard
                    type="generates"
                    fromElement={character.element}
                    toElement={relations.generates}
                    label="我生"
                    description={`${character.element}生${relations.generates}：增強 ${relations.generates}行角色`}
                  />
                )}
                
                {/* 生我 */}
                {relations?.generatedBy && (
                  <RelationCard
                    type="generatedBy"
                    fromElement={relations.generatedBy}
                    toElement={character.element}
                    label="生我"
                    description={`${relations.generatedBy}生${character.element}：獲得 ${relations.generatedBy}行增益`}
                  />
                )}
                
                {/* 我剋 */}
                {relations?.overcomes && (
                  <RelationCard
                    type="overcomes"
                    fromElement={character.element}
                    toElement={relations.overcomes}
                    label="我剋"
                    description={`${character.element}剋${relations.overcomes}：壓制 ${relations.overcomes}行角色`}
                  />
                )}
                
                {/* 剋我 */}
                {relations?.overcomedBy && (
                  <RelationCard
                    type="overcomedBy"
                    fromElement={relations.overcomedBy}
                    toElement={character.element}
                    label="剋我"
                    description={`${relations.overcomedBy}剋${character.element}：被 ${relations.overcomedBy}行壓制`}
                  />
                )}
              </div>
            </motion.div>

            {/* 藏干（地支專屬） */}
            {isZhi && (character as ZhiCharacter).hiddenStems && (
              <>
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Shield className="w-5 h-5" style={{ color: elementConfig?.color }} />
                    藏干
                  </h3>
                  <div className="flex gap-3">
                    {(character as ZhiCharacter).hiddenStems?.map((stem, i) => {
                      const ganChar = GAN_CHARACTERS[stem];
                      const stemElement = ganChar?.element as ElementType;
                      const stemConfig = ELEMENT_CONFIG[stemElement];
                      return (
                        <div 
                          key={i}
                          className="flex flex-col items-center p-3 rounded-lg border"
                          style={{ 
                            borderColor: `${stemConfig?.color}40`,
                            background: `${stemConfig?.color}10`
                          }}
                        >
                          <span 
                            className="text-2xl font-bold"
                            style={{ color: stemConfig?.color }}
                          >
                            {stem}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {ganChar?.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="mt-1 text-xs"
                            style={{ borderColor: stemConfig?.color, color: stemConfig?.color }}
                          >
                            {stemElement}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}

            {/* 原型標籤 */}
            {character.archetypes && (
              <>
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">角色原型</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.archetypes.map((archetype, i) => (
                      <Badge 
                        key={i} 
                        variant="outline"
                        style={{ borderColor: `${elementConfig?.color}60`, color: elementConfig?.color }}
                      >
                        {archetype}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            <Separator />

            {/* 相關角色推薦 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Sparkles className="w-5 h-5" style={{ color: elementConfig?.color }} />
                相關角色推薦
              </h3>
              
              <div className="space-y-4">
                {/* 相生角色 - 生我的 */}
                {relations?.generatedBy && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      增益夥伴（{relations.generatedBy}行生{character.element}行）
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getRelatedCharacters(relations.generatedBy).slice(0, 4).map((char) => (
                        <Badge 
                          key={char.id}
                          variant="outline"
                          className="cursor-pointer hover:scale-105 hover:bg-accent/50 transition-all"
                          style={{ 
                            borderColor: ELEMENT_CONFIG[relations.generatedBy as ElementType]?.color,
                            color: ELEMENT_CONFIG[relations.generatedBy as ElementType]?.color
                          }}
                          onClick={() => onCharacterClick?.(char)}
                        >
                          {char.id} {char.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 互補角色 - 我生的 */}
                {relations?.generates && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      互補夥伴（{character.element}行生{relations.generates}行）
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getRelatedCharacters(relations.generates).slice(0, 4).map((char) => (
                        <Badge 
                          key={char.id}
                          variant="outline"
                          className="cursor-pointer hover:scale-105 hover:bg-accent/50 transition-all"
                          style={{ 
                            borderColor: ELEMENT_CONFIG[relations.generates as ElementType]?.color,
                            color: ELEMENT_CONFIG[relations.generates as ElementType]?.color
                          }}
                          onClick={() => onCharacterClick?.(char)}
                        >
                          {char.id} {char.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 同行角色 */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: elementConfig?.color }} />
                    同行夥伴（{character.element}行）
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getRelatedCharacters(character.element)
                      .filter(c => c.id !== character.id)
                      .slice(0, 4)
                      .map((char) => (
                        <Badge 
                          key={char.id}
                          variant="outline"
                          className="cursor-pointer hover:scale-105 hover:bg-accent/50 transition-all"
                          style={{ 
                            borderColor: elementConfig?.color,
                            color: elementConfig?.color
                          }}
                          onClick={() => onCharacterClick?.(char)}
                        >
                          {char.id} {char.title}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// 關係卡片組件
interface RelationCardProps {
  type: 'generates' | 'generatedBy' | 'overcomes' | 'overcomedBy';
  fromElement: string;
  toElement: string;
  label: string;
  description: string;
}

const RelationCard = ({ type, fromElement, toElement, label, description }: RelationCardProps) => {
  const fromConfig = ELEMENT_CONFIG[fromElement as ElementType];
  const toConfig = ELEMENT_CONFIG[toElement as ElementType];
  const FromIcon = fromConfig?.icon || Circle;
  const ToIcon = toConfig?.icon || Circle;
  
  const isPositive = type === 'generates' || type === 'generatedBy';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg border ${
        isPositive 
          ? 'bg-green-500/5 border-green-500/20' 
          : 'bg-orange-500/5 border-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${fromConfig?.color}20` }}
        >
          <FromIcon className="w-5 h-5" style={{ color: fromConfig?.color }} />
        </div>
        <ArrowRight className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-orange-500'}`} />
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${toConfig?.color}20` }}
        >
          <ToIcon className="w-5 h-5" style={{ color: toConfig?.color }} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">{description}</p>
    </motion.div>
  );
};
