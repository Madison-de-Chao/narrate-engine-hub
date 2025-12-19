import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface TenGodInfo {
  id: string;
  name: string;
  pair: string;
  category: string;
  color: string;
  bgColor: string;
  relation: string;
  keywords: string[];
  description: string;
}

const TEN_GODS: TenGodInfo[] = [
  {
    id: 'bijian',
    name: '比肩',
    pair: '劫財',
    category: '比劫',
    color: '#8b5cf6',
    bgColor: 'from-violet-500 to-purple-400',
    relation: '同我者',
    keywords: ['自信', '獨立', '朋友'],
    description: '與日主同類同性，代表兄弟朋友、競爭對手、自我意識'
  },
  {
    id: 'jiecai',
    name: '劫財',
    pair: '比肩',
    category: '比劫',
    color: '#a855f7',
    bgColor: 'from-purple-500 to-fuchsia-400',
    relation: '同我者',
    keywords: ['競爭', '行動', '投機'],
    description: '與日主同類異性，代表競爭、行動力、敢冒險'
  },
  {
    id: 'shishen',
    name: '食神',
    pair: '傷官',
    category: '食傷',
    color: '#f97316',
    bgColor: 'from-orange-500 to-amber-400',
    relation: '我生者',
    keywords: ['口福', '藝術', '溫和'],
    description: '日主所生同性，代表才華、口福、藝術天賦'
  },
  {
    id: 'shangguan',
    name: '傷官',
    pair: '食神',
    category: '食傷',
    color: '#fb923c',
    bgColor: 'from-amber-500 to-yellow-400',
    relation: '我生者',
    keywords: ['才華', '創意', '反叛'],
    description: '日主所生異性，代表創意、口才、叛逆精神'
  },
  {
    id: 'zhengcai',
    name: '正財',
    pair: '偏財',
    category: '財星',
    color: '#22c55e',
    bgColor: 'from-green-500 to-emerald-400',
    relation: '我剋者',
    keywords: ['穩定', '勤儉', '務實'],
    description: '日主所剋異性，代表正當收入、勤儉持家'
  },
  {
    id: 'piancai',
    name: '偏財',
    pair: '正財',
    category: '財星',
    color: '#10b981',
    bgColor: 'from-emerald-500 to-teal-400',
    relation: '我剋者',
    keywords: ['意外', '投資', '慷慨'],
    description: '日主所剋同性，代表意外之財、投資收益'
  },
  {
    id: 'zhengguan',
    name: '正官',
    pair: '七殺',
    category: '官殺',
    color: '#3b82f6',
    bgColor: 'from-blue-500 to-sky-400',
    relation: '剋我者',
    keywords: ['名聲', '責任', '紀律'],
    description: '剋日主異性，代表正當權威、名譽地位'
  },
  {
    id: 'qisha',
    name: '七殺',
    pair: '正官',
    category: '官殺',
    color: '#ef4444',
    bgColor: 'from-red-500 to-rose-400',
    relation: '剋我者',
    keywords: ['權威', '魄力', '壓力'],
    description: '剋日主同性，代表強勢壓力、武職權柄'
  },
  {
    id: 'zhengyin',
    name: '正印',
    pair: '偏印',
    category: '印星',
    color: '#06b6d4',
    bgColor: 'from-cyan-500 to-blue-400',
    relation: '生我者',
    keywords: ['學問', '母親', '貴人'],
    description: '生日主異性，代表學問、母親、貴人庇護'
  },
  {
    id: 'pianyin',
    name: '偏印',
    pair: '正印',
    category: '印星',
    color: '#0891b2',
    bgColor: 'from-teal-500 to-cyan-400',
    relation: '生我者',
    keywords: ['偏學', '獨立', '思考'],
    description: '生日主同性，代表偏門學問、獨立思考'
  }
];

const CATEGORIES = [
  { id: 'bijie', name: '比劫', relation: '同我者', color: '#8b5cf6', description: '與日主同類' },
  { id: 'shishang', name: '食傷', relation: '我生者', color: '#f97316', description: '日主所生' },
  { id: 'caixing', name: '財星', relation: '我剋者', color: '#22c55e', description: '日主所剋' },
  { id: 'guansha', name: '官殺', relation: '剋我者', color: '#3b82f6', description: '剋日主者' },
  { id: 'yinxing', name: '印星', relation: '生我者', color: '#06b6d4', description: '生日主者' },
];

interface TenGodsDiagramProps {
  className?: string;
}

export const TenGodsDiagram: React.FC<TenGodsDiagramProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [activeGod, setActiveGod] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const getFilteredGods = () => {
    if (activeCategory) {
      return TEN_GODS.filter(g => g.category === CATEGORIES.find(c => c.id === activeCategory)?.name);
    }
    return TEN_GODS;
  };

  const activeGodInfo = TEN_GODS.find(g => g.id === activeGod);

  return (
    <div className={className}>
      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
        十神關係圖
      </h3>

      {/* 分類選擇器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeCategory === null
              ? theme === 'dark'
                ? 'bg-gold/20 text-gold border border-gold/40'
                : 'bg-amber-500 text-white'
              : theme === 'dark'
                ? 'bg-card text-paper/60 hover:text-paper border border-transparent'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
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

      {/* 中心日主 + 十神環繞 */}
      <div className={`relative rounded-2xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-card via-void to-card border border-gold/20' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-lg'
      }`}>
        {/* 日主中心 */}
        <div className="flex justify-center mb-6">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
              theme === 'dark' ? 'bg-gradient-to-br from-gold to-amber-500' : 'bg-gradient-to-br from-amber-500 to-yellow-400'
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            日主
          </motion.div>
        </div>

        {/* 關係標籤 */}
        <div className="grid grid-cols-5 gap-2 mb-4 text-center">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id}
              className={`text-xs py-1 rounded transition-all ${
                activeCategory === cat.id || !activeCategory
                  ? 'opacity-100'
                  : 'opacity-30'
              }`}
            >
              <div className="font-bold" style={{ color: cat.color }}>{cat.relation}</div>
              <div className={theme === 'dark' ? 'text-paper/50' : 'text-void/50'}>{cat.description}</div>
            </div>
          ))}
        </div>

        {/* 十神卡片網格 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {getFilteredGods().map((god, index) => (
              <motion.div
                key={god.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 ${
                  activeGod === god.id
                    ? 'ring-2 ring-offset-2 ring-amber-500'
                    : ''
                } ${
                  theme === 'dark'
                    ? 'bg-card/80 hover:bg-card border border-gold/10 hover:border-gold/30'
                    : 'bg-white hover:shadow-md border border-gray-100'
                }`}
                onClick={() => setActiveGod(activeGod === god.id ? null : god.id)}
                onMouseEnter={() => setActiveGod(god.id)}
              >
                <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${god.bgColor} flex items-center justify-center text-white font-bold mb-2 shadow-md`}>
                  {god.name.charAt(0)}
                </div>
                <div className={`text-center font-medium text-sm ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  {god.name}
                </div>
                <div className={`text-center text-xs mt-1 ${
                  theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                }`}>
                  {god.category}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 詳細信息面板 */}
        <AnimatePresence>
          {activeGodInfo && (
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
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${activeGodInfo.bgColor} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                  {activeGodInfo.name}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                      {activeGodInfo.name}
                    </span>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      theme === 'dark' ? 'bg-gold/20 text-gold' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activeGodInfo.relation}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-paper/70' : 'text-void/70'}`}>
                    {activeGodInfo.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeGodInfo.keywords.map(kw => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${activeGodInfo.color}20`,
                          color: activeGodInfo.color
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={`mt-3 text-center text-xs ${
        theme === 'dark' ? 'text-paper/50' : 'text-void/50'
      }`}>
        點擊或懸停十神卡片查看詳細說明
      </p>
    </div>
  );
};
