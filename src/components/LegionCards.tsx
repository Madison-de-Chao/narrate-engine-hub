import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Swords, Users, Heart, Sparkles, Crown, Shield, Star, Zap } from "lucide-react";
import tenGodsData from "@/data/ten_gods.json";
import shenshaData from "@/data/shensha.json";

interface LegionCardsProps {
  baziResult: BaziResult;
}

const legionConfig = {
  year: {
    name: "祖源軍團",
    icon: "👑",
    color: "text-legion-family",
    gradient: "bg-gradient-to-br from-legion-family/20 to-legion-family/5",
    description: "承載家族傳承的根基力量",
    lifeDomain: "家庭背景、童年經歷、祖輩關係",
    stage: "童年成長與青少年發展",
  },
  month: {
    name: "關係軍團",
    icon: "🤝",
    color: "text-legion-growth",
    gradient: "bg-gradient-to-br from-legion-growth/20 to-legion-growth/5",
    description: "掌管人際網絡的社交力量",
    lifeDomain: "父母關係、工作事業、人際社交",
    stage: "青年奮鬥與中年事業",
  },
  day: {
    name: "核心軍團",
    icon: "⭐",
    color: "text-legion-self",
    gradient: "bg-gradient-to-br from-legion-self/20 to-legion-self/5",
    description: "體現真實自我的本質力量",
    lifeDomain: "個人性格、婚姻感情、核心自我",
    stage: "成年自我實現",
  },
  hour: {
    name: "未來軍團",
    icon: "🚀",
    color: "text-legion-future",
    gradient: "bg-gradient-to-br from-legion-future/20 to-legion-future/5",
    description: "開創未來發展的希望力量",
    lifeDomain: "子女教育、晚年生活、未來規劃",
    stage: "晚年智慧與傳承延續",
  },
};

const tianganRoles: { [key: string]: { role: string; trait: string } } = {
  甲: { role: "陽木棟樑", trait: "堅毅不拔的領導者" },
  乙: { role: "陰木花草", trait: "柔韌適應的智者" },
  丙: { role: "陽火烈日", trait: "熱情奔放的先驅" },
  丁: { role: "陰火燭光", trait: "溫暖細膩的啟發者" },
  戊: { role: "陽土高山", trait: "穩重可靠的守護者" },
  己: { role: "陰土田園", trait: "包容滋養的培育者" },
  庚: { role: "陽金鋼鐵", trait: "果斷剛毅的戰士" },
  辛: { role: "陰金珠玉", trait: "精緻優雅的鑑賞家" },
  壬: { role: "陽水江河", trait: "靈活變通的探索者" },
  癸: { role: "陰水雨露", trait: "純淨透澈的療癒者" },
};

const dizhiRoles: { [key: string]: { role: string; trait: string } } = {
  子: { role: "水鼠", trait: "機智靈活，善於謀略" },
  丑: { role: "土牛", trait: "勤勞踏實，穩健持久" },
  寅: { role: "木虎", trait: "勇猛果敢，開拓進取" },
  卯: { role: "木兔", trait: "溫文儒雅，和諧共處" },
  辰: { role: "土龍", trait: "變化多端，威嚴神秘" },
  巳: { role: "火蛇", trait: "深沉智慧，洞察先機" },
  午: { role: "火馬", trait: "熱情奔放，積極向上" },
  未: { role: "土羊", trait: "溫順善良，藝術氣質" },
  申: { role: "金猴", trait: "聰明活潑，靈巧多變" },
  酉: { role: "金雞", trait: "精明細緻，條理分明" },
  戌: { role: "土犬", trait: "忠誠守護，正直可靠" },
  亥: { role: "水豬", trait: "福德圓滿，寬厚仁慈" },
};

export const LegionCards = ({ baziResult }: LegionCardsProps) => {
  const { pillars, nayin, tenGods } = baziResult;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-3">
          四時軍團詳細故事
        </h2>
        <p className="text-muted-foreground">每個軍團的完整命盤解釋</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {(["year", "month", "day", "hour"] as const).map((pillarName) => {
          const legion = legionConfig[pillarName];
          const pillar = pillars[pillarName];
          const { stem, branch } = pillar;
          const tenGod = tenGods[pillarName] || { stem: "待計算", branch: "待計算" };
          
          const commanderRole = tianganRoles[stem];
          const advisorRole = dizhiRoles[branch];

          return (
            <Card key={pillarName} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className={`absolute inset-0 ${legion.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className={`text-5xl ${legion.color}`}>{legion.icon}</div>
                  <div>
                    <CardTitle className="text-3xl">{legion.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{legion.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative">
                {/* 基本資訊卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">干支</p>
                    <p className="font-bold text-xl">{stem}{branch}</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">納音</p>
                    <p className="font-semibold text-lg">{nayin[pillarName] || "-"}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg border border-accent/30">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      十神(天干)
                    </p>
                    <p className="font-bold text-lg text-accent">{tenGod?.stem || "-"}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg border border-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      十神(地支)
                    </p>
                    <p className="font-bold text-lg text-secondary">{tenGod?.branch || "-"}</p>
                  </div>
                </div>

                {/* 指揮官與軍師 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-lg border-2 ${legion.gradient} border-primary/30`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-6 h-6 text-primary" />
                      <h4 className="font-bold text-lg">天干 · 指揮官</h4>
                    </div>
                    <p className="text-3xl font-bold mb-2">{stem}</p>
                    <p className="text-lg font-semibold text-primary mb-2">{commanderRole?.role}</p>
                    <p className="text-sm text-muted-foreground">{commanderRole?.trait}</p>
                  </div>

                  <div className={`p-5 rounded-lg border-2 ${legion.gradient} border-secondary/30`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-6 h-6 text-secondary" />
                      <h4 className="font-bold text-lg">地支 · 軍師</h4>
                    </div>
                    <p className="text-3xl font-bold mb-2">{branch}</p>
                    <p className="text-lg font-semibold text-secondary mb-2">{advisorRole?.role}</p>
                    <p className="text-sm text-muted-foreground">{advisorRole?.trait}</p>
                  </div>
                </div>

                {/* AI生成的150字軍團傳說故事 */}
                <div className={`p-5 rounded-lg ${legion.gradient} border-2 border-accent/30`}>
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    軍團傳說
                  </h4>
                  <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                    {baziResult.legionStories?.[pillarName] || (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="animate-pulse">✨</div>
                        <span>正在生成專屬軍團傳說故事...</span>
                      </div>
                    )}
                  </div>
                  {baziResult.legionStories?.[pillarName] && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground italic">
                        💡 這個故事展示了{legion.name}對你在{legion.stage}的影響。記住：這些是天賦潛能的展現，真正的選擇權永遠在你手中。
                      </p>
                    </div>
                  )}
                </div>

                {/* 深度分析標題 */}
                <div className="pt-4 border-t-2 border-border/50">
                  <h4 className="font-bold text-2xl mb-4 flex items-center gap-2">
                    🔍 深度分析與註釋
                  </h4>
                </div>

                {/* 深度分析區塊 */}
                <div className="space-y-4">
                  {/* 命理核心分析 */}
                  <div className="p-4 bg-card/40 rounded-lg border border-border/40">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      🔍 命理核心分析
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      此柱五行配置體現陰陽調和的特質。天干{stem}與地支{branch}相互配合，展現獨特的能量場特徵...
                    </p>
                  </div>

                  {/* 納音深度解讀 */}
                  <div className="p-4 bg-card/40 rounded-lg border border-border/40">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      🎵 納音深度解讀
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {nayin[pillarName] || "此納音"}在命理學中代表獨特的命格特質。在{legion.name}的位置上，
                      象徵著{pillarName === 'year' ? '童年環境與家族傳承' : pillarName === 'month' ? '社會關係與事業發展' : pillarName === 'day' ? '個人特質與內在品格' : '未來發展與子女運勢'}的體現。
                      此納音與生俱來的特質將在{legion.stage}階段發揮重要作用。
                    </p>
                  </div>

                  {/* 生活層面影響 */}
                  <div className="p-4 bg-card/40 rounded-lg border border-border/40">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      🏛 生活層面影響
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      此柱在現實生活中主要影響{legion.lifeDomain}。
                      天干{stem}的{commanderRole?.trait}特質，結合地支{branch}的{advisorRole?.trait}能量，
                      在這些方面要{pillarName === 'year' ? '重視家族傳統，保持與長輩的良好關係' : pillarName === 'month' ? '積極建立人脈，把握事業發展機會' : pillarName === 'day' ? '認識真實自我，經營好親密關係' : '提前規劃未來，注重自我實現'}。
                    </p>
                  </div>

                  {/* 十神關係分析 */}
                  <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border-2 border-accent/30">
                    <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-accent">
                      <Star className="w-6 h-6" />
                      十神關係分析
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 天干十神 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/20 border-primary/40">
                            天干：{tenGod?.stem || "未知"}
                          </Badge>
                        </div>
                        {tenGod?.stem && tenGodsData.tenGodsRules[tenGod.stem as keyof typeof tenGodsData.tenGodsRules] && (
                          <div className="space-y-2 text-sm">
                            <p className="text-foreground">
                              <span className="font-semibold">象徵：</span>
                              {tenGodsData.tenGodsRules[tenGod.stem as keyof typeof tenGodsData.tenGodsRules].象徵}
                            </p>
                            <p className="text-green-600 dark:text-green-400">
                              <span className="font-semibold">正面：</span>
                              {tenGodsData.tenGodsRules[tenGod.stem as keyof typeof tenGodsData.tenGodsRules].正面}
                            </p>
                            <p className="text-amber-600 dark:text-amber-400">
                              <span className="font-semibold">負面：</span>
                              {tenGodsData.tenGodsRules[tenGod.stem as keyof typeof tenGodsData.tenGodsRules].負面}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* 地支十神 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-secondary/20 border-secondary/40">
                            地支：{tenGod?.branch || "未知"}
                          </Badge>
                        </div>
                        {tenGod?.branch && tenGodsData.tenGodsRules[tenGod.branch as keyof typeof tenGodsData.tenGodsRules] && (
                          <div className="space-y-2 text-sm">
                            <p className="text-foreground">
                              <span className="font-semibold">象徵：</span>
                              {tenGodsData.tenGodsRules[tenGod.branch as keyof typeof tenGodsData.tenGodsRules].象徵}
                            </p>
                            <p className="text-green-600 dark:text-green-400">
                              <span className="font-semibold">正面：</span>
                              {tenGodsData.tenGodsRules[tenGod.branch as keyof typeof tenGodsData.tenGodsRules].正面}
                            </p>
                            <p className="text-amber-600 dark:text-amber-400">
                              <span className="font-semibold">負面：</span>
                              {tenGodsData.tenGodsRules[tenGod.branch as keyof typeof tenGodsData.tenGodsRules].負面}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 神煞加持效應 */}
                  <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border-2 border-purple-500/30">
                    <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-6 h-6" />
                      神煞加持效應
                    </h5>
                    {baziResult.shensha.length > 0 ? (
                      <div className="grid gap-3">
                        {baziResult.shensha.slice(0, 4).map((sha, idx) => {
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

                          const categoryColor = category === '吉神' ? 'bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300' :
                                               category === '凶煞' ? 'bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300' :
                                               category === '桃花' ? 'bg-pink-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300' :
                                               'bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300';

                          return (
                            <div key={idx} className={`p-3 rounded-lg border ${categoryColor}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-bold text-base">{sha}</div>
                                <Badge variant="outline" className="text-xs">{category}</Badge>
                              </div>
                              {shenshaInfo && (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{shenshaInfo.作用}</p>
                                  <p className="text-xs opacity-90">{shenshaInfo.現代意義}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {baziResult.shensha.length > 4 && (
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            還有 {baziResult.shensha.length - 4} 個神煞未顯示
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">此柱暫無特殊神煞</p>
                    )}
                  </div>

                  {/* 發展策略建議 */}
                  <div className="p-5 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary">
                      🌟 發展策略建議
                    </h5>
                    <p className="text-sm leading-relaxed">
                      充分發揮{stem}的{commanderRole?.trait}特質，同時運用{branch}的{advisorRole?.trait}能力，
                      結合{nayin[pillarName] || "此納音"}的優勢，可以在{pillarName === 'year' ? '家庭關係與個人根基' : pillarName === 'month' ? '事業發展與人際網絡' : pillarName === 'day' ? '個人成長與感情生活' : '創新創造與未來規劃'}方面取得重大突破。
                    </p>
                  </div>

                  {/* 運勢週期提醒 */}
                  <div className="p-5 bg-secondary/10 rounded-lg border-2 border-secondary/30">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2 text-secondary">
                      📈 運勢週期提醒
                    </h5>
                    <p className="text-sm leading-relaxed">
                      此柱的能量在特定時期最為活躍，建議在這些時間段內重點把握機會，積極行動。
                      配合自然節律與個人命局，可以事半功倍。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
