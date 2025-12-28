import { useMemo } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Droplets, Mountain, Flame, TreeDeciduous,
  TrendingUp, TrendingDown, ArrowRight, ArrowLeftRight, Swords, Heart, X
} from "lucide-react";
import type { GanCharacter, ZhiCharacter } from "@/lib/legionTranslator/types";
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
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

// 五行相剋關係
const OVERCOMING_CYCLE: Record<string, string> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

type ElementType = keyof typeof ELEMENT_CONFIG;
type CharacterType = GanCharacter | ZhiCharacter;

interface CharacterCompareDialogProps {
  characters: [CharacterType | null, CharacterType | null];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveCharacter: (index: 0 | 1) => void;
}

// 獲取頭像
const getAvatarSrc = (char: CharacterType) => {
  if ('gan' in char) {
    return commanderAvatars[char.gan as keyof typeof commanderAvatars];
  }
  return advisorAvatars[char.id as keyof typeof advisorAvatars];
};

// 分析兩個角色的五行關係
const analyzeRelationship = (element1: string, element2: string) => {
  if (element1 === element2) {
    return { type: 'same', label: '同屬性', description: '五行相同，特質相近', color: 'text-blue-500' };
  }
  if (GENERATING_CYCLE[element1] === element2) {
    return { type: 'generates', label: '我生彼', description: `${element1}生${element2}，相生增益`, color: 'text-green-500' };
  }
  if (GENERATING_CYCLE[element2] === element1) {
    return { type: 'generatedBy', label: '彼生我', description: `${element2}生${element1}，相生增益`, color: 'text-green-500' };
  }
  if (OVERCOMING_CYCLE[element1] === element2) {
    return { type: 'overcomes', label: '我剋彼', description: `${element1}剋${element2}，相剋壓制`, color: 'text-orange-500' };
  }
  if (OVERCOMING_CYCLE[element2] === element1) {
    return { type: 'overcomedBy', label: '彼剋我', description: `${element2}剋${element1}，相剋壓制`, color: 'text-red-500' };
  }
  return { type: 'neutral', label: '無直接關係', description: '五行關係較遠', color: 'text-muted-foreground' };
};

export const CharacterCompareDialog = ({
  characters,
  open,
  onOpenChange,
  onRemoveCharacter,
}: CharacterCompareDialogProps) => {
  const [char1, char2] = characters;
  
  const relationship = useMemo(() => {
    if (!char1 || !char2) return null;
    return analyzeRelationship(char1.element, char2.element);
  }, [char1, char2]);

  const bothSelected = char1 && char2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowLeftRight className="w-5 h-5" />
            角色比較
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 pt-4">
            {/* 角色對比區 */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <CharacterSlot 
                character={char1} 
                label="角色 A"
                onRemove={() => onRemoveCharacter(0)}
              />
              <CharacterSlot 
                character={char2} 
                label="角色 B"
                onRemove={() => onRemoveCharacter(1)}
              />
            </div>

            {/* 五行關係 */}
            {bothSelected && relationship && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="p-4 rounded-xl bg-muted/30 border">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    五行關係分析
                  </h3>
                  
                  <div className="flex items-center justify-center gap-4 py-4">
                    <ElementBadge element={char1.element} />
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className={`w-6 h-6 ${relationship.color}`} />
                      </motion.div>
                      <Badge className={`${relationship.color} bg-transparent border`}>
                        {relationship.label}
                      </Badge>
                    </div>
                    <ElementBadge element={char2.element} />
                  </div>
                  
                  <p className="text-center text-muted-foreground">
                    {relationship.description}
                  </p>

                  {/* 關係詳細說明 */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <RelationshipCard
                      from={char1}
                      to={char2}
                      type={relationship.type === 'generates' || relationship.type === 'overcomes' ? 'active' : 'passive'}
                    />
                    <RelationshipCard
                      from={char2}
                      to={char1}
                      type={relationship.type === 'generatedBy' || relationship.type === 'overcomedBy' ? 'active' : 'passive'}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 屬性對比表 */}
            {bothSelected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold mb-3">屬性對比</h3>
                
                <div className="space-y-3">
                  {/* 基本屬性 */}
                  <CompareRow 
                    label="五行" 
                    value1={char1.element} 
                    value2={char2.element}
                    color1={ELEMENT_CONFIG[char1.element as ElementType]?.color}
                    color2={ELEMENT_CONFIG[char2.element as ElementType]?.color}
                  />
                  <CompareRow 
                    label="陰陽" 
                    value1={char1.yinYang} 
                    value2={char2.yinYang}
                  />
                  
                  <Separator />
                  
                  {/* 增益減益 */}
                  <CompareRow 
                    label="增益值" 
                    value1={`+${char1.buffValue}`} 
                    value2={`+${char2.buffValue}`}
                    highlight={char1.buffValue > char2.buffValue ? 'left' : char2.buffValue > char1.buffValue ? 'right' : 'none'}
                    icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                  />
                  <CompareRow 
                    label="減益值" 
                    value1={`${char1.debuffValue}`} 
                    value2={`${char2.debuffValue}`}
                    highlight={char1.debuffValue > char2.debuffValue ? 'left' : char2.debuffValue > char1.debuffValue ? 'right' : 'none'}
                    icon={<TrendingDown className="w-4 h-4 text-red-500" />}
                  />
                  
                  <Separator />
                  
                  {/* 增益描述 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">增益效果</div>
                      <p className="text-sm">{char1.buff}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">增益效果</div>
                      <p className="text-sm">{char2.buff}</p>
                    </div>
                  </div>
                  
                  {/* 減益描述 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">減益效果</div>
                      <p className="text-sm">{char1.debuff}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">減益效果</div>
                      <p className="text-sm">{char2.debuff}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* 性格特質 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">性格特質</div>
                      <div className="flex flex-wrap gap-1">
                        {char1.personality.map((trait, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">性格特質</div>
                      <div className="flex flex-wrap gap-1">
                        {char2.personality.map((trait, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* 行動風格 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">行動風格</div>
                      <p className="text-sm italic">「{char1.actionStyle}」</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">行動風格</div>
                      <p className="text-sm italic">「{char2.actionStyle}」</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 未選擇完整提示 */}
            {!bothSelected && (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>請選擇兩個角色進行比較</p>
                <p className="text-sm mt-2">在角色圖鑑中點擊「加入比較」按鈕</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// 角色槽位組件
interface CharacterSlotProps {
  character: CharacterType | null;
  label: string;
  onRemove: () => void;
}

const CharacterSlot = ({ character, label, onRemove }: CharacterSlotProps) => {
  if (!character) {
    return (
      <div className="h-48 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
          <span className="text-2xl">?</span>
        </div>
        <span className="text-sm">{label}</span>
        <span className="text-xs">未選擇</span>
      </div>
    );
  }

  const elementConfig = ELEMENT_CONFIG[character.element as ElementType];
  const avatarSrc = getAvatarSrc(character);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-xl border-2 overflow-hidden"
      style={{ borderColor: `${elementConfig?.color}50` }}
    >
      {/* 移除按鈕 */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/80 border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      
      {/* 頭部漸變 */}
      <div 
        className={`h-20 bg-gradient-to-br ${elementConfig?.gradient}`}
      />
      
      {/* 頭像 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div 
          className="w-20 h-20 rounded-xl border-4 border-background overflow-hidden shadow-lg"
          style={{ boxShadow: `0 0 20px ${elementConfig?.color}40` }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={character.title} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ background: `${elementConfig?.color}30` }}
            >
              <span 
                className="text-3xl font-bold"
                style={{ color: elementConfig?.color }}
              >
                {character.id}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* 角色信息 */}
      <div className="pt-14 pb-4 px-4 text-center bg-card">
        <h3 
          className="text-xl font-bold"
          style={{ color: elementConfig?.color }}
        >
          {character.id}
        </h3>
        <p className="text-sm text-muted-foreground">{character.title}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge 
            style={{ 
              background: `${elementConfig?.color}20`,
              color: elementConfig?.color,
              borderColor: elementConfig?.color
            }}
          >
            {character.element}行
          </Badge>
          <Badge variant="outline">
            {character.yinYang}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

// 五行徽章組件
const ElementBadge = ({ element }: { element: string }) => {
  const config = ELEMENT_CONFIG[element as ElementType];
  const ElementIcon = config?.icon || Sparkles;
  
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
      style={{ 
        background: `${config?.color}20`,
        border: `2px solid ${config?.color}60`
      }}
    >
      <ElementIcon className="w-6 h-6" style={{ color: config?.color }} />
      <span className="text-sm font-bold mt-1" style={{ color: config?.color }}>
        {element}
      </span>
    </motion.div>
  );
};

// 關係卡片組件
interface RelationshipCardProps {
  from: CharacterType;
  to: CharacterType;
  type: 'active' | 'passive';
}

const RelationshipCard = ({ from, to, type }: RelationshipCardProps) => {
  const fromConfig = ELEMENT_CONFIG[from.element as ElementType];
  const toConfig = ELEMENT_CONFIG[to.element as ElementType];
  
  const isGenerating = GENERATING_CYCLE[from.element] === to.element;
  const isOvercoming = OVERCOMING_CYCLE[from.element] === to.element;
  
  let relationLabel = '無直接關係';
  let relationIcon = <ArrowRight className="w-4 h-4" />;
  let bgColor = 'bg-muted/30';
  
  if (isGenerating) {
    relationLabel = `${from.element}生${to.element}`;
    relationIcon = <Heart className="w-4 h-4 text-green-500" />;
    bgColor = 'bg-green-500/10';
  } else if (isOvercoming) {
    relationLabel = `${from.element}剋${to.element}`;
    relationIcon = <Swords className="w-4 h-4 text-orange-500" />;
    bgColor = 'bg-orange-500/10';
  }
  
  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="text-lg font-bold"
          style={{ color: fromConfig?.color }}
        >
          {from.id}
        </span>
        {relationIcon}
        <span 
          className="text-lg font-bold"
          style={{ color: toConfig?.color }}
        >
          {to.id}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{relationLabel}</p>
    </div>
  );
};

// 對比行組件
interface CompareRowProps {
  label: string;
  value1: string;
  value2: string;
  color1?: string;
  color2?: string;
  highlight?: 'left' | 'right' | 'none';
  icon?: React.ReactNode;
}

const CompareRow = ({ label, value1, value2, color1, color2, highlight = 'none', icon }: CompareRowProps) => {
  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
      <div 
        className={`text-right font-medium ${highlight === 'left' ? 'text-primary' : ''}`}
        style={{ color: color1 }}
      >
        {value1}
        {highlight === 'left' && <span className="ml-1 text-xs">★</span>}
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm px-3">
        {icon}
        <span>{label}</span>
      </div>
      <div 
        className={`font-medium ${highlight === 'right' ? 'text-primary' : ''}`}
        style={{ color: color2 }}
      >
        {highlight === 'right' && <span className="mr-1 text-xs">★</span>}
        {value2}
      </div>
    </div>
  );
};
