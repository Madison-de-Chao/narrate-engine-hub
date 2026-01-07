import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TenGodsAnalysisProps {
  baziResult: BaziResult;
}

// 十神分類
const TEN_GODS_CATEGORIES = {
  比劫: ['比肩', '劫財'],
  食傷: ['食神', '傷官'],
  財星: ['正財', '偏財'],
  官殺: ['正官', '七殺'],
  印星: ['正印', '偏印'],
};

// 分類顏色 - HSL 格式適配主題
const CATEGORY_COLORS: Record<string, string> = {
  比劫: 'hsl(190, 80%, 50%)',
  食傷: 'hsl(140, 70%, 45%)',
  財星: 'hsl(45, 90%, 50%)',
  官殺: 'hsl(220, 80%, 55%)',
  印星: 'hsl(270, 70%, 55%)',
};

// 個別十神顏色
const TEN_GODS_COLORS: Record<string, string> = {
  '比肩': 'hsl(190, 80%, 55%)',
  '劫財': 'hsl(190, 70%, 45%)',
  '食神': 'hsl(140, 70%, 50%)',
  '傷官': 'hsl(160, 70%, 45%)',
  '正財': 'hsl(45, 90%, 55%)',
  '偏財': 'hsl(50, 85%, 50%)',
  '正官': 'hsl(220, 80%, 55%)',
  '七殺': 'hsl(240, 70%, 50%)',
  '正印': 'hsl(270, 70%, 55%)',
  '偏印': 'hsl(280, 60%, 50%)',
};

// 分類描述
const CATEGORY_DESCRIPTIONS: Record<string, { theme: string; meaning: string }> = {
  比劫: { theme: '競爭與合作', meaning: '代表同輩、朋友、競爭者的能量' },
  食傷: { theme: '創造與表達', meaning: '代表才華、表達力、創造能力' },
  財星: { theme: '資源與財富', meaning: '代表財運、物質資源、現實能力' },
  官殺: { theme: '責任與壓力', meaning: '代表事業、地位、挑戰與責任' },
  印星: { theme: '學習與庇護', meaning: '代表學習、貴人、精神支援' },
};

export const TenGodsAnalysis = ({ baziResult }: TenGodsAnalysisProps) => {
  const { tenGods, pillars } = baziResult;
  
  // 統計十神出現次數
  const tenGodsCounts: Record<string, number> = {};
  const allTenGods = [
    tenGods.year.stem, tenGods.year.branch,
    tenGods.month.stem, tenGods.month.branch,
    tenGods.day.branch, // 日干是日元，不計入
    tenGods.hour.stem, tenGods.hour.branch,
  ].filter(g => g !== '日元');
  
  allTenGods.forEach(god => {
    tenGodsCounts[god] = (tenGodsCounts[god] || 0) + 1;
  });

  // 計算分類統計
  const categoryCounts: Record<string, number> = {};
  Object.entries(TEN_GODS_CATEGORIES).forEach(([category, gods]) => {
    categoryCounts[category] = gods.reduce((sum, god) => sum + (tenGodsCounts[god] || 0), 0);
  });
  
  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  // 準備圓環圖數據 - 分類視圖
  const categoryChartData = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: category,
      value: count,
      color: CATEGORY_COLORS[category],
      description: CATEGORY_DESCRIPTIONS[category]?.theme || '',
    }));

  // 準備圓環圖數據 - 詳細視圖
  const detailChartData = Object.entries(tenGodsCounts)
    .filter(([_, count]) => count > 0)
    .map(([god, count]) => ({
      name: god,
      value: count,
      color: TEN_GODS_COLORS[god] || 'hsl(0, 0%, 50%)',
    }));

  // 自訂 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const godInfo = tenGodsData.tenGodsRules?.[data.name as keyof typeof tenGodsData.tenGodsRules];
      
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-bold text-foreground mb-1">{data.name} × {data.value}</p>
          {data.description && (
            <p className="text-xs text-muted-foreground">{data.description}</p>
          )}
          {godInfo && (
            <p className="text-xs text-muted-foreground mt-1">{godInfo.象徵}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-2 border-blue-500/40 bg-gradient-to-br from-blue-950 via-blue-900/80 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        {/* 標題 */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            十神分析
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/50">
              日主：{pillars.day.stem}
            </Badge>
            {dominantCategory && dominantCategory[1] > 0 && (
              <Badge 
                variant="secondary"
                style={{ backgroundColor: CATEGORY_COLORS[dominantCategory[0]] + '33' }}
              >
                {dominantCategory[0]}為主
              </Badge>
            )}
          </div>
        </div>

        {/* 圖表區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 分類圓環圖 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground text-center">五類分布</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 詳細圓環圖 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground text-center">十神詳細</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detailChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => name}
                    labelLine={false}
                  >
                    {detailChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 分類摘要 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(categoryCounts).map(([category, count]) => {
            const desc = CATEGORY_DESCRIPTIONS[category];
            const isActive = count > 0;
            
            return (
              <div
                key={category}
                className={`rounded-lg p-3 text-center transition-all ${
                  isActive 
                    ? 'bg-card/50 border border-border/50' 
                    : 'bg-muted/20 opacity-50'
                }`}
                style={isActive ? { borderColor: CATEGORY_COLORS[category] + '50' } : {}}
              >
                <div 
                  className="text-lg font-bold"
                  style={{ color: isActive ? CATEGORY_COLORS[category] : 'hsl(var(--muted-foreground))' }}
                >
                  {count}
                </div>
                <div className="text-sm font-medium text-foreground">{category}</div>
                <div className="text-xs text-muted-foreground mt-1">{desc?.theme}</div>
              </div>
            );
          })}
        </div>

        {/* 主要十神說明 */}
        {dominantCategory && dominantCategory[1] > 0 && (
          <div className="rounded-lg p-4 bg-card/30 border border-border/30">
            <p className="text-sm text-foreground">
              <span 
                className="font-bold"
                style={{ color: CATEGORY_COLORS[dominantCategory[0]] }}
              >
                {dominantCategory[0]}
              </span>
              <span className="text-muted-foreground mx-2">|</span>
              {CATEGORY_DESCRIPTIONS[dominantCategory[0]]?.meaning}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TenGodsAnalysis;
