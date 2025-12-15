import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, Users, Palette, Coins, Shield, BookOpen,
  Heart, Briefcase, Home, Lightbulb, AlertTriangle
} from "lucide-react";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";

interface TenGodsAnalysisProps {
  baziResult: BaziResult;
}

// 十神分類
const TEN_GODS_CATEGORIES = {
  比劫: ['比肩', '劫財'],
  食傷: ['食神', '傷官'],
  財星: ['正財', '偏財'],
  官殺: ['正官', '七殺'],
  印星: ['正印', '偏印'],
};

// 十神顏色配置
const TEN_GODS_COLORS: Record<string, { color: string; bgColor: string }> = {
  '比肩': { color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-cyan-500/5' },
  '劫財': { color: 'text-cyan-300', bgColor: 'from-cyan-400/20 to-cyan-400/5' },
  '食神': { color: 'text-green-400', bgColor: 'from-green-500/20 to-green-500/5' },
  '傷官': { color: 'text-emerald-400', bgColor: 'from-emerald-500/20 to-emerald-500/5' },
  '正財': { color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-500/5' },
  '偏財': { color: 'text-yellow-400', bgColor: 'from-yellow-500/20 to-yellow-500/5' },
  '正官': { color: 'text-blue-400', bgColor: 'from-blue-500/20 to-blue-500/5' },
  '七殺': { color: 'text-indigo-400', bgColor: 'from-indigo-500/20 to-indigo-500/5' },
  '正印': { color: 'text-violet-400', bgColor: 'from-violet-500/20 to-violet-500/5' },
  '偏印': { color: 'text-purple-400', bgColor: 'from-purple-500/20 to-purple-500/5' },
  '日元': { color: 'text-primary', bgColor: 'from-primary/20 to-primary/5' },
};

// 柱位解讀
const PILLAR_MEANINGS: Record<string, { area: string; relation: string }> = {
  year: { area: '祖業、社會', relation: '祖父母、長輩' },
  month: { area: '事業、父母', relation: '父母、兄弟' },
  day: { area: '自己、配偶', relation: '配偶、自身' },
  hour: { area: '子女、家庭', relation: '子女、後輩' },
};

// 十神在不同柱位的詳細解讀
const TEN_GODS_PILLAR_MEANINGS: Record<string, Record<string, string>> = {
  '比肩': {
    year: '祖上有兄弟姐妹助力，家族有合作傳統。',
    month: '與兄弟姐妹關係良好，事業上適合合夥或團隊合作。',
    day: '（日支為配偶宮）配偶個性獨立，有主見，夫妻間需相互尊重。',
    hour: '子女獨立自主，社交活躍，重視朋友關係。',
  },
  '劫財': {
    year: '祖上可能有財產爭奪，家族關係較複雜。',
    month: '事業競爭激烈，需防小人。與兄弟姐妹有財務糾紛的可能。',
    day: '配偶花錢較大方，夫妻間需財務分明。婚姻需防第三者。',
    hour: '子女花費較多，家庭開銷需規劃。',
  },
  '食神': {
    year: '祖上有藝術或技術傳承，家族有口福。',
    month: '才華易展現，有藝術天賦。事業上適合創作類工作。',
    day: '配偶溫和好相處，婚姻生活愉快。有美食緣分。',
    hour: '子女有才華，家庭生活愜意。',
  },
  '傷官': {
    year: '祖上有叛逆或創新之人，家族個性鮮明。',
    month: '表達欲強，可能與上司有衝突。適合自主性強的工作。',
    day: '配偶聰明有個性，婚姻中需要溝通。女命婚姻需注意。',
    hour: '子女聰明但個性強，需要多溝通。',
  },
  '正財': {
    year: '祖上有穩定產業，家境基礎不錯。',
    month: '財運穩定，工作收入好。事業上穩紮穩打。',
    day: '男命妻緣佳，配偶持家有方。婚姻穩定和諧。',
    hour: '子女孝順，家庭財務穩定。',
  },
  '偏財': {
    year: '祖上有經商或投資傳統，有意外之財緣分。',
    month: '有投資運，適合做生意。可能有兼職或副業收入。',
    day: '男命異性緣佳，需注意感情。配偶可能帶財。',
    hour: '子女有經商能力，家庭有偏財運。',
  },
  '正官': {
    year: '祖上有公職或受人尊敬，家教嚴格。',
    month: '事業運好，適合體制內發展。有升遷機會。',
    day: '女命丈夫運佳，配偶有責任感。婚姻受禮法約束。',
    hour: '子女有出息，家庭名聲好。',
  },
  '七殺': {
    year: '祖上有軍人或強勢人物，家族有挑戰性。',
    month: '面對激烈競爭，需要魄力突圍。適合挑戰性工作。',
    day: '配偶個性強勢，婚姻中有壓力。需要磨合與妥協。',
    hour: '子女可能較強勢，家庭需要平衡。',
  },
  '正印': {
    year: '祖上有文化人或受良好教育，家族重視學習。',
    month: '學業運好，有貴人提攜。適合文教類工作。',
    day: '配偶善解人意，婚姻有溫暖。有母親緣。',
    hour: '子女孝順，家庭精神生活豐富。',
  },
  '偏印': {
    year: '祖上有特殊才能或偏門技藝，家族思想獨特。',
    month: '有獨特才華，適合研究或特殊領域。直覺強。',
    day: '配偶思維獨特，婚姻需要理解。可能有玄學緣分。',
    hour: '子女有獨特才能，家庭氛圍獨特。',
  },
};

// 十神人生領域影響
const LIFE_AREA_INFLUENCE: Record<string, {
  career: string;
  wealth: string;
  relationship: string;
  health: string;
}> = {
  '比肩': {
    career: '適合團隊合作、合夥經營，有領導潛力但需要學會協調',
    wealth: '財運平穩，需防朋友借錢不還。適合穩健投資',
    relationship: '重視友情，但感情上可能有競爭者',
    health: '注意肌肉骨骼系統，避免過度勞累',
  },
  '劫財': {
    career: '有競爭力和爆發力，適合業務或競技類工作',
    wealth: '財來財去，需學會理財。防投機取巧',
    relationship: '異性緣佳但需防桃花劫',
    health: '注意血液循環，避免衝動受傷',
  },
  '食神': {
    career: '有藝術天賦，適合餐飲、創作、演藝等行業',
    wealth: '財運來自才華，收入與付出成正比',
    relationship: '人緣好，婚姻生活和諧美滿',
    health: '注意脾胃消化，避免暴飲暴食',
  },
  '傷官': {
    career: '有創新能力，適合設計、表演、律師等需要表達的工作',
    wealth: '才華變現能力強，但需要穩定心態',
    relationship: '個性強烈，需學會收斂。女命注意婚姻',
    health: '注意神經系統，避免過度敏感',
  },
  '正財': {
    career: '適合財務、會計、管理等穩定性工作',
    wealth: '正財運好，收入穩定，善於守財',
    relationship: '男命婚姻穩定，女命有持家能力',
    health: '整體健康良好，注意勿過度操勞',
  },
  '偏財': {
    career: '適合投資、貿易、銷售等靈活性工作',
    wealth: '有意外之財運，但也要防投資失利',
    relationship: '桃花運旺，男命需注意感情專一',
    health: '注意肝膽系統，避免應酬過多',
  },
  '正官': {
    career: '適合公職、管理、法律等需要權威的工作',
    wealth: '財運穩定，靠薪資收入為主',
    relationship: '女命丈夫運好，婚姻受禮法保護',
    health: '注意呼吸系統，避免壓力過大',
  },
  '七殺': {
    career: '適合軍警、競技、創業等需要魄力的工作',
    wealth: '財運起伏大，需要果斷把握機會',
    relationship: '感情中有壓力，需要強大內心',
    health: '注意肝膽和神經系統，避免過度緊張',
  },
  '正印': {
    career: '適合教育、文化、醫療等服務性工作',
    wealth: '財運平穩，有貴人相助',
    relationship: '感情細膩，婚姻溫馨有依靠',
    health: '整體健康佳，注意腎臟保養',
  },
  '偏印': {
    career: '適合研究、藝術、玄學等需要獨特思維的工作',
    wealth: '財運靠獨特技能，可能有偏門收入',
    relationship: '感情觀獨特，需找理解自己的人',
    health: '注意精神健康，避免鑽牛角尖',
  },
};

export const TenGodsAnalysis = ({ baziResult }: TenGodsAnalysisProps) => {
  const { tenGods, pillars } = baziResult;
  
  // 統計十神出現次數
  const tenGodsCounts: Record<string, number> = {};
  const allTenGods = [
    tenGods.year.stem, tenGods.year.branch,
    tenGods.month.stem, tenGods.month.branch,
    tenGods.day.branch, // 日干是日元，不計入
    tenGods.hour.stem, tenGods.hour.branch,
  ].filter(g => g !== '日元');
  
  allTenGods.forEach(god => {
    tenGodsCounts[god] = (tenGodsCounts[god] || 0) + 1;
  });

  // 找出最多的十神類別
  const categoryCounts: Record<string, number> = {};
  Object.entries(TEN_GODS_CATEGORIES).forEach(([category, gods]) => {
    categoryCounts[category] = gods.reduce((sum, god) => sum + (tenGodsCounts[god] || 0), 0);
  });
  
  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const pillarsArray = [
    { key: 'year', label: '年柱', stemGod: tenGods.year.stem, branchGod: tenGods.year.branch, stem: pillars.year.stem, branch: pillars.year.branch },
    { key: 'month', label: '月柱', stemGod: tenGods.month.stem, branchGod: tenGods.month.branch, stem: pillars.month.stem, branch: pillars.month.branch },
    { key: 'day', label: '日柱', stemGod: '日元', branchGod: tenGods.day.branch, stem: pillars.day.stem, branch: pillars.day.branch },
    { key: 'hour', label: '時柱', stemGod: tenGods.hour.stem, branchGod: tenGods.hour.branch, stem: pillars.hour.stem, branch: pillars.hour.branch },
  ];

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            十神關係分析
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary">
              日主：{pillars.day.stem}
            </Badge>
            {dominantCategory && dominantCategory[1] > 0 && (
              <Badge variant="secondary">
                {dominantCategory[0]}為主 × {dominantCategory[1]}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="pillars" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="pillars">四柱十神</TabsTrigger>
            <TabsTrigger value="life">人生領域</TabsTrigger>
            <TabsTrigger value="statistics">統計分析</TabsTrigger>
          </TabsList>

          {/* 四柱十神 */}
          <TabsContent value="pillars" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillarsArray.map(({ key, label, stemGod, branchGod, stem, branch }) => {
                const stemColors = TEN_GODS_COLORS[stemGod] || TEN_GODS_COLORS['日元'];
                const branchColors = TEN_GODS_COLORS[branchGod] || TEN_GODS_COLORS['日元'];
                const pillarMeaning = PILLAR_MEANINGS[key];
                const stemMeaning = stemGod !== '日元' 
                  ? TEN_GODS_PILLAR_MEANINGS[stemGod]?.[key] 
                  : '日元代表命主自身，是整個命盤的核心。';
                const branchMeaning = TEN_GODS_PILLAR_MEANINGS[branchGod]?.[key];
                
                return (
                  <div 
                    key={key}
                    className={`rounded-xl p-4 bg-gradient-to-br ${stemColors.bgColor} border border-border/30`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">({pillarMeaning?.area})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{pillarMeaning?.relation}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center p-2 rounded-lg bg-background/30">
                        <p className="text-xs text-muted-foreground mb-1">天干</p>
                        <p className="text-lg font-bold text-foreground">{stem}</p>
                        <Badge className={`${stemColors.color} bg-transparent border-current mt-1`}>
                          {stemGod}
                        </Badge>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-background/30">
                        <p className="text-xs text-muted-foreground mb-1">地支</p>
                        <p className="text-lg font-bold text-foreground">{branch}</p>
                        <Badge className={`${branchColors.color} bg-transparent border-current mt-1`}>
                          {branchGod}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {stemMeaning && (
                        <p className="text-muted-foreground">
                          <span className={`font-medium ${stemColors.color}`}>{stemGod}：</span>
                          {stemMeaning}
                        </p>
                      )}
                      {branchMeaning && branchGod !== stemGod && (
                        <p className="text-muted-foreground">
                          <span className={`font-medium ${branchColors.color}`}>{branchGod}：</span>
                          {branchMeaning}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* 人生領域影響 */}
          <TabsContent value="life" className="space-y-4 mt-6">
            {/* 根據最多的十神顯示影響 */}
            {Object.entries(tenGodsCounts)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([god, count]) => {
                const influence = LIFE_AREA_INFLUENCE[god];
                const colors = TEN_GODS_COLORS[god];
                const godInfo = tenGodsData.tenGodsRules[god as keyof typeof tenGodsData.tenGodsRules];
                
                if (!influence) return null;
                
                return (
                  <Card key={god} className={`p-4 bg-gradient-to-br ${colors?.bgColor || 'from-muted/30 to-muted/10'} border-border/30`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${colors?.color || 'text-foreground'} bg-transparent border-current`}>
                          {god} × {count}
                        </Badge>
                        {godInfo && (
                          <span className="text-xs text-muted-foreground">
                            {godInfo.象徵}
                          </span>
                        )}
                      </div>
                      {godInfo && (
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                            {godInfo.正面.split('、')[0]}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-rose-400 border-rose-400/30">
                            {godInfo.負面.split('、')[0]}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">事業</p>
                          <p className="text-xs text-muted-foreground">{influence.career}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Coins className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">財運</p>
                          <p className="text-xs text-muted-foreground">{influence.wealth}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">感情</p>
                          <p className="text-xs text-muted-foreground">{influence.relationship}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">健康</p>
                          <p className="text-xs text-muted-foreground">{influence.health}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </TabsContent>

          {/* 統計分析 */}
          <TabsContent value="statistics" className="space-y-4 mt-6">
            {/* 十神分布 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(TEN_GODS_CATEGORIES).map(([category, gods]) => {
                const count = categoryCounts[category] || 0;
                const isHighest = category === dominantCategory?.[0];
                
                return (
                  <div 
                    key={category}
                    className={`rounded-xl p-3 text-center border ${
                      isHighest 
                        ? 'border-primary/50 bg-primary/10' 
                        : 'border-border/30 bg-muted/30'
                    }`}
                  >
                    <p className={`font-semibold ${isHighest ? 'text-primary' : 'text-foreground'}`}>
                      {category}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {gods.map(god => {
                        const godCount = tenGodsCounts[god] || 0;
                        return (
                          <Badge 
                            key={god} 
                            variant="outline" 
                            className={`text-xs ${TEN_GODS_COLORS[god]?.color || 'text-muted-foreground'}`}
                          >
                            {god.slice(0, 1)} {godCount}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 格局提示 */}
            <Card className="p-4 bg-muted/30 border-border/30">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                命局特點
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {dominantCategory && (
                  <p>
                    <span className="text-foreground font-medium">主要格局：</span>
                    {dominantCategory[0] === '比劫' && '命局比劫旺，獨立性強，重視朋友和兄弟關係。需注意破財和競爭。'}
                    {dominantCategory[0] === '食傷' && '命局食傷旺，才華洋溢，創造力強。需注意心態平和，避免過於表現。'}
                    {dominantCategory[0] === '財星' && '命局財星旺，理財能力強，重視物質生活。男命異性緣佳。'}
                    {dominantCategory[0] === '官殺' && '命局官殺旺，有責任感和壓力，適合從政或管理。需注意健康。'}
                    {dominantCategory[0] === '印星' && '命局印星旺，有學習能力和貴人運。需注意避免過度依賴。'}
                  </p>
                )}
                {Object.keys(tenGodsCounts).length <= 3 && (
                  <p>
                    <span className="text-foreground font-medium">提示：</span>
                    十神種類較少，個性特點鮮明，專注力強。
                  </p>
                )}
                {Object.keys(tenGodsCounts).length >= 6 && (
                  <p>
                    <span className="text-foreground font-medium">提示：</span>
                    十神種類豐富，人生經歷多元，適應力強。
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
