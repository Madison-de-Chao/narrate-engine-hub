import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Flame, Crown } from "lucide-react";
import type { FullLegionArmy, WuxingElement, Legion, PillarKey } from "@/lib/legionTranslator/types";

interface LegionOverviewChartProps {
  army: FullLegionArmy;
}

// Cosmic Architect 配色
const LEGION_COLORS = {
  year: { primary: 'hsl(42, 80%, 55%)', secondary: 'hsl(42, 70%, 40%)' },   // 金色 - 祖源
  month: { primary: 'hsl(160, 60%, 45%)', secondary: 'hsl(160, 50%, 35%)' }, // 青綠 - 關係
  day: { primary: 'hsl(270, 60%, 60%)', secondary: 'hsl(270, 50%, 45%)' },   // 紫色 - 核心
  hour: { primary: 'hsl(25, 80%, 55%)', secondary: 'hsl(25, 70%, 40%)' }     // 橙色 - 未來
};

const WUXING_COLORS: Record<WuxingElement, string> = {
  '木': 'hsl(140, 55%, 40%)',
  '火': 'hsl(0, 70%, 55%)',
  '土': 'hsl(35, 60%, 45%)',
  '金': 'hsl(42, 70%, 55%)',
  '水': 'hsl(210, 60%, 50%)'
};

const LEGION_LABELS: Record<PillarKey, { name: string; subtitle: string; icon: typeof Crown }> = {
  year: { name: '年柱 · 祖源軍', subtitle: '家族傳承', icon: Crown },
  month: { name: '月柱 · 關係軍', subtitle: '事業發展', icon: Crown },
  day: { name: '日柱 · 核心軍', subtitle: '核心本質', icon: Shield },
  hour: { name: '時柱 · 未來軍', subtitle: '未來潛能', icon: Swords }
};

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
  const legionPowerData = (['year', 'month', 'day', 'hour'] as PillarKey[]).map((key) => {
    const legion = getLegionByKey(army, key);
    const label = LEGION_LABELS[key];
    
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

  const wuxingDistribution: Record<WuxingElement, number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };

  (['year', 'month', 'day', 'hour'] as PillarKey[]).forEach((key) => {
    const legion = getLegionByKey(army, key);
    const generalElement = legion.general?.character?.element as WuxingElement | undefined;
    if (generalElement && wuxingDistribution[generalElement] !== undefined) {
      wuxingDistribution[generalElement] += 25;
    }
    const strategistElement = legion.strategist?.character?.element as WuxingElement | undefined;
    if (strategistElement && wuxingDistribution[strategistElement] !== undefined) {
      wuxingDistribution[strategistElement] += 20;
    }
    legion.specialists?.forEach(spec => {
      const specElement = spec.character?.element as WuxingElement | undefined;
      if (specElement && wuxingDistribution[specElement] !== undefined) {
        wuxingDistribution[specElement] += 10;
      }
    });
  });

  const radarData = Object.entries(wuxingDistribution).map(([element, value]) => ({
    element,
    value: Math.min(100, value),
    fullMark: 100
  }));

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
        <div className="relative overflow-hidden rounded-xl border border-cosmic-gold/20 bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-surface">
          {/* 背景星空 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white/60 rounded-full" />
            <div className="absolute top-[30%] right-[15%] w-0.5 h-0.5 bg-cosmic-gold/50 rounded-full" />
            <div className="absolute bottom-[20%] left-[40%] w-0.5 h-0.5 bg-white/40 rounded-full" />
          </div>

          {/* HUD 角落裝飾 */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cosmic-gold/40" />

          <div className="relative border-b border-cosmic-gold/20 bg-gradient-to-r from-cosmic-gold/10 to-transparent p-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-cosmic-gold">
              <Swords className="w-5 h-5" />
              四大軍團戰力對比
            </div>
            <p className="text-xs text-cosmic-text-dim mt-1 tracking-widest">COMBAT POWER ANALYSIS</p>
          </div>

          <div className="p-6 relative">
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
                        className="w-3 h-3 rounded-full shadow-lg"
                        style={{ 
                          backgroundColor: legion.color,
                          boxShadow: `0 0 10px ${legion.color}50`
                        }}
                      />
                      <span className="font-medium text-cosmic-text">{legion.fullName}</span>
                      <Badge variant="outline" className="text-xs border-cosmic-gold/30 text-cosmic-gold bg-cosmic-gold/5">
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
                  
                  <div className="h-3 bg-cosmic-void/60 rounded-full overflow-hidden border border-cosmic-gold/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${legion.戰力}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="h-full rounded-full relative"
                      style={{ 
                        background: `linear-gradient(to right, ${legion.color}60, ${legion.color})`,
                        boxShadow: `0 0 10px ${legion.color}40`
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-6 pt-4 border-t border-cosmic-gold/20 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {legionPowerData.map((legion) => (
                <div 
                  key={legion.fullName}
                  className="text-center p-3 rounded-lg bg-cosmic-void/40 border border-cosmic-gold/10"
                >
                  <p className="text-xs text-cosmic-text-dim mb-1">{legion.name}</p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ 
                      color: legion.color,
                      textShadow: `0 0 15px ${legion.color}40`
                    }}
                  >
                    {legion.戰力}
                  </p>
                  <p className="text-xs text-cosmic-text-dim">戰力指數</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 五行分布圖 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* 雷達圖 */}
        <div className="relative overflow-hidden rounded-xl border border-cosmic-gold/20 bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-surface">
          <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-cosmic-gold/40" />

          <div className="relative border-b border-cosmic-gold/20 p-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-cosmic-gold">
              <Flame className="w-5 h-5 text-orange-400" />
              五行能量分布
            </div>
            <p className="text-xs text-cosmic-text-dim mt-1 tracking-widest">WUXING RADAR</p>
          </div>

          <div className="p-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="hsl(42, 60%, 30%)" strokeOpacity={0.3} />
                  <PolarAngleAxis 
                    dataKey="element" 
                    tick={{ fill: 'hsl(42, 80%, 55%)', fontSize: 14, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
                  />
                  <Radar
                    name="五行分布"
                    dataKey="value"
                    stroke="hsl(42, 80%, 55%)"
                    fill="hsl(42, 80%, 55%)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 柱狀圖 */}
        <div className="relative overflow-hidden rounded-xl border border-cosmic-gold/20 bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-surface">
          <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-cosmic-gold/40" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-cosmic-gold/40" />

          <div className="relative border-b border-cosmic-gold/20 p-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-cosmic-gold">
              <Shield className="w-5 h-5" />
              五行強度對比
            </div>
            <p className="text-xs text-cosmic-text-dim mt-1 tracking-widest">ELEMENT STRENGTH</p>
          </div>

          <div className="p-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wuxingBarData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(42, 60%, 25%)" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(42, 80%, 55%)', fontSize: 14, fontWeight: 600 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(230, 30%, 10%)',
                      border: '1px solid hsl(42, 60%, 40%)',
                      borderRadius: '8px',
                      color: 'hsl(0, 0%, 90%)'
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
            
            <div className="flex justify-center gap-3 mt-4">
              {Object.entries(WUXING_COLORS).map(([element, color]) => (
                <div key={element} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}50` }}
                  />
                  <span className="text-xs text-cosmic-text-dim">{element}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
