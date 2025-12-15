import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";
import shenshaData from "@/data/shensha.json";
import { Sparkles, Star, Shield, Zap, User, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface TraditionalBaziDisplayProps {
  baziResult: BaziResult;
}

export const TraditionalBaziDisplay = ({ baziResult }: TraditionalBaziDisplayProps) => {
  const { pillars, hiddenStems, tenGods, nayin, shensha, name, birthDate, gender } = baziResult;

  // 格式化時辰顯示
  const getHourLabel = (branch: string) => {
    const hourMap: Record<string, string> = {
      '子': '子時 (23:00-01:00)',
      '丑': '丑時 (01:00-03:00)',
      '寅': '寅時 (03:00-05:00)',
      '卯': '卯時 (05:00-07:00)',
      '辰': '辰時 (07:00-09:00)',
      '巳': '巳時 (09:00-11:00)',
      '午': '午時 (11:00-13:00)',
      '未': '未時 (13:00-15:00)',
      '申': '申時 (15:00-17:00)',
      '酉': '酉時 (17:00-19:00)',
      '戌': '戌時 (19:00-21:00)',
      '亥': '亥時 (21:00-23:00)'
    };
    return hourMap[branch] || branch;
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
      {/* 裝飾性邊框光效 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-50" />
      <div className="absolute inset-[1px] rounded-lg bg-card" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">傳統八字排盤</h2>
        
        <div className="space-y-6">
          {/* 基本資料區 */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 rounded-xl p-5 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              命主基本資料
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">姓名</span>
                <p className="text-lg font-bold text-foreground">{name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">性別</span>
                <p className="text-lg font-semibold text-foreground">
                  {gender === 'male' ? '男' : gender === 'female' ? '女' : gender}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 出生日期
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {birthDate ? format(new Date(birthDate), 'yyyy年MM月dd日') : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">出生時辰</span>
                <p className="text-lg font-semibold text-foreground">
                  {getHourLabel(pillars.hour.branch)}
                </p>
              </div>
            </div>
          </div>

          {/* 四柱八字 */}
          <div className="grid grid-cols-4 gap-4">
            {["year", "month", "day", "hour"].map((pillar, index) => {
              const pillarData = pillars[pillar as keyof typeof pillars];
              const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
              
              return (
                <div key={pillar} className="text-center group">
                  <div className="text-sm text-muted-foreground mb-2">{pillarNames[index]}</div>
                  <div className="relative bg-muted/30 rounded-lg p-4 border border-border/50 transition-all duration-300 group-hover:border-primary/50">
                    {/* 懸停時的邊框發光 */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" style={{ filter: 'blur(4px)' }} />
                    <div className="relative z-10">
                      <div className="text-3xl font-bold text-primary mb-2">{pillarData.stem}</div>
                      <div className="text-3xl font-bold text-secondary">{pillarData.branch}</div>
                    </div>
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
                  
                  if (shenshaData.吉神[sha as keyof typeof shenshaData.吉神]) {
                    shenshaInfo = shenshaData.吉神[sha as keyof typeof shenshaData.吉神];
                    category = '吉神';
                  } else if (shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞]) {
                    shenshaInfo = shenshaData.凶煞[sha as keyof typeof shenshaData.凶煞];
                    category = '凶煞';
                  } else if (shenshaData.桃花[sha as keyof typeof shenshaData.桃花]) {
                    shenshaInfo = shenshaData.桃花[sha as keyof typeof shenshaData.桃花];
                    category = '桃花';
                  } else if (shenshaData.特殊神煞[sha as keyof typeof shenshaData.特殊神煞]) {
                    shenshaInfo = shenshaData.特殊神煞[sha as keyof typeof shenshaData.特殊神煞];
                    category = '特殊';
                  }

                  const borderColor = category === '吉神' ? 'border-emerald-500/40 hover:border-emerald-400' :
                                     category === '凶煞' ? 'border-rose-500/40 hover:border-rose-400' :
                                     category === '桃花' ? 'border-pink-500/40 hover:border-pink-400' :
                                     'border-violet-500/40 hover:border-violet-400';

                  const textColor = category === '吉神' ? 'text-emerald-400' :
                                   category === '凶煞' ? 'text-rose-400' :
                                   category === '桃花' ? 'text-pink-400' :
                                   'text-violet-400';

                  return (
                    <div 
                      key={index} 
                      className={`relative p-4 rounded-lg border-2 ${borderColor} bg-card/50 transition-all duration-300 group overflow-hidden`}
                    >
                      {/* 邊框發光效果 */}
                      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                           style={{ 
                             boxShadow: category === '吉神' ? '0 0 20px rgba(16, 185, 129, 0.3)' :
                                        category === '凶煞' ? '0 0 20px rgba(244, 63, 94, 0.3)' :
                                        category === '桃花' ? '0 0 20px rgba(236, 72, 153, 0.3)' :
                                        '0 0 20px rgba(139, 92, 246, 0.3)'
                           }} 
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-bold text-lg ${textColor}`}>
                            {sha}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {category}
                          </Badge>
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
