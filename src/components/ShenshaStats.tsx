import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { ShenshaMatch, RARITY_CONFIG, CATEGORY_CONFIG } from "@/data/shenshaTypes";
import { Sparkles, TrendingUp, Shield, AlertTriangle } from "lucide-react";

interface ShenshaStatsProps {
  shenshaList: ShenshaMatch[];
}

export const ShenshaStats = ({ shenshaList }: ShenshaStatsProps) => {
  if (!shenshaList || shenshaList.length === 0) {
    return null;
  }

  // 按分類統計
  const categoryStats = shenshaList.reduce((acc, sha) => {
    acc[sha.category] = (acc[sha.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_CONFIG[name]?.color || '#888',
    icon: CATEGORY_CONFIG[name]?.icon || '✨'
  }));

  // 按稀有度統計
  const rarityStats = shenshaList.reduce((acc, sha) => {
    acc[sha.rarity] = (acc[sha.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rarityData = ['SSR', 'SR', 'R', 'N']
    .filter(rarity => rarityStats[rarity])
    .map(rarity => ({
      name: RARITY_CONFIG[rarity]?.label || rarity,
      value: rarityStats[rarity] || 0,
      color: RARITY_CONFIG[rarity]?.color || '#888',
      rarity
    }));

  // 計算吉凶比例
  const auspiciousCount = (categoryStats['吉神'] || 0) + (categoryStats['桃花'] || 0);
  const ominousCount = categoryStats['凶煞'] || 0;
  const specialCount = categoryStats['特殊'] || 0;
  const total = shenshaList.length;

  // 計算命格指數
  const fortuneIndex = Math.round(
    (auspiciousCount * 100 + specialCount * 50 - ominousCount * 30) / total
  );

  // Buff/Debuff 統計
  const buffs = shenshaList.filter(sha => sha.buff).map(sha => sha.buff!);
  const debuffs = shenshaList.filter(sha => sha.debuff).map(sha => sha.debuff!);

  return (
    <Card className="p-4 sm:p-6 border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950 via-fuchsia-900/80 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-fuchsia-500/10 via-transparent to-purple-500/10 opacity-50" />
      
      <div className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            神煞統計分析
          </h3>
          <Badge variant="secondary" className="text-xs sm:text-sm">
            共 {total} 個神煞
          </Badge>
        </div>

        {/* 命格指數 - 行動端 2x2 網格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{auspiciousCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> 吉神
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-500/20 to-rose-500/5 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-rose-400">{ominousCount}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> 凶煞
            </div>
          </div>
          <div className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-violet-400">{specialCount}</div>
            <div className="text-xs text-muted-foreground">特殊</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              {fortuneIndex > 0 ? '+' : ''}{fortuneIndex}
            </div>
            <div className="text-xs text-muted-foreground">命格指數</div>
          </div>
        </div>

        {/* 圖表區 - 行動端堆疊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 分類比例圓餅圖 */}
          <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 text-center">神煞分類分布</h4>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="65%"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [`${value} 個`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 稀有度長條圖 */}
          <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 text-center">稀有度分布</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={rarityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={45}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value} 個`, '數量']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buff/Debuff 總覽 - 行動端堆疊 */}
        {(buffs.length > 0 || debuffs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {buffs.length > 0 && (
              <div className="bg-emerald-500/10 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-emerald-400 mb-2">增益效果 ↑</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[...new Set(buffs)].map((buff, idx) => (
                    <Badge key={idx} variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">
                      {buff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {debuffs.length > 0 && (
              <div className="bg-rose-500/10 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-rose-400 mb-2">減益效果 ↓</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[...new Set(debuffs)].map((debuff, idx) => (
                    <Badge key={idx} variant="outline" className="text-rose-400 border-rose-400/30 text-xs">
                      {debuff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
