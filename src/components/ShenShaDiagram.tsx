import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles, AlertTriangle, Heart, BookOpen, Swords, Star } from 'lucide-react';

interface ShenshaInfo {
  id: string;
  name: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  category: string;
  icon: React.ReactNode;
  effect: string;
  description: string;
}

const SHENSHA_LIST: ShenshaInfo[] = [
  // 吉神
  {
    id: 'tianyi',
    name: '天乙貴人',
    type: 'auspicious',
    category: '貴人',
    icon: <Star className="w-4 h-4" />,
    effect: '遇難呈祥，逢凶化吉',
    description: '最重要的貴人星，主一生多得貴人相助，遇困難能化解'
  },
  {
    id: 'tiande',
    name: '天德貴人',
    type: 'auspicious',
    category: '貴人',
    icon: <Star className="w-4 h-4" />,
    effect: '逢凶化吉，災難消散',
    description: '主仁慈善良，能化解災禍，一生平安'
  },
  {
    id: 'wenchang',
    name: '文昌星',
    type: 'auspicious',
    category: '學業',
    icon: <BookOpen className="w-4 h-4" />,
    effect: '聰明好學，考試順利',
    description: '主學業有成，文采出眾，利於考試升學'
  },
  {
    id: 'jiangxing',
    name: '將星',
    type: 'auspicious',
    category: '事業',
    icon: <Swords className="w-4 h-4" />,
    effect: '領導才能，權柄在握',
    description: '主具有領導才能，適合從事管理工作'
  },
  {
    id: 'yima',
    name: '驛馬',
    type: 'neutral',
    category: '遷移',
    icon: <Sparkles className="w-4 h-4" />,
    effect: '遷移變動，出外發展',
    description: '主一生多遷移變動，適合外出發展或從事流動性工作'
  },
  // 桃花類
  {
    id: 'hongluan',
    name: '紅鸞',
    type: 'auspicious',
    category: '桃花',
    icon: <Heart className="w-4 h-4" />,
    effect: '婚姻喜慶，良緣天定',
    description: '主婚姻喜慶，遇此年份易有婚嫁之喜'
  },
  {
    id: 'tianxi',
    name: '天喜',
    type: 'auspicious',
    category: '桃花',
    icon: <Heart className="w-4 h-4" />,
    effect: '喜事臨門，人緣極佳',
    description: '主喜慶之事，人緣好，易有喜事發生'
  },
  {
    id: 'taohua',
    name: '桃花',
    type: 'neutral',
    category: '桃花',
    icon: <Heart className="w-4 h-4" />,
    effect: '異性緣佳，魅力出眾',
    description: '主異性緣，人緣好，但過多可能感情複雜'
  },
  // 凶煞
  {
    id: 'yangren',
    name: '羊刃',
    type: 'inauspicious',
    category: '凶煞',
    icon: <AlertTriangle className="w-4 h-4" />,
    effect: '剛烈衝動，易有傷害',
    description: '主性格剛烈，做事衝動，需注意意外傷害'
  },
  {
    id: 'huagai',
    name: '華蓋',
    type: 'neutral',
    category: '孤獨',
    icon: <Sparkles className="w-4 h-4" />,
    effect: '聰明孤高，宜修行研究',
    description: '主聰明但孤獨，適合研究學問或宗教修行'
  },
  {
    id: 'guchen',
    name: '孤辰',
    type: 'inauspicious',
    category: '孤獨',
    icon: <AlertTriangle className="w-4 h-4" />,
    effect: '性情孤僻，六親緣薄',
    description: '主性格孤僻，與親人緣分較薄'
  },
  {
    id: 'guasu',
    name: '寡宿',
    type: 'inauspicious',
    category: '孤獨',
    icon: <AlertTriangle className="w-4 h-4" />,
    effect: '婚姻不順，宜晚婚',
    description: '主婚姻較遲，感情路較曲折'
  },
  {
    id: 'wangshen',
    name: '亡神',
    type: 'inauspicious',
    category: '凶煞',
    icon: <AlertTriangle className="w-4 h-4" />,
    effect: '精神困擾，思慮過度',
    description: '主精神壓力大，易有憂鬱傾向'
  },
  {
    id: 'jiesha',
    name: '劫煞',
    type: 'inauspicious',
    category: '凶煞',
    icon: <AlertTriangle className="w-4 h-4" />,
    effect: '損失風險，小人暗害',
    description: '主易有損失，需防小人暗中破壞'
  },
  {
    id: 'kongwang',
    name: '空亡',
    type: 'neutral',
    category: '特殊',
    icon: <Sparkles className="w-4 h-4" />,
    effect: '虛無飄渺，靈感豐富',
    description: '主事物空虛，但也代表超脫與靈感'
  },
];

const CATEGORIES = [
  { id: 'all', name: '全部', color: '#a855f7' },
  { id: 'guiren', name: '貴人', color: '#eab308' },
  { id: 'xueye', name: '學業', color: '#3b82f6' },
  { id: 'shiye', name: '事業', color: '#22c55e' },
  { id: 'taohua', name: '桃花', color: '#ec4899' },
  { id: 'gudu', name: '孤獨', color: '#6366f1' },
  { id: 'xiongsha', name: '凶煞', color: '#ef4444' },
  { id: 'teshu', name: '特殊', color: '#8b5cf6' },
];

const TYPE_CONFIG = {
  auspicious: { label: '吉', color: '#22c55e', bg: 'bg-green-500' },
  inauspicious: { label: '凶', color: '#ef4444', bg: 'bg-red-500' },
  neutral: { label: '中', color: '#f59e0b', bg: 'bg-amber-500' },
};

interface ShenShaDiagramProps {
  className?: string;
}

export const ShenShaDiagram: React.FC<ShenShaDiagramProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeShensha, setActiveShensha] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'auspicious' | 'inauspicious' | 'neutral'>('all');

  const categoryMap: Record<string, string> = {
    'guiren': '貴人',
    'xueye': '學業',
    'shiye': '事業',
    'taohua': '桃花',
    'gudu': '孤獨',
    'xiongsha': '凶煞',
    'teshu': '特殊',
    'qianyi': '遷移',
  };

  const getFilteredShensha = () => {
    return SHENSHA_LIST.filter(s => {
      const categoryMatch = activeCategory === 'all' || s.category === categoryMap[activeCategory];
      const typeMatch = typeFilter === 'all' || s.type === typeFilter;
      return categoryMatch && typeMatch;
    });
  };

  const activeShenshaInfo = SHENSHA_LIST.find(s => s.id === activeShensha);

  // 統計
  const stats = {
    auspicious: SHENSHA_LIST.filter(s => s.type === 'auspicious').length,
    inauspicious: SHENSHA_LIST.filter(s => s.type === 'inauspicious').length,
    neutral: SHENSHA_LIST.filter(s => s.type === 'neutral').length,
  };

  return (
    <div className={className}>
      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
        神煞總覽
      </h3>

      {/* 吉凶統計 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['auspicious', 'inauspicious', 'neutral'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            className={`p-3 rounded-xl text-center transition-all ${
              typeFilter === type
                ? `ring-2 ring-offset-2 ${type === 'auspicious' ? 'ring-green-500' : type === 'inauspicious' ? 'ring-red-500' : 'ring-amber-500'}`
                : ''
            } ${
              theme === 'dark'
                ? 'bg-card border border-gold/10 hover:border-gold/30'
                : 'bg-white shadow border border-gray-100 hover:shadow-md'
            }`}
          >
            <div className={`w-8 h-8 mx-auto rounded-full ${TYPE_CONFIG[type].bg} text-white font-bold flex items-center justify-center mb-1`}>
              {stats[type]}
            </div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
              {TYPE_CONFIG[type].label}神
            </div>
          </button>
        ))}
      </div>

      {/* 分類選擇器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'text-white'
                : theme === 'dark'
                  ? 'bg-card text-paper/60 hover:text-paper border border-transparent'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: activeCategory === cat.id ? cat.color : undefined
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 神煞列表 */}
      <div className={`rounded-2xl p-4 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-card via-void to-card border border-gold/20' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-lg'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {getFilteredShensha().map((shensha, index) => (
              <motion.div
                key={shensha.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 relative ${
                  activeShensha === shensha.id
                    ? `ring-2 ring-offset-2 ${shensha.type === 'auspicious' ? 'ring-green-500' : shensha.type === 'inauspicious' ? 'ring-red-500' : 'ring-amber-500'}`
                    : ''
                } ${
                  theme === 'dark'
                    ? 'bg-card/80 hover:bg-card border border-gold/10 hover:border-gold/30'
                    : 'bg-white hover:shadow-md border border-gray-100'
                }`}
                onClick={() => setActiveShensha(activeShensha === shensha.id ? null : shensha.id)}
              >
                {/* 吉凶標籤 */}
                <div 
                  className={`absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold ${TYPE_CONFIG[shensha.type].bg}`}
                >
                  {TYPE_CONFIG[shensha.type].label}
                </div>

                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  shensha.type === 'auspicious' 
                    ? 'bg-green-500/20 text-green-500'
                    : shensha.type === 'inauspicious'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {shensha.icon}
                </div>
                <div className={`text-center font-medium text-sm ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  {shensha.name}
                </div>
                <div className={`text-center text-xs mt-1 ${
                  theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                }`}>
                  {shensha.category}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {getFilteredShensha().length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
            此分類暫無神煞
          </div>
        )}

        {/* 詳細信息面板 */}
        <AnimatePresence>
          {activeShenshaInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-4 p-4 rounded-xl ${
                theme === 'dark'
                  ? 'bg-card border border-gold/20'
                  : 'bg-white shadow-lg border border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                  activeShenshaInfo.type === 'auspicious'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-400 text-white'
                    : activeShenshaInfo.type === 'inauspicious'
                      ? 'bg-gradient-to-br from-red-500 to-rose-400 text-white'
                      : 'bg-gradient-to-br from-amber-500 to-yellow-400 text-white'
                }`}>
                  <span className="text-xl font-bold">{activeShenshaInfo.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                      {activeShenshaInfo.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${TYPE_CONFIG[activeShenshaInfo.type].bg}`}>
                      {TYPE_CONFIG[activeShenshaInfo.type].label}神
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      theme === 'dark' ? 'bg-gold/20 text-gold' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activeShenshaInfo.category}
                    </span>
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    activeShenshaInfo.type === 'auspicious'
                      ? 'text-green-500'
                      : activeShenshaInfo.type === 'inauspicious'
                        ? 'text-red-500'
                        : 'text-amber-500'
                  }`}>
                    {activeShenshaInfo.effect}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-paper/70' : 'text-void/70'}`}>
                    {activeShenshaInfo.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={`mt-3 text-center text-xs ${
        theme === 'dark' ? 'text-paper/50' : 'text-void/50'
      }`}>
        點擊神煞卡片查看詳細說明，使用篩選器快速查找
      </p>
    </div>
  );
};
