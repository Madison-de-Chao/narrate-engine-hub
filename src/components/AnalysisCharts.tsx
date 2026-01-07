import { Card } from "@/components/ui/card";
import { BaziResult } from "@/pages/Index";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Flame, Mountain, TreeDeciduous, Gem,
  TrendingUp, TrendingDown, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface AnalysisChartsProps {
  baziResult: BaziResult;
}

const WUXING_CONFIG: Record<string, { 
  name: string;
  color: string;
  chartColor: string;
  icon: React.ReactNode;
}> = {
  wood: { name: '木', color: 'text-green-400', chartColor: '#4ade80', icon: <TreeDeciduous className="w-4 h-4" /> },
  fire: { name: '火', color: 'text-red-400', chartColor: '#f87171', icon: <Flame className="w-4 h-4" /> },
  earth: { name: '土', color: 'text-yellow-500', chartColor: '#eab308', icon: <Mountain className="w-4 h-4" /> },
  metal: { name: '金', color: 'text-amber-300', chartColor: '#fcd34d', icon: <Gem className="w-4 h-4" /> },
  water: { name: '水', color: 'text-blue-400', chartColor: '#60a5fa', icon: <Droplets className="w-4 h-4" /> },
};

// 根據日主五行生成簡要建議
function getQuickAdvice(dayElement: string, isStrong: boolean): { develop: string; caution: string } {
  const advice: Record<string, { strong: { develop: string; caution: string }; weak: { develop: string; caution: string } }> = {
    wood: {
      strong: { develop: '發揮領導力，帶領團隊成長', caution: '避免過於固執，學會傾聽' },
      weak: { develop: '多接觸水元素，增強生機', caution: '避免過度消耗，保持休息' }
    },
    fire: {
      strong: { develop: '善用熱情感染他人', caution: '控制衝動，避免燃燒過度' },
      weak: { develop: '多接觸木元素，增添活力', caution: '注意心血管健康' }
    },
    earth: {
      strong: { develop: '發揮穩定優勢，承擔責任', caution: '避免過於保守固執' },
      weak: { develop: '多接觸火元素，增強動力', caution: '注意脾胃調養' }
    },
    metal: {
      strong: { develop: '善用果斷決策能力', caution: '學會柔軟，避免過於嚴厲' },
      weak: { develop: '多接觸土元素，增強根基', caution: '注意呼吸系統保養' }
    },
    water: {
      strong: { develop: '發揮智慧，善於謀略', caution: '避免多慮，增加行動力' },
      weak: { develop: '多接觸金元素，增強內涵', caution: '注意腎臟調養' }
    },
  };
  return isStrong ? advice[dayElement]?.strong || advice.earth.strong : advice[dayElement]?.weak || advice.earth.weak;
}

export const AnalysisCharts = ({ baziResult }: AnalysisChartsProps) => {
  const { wuxing, yinyang, pillars } = baziResult;
  const dayStem = pillars.day.stem;

  // 計算日主五行
  const stemElements: Record<string, string> = {
    '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  const dayElement = stemElements[dayStem] || 'earth';

  // 計算五行百分比
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const wuxingPercent = Object.fromEntries(
    Object.entries(wuxing).map(([k, v]) => [k, (v / totalWuxing) * 100])
  );

  // 判斷身強身弱
  const dayElementPercent = wuxingPercent[dayElement] || 0;
  const isStrong = dayElementPercent > 25;

  // 找出最強最弱五行
  const sorted = Object.entries(wuxing).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  // 圓環圖數據
  const pieData = Object.entries(wuxing).map(([key, value]) => ({
    name: WUXING_CONFIG[key]?.name || key,
    value,
    color: WUXING_CONFIG[key]?.chartColor || '#666',
  }));

  // 雷達圖數據
  const radarData = Object.entries(wuxingPercent).map(([key, value]) => ({
    subject: WUXING_CONFIG[key]?.name || key,
    value: value,
    fullMark: 50,
  }));

  const advice = getQuickAdvice(dayElement, isStrong);

  return (
    <Card className="p-6 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-emerald-900/80 to-slate-900">
      <h2 className="text-2xl font-bold text-emerald-100 mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        五行分析圖表
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：圓環圖 + 陰陽 */}
        <div className="space-y-4">
          {/* 五行圓環圖 */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 中心：日主 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${WUXING_CONFIG[dayElement]?.color}`}>
                  {WUXING_CONFIG[dayElement]?.name}
                </span>
                <span className="text-xs text-muted-foreground">日主</span>
              </div>
            </div>
          </div>

          {/* 五行比例標籤 */}
          <div className="flex justify-center gap-2 flex-wrap">
            {Object.entries(wuxing).map(([key, value]) => {
              const config = WUXING_CONFIG[key];
              const percent = wuxingPercent[key];
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className={`${config?.color} border-current/30 flex items-center gap-1`}
                >
                  {config?.icon}
                  {config?.name} {percent?.toFixed(0)}%
                  {key === strongest && <TrendingUp className="w-3 h-3 ml-1" />}
                  {key === weakest && <TrendingDown className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>

          {/* 陰陽平衡 */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">☯️ 陰陽平衡</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>陽</span>
                  <span className="text-amber-400">{yinyang.yang}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${yinyang.yang}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>陰</span>
                  <span className="text-blue-400">{yinyang.yin}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${yinyang.yin}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {yinyang.yang > yinyang.yin ? '陽性能量較強，個性外向積極' : 
               yinyang.yang < yinyang.yin ? '陰性能量較強，個性內斂穩重' : '陰陽平衡，適應力強'}
            </p>
          </div>
        </div>

        {/* 右側：雷達圖 + 建議 */}
        <div className="space-y-4">
          {/* 雷達圖 */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <Radar
                  name="五行分布"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '比例']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 命局強弱 */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${isStrong ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'} border`}>
              <span className="text-xs text-muted-foreground">命局</span>
              <div className={`text-lg font-bold ${isStrong ? 'text-amber-400' : 'text-blue-400'}`}>
                {isStrong ? '身強' : '身弱'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <span className="text-xs text-muted-foreground">日主五行</span>
              <div className={`text-lg font-bold ${WUXING_CONFIG[dayElement]?.color}`}>
                {WUXING_CONFIG[dayElement]?.name}命
              </div>
            </div>
          </div>

          {/* 快速建議 */}
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xs text-emerald-400">✨ 發展建議</span>
              <p className="text-sm text-foreground mt-1">{advice.develop}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs text-amber-400">⚠️ 注意事項</span>
              <p className="text-sm text-foreground mt-1">{advice.caution}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnalysisCharts;
