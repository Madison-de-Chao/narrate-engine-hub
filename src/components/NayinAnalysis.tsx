import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Mountain, Droplets, Flame, TreeDeciduous, Gem
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface NayinAnalysisProps {
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

// 納音五行對應
const NAYIN_ELEMENTS: Record<string, string> = {
  '海中金': '金', '劍鋒金': '金', '白蠟金': '金', '砂中金': '金', '金箔金': '金', '釵釧金': '金',
  '爐中火': '火', '山頭火': '火', '霹靂火': '火', '山下火': '火', '覆燈火': '火', '天上火': '火',
  '澗下水': '水', '泉中水': '水', '長流水': '水', '天河水': '水', '大溪水': '水', '大海水': '水',
  '路旁土': '土', '城頭土': '土', '屋上土': '土', '壁上土': '土', '大驛土': '土', '沙中土': '土',
  '桑柘木': '木', '楊柳木': '木', '松柏木': '木', '平地木': '木', '石榴木': '木', '大林木': '木',
};

// 簡化的納音意象
const NAYIN_BRIEF: Record<string, { image: string; theme: string }> = {
  '海中金': { image: '深藏海底的珍貴金礦', theme: '潛龍勿用，韜光養晦' },
  '劍鋒金': { image: '鋒利無比的寶劍', theme: '鋒芒畢露，以剛克柔' },
  '白蠟金': { image: '精緻細膩的白金', theme: '溫潤如玉，以柔克剛' },
  '砂中金': { image: '沙土中的金粒', theme: '沙裡淘金，厚積薄發' },
  '金箔金': { image: '輕薄如紙的金箔', theme: '金玉其外，內功為本' },
  '釵釧金': { image: '女子首飾的精美金飾', theme: '精緻典雅，以美服人' },
  '爐中火': { image: '熔爐中的烈火', theme: '烈火熔金，百煉成鋼' },
  '山頭火': { image: '山頂燃燒的火焰', theme: '高瞻遠矚，照耀四方' },
  '霹靂火': { image: '雷電之火', theme: '電光石火，一鳴驚人' },
  '山下火': { image: '山腳下的篝火', theme: '溫暖人心，腳踏實地' },
  '覆燈火': { image: '燈籠內的燭火', theme: '燈火傳心，照亮他人' },
  '天上火': { image: '太陽般的光芒', theme: '普照萬物，光明磊落' },
  '澗下水': { image: '山澗中的清泉', theme: '清流不息，靈動自如' },
  '泉中水': { image: '地底湧出的泉水', theme: '源源不絕，厚積薄發' },
  '長流水': { image: '奔流不息的河水', theme: '奔流向海，勇往直前' },
  '天河水': { image: '天上的銀河', theme: '銀河璀璨，志在高遠' },
  '大溪水': { image: '寬廣的溪流', theme: '海納百川，包容萬物' },
  '大海水': { image: '浩瀚無垠的大海', theme: '浩瀚無邊，深藏不露' },
  '路旁土': { image: '道路兩旁的泥土', theme: '腳踏實地，穩步前行' },
  '城頭土': { image: '城牆上的堅土', theme: '城牆堡壘，守護一方' },
  '屋上土': { image: '屋頂的泥瓦', theme: '庇護家園，遮風擋雨' },
  '壁上土': { image: '牆壁上的泥土', theme: '依附借力，合作共贏' },
  '大驛土': { image: '驛站的大道', theme: '四通八達，廣結善緣' },
  '沙中土': { image: '沙漠中的土地', theme: '沙漠綠洲，厚積薄發' },
  '桑柘木': { image: '桑樹和柘樹', theme: '柔韌不折，勤勞致富' },
  '楊柳木': { image: '隨風搖曳的柳樹', theme: '隨風搖曳，柔美多情' },
  '松柏木': { image: '常青的松柏', theme: '松柏長青，堅貞不渝' },
  '平地木': { image: '平原上的樹木', theme: '平穩中正，安居樂業' },
  '石榴木': { image: '結實纍纍的石榴樹', theme: '碩果纍纍，開花結果' },
  '大林木': { image: '茂密的森林', theme: '森林茂盛，蔚為大觀' },
};

// 五行配置
const ELEMENT_CONFIG: Record<string, { 
  color: string; 
  bgClass: string;
  chartColor: string;
  icon: React.ReactNode;
}> = {
  '金': { 
    color: 'text-amber-400', 
    bgClass: 'from-amber-500/20 to-amber-500/5',
    chartColor: '#fbbf24',
    icon: <Gem className="w-4 h-4" />
  },
  '木': { 
    color: 'text-green-400', 
    bgClass: 'from-green-500/20 to-green-500/5',
    chartColor: '#4ade80',
    icon: <TreeDeciduous className="w-4 h-4" />
  },
  '水': { 
    color: 'text-blue-400', 
    bgClass: 'from-blue-500/20 to-blue-500/5',
    chartColor: '#60a5fa',
    icon: <Droplets className="w-4 h-4" />
  },
  '火': { 
    color: 'text-red-400', 
    bgClass: 'from-red-500/20 to-red-500/5',
    chartColor: '#f87171',
    icon: <Flame className="w-4 h-4" />
  },
  '土': { 
    color: 'text-yellow-600', 
    bgClass: 'from-yellow-500/20 to-yellow-500/5',
    chartColor: '#ca8a04',
    icon: <Mountain className="w-4 h-4" />
  },
};

const PILLAR_NAMES = {
  year: '年柱',
  month: '月柱', 
  day: '日柱',
  hour: '時柱'
};

export const NayinAnalysis = ({ nayin }: NayinAnalysisProps) => {
  // 計算五行分布
  const elementCounts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  const pillars = ['year', 'month', 'day', 'hour'] as const;
  
  pillars.forEach((pillar) => {
    const nayinName = nayin[pillar];
    const element = NAYIN_ELEMENTS[nayinName] || '土';
    elementCounts[element]++;
  });

  // 準備圓環圖數據
  const chartData = Object.entries(elementCounts)
    .filter(([_, count]) => count > 0)
    .map(([element, count]) => ({
      name: element,
      value: count,
      color: ELEMENT_CONFIG[element]?.chartColor || '#666',
    }));

  // 日柱納音（主要分析）
  const dayNayin = nayin.day;
  const dayElement = NAYIN_ELEMENTS[dayNayin] || '土';
  const dayBrief = NAYIN_BRIEF[dayNayin] || { image: '未知', theme: '未知' };
  const dayConfig = ELEMENT_CONFIG[dayElement];

  // 找出主導五行
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <Card className="p-4 sm:p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-950 via-amber-900/80 to-slate-900">
      <h2 className="text-lg sm:text-2xl font-bold text-amber-100 mb-4 sm:mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
        納音五行分析
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 左側：圓環圖 + 四柱一覽 */}
        <div className="space-y-4">
          {/* 圓環圖 */}
          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36 sm:w-48 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} 柱`, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 中心文字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl sm:text-2xl font-bold ${ELEMENT_CONFIG[dominantElement[0]]?.color}`}>
                  {dominantElement[0]}
                </span>
                <span className="text-xs text-muted-foreground">主導</span>
              </div>
            </div>
          </div>

          {/* 五行統計 - 行動端緊湊排列 */}
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {Object.entries(elementCounts).map(([element, count]) => (
              <Badge
                key={element}
                variant="outline"
                className={`${ELEMENT_CONFIG[element]?.color} border-current/30 flex items-center gap-1 text-xs sm:text-sm`}
              >
                {ELEMENT_CONFIG[element]?.icon}
                {element} × {count}
              </Badge>
            ))}
          </div>

          {/* 四柱納音一覽 - 行動端 2x2 網格 */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pillars.map((pillar) => {
              const nayinName = nayin[pillar];
              const element = NAYIN_ELEMENTS[nayinName] || '土';
              const config = ELEMENT_CONFIG[element];
              return (
                <div
                  key={pillar}
                  className={`p-2.5 sm:p-3 rounded-lg bg-gradient-to-br ${config?.bgClass} border border-current/20`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{PILLAR_NAMES[pillar]}</span>
                    <Badge variant="outline" className={`text-xs ${config?.color} border-current/30 px-1.5 py-0`}>
                      {element}
                    </Badge>
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${config?.color}`}>{nayinName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：日柱重點解讀 */}
        <div className={`p-4 sm:p-5 rounded-xl bg-gradient-to-br ${dayConfig?.bgClass} border border-current/20`}>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-background/50 ${dayConfig?.color}`}>
              {dayConfig?.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm sm:text-base truncate">日柱納音：{dayNayin}</h3>
              <Badge variant="outline" className={`text-xs ${dayConfig?.color} border-current/30`}>
                {dayElement}行
              </Badge>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">🎭 意象</h4>
              <p className="text-sm text-foreground">{dayBrief.image}</p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">💡 核心主題</h4>
              <p className={`text-sm sm:text-base font-semibold ${dayConfig?.color}`}>{dayBrief.theme}</p>
            </div>

            <div className="pt-2 sm:pt-3 border-t border-border/30">
              <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2">📊 五行特質</h4>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {dayElement === '金' && '金主義，性剛，情烈。其性剛果決斷，其情豪邁厲利。'}
                {dayElement === '木' && '木主仁，性直，情和。其性仁直正義，其情溫和穩重。'}
                {dayElement === '水' && '水主智，性聰，情善。其性聰明靈活，其情柔和通達。'}
                {dayElement === '火' && '火主禮，性急，情恭。其性急躁衝動，其情明朗熱情。'}
                {dayElement === '土' && '土主信，性重，情厚。其性穩重踏實，其情厚道敦厚。'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NayinAnalysis;
