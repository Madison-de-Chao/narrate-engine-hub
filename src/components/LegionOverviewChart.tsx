import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Flame, Crown } from "lucide-react";
import type { FullLegionArmy, WuxingElement, Legion, PillarKey } from "@/lib/legionTranslator/types";

interface LegionOverviewChartProps {
  army: FullLegionArmy;
}

const LEGION_COLORS = {
  year: { primary: 'hsl(280, 70%, 60%)', secondary: 'hsl(280, 60%, 40%)' },
  month: { primary: 'hsl(200, 70%, 55%)', secondary: 'hsl(200, 60%, 40%)' },
  day: { primary: 'hsl(45, 85%, 55%)', secondary: 'hsl(45, 70%, 40%)' },
  hour: { primary: 'hsl(350, 70%, 55%)', secondary: 'hsl(350, 60%, 40%)' }
};

const WUXING_COLORS: Record<WuxingElement, string> = {
  '木': 'hsl(140, 60%, 45%)',
  '火': 'hsl(15, 80%, 50%)',
  '土': 'hsl(35, 60%, 50%)',
  '金': 'hsl(45, 70%, 55%)',
  '水': 'hsl(210, 70%, 50%)'
};

const LEGION_LABELS: Record<PillarKey, { name: string; subtitle: string; icon: typeof Crown }> = {
  year: { name: '年柱 · 先天軍', subtitle: '家族傳承', icon: Crown },
  month: { name: '月柱 · 社會軍', subtitle: '事業發展', icon: Crown },
  day: { name: '日柱 · 自我軍', subtitle: '核心本質', icon: Shield },
  hour: { name: '時柱 · 行動軍', subtitle: '未來潛能', icon: Swords }
};

// 獲取軍團
function getLegionByKey(army: FullLegionArmy, key: PillarKey): Legion {
  const legionMap: Record<PillarKey, Legion> = {
    year: army.familyLegion,
    month: army.growthLegion,
    day: army.selfLegion,
    hour: army.futureLegion
  };
  return legionMap[key];
}

export const LegionOverviewChart = ({ army }: LegionOverviewChartProps) => {
  // 計算各軍團戰力數據
  const legionPowerData = (['year', 'month', 'day', 'hour'] as PillarKey[]).map((key) => {
    const legion = getLegionByKey(army, key);
    const label = LEGION_LABELS[key];
    
    // 計算綜合戰力
    const buffTotal = legion.totalBuff ?? 50;
    const debuffTotal = Math.abs(legion.totalDebuff ?? 0);
    const harmonyScore = legion.internalHarmony ?? 50;
    const combatPower = Math.round((buffTotal * 1.5 - debuffTotal * 0.5 + harmonyScore) / 2);
    
    return {
      name: label.name.split(' · ')[1] || label.name,
      fullName: label.name,
      subtitle: label.subtitle,
      戰力: Math.min(100, Math.max(0, combatPower)),
      增益: buffTotal,
      減益: debuffTotal,
      和諧: harmonyScore,
      color: LEGION_COLORS[key].primary
    };
  });

  // 計算五行分布數據
  const wuxingDistribution: Record<WuxingElement, number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };

  (['year', 'month', 'day', 'hour'] as PillarKey[]).forEach((key) => {
    const legion = getLegionByKey(army, key);
    // 主將元素
    const generalElement = legion.general?.character?.element as WuxingElement | undefined;
    if (generalElement && wuxingDistribution[generalElement] !== undefined) {
      wuxingDistribution[generalElement] += 25;
    }
    // 軍師元素
    const strategistElement = legion.strategist?.character?.element as WuxingElement | undefined;
    if (strategistElement && wuxingDistribution[strategistElement] !== undefined) {
      wuxingDistribution[strategistElement] += 20;
    }
    // 副將/藏干元素
    legion.specialists?.forEach(spec => {
      const specElement = spec.character?.element as WuxingElement | undefined;
      if (specElement && wuxingDistribution[specElement] !== undefined) {
        wuxingDistribution[specElement] += 10;
      }
    });
  });

  // 轉換為雷達圖數據
  const radarData = Object.entries(wuxingDistribution).map(([element, value]) => ({
    element,
    value: Math.min(100, value),
    fullMark: 100
  }));

  // 五行柱狀圖數據
  const wuxingBarData = Object.entries(wuxingDistribution).map(([element, value]) => ({
    name: element,
    數值: Math.min(100, value),
    color: WUXING_COLORS[element as WuxingElement]
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* 軍團戰力對比 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Swords className="w-5 h-5 text-primary" />
              四大軍團戰力對比
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* 戰力條形圖 */}
            <div className="space-y-4">
              {legionPowerData.map((legion, index) => (
                <motion.div
                  key={legion.fullName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: legion.color }}
                      />
                      <span className="font-medium text-foreground">{legion.fullName}</span>
                      <Badge variant="outline" className="text-xs">
                        {legion.subtitle}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-400">+{legion.增益}</span>
                      <span className="text-red-400">-{legion.減益}</span>
                      <span 
                        className="font-bold text-lg"
                        style={{ color: legion.color }}
                      >
                        {legion.戰力}
                      </span>
                    </div>
                  </div>
                  
                  {/* 戰力進度條 */}
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${legion.戰力}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="h-full rounded-full relative"
                      style={{ 
                        background: `linear-gradient(to right, ${legion.color}80, ${legion.color})`
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 總覽統計 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-6 pt-4 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {legionPowerData.map((legion) => (
                <div 
                  key={legion.fullName}
                  className="text-center p-3 rounded-lg bg-muted/30"
                >
                  <p className="text-xs text-muted-foreground mb-1">{legion.name}</p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: legion.color }}
                  >
                    {legion.戰力}
                  </p>
                  <p className="text-xs text-muted-foreground">戰力指數</p>
                </div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 五行分布圖 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* 雷達圖 */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              五行能量分布
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="element" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="五行分布"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 柱狀圖 */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              五行強度對比
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wuxingBarData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="數值" radius={[4, 4, 0, 0]}>
                    {wuxingBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 五行標籤 */}
            <div className="flex justify-center gap-3 mt-4">
              {Object.entries(WUXING_COLORS).map(([element, color]) => (
                <div key={element} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{element}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
