import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";
import shenshaData from "@/data/shensha.json";
import { Sparkles, Star, Shield, Zap } from "lucide-react";

interface TraditionalBaziDisplayProps {
  baziResult: BaziResult;
}

export const TraditionalBaziDisplay = ({ baziResult }: TraditionalBaziDisplayProps) => {
  const { pillars, hiddenStems, tenGods, nayin, shensha } = baziResult;

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
      <h2 className="text-2xl font-bold text-foreground mb-6">傳統八字排盤</h2>
      
      <div className="space-y-6">
        {/* 四柱八字 */}
        <div className="grid grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar, index) => {
            const pillarData = pillars[pillar as keyof typeof pillars];
            const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
            
            return (
              <div key={pillar} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{pillarNames[index]}</div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-2">{pillarData.stem}</div>
                  <div className="text-3xl font-bold text-secondary">{pillarData.branch}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 藏干 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">藏干</h3>
          <div className="grid grid-cols-4 gap-4">
        {["year", "month", "day", "hour"].map((pillar) => {
              const stems = hiddenStems[pillar as keyof typeof hiddenStems] || [];
              return (
                <div key={pillar} className="bg-muted/20 rounded p-3 text-center">
                  <div className="flex justify-center gap-1">
                    {Array.isArray(stems) && stems.map((stem: string, idx: number) => (
                      <span key={idx} className="text-sm text-muted-foreground">
                        {stem}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 十神 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            十神
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {["year", "month", "day", "hour"].map((pillar) => {
              const gods = tenGods[pillar as keyof typeof tenGods] || { stem: "", branch: "" };
              const stemGodInfo = tenGodsData.tenGodsRules[gods.stem as keyof typeof tenGodsData.tenGodsRules];
              const branchGodInfo = tenGodsData.tenGodsRules[gods.branch as keyof typeof tenGodsData.tenGodsRules];
              
              return (
                <div key={pillar} className="bg-gradient-to-br from-card/80 to-card/40 rounded-lg p-4 border border-border/50 space-y-2 hover:border-accent/50 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">天干</span>
                    </div>
                    <div className="text-lg font-bold text-accent">{gods.stem || "-"}</div>
                    {stemGodInfo && (
                      <div className="text-xs text-muted-foreground">
                        {stemGodInfo.象徵}
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-secondary" />
                      <span className="text-xs text-muted-foreground">地支</span>
                    </div>
                    <div className="text-lg font-bold text-secondary">{gods.branch || "-"}</div>
                    {branchGodInfo && (
                      <div className="text-xs text-muted-foreground">
                        {branchGodInfo.象徵}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 納音 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">納音五行</h3>
          <div className="grid grid-cols-4 gap-4">
            {["year", "month", "day", "hour"].map((pillar) => {
              const nayinValue = nayin[pillar as keyof typeof nayin] || "-";
              return (
                <div key={pillar} className="bg-muted/20 rounded p-3 text-center">
                  <div className="text-sm text-primary">{nayinValue}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 神煞 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            神煞
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shensha.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">暫無神煞資訊</p>
            ) : (
              shensha.map((sha, index) => {
                // 查找神煞詳細資訊
                let shenshaInfo: any = null;
                let category = '';
                
                // 在吉神中查找
                if (shenshaData.吉神[sha as keyof typeof shenshaData.吉神]) {
                  shenshaInfo = shenshaData.吉神[sha as keyof typeof shenshaData.吉神];
                  category = '吉神';
                }
                // 在凶煞中查找
                else if (shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞]) {
                  shenshaInfo = shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞];
                  category = '凶煞';
                }
                // 在桃花中查找
                else if (shenshaData.桃花[sha as keyof typeof shenshaData.桃花]) {
                  shenshaInfo = shenshaData.桃花[sha as keyof typeof shenshaData.桃花];
                  category = '桃花';
                }
                // 在特殊神煞中查找
                else if (shenshaData.特殊神煞[sha as keyof typeof shenshaData.特殊神煞]) {
                  shenshaInfo = shenshaData.特殊神煞[sha as keyof typeof shenshaData.特殊神煞];
                  category = '特殊';
                }

                const bgColor = category === '吉神' ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' :
                               category === '凶煞' ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' :
                               category === '桃花' ? 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20' :
                               'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20';

                const textColor = category === '吉神' ? 'text-green-600 dark:text-green-400' :
                                 category === '凶煞' ? 'text-red-600 dark:text-red-400' :
                                 category === '桃花' ? 'text-pink-600 dark:text-pink-400' :
                                 'text-purple-600 dark:text-purple-400';

                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${bgColor} transition-all duration-200 group`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className={`font-bold text-lg ${textColor} group-hover:scale-105 transition-transform`}>
                          {sha}
                        </h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {category}
                        </Badge>
                      </div>
                    </div>
                    {shenshaInfo && (
                      <div className="space-y-2 mt-3">
                        <p className="text-sm font-medium text-foreground">
                          {shenshaInfo.作用}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shenshaInfo.現代意義}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
