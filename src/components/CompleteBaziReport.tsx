import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Sparkles, Star, Shield, Zap, Swords, Target, Map, Crown, Award } from "lucide-react";
import tenGodsData from "@/data/ten_gods.json";
import shenshaData from "@/data/shensha.json";

interface CompleteBaziReportProps {
  baziResult: BaziResult;
}

export const CompleteBaziReport = ({ baziResult }: CompleteBaziReportProps) => {
  const { name, pillars, hiddenStems, tenGods, nayin, shensha, wuxing, yinyang } = baziResult;

  // 天干描述數據
  const tianganDescriptions: Record<string, any> = {
    "甲": { name: "森林將軍", image: "參天大樹", style: "重承諾，敢開疆拓土", weakness: "固執，不易轉彎" },
    "乙": { name: "花草軍師", image: "藤蔓花草", style: "協調圓融，善於美化", weakness: "優柔寡斷，隨境而變" },
    "丙": { name: "烈日戰神", image: "太陽光明", style: "熱情奔放，感染全軍", weakness: "急躁衝動，消耗過快" },
    "丁": { name: "燭光法師", image: "溫柔燭火", style: "細膩體貼，擅啟蒙", weakness: "情感敏感，力量有限" },
    "戊": { name: "山岳守護", image: "高山厚土", style: "可靠堅實，能守護全軍", weakness: "過於保守，難以靈活" },
    "己": { name: "大地母親", image: "田園沃土", style: "包容養育，實踐力強", weakness: "過度操勞，易受累" },
    "庚": { name: "鋼鐵騎士", image: "礦石鋼鐵", style: "直接強硬，果斷決斷", weakness: "過於剛烈，易傷盟友" },
    "辛": { name: "珠寶商人", image: "珠玉寶石", style: "重視品質，善於鑑賞", weakness: "過於挑剔，脆弱易傷" },
    "壬": { name: "江河船長", image: "江河大海", style: "胸懷寬廣，靈活多變", weakness: "漂泊善變，缺乏定性" },
    "癸": { name: "甘露天使", image: "雨露泉水", style: "溫柔細膩，智慧含蓄", weakness: "過於感性，憂慮纏身" }
  };

  // 地支描述數據
  const dizhiDescriptions: Record<string, any> = {
    "子": { name: "夜行刺客", symbol: "冬至之水", character: "聰明靈活，反應快", weakness: "缺乏耐心，情緒化" },
    "丑": { name: "忠犬守衛", symbol: "寒冬大地", character: "勤勞耐力，穩中帶剛", weakness: "遲緩、保守" },
    "寅": { name: "森林獵人", symbol: "春雷初動", character: "勇猛果敢，開創力強", weakness: "急躁，缺耐性" },
    "卯": { name: "春兔使者", symbol: "春花盛開", character: "柔美雅靜，善於社交", weakness: "過於柔弱，缺決斷" },
    "辰": { name: "龍族法師", symbol: "水土交雜", character: "多才多變，能容納百川", weakness: "內在矛盾，常陷糾結" },
    "巳": { name: "火蛇術士", symbol: "夏日將至", character: "聰慧靈動，足智多謀", weakness: "多疑、善於隱匿" },
    "午": { name: "烈馬騎兵", symbol: "盛夏正陽", character: "熱情奔放，行動力強", weakness: "衝動，耐力不足" },
    "未": { name: "溫羊牧者", symbol: "夏末收成", character: "溫和耐心，注重和諧", weakness: "優柔寡斷，缺魄力" },
    "申": { name: "靈猴戰士", symbol: "秋風肅殺", character: "聰明機警，反應靈巧", weakness: "反覆無常，善變狡黠" },
    "酉": { name: "金雞衛士", symbol: "秋收精煉", character: "細膩守護，重原則", weakness: "過於嚴苛，難妥協" },
    "戌": { name: "戰犬統領", symbol: "深秋守土", character: "忠誠可靠，重責任", weakness: "固執己見，難變通" },
    "亥": { name: "靈豬智者", symbol: "冬藏萬物", character: "智慧深邃，善於謀劃", weakness: "過度隱藏，難以表達" }
  };

  return (
    <div id="bazi-complete-report" className="space-y-8">
      {/* 序章：彩虹靈魂與命運戰場 */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm border-primary/30">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            虹靈御所八字人生兵法
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">序章：彩虹靈魂與命運戰場</h2>
          <div className="text-lg text-muted-foreground max-w-3xl mx-auto space-y-3 leading-relaxed">
            <p>歡迎來到 虹靈御所。在這裡，我們相信：<span className="text-primary font-semibold">八字不是宿命，而是靈魂的戰場。</span></p>
            <p>你出生的那一刻，時間的能量化為四個兵團：</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">年柱 → 家族兵團</div>
                <div className="text-sm text-muted-foreground">祖上的旗幟與傳承</div>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="font-semibold">月柱 → 成長兵團</div>
                <div className="text-sm text-muted-foreground">環境的資源與考驗</div>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="font-semibold">日柱 → 本我兵團</div>
                <div className="text-sm text-muted-foreground">靈魂的核心與真我</div>
              </div>
              <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                <Map className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">時柱 → 未來兵團</div>
                <div className="text-sm text-muted-foreground">理想、後代與志向</div>
              </div>
            </div>
            <p className="text-primary font-medium">你的人生，就是一場軍團策略遊戲。你不是棋子，而是指揮官。</p>
          </div>
        </div>
      </Card>

      {/* 第一軍：天干主將 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary" />
          第一軍：天干主將
        </h2>
        <p className="text-muted-foreground mb-6">天干，是八字兵團的主將。它們是外顯的將領，直接表現出人格、行為與領導風格。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar) => {
            const pillarData = pillars[pillar as keyof typeof pillars];
            const stemDesc = tianganDescriptions[pillarData.stem];
            const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
            const pillarIndex = ["year", "month", "day", "hour"].indexOf(pillar);
            
            return (
              <Card key={pillar} className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <div className="text-center mb-3">
                  <Badge variant="outline" className="mb-2">{pillarNames[pillarIndex]}</Badge>
                  <div className="text-4xl font-bold text-primary mb-2">{pillarData.stem}</div>
                  <div className="text-xl font-semibold text-foreground">{stemDesc?.name}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">形象</div>
                      <div className="text-foreground">{stemDesc?.image}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">風格</div>
                      <div className="text-foreground">{stemDesc?.style}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">弱點</div>
                      <div className="text-foreground">{stemDesc?.weakness}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* 第二軍：地支軍師 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-secondary" />
          第二軍：地支軍師
        </h2>
        <p className="text-muted-foreground mb-6">如果說天干是主將，那麼地支就是軍師。軍師是深層底蘊，掌握資源、人脈與背景。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar) => {
            const pillarData = pillars[pillar as keyof typeof pillars];
            const branchDesc = dizhiDescriptions[pillarData.branch];
            const stems = hiddenStems[pillar as keyof typeof hiddenStems] || [];
            const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
            const pillarIndex = ["year", "month", "day", "hour"].indexOf(pillar);
            
            return (
              <Card key={pillar} className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                <div className="text-center mb-3">
                  <Badge variant="outline" className="mb-2">{pillarNames[pillarIndex]}</Badge>
                  <div className="text-4xl font-bold text-secondary mb-2">{pillarData.branch}</div>
                  <div className="text-xl font-semibold text-foreground">{branchDesc?.name}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">象徵</div>
                      <div className="text-foreground">{branchDesc?.symbol}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">性格</div>
                      <div className="text-foreground">{branchDesc?.character}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-muted-foreground">藏干</div>
                      <div className="text-foreground">{Array.isArray(stems) ? stems.join('、') : '-'}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* 第三軍：五行戰力 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-accent" />
          第三軍：五行戰力
        </h2>
        <p className="text-muted-foreground mb-6">五行是軍團的能量屬性。每一種能量代表不同的戰力類型。</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "木", value: wuxing.wood, color: "text-green-500", description: "成長突破力" },
            { name: "火", value: wuxing.fire, color: "text-red-500", description: "行動爆發力" },
            { name: "土", value: wuxing.earth, color: "text-yellow-600", description: "穩定承載力" },
            { name: "金", value: wuxing.metal, color: "text-gray-400", description: "決斷執行力" },
            { name: "水", value: wuxing.water, color: "text-blue-500", description: "智慧應變力" }
          ].map((element) => (
            <Card key={element.name} className="p-4 text-center bg-gradient-to-br from-card/50 to-card/30">
              <div className={`text-3xl font-bold ${element.color} mb-1`}>{element.name}</div>
              <div className="text-2xl font-semibold text-foreground mb-2">{element.value}</div>
              <div className="text-xs text-muted-foreground">{element.description}</div>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground mb-1">陽性能量</div>
              <div className="text-3xl font-bold text-blue-500">{yinyang.yang}</div>
              <div className="text-sm text-muted-foreground mt-1">外放、積極、主動</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground mb-1">陰性能量</div>
              <div className="text-3xl font-bold text-purple-500">{yinyang.yin}</div>
              <div className="text-sm text-muted-foreground mt-1">內斂、沉穩、含蓄</div>
            </div>
          </Card>
        </div>
      </Card>

      {/* 第五軍：十神技能樹 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Star className="w-6 h-6 text-accent" />
          第五軍：十神技能樹
        </h2>
        <p className="text-muted-foreground mb-6">十神是靈魂的技能樹，代表你在人生戰場上的行為模式與技能組合。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar) => {
            const gods = tenGods[pillar as keyof typeof tenGods] || { stem: "", branch: "" };
            const stemGodInfo = tenGodsData.tenGodsRules[gods.stem as keyof typeof tenGodsData.tenGodsRules];
            const branchGodInfo = tenGodsData.tenGodsRules[gods.branch as keyof typeof tenGodsData.tenGodsRules];
            const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
            const pillarIndex = ["year", "month", "day", "hour"].indexOf(pillar);
            
            return (
              <Card key={pillar} className="p-4 bg-gradient-to-br from-card/80 to-card/40 border-border/50 space-y-3">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">{pillarNames[pillarIndex]}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">天干技能</span>
                    </div>
                    <div className="text-lg font-bold text-accent mb-1">{gods.stem || "-"}</div>
                    {stemGodInfo && (
                      <div className="text-xs text-muted-foreground">{stemGodInfo.象徵}</div>
                    )}
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-secondary" />
                      <span className="text-xs text-muted-foreground">地支技能</span>
                    </div>
                    <div className="text-lg font-bold text-accent mb-1">{gods.branch || "-"}</div>
                    {branchGodInfo && (
                      <div className="text-xs text-muted-foreground">{branchGodInfo.象徵}</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* 第六軍：神煞兵符 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-accent" />
          第六軍：神煞兵符
        </h2>
        <p className="text-muted-foreground mb-6">神煞是人生戰場上的特殊兵符，能觸發額外的事件與效果。</p>
        
        {shensha && shensha.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shensha.map((sha, index) => {
              // 在所有分類中查找神煞信息
              let shaInfo: any = null;
              let category = "";
              
              if (shenshaData.吉神[sha as keyof typeof shenshaData.吉神]) {
                shaInfo = shenshaData.吉神[sha as keyof typeof shenshaData.吉神];
                category = "吉神";
              } else if (shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞]) {
                shaInfo = shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞];
                category = "凶煞";
              } else if (shenshaData.桃花[sha as keyof typeof shenshaData.桃花]) {
                shaInfo = shenshaData.桃花[sha as keyof typeof shenshaData.桃花];
                category = "桃花";
              } else if (shenshaData["特殊神煞"][sha as keyof typeof shenshaData["特殊神煞"]]) {
                shaInfo = shenshaData["特殊神煞"][sha as keyof typeof shenshaData["特殊神煞"]];
                category = "特殊";
              }
              
              const isLucky = category === "吉神";
              
              return (
                <Card 
                  key={index} 
                  className={`p-4 ${isLucky ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30' : 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-lg font-bold text-foreground">{sha}</div>
                    <Badge variant={isLucky ? "default" : "destructive"} className="text-xs">
                      {category}
                    </Badge>
                  </div>
                  {shaInfo && (
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">{shaInfo.作用 || shaInfo.effect}</div>
                      {(shaInfo.現代意義 || shaInfo.modernInterpretation) && (
                        <div className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
                          {shaInfo.現代意義 || shaInfo.modernInterpretation}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">無特殊神煞</p>
        )}
      </Card>

      {/* 第七軍：納音戰場 */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Map className="w-6 h-6 text-secondary" />
          第七軍：納音戰場
        </h2>
        <p className="text-muted-foreground mb-6">納音是四柱兵團的戰場環境，決定了你在不同人生階段的作戰地形。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar) => {
            const nayinValue = nayin[pillar as keyof typeof nayin];
            const pillarNames = ["年柱戰場", "月柱戰場", "日柱戰場", "時柱戰場"];
            const pillarIndex = ["year", "month", "day", "hour"].indexOf(pillar);
            
            return (
              <Card key={pillar} className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                <Badge variant="outline" className="mb-3">{pillarNames[pillarIndex]}</Badge>
                <div className="text-2xl font-bold text-secondary mb-2">{nayinValue}</div>
                <div className="text-sm text-muted-foreground">
                  {pillar === "year" && "家族傳承的環境"}
                  {pillar === "month" && "社會發展的舞台"}
                  {pillar === "day" && "個人核心的場域"}
                  {pillar === "hour" && "未來延續的地形"}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* 兵法總結 */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm border-primary/30">
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">兵法總論</h2>
        <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto">
          <p className="text-lg leading-relaxed">
            {name}的八字命盤，就像一場完整的軍團戰役劇本。你的主將、軍師、戰力、技能、兵符和戰場，
            共同構成了你獨特的人生戰略圖。
          </p>
          <div className="p-6 bg-card/50 rounded-lg border border-primary/30">
            <p className="text-center text-lg font-medium text-primary mb-3">
              記住：你不是棋子，而是指揮官。
            </p>
            <p className="text-center text-foreground">
              命理展示的是「相對好走的路」，但選擇權始終在你手中。
              每一個決策、每一次行動，都在重新定義你的戰局。
            </p>
          </div>
          <p className="text-center text-sm italic text-muted-foreground pt-4">
            願你在人生的戰場上，運籌帷幄，決勝千里。
          </p>
        </div>
      </Card>
    </div>
  );
};
