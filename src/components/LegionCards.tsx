import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Swords, Users, Heart, Sparkles } from "lucide-react";

interface LegionCardsProps {
  baziResult: BaziResult;
}

const legionConfig = {
  year: {
    name: "家族兵團",
    icon: Users,
    color: "legion-family",
    bgGradient: "from-yellow-900/20 to-green-900/20",
    description: "祖上的旗幟與傳承",
  },
  month: {
    name: "成長兵團",
    icon: Swords,
    color: "legion-growth",
    bgGradient: "from-green-600/20 to-yellow-500/20",
    description: "環境的資源與考驗",
  },
  day: {
    name: "本我兵團",
    icon: Heart,
    color: "legion-self",
    bgGradient: "from-blue-600/20 to-purple-600/20",
    description: "靈魂的核心與真我",
  },
  hour: {
    name: "未來兵團",
    icon: Sparkles,
    color: "legion-future",
    bgGradient: "from-orange-600/20 to-red-600/20",
    description: "理想、後代與志向",
  },
};

const tianganRoles: { [key: string]: { name: string; icon: string; trait: string } } = {
  甲: { name: "森林將軍", icon: "🌲", trait: "堅毅規劃者" },
  乙: { name: "花草軍師", icon: "🌸", trait: "柔韌適應者" },
  丙: { name: "烈日戰神", icon: "🔥", trait: "熱情領航者" },
  丁: { name: "燭光智者", icon: "🕯️", trait: "溫暖啟蒙者" },
  戊: { name: "山岳守護", icon: "⛰️", trait: "穩重支柱" },
  己: { name: "沃土培育", icon: "🌱", trait: "務實培育者" },
  庚: { name: "鋼鐵騎士", icon: "⚔️", trait: "果斷戰士" },
  辛: { name: "珠寶鑑賞", icon: "💎", trait: "優雅鑑賞者" },
  壬: { name: "江河探險", icon: "🌊", trait: "靈活探索者" },
  癸: { name: "甘露療癒", icon: "💧", trait: "溫柔療癒者" },
};

const dizhiRoles: { [key: string]: { name: string; icon: string; trait: string } } = {
  子: { name: "機智鼠", icon: "🐭", trait: "機智靈活" },
  丑: { name: "勤勞牛", icon: "🐂", trait: "勤勞踏實" },
  寅: { name: "勇猛虎", icon: "🐅", trait: "勇猛果敢" },
  卯: { name: "溫和兔", icon: "🐰", trait: "溫和謹慎" },
  辰: { name: "神龍", icon: "🐲", trait: "變化多端" },
  巳: { name: "智慧蛇", icon: "🐍", trait: "智慧深沉" },
  午: { name: "奔騰馬", icon: "🐎", trait: "熱情奔放" },
  未: { name: "溫順羊", icon: "🐑", trait: "溫順善良" },
  申: { name: "聰明猴", icon: "🐒", trait: "聰明活潑" },
  酉: { name: "精明雞", icon: "🐓", trait: "精明細緻" },
  戌: { name: "忠誠犬", icon: "🐕", trait: "忠誠守護" },
  亥: { name: "智慧豬", icon: "🐗", trait: "福德圓滿" },
};

export const LegionCards = ({ baziResult }: LegionCardsProps) => {
  const { pillars, nayin } = baziResult;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">四時軍團戰略佈局</h2>
        <p className="text-muted-foreground">你的人生，就是一場軍團策略遊戲</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(["year", "month", "day", "hour"] as const).map((pillar) => {
          const config = legionConfig[pillar];
          const pillarData = pillars[pillar];
          const Icon = config.icon;
          
          const commander = tianganRoles[pillarData.stem];
          const advisor = dizhiRoles[pillarData.branch];
          const battlefield = nayin[pillar as keyof typeof nayin];

          return (
            <Card
              key={pillar}
              className={`p-6 bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border-2 border-${config.color}/50 card-glow hover:scale-[1.02] transition-transform`}
            >
              {/* 軍團標題 */}
              <div className="flex items-center gap-3 mb-6">
                <Icon className={`w-8 h-8 text-${config.color}`} />
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>

              {/* 主將（天干） */}
              <div className="mb-4 p-4 bg-card/50 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-primary border-primary/50">
                    主將
                  </Badge>
                  <span className="text-3xl">{commander.icon}</span>
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {pillarData.stem} - {commander.name}
                </div>
                <div className="text-sm text-muted-foreground">{commander.trait}</div>
              </div>

              {/* 軍師（地支） */}
              <div className="mb-4 p-4 bg-card/50 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-secondary border-secondary/50">
                    軍師
                  </Badge>
                  <span className="text-3xl">{advisor.icon}</span>
                </div>
                <div className="text-xl font-bold text-foreground mb-1">
                  {pillarData.branch} - {advisor.name}
                </div>
                <div className="text-sm text-muted-foreground">{advisor.trait}</div>
              </div>

              {/* 納音戰場 */}
              <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="text-sm text-muted-foreground mb-1">⚔️ 納音戰場</div>
                <div className="text-lg font-semibold text-accent">{battlefield}</div>
              </div>

              {/* AI 軍團故事（預留） */}
              <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                <div className="text-sm text-muted-foreground mb-2">📖 軍團故事</div>
                <p className="text-sm text-foreground leading-relaxed">
                  在{baziResult.name}的{config.name}中，{commander.name}擔任主將，以{commander.trait}的特質領導著整個軍團。
                  軍師{advisor.name}以{advisor.trait}的智慧輔佐，共同在{battlefield}的戰場上創造傳奇...
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
