import { Card } from "@/components/ui/card";
import { BaziResult } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FourSeasonsCard } from "./FourSeasonsCard";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Flame, Mountain, TreeDeciduous, Gem,
  TrendingUp, TrendingDown, ArrowRight, Sparkles
} from "lucide-react";

interface AnalysisChartsProps {
  baziResult: BaziResult;
}

// 五行相生相剋關係
const WUXING_RELATIONS = {
  generate: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
  restrain: { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' },
};

const WUXING_NAMES: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
};

const WUXING_ICONS: Record<string, React.ReactNode> = {
  wood: <TreeDeciduous className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  earth: <Mountain className="w-4 h-4" />,
  metal: <Gem className="w-4 h-4" />,
  water: <Droplets className="w-4 h-4" />,
};

const WUXING_COLORS: Record<string, string> = {
  wood: 'text-green-500',
  fire: 'text-red-500',
  earth: 'text-yellow-600',
  metal: 'text-gray-400',
  water: 'text-blue-500',
};

// 根據日主五行和命局強弱生成動態建議
function generateDynamicSuggestions(wuxing: BaziResult['wuxing'], dayStem: string) {
  const stemElements: Record<string, string> = {
    '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  
  const dayElement = stemElements[dayStem] || 'earth';
  const total = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const dayElementPercent = (wuxing[dayElement as keyof typeof wuxing] / total) * 100;
  const isStrong = dayElementPercent > 25;
  
  // 找出最強和最弱的五行
  const sorted = Object.entries(wuxing).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];
  
  const developSuggestions: string[] = [];
  const cautionSuggestions: string[] = [];
  
  if (isStrong) {
    // 身強，需要洩耗
    const restrainedBy = Object.entries(WUXING_RELATIONS.restrain).find(([k, v]) => v === dayElement)?.[0];
    const generates = WUXING_RELATIONS.generate[dayElement as keyof typeof WUXING_RELATIONS.generate];
    
    developSuggestions.push(`發揮${WUXING_NAMES[dayElement]}的優勢，展現領導才能`);
    developSuggestions.push(`多接觸${WUXING_NAMES[generates]}相關事物，釋放能量`);
    if (restrainedBy) {
      developSuggestions.push(`適度接觸${WUXING_NAMES[restrainedBy]}，平衡過旺能量`);
    }
    
    cautionSuggestions.push('避免過於強勢，學會傾聽他人意見');
    cautionSuggestions.push(`控制${WUXING_NAMES[dayElement]}過旺帶來的負面影響`);
  } else {
    // 身弱，需要生扶
    const generatedBy = Object.entries(WUXING_RELATIONS.generate).find(([k, v]) => v === dayElement)?.[0];
    
    developSuggestions.push(`加強${WUXING_NAMES[dayElement]}能量，提升自信`);
    if (generatedBy) {
      developSuggestions.push(`多接觸${WUXING_NAMES[generatedBy]}相關事物，增強運勢`);
    }
    developSuggestions.push('培養穩定的生活節奏，增強內在力量');
    
    cautionSuggestions.push('避免過度消耗精力，學會適當休息');
    cautionSuggestions.push(`注意補充${WUXING_NAMES[weakest]}不足帶來的問題`);
  }
  
  return { developSuggestions, cautionSuggestions, isStrong, dayElement, strongest, weakest };
}

// 根據五行生成性格和運勢分析
function generateInfluenceAnalysis(wuxing: BaziResult['wuxing'], dayStem: string, yinyang: BaziResult['yinyang']) {
  const stemElements: Record<string, string> = {
    '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  
  const dayElement = stemElements[dayStem] || 'earth';
  const total = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  
  const personalityTraits: Record<string, { inner: string; outer: string }> = {
    wood: { 
      inner: '內心正直剛毅，具有堅定的理想和信念。善於規劃與成長，追求向上發展。', 
      outer: '行事果斷，有領導氣質。待人寬厚，但原則性強，不輕易妥協。' 
    },
    fire: { 
      inner: '內心熱情開朗，充滿活力與創造力。重視表達，渴望被認可與關注。', 
      outer: '光明磊落，魅力四射。善於激勵他人，但有時過於衝動急躁。' 
    },
    earth: { 
      inner: '內心穩重踏實，重視安全感與穩定。包容性強，願意承擔責任。', 
      outer: '處事公正，信守承諾。給人可靠感，但有時過於保守固執。' 
    },
    metal: { 
      inner: '內心堅毅果斷，追求完美與效率。重視原則，不輕易改變立場。', 
      outer: '處事乾脆利落，講求效率。重視公平正義，但有時過於嚴厲。' 
    },
    water: { 
      inner: '內心靈活多變，富有智慧與洞察力。善於觀察，思維敏捷。', 
      outer: '處世圓融，善於溝通。適應力強，但有時難以捉摸，缺乏定性。' 
    },
  };
  
  const careerAdvice: Record<string, string> = {
    wood: '適合教育、出版、設計創意、環保等需要成長和創造的領域。管理層或創業也是不錯的選擇。',
    fire: '適合媒體、演藝、公關行銷、餐飲等需要熱情和表達的領域。前台工作更能發揮魅力。',
    earth: '適合房地產、建築、農業、管理等需要穩定和耐心的領域。中後台支援工作也很合適。',
    metal: '適合金融、法律、科技製造、軍警等需要果斷和精準的領域。技術專業方向發展有利。',
    water: '適合貿易、物流、旅遊、諮詢等需要流動和溝通的領域。自由職業或外勤工作更適合。',
  };
  
  const relationshipAdvice: Record<string, string> = {
    wood: '感情中重視承諾和責任，一旦認定便會努力維護。需要學習更多的柔軟和浪漫。',
    fire: '感情中熱情主動，浪漫多情。需要控制衝動，學習更多的耐心和理解。',
    earth: '感情中穩重可靠，給人強烈的安全感。需要增加情趣，避免過於沉悶。',
    metal: '感情中認真專一，愛恨分明。需要學習柔軟表達，避免過於冷漠。',
    water: '感情中善於溝通，體貼入微。需要增加穩定性，避免給人不安全感。',
  };
  
  // 根據陰陽調整描述
  const yinyangModifier = yinyang.yang > yinyang.yin ? '外向積極' : '內斂沉穩';
  
  return {
    inner: personalityTraits[dayElement]?.inner || personalityTraits.earth.inner,
    outer: personalityTraits[dayElement]?.outer || personalityTraits.earth.outer,
    career: careerAdvice[dayElement] || careerAdvice.earth,
    relationship: relationshipAdvice[dayElement] || relationshipAdvice.earth,
    yinyangModifier,
  };
}

export const AnalysisCharts = ({ baziResult }: AnalysisChartsProps) => {
  const { wuxing, yinyang, fourSeasonsTeam, pillars } = baziResult;
  const dayStem = pillars.day.stem;

  // 計算五行百分比
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const wuxingPercent = {
    wood: (wuxing.wood / totalWuxing) * 100,
    fire: (wuxing.fire / totalWuxing) * 100,
    earth: (wuxing.earth / totalWuxing) * 100,
    metal: (wuxing.metal / totalWuxing) * 100,
    water: (wuxing.water / totalWuxing) * 100,
  };

  const wuxingData = [
    { name: "木", key: "wood", value: wuxing.wood, percent: wuxingPercent.wood, color: "bg-green-500", icon: "🌳" },
    { name: "火", key: "fire", value: wuxing.fire, percent: wuxingPercent.fire, color: "bg-red-500", icon: "🔥" },
    { name: "土", key: "earth", value: wuxing.earth, percent: wuxingPercent.earth, color: "bg-yellow-600", icon: "⛰️" },
    { name: "金", key: "metal", value: wuxing.metal, percent: wuxingPercent.metal, color: "bg-gray-400", icon: "⚔️" },
    { name: "水", key: "water", value: wuxing.water, percent: wuxingPercent.water, color: "bg-blue-500", icon: "💧" },
  ];

  const suggestions = generateDynamicSuggestions(wuxing, dayStem);
  const influence = generateInfluenceAnalysis(wuxing, dayStem, yinyang);

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        五行詳細分析
      </h2>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="balance">五行平衡</TabsTrigger>
          <TabsTrigger value="fourseasons">四時軍團</TabsTrigger>
          <TabsTrigger value="influence">性格運勢</TabsTrigger>
          <TabsTrigger value="suggestions">開運建議</TabsTrigger>
        </TabsList>

        {/* 平衡度分析 */}
        <TabsContent value="balance" className="space-y-6 mt-6">
          {/* 陰陽平衡 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">☯️ 陰陽平衡度</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">陽</span>
                  <span className="text-sm text-primary font-semibold">{yinyang.yang}%</span>
                </div>
                <Progress value={yinyang.yang} className="h-3 bg-muted" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">陰</span>
                  <span className="text-sm text-secondary font-semibold">{yinyang.yin}%</span>
                </div>
                <Progress value={yinyang.yin} className="h-3 bg-muted" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {yinyang.yang > yinyang.yin
                ? "陽性能量較強，個性較為外向、主動、積極，適合從事需要社交和領導的工作"
                : yinyang.yang < yinyang.yin
                ? "陰性能量較強，個性較為內斂、穩重、深思，適合從事需要細心和耐心的工作"
                : "陰陽平衡，個性圓融，適應力強，能夠在不同環境中自如切換"}
            </p>
          </div>

          {/* 五行平衡 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">🌟 五行平衡度</h3>
            <div className="space-y-4">
              {wuxingData.map((element) => (
                <div key={element.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{element.icon}</span>
                      <span className="text-sm font-medium text-foreground">{element.name}</span>
                      {element.percent > 30 && (
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" /> 旺
                        </Badge>
                      )}
                      {element.percent < 10 && (
                        <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                          <TrendingDown className="w-3 h-3 mr-1" /> 弱
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {element.value.toFixed(1)} ({element.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${element.color} transition-all duration-500`}
                      style={{ width: `${element.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* 五行相生相剋提示 */}
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30">
              <h4 className="text-sm font-semibold mb-2">五行流轉</h4>
              <div className="flex items-center justify-center gap-2 text-sm">
                {['wood', 'fire', 'earth', 'metal', 'water'].map((el, idx, arr) => (
                  <div key={el} className="flex items-center gap-1">
                    <span className={`${WUXING_COLORS[el]} flex items-center gap-1`}>
                      {WUXING_ICONS[el]}
                      {WUXING_NAMES[el]}
                    </span>
                    {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                木生火 → 火生土 → 土生金 → 金生水 → 水生木
              </p>
            </div>
          </div>
        </TabsContent>

        {/* 四時軍團分析 */}
        <TabsContent value="fourseasons" className="mt-6">
          {fourSeasonsTeam ? (
            <FourSeasonsCard fourSeasonsTeam={fourSeasonsTeam} />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              四時軍團分析資料載入中...
            </Card>
          )}
        </TabsContent>

        {/* 影響分析 */}
        <TabsContent value="influence" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/30">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                💭 內在個性
                <Badge variant="outline" className="text-xs">{influence.yinyangModifier}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{influence.inner}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/30">
              <h4 className="font-semibold text-foreground mb-2">🎯 外在行事</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{influence.outer}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
              <h4 className="font-semibold text-foreground mb-2">💼 事業運勢</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{influence.career}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/30">
              <h4 className="font-semibold text-foreground mb-2">💖 愛情關係</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{influence.relationship}</p>
            </Card>
          </div>
        </TabsContent>

        {/* 建議 */}
        <TabsContent value="suggestions" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
              <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                ✨ 發展建議
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                  {suggestions.isStrong ? '身強' : '身弱'} · {WUXING_NAMES[suggestions.dayElement]}命
                </Badge>
              </h4>
              <ul className="text-sm text-foreground space-y-2">
                {suggestions.developSuggestions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
              <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                ⚠️ 注意事項
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">
                  {WUXING_NAMES[suggestions.strongest]}旺 · {WUXING_NAMES[suggestions.weakest]}弱
                </Badge>
              </h4>
              <ul className="text-sm text-foreground space-y-2">
                {suggestions.cautionSuggestions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* 開運方位與顏色 */}
          <Card className="p-4 bg-muted/30 border-border/50">
            <h4 className="font-semibold text-foreground mb-3">🧭 開運指南</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">幸運方位</p>
                <p className="font-medium text-foreground">
                  {suggestions.isStrong 
                    ? (suggestions.dayElement === 'wood' ? '西方、北方' :
                       suggestions.dayElement === 'fire' ? '北方、中央' :
                       suggestions.dayElement === 'earth' ? '東方、西方' :
                       suggestions.dayElement === 'metal' ? '南方、北方' : '中央、東方')
                    : (suggestions.dayElement === 'wood' ? '北方、東方' :
                       suggestions.dayElement === 'fire' ? '東方、南方' :
                       suggestions.dayElement === 'earth' ? '南方、中央' :
                       suggestions.dayElement === 'metal' ? '中央、西方' : '西方、北方')
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">幸運顏色</p>
                <p className="font-medium text-foreground">
                  {suggestions.isStrong 
                    ? (suggestions.dayElement === 'wood' ? '白色、黑色' :
                       suggestions.dayElement === 'fire' ? '黑色、黃色' :
                       suggestions.dayElement === 'earth' ? '綠色、白色' :
                       suggestions.dayElement === 'metal' ? '紅色、黑色' : '黃色、綠色')
                    : (suggestions.dayElement === 'wood' ? '黑色、綠色' :
                       suggestions.dayElement === 'fire' ? '綠色、紅色' :
                       suggestions.dayElement === 'earth' ? '紅色、黃色' :
                       suggestions.dayElement === 'metal' ? '黃色、白色' : '白色、黑色')
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">幸運數字</p>
                <p className="font-medium text-foreground">
                  {suggestions.dayElement === 'wood' ? '3、8' :
                   suggestions.dayElement === 'fire' ? '2、7' :
                   suggestions.dayElement === 'earth' ? '5、0' :
                   suggestions.dayElement === 'metal' ? '4、9' : '1、6'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">開運物品</p>
                <p className="font-medium text-foreground">
                  {suggestions.isStrong 
                    ? (suggestions.dayElement === 'wood' ? '金屬飾品、水晶' :
                       suggestions.dayElement === 'fire' ? '水族、黑曜石' :
                       suggestions.dayElement === 'earth' ? '盆栽、白水晶' :
                       suggestions.dayElement === 'metal' ? '紅瑪瑙、黑曜石' : '黃水晶、綠植')
                    : (suggestions.dayElement === 'wood' ? '魚缸、綠植' :
                       suggestions.dayElement === 'fire' ? '木雕、紅瑪瑙' :
                       suggestions.dayElement === 'earth' ? '紅瑪瑙、陶瓷' :
                       suggestions.dayElement === 'metal' ? '陶瓷、白水晶' : '金屬飾品、黑曜石')
                  }
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
