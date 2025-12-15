import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, Sun, Wind, Snowflake, Target, AlertTriangle, Lightbulb } from "lucide-react";
import { FourSeasonsTeam, getSeasonColor } from "@/lib/fourSeasonsAnalyzer";

interface FourSeasonsCardProps {
  fourSeasonsTeam: FourSeasonsTeam;
}

const seasonIcons = {
  '春': Leaf,
  '夏': Sun,
  '秋': Wind,
  '冬': Snowflake
};

const seasonLabels = {
  '春': '春季（木旺）',
  '夏': '夏季（火旺）',
  '秋': '秋季（金旺）',
  '冬': '冬季（水旺）'
};

export const FourSeasonsCard = ({ fourSeasonsTeam }: FourSeasonsCardProps) => {
  const SeasonIcon = seasonIcons[fourSeasonsTeam.team];
  const teamColor = getSeasonColor(fourSeasonsTeam.team);

  return (
    <Card className="relative overflow-hidden">
      {/* 背景裝飾 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${teamColor}40 0%, transparent 50%)` 
        }}
      />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${teamColor}20` }}
          >
            <SeasonIcon className="w-8 h-8" style={{ color: teamColor }} />
          </div>
          <div>
            <CardTitle className="text-2xl">{fourSeasonsTeam.teamName}</CardTitle>
            <p className="text-muted-foreground text-sm">
              月令所屬：{seasonLabels[fourSeasonsTeam.team]}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {/* 關鍵詞標籤 */}
        <div className="flex flex-wrap gap-2">
          {fourSeasonsTeam.keywords.map((keyword, index) => (
            <Badge 
              key={index} 
              variant="outline"
              style={{ 
                borderColor: `${teamColor}60`,
                backgroundColor: `${teamColor}10`
              }}
            >
              {keyword}
            </Badge>
          ))}
        </div>

        {/* 季節分布 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">四季能量分布</h4>
          <div className="grid grid-cols-4 gap-3">
            {(['春', '夏', '秋', '冬'] as const).map(season => {
              const Icon = seasonIcons[season];
              const percentage = parseFloat(fourSeasonsTeam.distribution[season]);
              const color = getSeasonColor(season);
              const isTeam = season === fourSeasonsTeam.team;
              
              return (
                <div 
                  key={season}
                  className={`p-3 rounded-lg text-center ${isTeam ? 'ring-2' : ''}`}
                  style={{ 
                    backgroundColor: `${color}10`,
                    ...(isTeam && { ringColor: color })
                  }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                  <p className="text-xs font-medium">{season}</p>
                  <p className="text-lg font-bold" style={{ color }}>{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 四柱季節對照 */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {(['year', 'month', 'day', 'hour'] as const).map(pillar => {
            const season = fourSeasonsTeam.seasonByPillar[pillar];
            const pillarNames = { year: '年支', month: '月支', day: '日支', hour: '時支' };
            return (
              <div key={pillar} className="p-2 bg-muted/30 rounded">
                <p className="text-muted-foreground">{pillarNames[pillar]}</p>
                <p className="font-semibold">{season}季</p>
              </div>
            );
          })}
        </div>

        {/* 優勢分析 */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <h4 className="font-bold flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
            <Target className="w-5 h-5" />
            核心優勢
          </h4>
          <ul className="space-y-2 text-sm">
            {fourSeasonsTeam.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 盲點提醒 */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <h4 className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle className="w-5 h-5" />
            盲點提醒
          </h4>
          <ul className="space-y-2 text-sm">
            {fourSeasonsTeam.blindspots.map((blindspot, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500">⚠</span>
                <span>{blindspot}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 行動建議 */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h4 className="font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
            <Lightbulb className="w-5 h-5" />
            行動建議
          </h4>
          <ul className="space-y-2 text-sm">
            {fourSeasonsTeam.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
