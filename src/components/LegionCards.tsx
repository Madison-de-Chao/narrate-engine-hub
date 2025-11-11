import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Swords, Users, Heart, Sparkles, Crown, Shield } from "lucide-react";

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
          const tenGod = tenGods[pillarName];
          
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
                    <p className="font-semibold text-lg">{nayin[pillarName]}</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">十神</p>
                    <p className="font-semibold text-lg">{tenGod.stem}</p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">神煞</p>
                    <p className="font-semibold text-sm">{baziResult.shensha.slice(0, 2).join('、')}</p>
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

                {/* 150字軍團故事 */}
                <div className={`p-5 rounded-lg ${legion.gradient} border-2 border-accent/30`}>
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    軍團傳說
                  </h4>
                  <p className="text-base leading-relaxed text-foreground">
                    在{pillarName === 'year' ? '你生命的源頭' : pillarName === 'month' ? '人際關係的戰場上' : pillarName === 'day' ? '你內心的核心要塞中' : '未來的地平線上'}，
                    {stem}將軍{pillarName === 'year' ? '統領著' : pillarName === 'month' ? '率領著' : pillarName === 'day' ? '統治著最重要的' : '領導著前瞻'}軍團。
                    這支由{stem}{branch}組成的部隊，蘊含著{nayin[pillarName]}的神秘力量。{commanderRole?.role}，
                    {pillarName === 'year' ? '掌管著你的根基與傳承' : pillarName === 'month' ? '專精於外交與合作策略' : pillarName === 'day' ? '是你真實自我的化身與代表' : '具有預見未來的卓越能力'}。
                    地支{branch}化身為{advisorRole?.role}，以其{advisorRole?.trait}的特質輔佐軍團。
                    這個軍團象徵著你的{legion.lifeDomain}，在{legion.stage}階段發揮重要作用...
                  </p>
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
                      {nayin[pillarName]}在命理學中代表獨特的命格特質。在{legion.name}的位置上，
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
                  <div className="p-4 bg-card/40 rounded-lg border border-border/40">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      ⚔️ 十神關係分析
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      作為{tenGod.stem}，此柱體現了特定的命理特質。
                      在人生格局中扮演重要角色，影響著你的{pillarName === 'year' ? '根基與傳承' : pillarName === 'month' ? '事業與人際' : pillarName === 'day' ? '性格與感情' : '創造與未來'}發展方向。
                    </p>
                  </div>

                  {/* 神煞加持效應 */}
                  <div className="p-4 bg-card/40 rounded-lg border border-border/40">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      🔮 神煞加持效應
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {baziResult.shensha.slice(0, 2).join('、')}等神煞的出現，
                      為此柱增添了{pillarName === 'year' ? '家族運勢與祖德庇佑' : pillarName === 'month' ? '事業發展與貴人助力' : pillarName === 'day' ? '個人魅力與感情運勢' : '創造靈感與子女運勢'}的特殊能量。
                    </p>
                  </div>

                  {/* 發展策略建議 */}
                  <div className="p-5 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary">
                      🌟 發展策略建議
                    </h5>
                    <p className="text-sm leading-relaxed">
                      充分發揮{stem}的{commanderRole?.trait}特質，同時運用{branch}的{advisorRole?.trait}能力，
                      結合{nayin[pillarName]}的優勢，可以在{pillarName === 'year' ? '家庭關係與個人根基' : pillarName === 'month' ? '事業發展與人際網絡' : pillarName === 'day' ? '個人成長與感情生活' : '創新創造與未來規劃'}方面取得重大突破。
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
