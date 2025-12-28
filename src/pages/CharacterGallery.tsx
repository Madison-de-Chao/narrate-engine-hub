import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Shield, Droplets, Mountain, Flame, TreeDeciduous, Users, ArrowLeftRight, Plus, Check, X, Heart, Star } from "lucide-react";
import { GAN_CHARACTERS, ZHI_CHARACTERS } from "@/lib/legionTranslator/characterData";
import { CharacterDetailDialog } from "@/components/CharacterDetailDialog";
import { CharacterCompareDialog } from "@/components/CharacterCompareDialog";
import { useCharacterFavorites } from "@/hooks/useCharacterFavorites";
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
type CharacterType = GanCharacter | ZhiCharacter;

const CharacterGallery = () => {
  const [activeTab, setActiveTab] = useState<'gan' | 'zhi' | 'favorites'>('gan');
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // 比較功能狀態
  const [compareMode, setCompareMode] = useState(false);
  const [compareCharacters, setCompareCharacters] = useState<[CharacterType | null, CharacterType | null]>([null, null]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  // 收藏功能
  const { favorites, loading: favoritesLoading, isLoggedIn, isFavorite, toggleFavorite, getFavoriteIds } = useCharacterFavorites();

  // 獲取當前顯示的角色列表
  const characters = useMemo(() => {
    let source: CharacterType[];
    
    if (activeTab === 'favorites') {
      // 獲取收藏的角色
      const ganFavoriteIds = getFavoriteIds('gan');
      const zhiFavoriteIds = getFavoriteIds('zhi');
      const ganFavorites = Object.values(GAN_CHARACTERS).filter(c => ganFavoriteIds.includes(c.id));
      const zhiFavorites = Object.values(ZHI_CHARACTERS).filter(c => zhiFavoriteIds.includes(c.id));
      source = [...ganFavorites, ...zhiFavorites];
    } else {
      source = activeTab === 'gan' ? Object.values(GAN_CHARACTERS) : Object.values(ZHI_CHARACTERS);
    }
    
    return source.filter(char => {
      if (selectedElement !== 'all' && char.element !== selectedElement) {
        return false;
      }
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
  }, [activeTab, selectedElement, searchQuery, getFavoriteIds]);

  // 獲取頭像
  const getAvatarSrc = (char: CharacterType) => {
    if ('gan' in char) {
      return commanderAvatars[char.gan as keyof typeof commanderAvatars];
    }
    return advisorAvatars[char.id as keyof typeof advisorAvatars];
  };

  // 獲取角色類型
  const getCharacterType = (char: CharacterType): 'gan' | 'zhi' => {
    return 'gan' in char ? 'gan' : 'zhi';
  };

  // 打開角色詳情
  const handleCharacterClick = (char: CharacterType) => {
    if (compareMode) {
      handleAddToCompare(char);
    } else {
      setSelectedCharacter(char);
      setDialogOpen(true);
    }
  };

  // 處理收藏點擊
  const handleFavoriteClick = (e: React.MouseEvent, char: CharacterType) => {
    e.stopPropagation();
    const type = getCharacterType(char);
    toggleFavorite(char.id, type, `${char.id} ${char.title}`);
  };

  // 添加到比較
  const handleAddToCompare = (char: CharacterType) => {
    const isAlreadySelected = compareCharacters.some(c => c?.id === char.id);
    
    if (isAlreadySelected) {
      setCompareCharacters(prev => [
        prev[0]?.id === char.id ? null : prev[0],
        prev[1]?.id === char.id ? null : prev[1]
      ]);
    } else {
      if (!compareCharacters[0]) {
        setCompareCharacters([char, compareCharacters[1]]);
      } else if (!compareCharacters[1]) {
        setCompareCharacters([compareCharacters[0], char]);
      } else {
        setCompareCharacters([char, compareCharacters[1]]);
      }
    }
  };

  // 移除比較角色
  const handleRemoveFromCompare = (index: 0 | 1) => {
    setCompareCharacters(prev => {
      const newCompare: [CharacterType | null, CharacterType | null] = [...prev];
      newCompare[index] = null;
      return newCompare;
    });
  };

  // 檢查角色是否在比較列表中
  const isInCompareList = (char: CharacterType) => {
    return compareCharacters.some(c => c?.id === char.id);
  };

  // 獲取比較位置
  const getComparePosition = (char: CharacterType): number | null => {
    if (compareCharacters[0]?.id === char.id) return 1;
    if (compareCharacters[1]?.id === char.id) return 2;
    return null;
  };

  // 統計數據
  const stats = useMemo(() => {
    const source = activeTab === 'gan' 
      ? Object.values(GAN_CHARACTERS) 
      : activeTab === 'zhi'
        ? Object.values(ZHI_CHARACTERS)
        : characters;
    const elementCounts: Record<string, number> = {};
    source.forEach(char => {
      elementCounts[char.element] = (elementCounts[char.element] || 0) + 1;
    });
    return elementCounts;
  }, [activeTab, characters]);

  const compareCount = compareCharacters.filter(Boolean).length;
  const favoritesCount = favorites.length;

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'gan' | 'zhi' | 'favorites')} className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="gan" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">天干主將</span>
                <span className="sm:hidden">天干</span>
              </TabsTrigger>
              <TabsTrigger value="zhi" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">地支軍師</span>
                <span className="sm:hidden">地支</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">我的收藏</span>
                <span className="sm:hidden">收藏</span>
                {favoritesCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {favoritesCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* 比較模式按鈕 */}
            <div className="flex items-center gap-2">
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
                className="gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {compareMode ? "退出比較" : "角色比較"}
              </Button>
              
              {compareMode && compareCount > 0 && (
                <Button
                  size="sm"
                  onClick={() => setCompareDialogOpen(true)}
                  className="gap-2"
                  disabled={compareCount < 2}
                >
                  <Check className="w-4 h-4" />
                  比較 ({compareCount}/2)
                </Button>
              )}
              
              {compareMode && compareCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompareCharacters([null, null])}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 比較模式提示 */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      點擊角色卡片選擇要比較的角色（最多2個）
                    </span>
                  </div>
                  
                  {/* 已選角色預覽 */}
                  <div className="flex items-center gap-2">
                    {compareCharacters.map((char, idx) => (
                      <div 
                        key={idx}
                        className="w-10 h-10 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                        style={{ 
                          borderColor: char 
                            ? ELEMENT_CONFIG[char.element as ElementType]?.color 
                            : 'hsl(var(--border))'
                        }}
                      >
                        {char ? (
                          <img 
                            src={getAvatarSrc(char)} 
                            alt={char.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                const ElementIcon = config.icon;
                const count = stats[element] || 0;
                if (count === 0 && activeTab !== 'favorites') return null;
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
                    <ElementIcon className="w-3 h-3" />
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
              onFavoriteClick={handleFavoriteClick}
              getCharacterType={getCharacterType}
              isFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
              compareMode={compareMode}
              isInCompareList={isInCompareList}
              getComparePosition={getComparePosition}
            />
          </TabsContent>
          <TabsContent value="zhi" className="mt-0">
            <CharacterGrid 
              characters={characters as ZhiCharacter[]} 
              getAvatarSrc={getAvatarSrc}
              onCharacterClick={handleCharacterClick}
              onFavoriteClick={handleFavoriteClick}
              getCharacterType={getCharacterType}
              isFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
              compareMode={compareMode}
              isInCompareList={isInCompareList}
              getComparePosition={getComparePosition}
            />
          </TabsContent>
          <TabsContent value="favorites" className="mt-0">
            {!isLoggedIn ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-2">請先登入以使用收藏功能</p>
                <Button variant="outline" onClick={() => window.location.href = '/auth'}>
                  前往登入
                </Button>
              </motion.div>
            ) : favoritesLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">載入收藏中...</p>
              </div>
            ) : characters.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-2">還沒有收藏任何角色</p>
                <p className="text-sm text-muted-foreground">點擊角色卡片上的愛心圖標即可收藏</p>
              </motion.div>
            ) : (
              <CharacterGrid 
                characters={characters} 
                getAvatarSrc={getAvatarSrc}
                onCharacterClick={handleCharacterClick}
                onFavoriteClick={handleFavoriteClick}
                getCharacterType={getCharacterType}
                isFavorite={isFavorite}
                isLoggedIn={isLoggedIn}
                compareMode={compareMode}
                isInCompareList={isInCompareList}
                getComparePosition={getComparePosition}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* 空狀態 */}
        {characters.length === 0 && activeTab !== 'favorites' && (
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
      
      {/* 角色比較彈窗 */}
      <CharacterCompareDialog
        characters={compareCharacters}
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        onRemoveCharacter={handleRemoveFromCompare}
      />
    </div>
  );
};

// 角色卡片網格組件
interface CharacterGridProps {
  characters: (GanCharacter | ZhiCharacter)[];
  getAvatarSrc: (char: GanCharacter | ZhiCharacter) => string | undefined;
  onCharacterClick: (char: GanCharacter | ZhiCharacter) => void;
  onFavoriteClick: (e: React.MouseEvent, char: GanCharacter | ZhiCharacter) => void;
  getCharacterType: (char: GanCharacter | ZhiCharacter) => 'gan' | 'zhi';
  isFavorite: (id: string, type: 'gan' | 'zhi') => boolean;
  isLoggedIn: boolean;
  compareMode: boolean;
  isInCompareList: (char: GanCharacter | ZhiCharacter) => boolean;
  getComparePosition: (char: GanCharacter | ZhiCharacter) => number | null;
}

const CharacterGrid = ({ 
  characters, 
  getAvatarSrc, 
  onCharacterClick,
  onFavoriteClick,
  getCharacterType,
  isFavorite,
  isLoggedIn,
  compareMode,
  isInCompareList,
  getComparePosition
}: CharacterGridProps) => {
  return (
    <motion.div 
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {characters.map((char, index) => {
          const elementConfig = ELEMENT_CONFIG[char.element as ElementType];
          const ElementIcon = elementConfig?.icon || Sparkles;
          const avatarSrc = getAvatarSrc(char);
          const inCompare = isInCompareList(char);
          const comparePosition = getComparePosition(char);
          const charType = getCharacterType(char);
          const isFav = isFavorite(char.id, charType);
          
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
                className={`group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-2 relative ${
                  compareMode && inCompare ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={{ borderColor: `${elementConfig?.color}30` }}
                onClick={() => onCharacterClick(char)}
              >
                {/* 比較模式標記 */}
                {compareMode && inCompare && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                    {comparePosition}
                  </div>
                )}
                
                {/* 比較模式遮罩 */}
                {compareMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 z-10 flex items-center justify-center transition-colors ${
                      inCompare 
                        ? 'bg-primary/20' 
                        : 'bg-transparent hover:bg-primary/10'
                    }`}
                  >
                    {!inCompare && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
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
                    
                    {/* 懸停遮罩（非比較模式） */}
                    {!compareMode && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          查看詳情
                        </motion.span>
                      </div>
                    )}

                    {/* 收藏按鈕 */}
                    {!compareMode && (
                      <motion.button
                        onClick={(e) => onFavoriteClick(e, char)}
                        className={`absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isFav 
                            ? 'bg-red-500 text-white shadow-lg' 
                            : 'bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={isLoggedIn ? (isFav ? "取消收藏" : "加入收藏") : "請先登入"}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </motion.button>
                    )}

                    {/* 五行標籤 */}
                    <div 
                      className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1"
                      style={{ 
                        background: `${elementConfig?.color}90`,
                        color: char.element === '金' ? '#1a1a24' : '#fff'
                      }}
                    >
                      <ElementIcon className="w-3 h-3" />
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
