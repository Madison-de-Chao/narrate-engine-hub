import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Shield, Zap, Droplets, Mountain, Flame, TreeDeciduous, Users } from "lucide-react";
import { GAN_CHARACTERS, ZHI_CHARACTERS } from "@/lib/legionTranslator/characterData";
import { CharacterDetailDialog } from "@/components/CharacterDetailDialog";
import type { GanCharacter, ZhiCharacter } from "@/lib/legionTranslator/types";
import { commanderAvatars } from "@/assets/commanders";
import { advisorAvatars } from "@/assets/advisors";

// 五行圖標和顏色映射
const ELEMENT_CONFIG = {
  木: { icon: TreeDeciduous, color: '#22C55E', bgClass: 'from-green-500/20 to-emerald-600/10' },
  火: { icon: Flame, color: '#EF4444', bgClass: 'from-red-500/20 to-orange-600/10' },
  土: { icon: Mountain, color: '#F59E0B', bgClass: 'from-amber-500/20 to-yellow-600/10' },
  金: { icon: Sparkles, color: '#9CA3AF', bgClass: 'from-gray-300/20 to-gray-400/10' },
  水: { icon: Droplets, color: '#3B82F6', bgClass: 'from-blue-500/20 to-indigo-600/10' },
} as const;

type ElementType = keyof typeof ELEMENT_CONFIG;

const CharacterGallery = () => {
  const [activeTab, setActiveTab] = useState<'gan' | 'zhi'>('gan');
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<GanCharacter | ZhiCharacter | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 獲取當前顯示的角色列表
  const characters = useMemo(() => {
    const source = activeTab === 'gan' ? Object.values(GAN_CHARACTERS) : Object.values(ZHI_CHARACTERS);
    
    return source.filter(char => {
      // 元素過濾
      if (selectedElement !== 'all' && char.element !== selectedElement) {
        return false;
      }
      // 搜索過濾
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          char.id.includes(query) ||
          char.title.toLowerCase().includes(query) ||
          char.description.toLowerCase().includes(query) ||
          char.personality.some(p => p.includes(query))
        );
      }
      return true;
    });
  }, [activeTab, selectedElement, searchQuery]);

  // 獲取頭像
  const getAvatarSrc = (char: GanCharacter | ZhiCharacter) => {
    if ('gan' in char) {
      return commanderAvatars[char.gan as keyof typeof commanderAvatars];
    }
    return advisorAvatars[char.id as keyof typeof advisorAvatars];
  };

  // 打開角色詳情
  const handleCharacterClick = (char: GanCharacter | ZhiCharacter) => {
    setSelectedCharacter(char);
    setDialogOpen(true);
  };

  // 統計數據
  const stats = useMemo(() => {
    const source = activeTab === 'gan' ? Object.values(GAN_CHARACTERS) : Object.values(ZHI_CHARACTERS);
    const elementCounts: Record<string, number> = {};
    source.forEach(char => {
      elementCounts[char.element] = (elementCounts[char.element] || 0) + 1;
    });
    return elementCounts;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            角色圖鑑
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            探索天干十主將與地支十二軍師的完整資料，了解每位角色的五行屬性、性格特質與增益減益效果
          </p>
        </motion.div>

        {/* 主選項卡 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'gan' | 'zhi')} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="gan" className="gap-2">
              <Shield className="w-4 h-4" />
              天干主將
            </TabsTrigger>
            <TabsTrigger value="zhi" className="gap-2">
              <Users className="w-4 h-4" />
              地支軍師
            </TabsTrigger>
          </TabsList>

          {/* 過濾器區域 */}
          <motion.div 
            layout
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索角色名稱、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 五行過濾 */}
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedElement === 'all' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => setSelectedElement('all')}
              >
                全部 ({Object.values(stats).reduce((a, b) => a + b, 0)})
              </Badge>
              {(Object.keys(ELEMENT_CONFIG) as ElementType[]).map(element => {
                const config = ELEMENT_CONFIG[element];
                const Icon = config.icon;
                const count = stats[element] || 0;
                if (count === 0) return null;
                
                return (
                  <Badge
                    key={element}
                    variant={selectedElement === element ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80 transition-all gap-1"
                    style={{
                      backgroundColor: selectedElement === element ? config.color : 'transparent',
                      borderColor: config.color,
                      color: selectedElement === element ? '#fff' : config.color,
                    }}
                    onClick={() => setSelectedElement(element)}
                  >
                    <Icon className="w-3 h-3" />
                    {element} ({count})
                  </Badge>
                );
              })}
            </div>
          </motion.div>

          {/* 角色網格 */}
          <TabsContent value="gan" className="mt-0">
            <CharacterGrid 
              characters={characters as GanCharacter[]} 
              getAvatarSrc={getAvatarSrc}
              onCharacterClick={handleCharacterClick}
              type="gan"
            />
          </TabsContent>
          <TabsContent value="zhi" className="mt-0">
            <CharacterGrid 
              characters={characters as ZhiCharacter[]} 
              getAvatarSrc={getAvatarSrc}
              onCharacterClick={handleCharacterClick}
              type="zhi"
            />
          </TabsContent>
        </Tabs>

        {/* 空狀態 */}
        {characters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>沒有找到符合條件的角色</p>
          </motion.div>
        )}
      </div>

      {/* 角色詳情彈窗 */}
      <CharacterDetailDialog
        character={selectedCharacter}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        avatarSrc={selectedCharacter ? getAvatarSrc(selectedCharacter) : undefined}
      />
    </div>
  );
};

// 角色卡片網格組件
interface CharacterGridProps {
  characters: (GanCharacter | ZhiCharacter)[];
  getAvatarSrc: (char: GanCharacter | ZhiCharacter) => string | undefined;
  onCharacterClick: (char: GanCharacter | ZhiCharacter) => void;
  type: 'gan' | 'zhi';
}

const CharacterGrid = ({ characters, getAvatarSrc, onCharacterClick, type }: CharacterGridProps) => {
  return (
    <motion.div 
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {characters.map((char, index) => {
          const elementConfig = ELEMENT_CONFIG[char.element as ElementType];
          const Icon = elementConfig?.icon || Sparkles;
          const avatarSrc = getAvatarSrc(char);
          
          return (
            <motion.div
              key={char.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card 
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-2"
                style={{ borderColor: `${elementConfig?.color}30` }}
                onClick={() => onCharacterClick(char)}
              >
                <CardContent className="p-0">
                  {/* 頭像區域 */}
                  <div 
                    className={`relative aspect-square overflow-hidden bg-gradient-to-br ${elementConfig?.bgClass}`}
                  >
                    {avatarSrc ? (
                      <motion.img
                        src={avatarSrc}
                        alt={char.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span 
                          className="text-5xl font-bold"
                          style={{ color: elementConfig?.color }}
                        >
                          {char.id}
                        </span>
                      </div>
                    )}
                    
                    {/* 懸停遮罩 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        查看詳情
                      </motion.span>
                    </div>

                    {/* 五行標籤 */}
                    <div 
                      className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1"
                      style={{ 
                        background: `${elementConfig?.color}90`,
                        color: char.element === '金' ? '#1a1a24' : '#fff'
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {char.element}
                    </div>

                    {/* 陰陽標籤 */}
                    <div 
                      className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                      style={{ 
                        background: char.yinYang === '陽' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,40,0.9)',
                        color: char.yinYang === '陽' ? '#1a1a24' : '#fff'
                      }}
                    >
                      {char.yinYang}
                    </div>
                  </div>

                  {/* 角色信息 */}
                  <div className="p-3 bg-card">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xl font-bold"
                        style={{ color: elementConfig?.color }}
                      >
                        {char.id}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {char.title}
                      </span>
                    </div>
                    
                    {/* 性格標籤 */}
                    <div className="flex flex-wrap gap-1">
                      {char.personality.slice(0, 2).map((trait, i) => (
                        <span 
                          key={i}
                          className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {trait}
                        </span>
                      ))}
                      {char.personality.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{char.personality.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default CharacterGallery;
