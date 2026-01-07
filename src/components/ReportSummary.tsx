import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { 
  Star, Shield, TrendingUp, Heart, Briefcase,
  Sparkles, ArrowUpRight, ArrowDownRight, Minus,
  ThumbsUp, ThumbsDown, Zap, Droplets, Flame, Mountain, Trees,
  Compass, Palette, Gift, Activity
} from "lucide-react";
import { getDetailedAdvice } from "@/data/fortuneAdviceTemplates";

interface ReportSummaryProps {
  baziResult: BaziResult;
}

// 五行圖標映射
const elementIcons: Record<string, React.ReactNode> = {
  wood: <Trees className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  earth: <Mountain className="w-4 h-4" />,
  metal: <Zap className="w-4 h-4" />,
  water: <Droplets className="w-4 h-4" />
};

const elementNames: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
};

const elementColors: Record<string, string> = {
  wood: 'text-green-400 bg-green-900/50 border-green-500/30',
  fire: 'text-red-400 bg-red-900/50 border-red-500/30',
  earth: 'text-yellow-400 bg-yellow-900/50 border-yellow-500/30',
  metal: 'text-slate-300 bg-slate-800/50 border-slate-500/30',
  water: 'text-blue-400 bg-blue-900/50 border-blue-500/30'
};

export const ReportSummary = ({ baziResult }: ReportSummaryProps) => {
  const { pillars, wuxing, yinyang, shensha, name, gender } = baziResult;
  
  // 計算命格強弱
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const maxElement = Object.entries(wuxing).reduce((max, [key, val]) => 
    val > max.value ? { name: key, value: val } : max, { name: '', value: 0 });
  const minElement = Object.entries(wuxing).reduce((min, [key, val]) => 
    val < min.value ? { name: key, value: val } : min, { name: '', value: Infinity });

  // 日主強弱判斷（根據傳統八字理論）
  const dayMasterElement = getDayMasterElement(pillars.day.stem);
  const dayMasterStrength = wuxing[dayMasterElement as keyof typeof wuxing] / totalWuxing;
  // 計算印比（生扶日主）和官殺財（剋洩日主）的比例
  const supportElements = getSupportElements(dayMasterElement);
  const drainElements = getDrainElements(dayMasterElement);
  const supportScore = supportElements.reduce((sum, el) => sum + (wuxing[el as keyof typeof wuxing] || 0), 0);
  const drainScore = drainElements.reduce((sum, el) => sum + (wuxing[el as keyof typeof wuxing] || 0), 0);
  const strengthRatio = supportScore / (supportScore + drainScore + 0.1);
  const strengthLevel = strengthRatio > 0.55 ? '身強' : strengthRatio < 0.45 ? '身弱' : '中和';
  
  // 用神喜忌分析
  const yongShenAnalysis = getYongShenAnalysis(dayMasterElement, strengthLevel, wuxing);
  
  // 統計吉凶神煞
  const jiShen = shensha.filter(s => isJiShen(s)).length;
  const xiongSha = shensha.filter(s => isXiongSha(s)).length;

  // 陰陽對應
  const YINYANG_MAP: Record<string, string> = {
    '甲': '陽', '乙': '陰', '丙': '陽', '丁': '陰',
    '戊': '陽', '己': '陰', '庚': '陽', '辛': '陰',
    '壬': '陽', '癸': '陰'
  };

  // 計算整體運勢指數 (簡化算法)
  const fortuneIndex = Math.min(100, Math.max(0, 
    50 + (jiShen * 8) - (xiongSha * 5) + (yinyang.yang > 40 && yinyang.yang < 60 ? 10 : 0)
  ));

  // 根據日干獲取職業方向（與 PersonalityAnalysis 統一）
  const getDayStemCareer = (stem: string): string => {
    const careers: Record<string, string> = {
      '甲': '管理、法律、公職',
      '乙': '藝術設計、服務、教育',
      '丙': '演藝傳媒、銷售、創意',
      '丁': '研究、文字創作、心理',
      '戊': '房地產、建築、金融',
      '己': '服務業、農業、行政',
      '庚': '軍警法律、金融、科技',
      '辛': '珠寶設計、精品、財務',
      '壬': '貿易物流、旅遊、策劃',
      '癸': '研究學術、心理、藝術'
    };
    return careers[stem] || '多元發展';
  };

  return (
    <Card className="relative overflow-hidden border-2 border-report-border bg-report-card dark:bg-gradient-to-br dark:from-indigo-950 dark:via-indigo-900/80 dark:to-slate-900">
      {/* 裝飾性背景 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/10 dark:from-indigo-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-secondary/10 dark:from-violet-500/20 to-transparent rounded-full blur-3xl" />
      
      {/* 四角裝飾 */}
      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/50 dark:border-indigo-500/50" />
      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/50 dark:border-indigo-500/50" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/50 dark:border-indigo-500/50" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/50 dark:border-indigo-500/50" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold font-serif bg-gradient-to-r from-primary via-primary/80 to-secondary dark:from-indigo-300 dark:via-violet-300 dark:to-purple-300 bg-clip-text text-transparent tracking-wider">
              命盤總覽
            </CardTitle>
            <p className="text-report-subtitle dark:text-indigo-200/70 mt-1 font-serif">
              {name} · {gender === 'male' ? '乾造' : '坤造'} · 日主 {pillars.day.stem}（{elementNames[dayMasterElement]}{YINYANG_MAP[pillars.day.stem]}）
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-primary dark:text-indigo-300 font-serif animate-pulse-glow">{fortuneIndex}</div>
            <p className="text-xs text-report-muted dark:text-indigo-200/60">綜合運勢指數</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* 核心四柱展示 */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-muted/30 dark:bg-black/30 rounded-xl border border-report-border/30 dark:border-indigo-500/20">
          {(['year', 'month', 'day', 'hour'] as const).map((pillar, idx) => {
            const labels = ['年柱', '月柱', '日柱', '時柱'];
            return (
              <div key={pillar} className="text-center">
                <p className="text-xs text-report-muted dark:text-indigo-300/60 mb-1">{labels[idx]}</p>
                <div className="text-2xl font-bold">
                  <span className="text-primary dark:text-indigo-300">{pillars[pillar].stem}</span>
                  <span className="text-secondary dark:text-violet-300">{pillars[pillar].branch}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 日主強弱 */}
          <div className="p-4 rounded-xl bg-rose-100 dark:bg-gradient-to-br dark:from-rose-900/50 dark:to-rose-950/50 border border-rose-300 dark:border-rose-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs text-rose-700 dark:text-rose-200/70">日主強弱</span>
            </div>
            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{strengthLevel}</p>
            <p className="text-xs text-rose-600/80 dark:text-rose-200/60 mt-1">
              {elementNames[dayMasterElement]}命 · {getStrengthDescription(strengthLevel)}
            </p>
          </div>

          {/* 陰陽平衡 */}
          <div className="p-4 rounded-xl bg-cyan-100 dark:bg-gradient-to-br dark:from-cyan-900/50 dark:to-cyan-950/50 border border-cyan-300 dark:border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs text-cyan-700 dark:text-cyan-200/70">陰陽平衡</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
                {Math.abs(yinyang.yang - yinyang.yin) < 20 ? '平衡' : 
                 yinyang.yang > yinyang.yin ? '偏陽' : '偏陰'}
              </p>
              {Math.abs(yinyang.yang - yinyang.yin) < 20 ? 
                <Minus className="w-4 h-4 text-green-500 dark:text-green-400" /> :
                yinyang.yang > yinyang.yin ? 
                <ArrowUpRight className="w-4 h-4 text-orange-500 dark:text-orange-400" /> :
                <ArrowDownRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              }
            </div>
            <p className="text-xs text-cyan-600/80 dark:text-cyan-200/60 mt-1">{yinyang.yang}% / {yinyang.yin}%</p>
          </div>

          {/* 五行特點 */}
          <div className="p-4 rounded-xl bg-amber-100 dark:bg-gradient-to-br dark:from-amber-900/50 dark:to-amber-950/50 border border-amber-300 dark:border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-200/70">五行特點</span>
            </div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {elementNames[maxElement.name]}旺 · {elementNames[minElement.name]}弱
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-200/60 mt-1">
              喜用：{yongShenAnalysis.xiYong.map(e => elementNames[e]).join('')}
            </p>
          </div>

          {/* 神煞統計 */}
          <div className="p-4 rounded-xl bg-emerald-100 dark:bg-gradient-to-br dark:from-emerald-900/50 dark:to-emerald-950/50 border border-emerald-300 dark:border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-700 dark:text-emerald-200/70">神煞統計</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{jiShen} 吉</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{xiongSha} 凶</span>
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-200/60 mt-1">共 {shensha.length} 個神煞</p>
          </div>
        </div>

        {/* 用神喜忌詳細分析 */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-500/30">
          <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            用神喜忌分析
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* 喜用神 */}
            <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-emerald-300">喜用神</span>
                <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-300">
                  有利五行
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {yongShenAnalysis.xiYong.map(element => (
                  <div key={element} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${elementColors[element]}`}>
                    {elementIcons[element]}
                    <span className="font-medium">{elementNames[element]}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-emerald-200/80">{yongShenAnalysis.xiYongReason}</p>
            </div>

            {/* 忌神 */}
            <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-500/30">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-rose-300">忌神</span>
                <Badge variant="outline" className="text-xs border-rose-500/50 text-rose-300">
                  不利五行
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {yongShenAnalysis.jiShen.map(element => (
                  <div key={element} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${elementColors[element]}`}>
                    {elementIcons[element]}
                    <span className="font-medium">{elementNames[element]}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-rose-200/80">{yongShenAnalysis.jiShenReason}</p>
            </div>
          </div>

          {/* 十神對照 */}
          <div className="p-4 rounded-lg bg-black/30 border border-purple-500/20">
            <h4 className="text-sm font-bold text-purple-300 mb-3">十神喜忌對照</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {yongShenAnalysis.tenGodAnalysis.map((item, idx) => (
                <div key={idx} className={`p-2 rounded-lg text-center ${
                  item.type === 'xi' ? 'bg-emerald-900/40 border border-emerald-500/30' : 
                  item.type === 'ji' ? 'bg-rose-900/40 border border-rose-500/30' :
                  'bg-slate-800/40 border border-slate-500/30'
                }`}>
                  <p className="text-xs text-stone-400 mb-1">{item.element}</p>
                  <p className={`text-sm font-bold ${
                    item.type === 'xi' ? 'text-emerald-300' : 
                    item.type === 'ji' ? 'text-rose-300' : 'text-slate-300'
                  }`}>{item.name}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${
                    item.type === 'xi' ? 'border-emerald-500/50 text-emerald-400' : 
                    item.type === 'ji' ? 'border-rose-500/50 text-rose-400' :
                    'border-slate-500/50 text-slate-400'
                  }`}>
                    {item.type === 'xi' ? '喜' : item.type === 'ji' ? '忌' : '中'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* 個性化開運建議 */}
          {(() => {
            const detailedAdvice = getDetailedAdvice(
              dayMasterElement,
              strengthLevel as '身強' | '身弱' | '中和'
            );
            return (
              <div className="mt-4 space-y-3">
                {/* 核心建議 */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
                  <h4 className="text-sm font-bold text-indigo-300 mb-3 font-serif flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    開運建議
                    <Badge variant="outline" className="text-xs border-indigo-500/50 text-indigo-300 ml-2">
                      {elementNames[dayMasterElement]}命 · {strengthLevel}
                    </Badge>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-indigo-200/80">
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                      <p className="font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        適合方向
                      </p>
                      <p className="leading-relaxed">{detailedAdvice.summary.favorable}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20">
                      <p className="font-medium text-rose-400 mb-2 flex items-center gap-1.5">
                        <ThumbsDown className="w-3.5 h-3.5" />
                        宜避開
                      </p>
                      <p className="leading-relaxed">{detailedAdvice.summary.unfavorable}</p>
                    </div>
                  </div>
                </div>

                {/* 詳細建議區塊 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg bg-violet-950/40 border border-violet-500/20">
                    <p className="text-xs text-violet-300 mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      生活方式
                    </p>
                    <p className="text-xs text-violet-200/80 leading-relaxed">{detailedAdvice.details.lifestyle}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/20">
                    <p className="text-xs text-sky-300 mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      事業發展
                    </p>
                    <p className="text-xs text-sky-200/80 leading-relaxed">{detailedAdvice.details.career}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-950/40 border border-pink-500/20">
                    <p className="text-xs text-pink-300 mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      感情經營
                    </p>
                    <p className="text-xs text-pink-200/80 leading-relaxed">{detailedAdvice.details.relationship}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-500/20">
                    <p className="text-xs text-teal-300 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      養生保健
                    </p>
                    <p className="text-xs text-teal-200/80 leading-relaxed">{detailedAdvice.details.health}</p>
                  </div>
                </div>

                {/* 開運物品 */}
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-amber-300 mb-1.5 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        開運物品
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {detailedAdvice.lucky.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-amber-500/40 text-amber-200/80">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-amber-300 mb-1.5 flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        幸運顏色
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {detailedAdvice.lucky.colors.map((color, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-amber-500/40 text-amber-200/80">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-amber-300 mb-1.5 flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        有利方位
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {detailedAdvice.lucky.directions.map((dir, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-amber-500/40 text-amber-200/80">
                            {dir}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 古籍引用 */}
                <div className="quote-classical text-sm text-indigo-200/70">
                  <p className="mb-1">
                    《滴天髓》云：「{strengthLevel === '身強' ? '旺者宜洩，強者宜制' : strengthLevel === '身弱' ? '衰者宜扶，弱者宜生' : '中和純粹，無處不宜'}」
                  </p>
                  <p className="text-xs text-indigo-300/50">
                    ——命理格局以日主強弱為綱，用神喜忌為目
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 速覽提示 */}
        <div className="grid md:grid-cols-3 gap-3">
          <QuickInsight 
            icon={<Briefcase className="w-4 h-4" />}
            title="事業方向"
            content={getDayStemCareer(pillars.day.stem)}
            color="primary"
          />
          <QuickInsight 
            icon={<Heart className="w-4 h-4" />}
            title="感情特質"
            content={getRelationshipTrait(pillars.day.stem)}
            color="secondary"
          />
          <QuickInsight 
            icon={<Star className="w-4 h-4" />}
            title="幸運提示"
            content={getLuckyTip(minElement.name)}
            color="accent"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// 速覽提示組件
const QuickInsight = ({ 
  icon, title, content, color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  color: 'primary' | 'secondary' | 'accent' 
}) => {
  const colorClasses = {
    primary: 'border-violet-500/30 text-violet-300 bg-violet-900/30',
    secondary: 'border-pink-500/30 text-pink-300 bg-pink-900/30',
    accent: 'border-sky-500/30 text-sky-300 bg-sky-900/30'
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm text-stone-200">{content}</p>
    </div>
  );
};

// 用神喜忌分析結果類型
interface YongShenAnalysis {
  xiYong: string[];
  jiShen: string[];
  xiYongReason: string;
  jiShenReason: string;
  tenGodAnalysis: { name: string; element: string; type: 'xi' | 'ji' | 'zhong' }[];
  advice: { favorable: string; unfavorable: string };
}

// 根據日主強弱計算用神喜忌
function getYongShenAnalysis(dayElement: string, strength: string, wuxing: Record<string, number>): YongShenAnalysis {
  // 五行生剋關係
  const generating: Record<string, string> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
  const controlling: Record<string, string> = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };
  const generatedBy: Record<string, string> = { wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal' };
  const controlledBy: Record<string, string> = { wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth' };

  // 十神對應
  const tenGodMap: Record<string, { name: string; element: string }[]> = {
    wood: [
      { name: '比肩/劫財', element: 'wood' },
      { name: '食神/傷官', element: 'fire' },
      { name: '偏財/正財', element: 'earth' },
      { name: '七殺/正官', element: 'metal' },
      { name: '偏印/正印', element: 'water' }
    ],
    fire: [
      { name: '比肩/劫財', element: 'fire' },
      { name: '食神/傷官', element: 'earth' },
      { name: '偏財/正財', element: 'metal' },
      { name: '七殺/正官', element: 'water' },
      { name: '偏印/正印', element: 'wood' }
    ],
    earth: [
      { name: '比肩/劫財', element: 'earth' },
      { name: '食神/傷官', element: 'metal' },
      { name: '偏財/正財', element: 'water' },
      { name: '七殺/正官', element: 'wood' },
      { name: '偏印/正印', element: 'fire' }
    ],
    metal: [
      { name: '比肩/劫財', element: 'metal' },
      { name: '食神/傷官', element: 'water' },
      { name: '偏財/正財', element: 'wood' },
      { name: '七殺/正官', element: 'fire' },
      { name: '偏印/正印', element: 'earth' }
    ],
    water: [
      { name: '比肩/劫財', element: 'water' },
      { name: '食神/傷官', element: 'wood' },
      { name: '偏財/正財', element: 'fire' },
      { name: '七殺/正官', element: 'earth' },
      { name: '偏印/正印', element: 'metal' }
    ]
  };

  let xiYong: string[] = [];
  let jiShen: string[] = [];
  let xiYongReason = '';
  let jiShenReason = '';
  let advice = { favorable: '', unfavorable: '' };

  const printElement = generatedBy[dayElement]; // 印星五行
  const sameElement = dayElement; // 比劫五行
  const foodElement = generating[dayElement]; // 食傷五行
  const wealthElement = controlling[dayElement]; // 財星五行
  const officialElement = controlledBy[dayElement]; // 官殺五行

  if (strength === '身強') {
    // 身強：喜食傷、財星、官殺（洩耗制衡）
    xiYong = [foodElement, wealthElement, officialElement];
    jiShen = [printElement, sameElement];
    xiYongReason = `日主${elementNames[dayElement]}氣勢強旺，需要洩耗之氣來平衡。食傷（${elementNames[foodElement]}）洩秀、財星（${elementNames[wealthElement]}）耗身、官殺（${elementNames[officialElement]}）制身，皆為喜用。`;
    jiShenReason = `印星（${elementNames[printElement]}）生身、比劫（${elementNames[sameElement]}）助身，會使日主更強，反為忌神。`;
    advice = {
      favorable: `從事與${elementNames[foodElement]}（創作表達）、${elementNames[wealthElement]}（財務投資）、${elementNames[officialElement]}（管理規範）相關的行業或活動`,
      unfavorable: `過度依賴長輩資源（${elementNames[printElement]}）或與同輩競爭（${elementNames[sameElement]}）`
    };
  } else if (strength === '身弱') {
    // 身弱：喜印星、比劫（生扶輔助）
    xiYong = [printElement, sameElement];
    jiShen = [foodElement, wealthElement, officialElement];
    xiYongReason = `日主${elementNames[dayElement]}氣勢較弱，需要生扶之力來增強。印星（${elementNames[printElement]}）生身、比劫（${elementNames[sameElement]}）助身，皆為喜用。`;
    jiShenReason = `食傷（${elementNames[foodElement]}）洩氣、財星（${elementNames[wealthElement]}）耗身、官殺（${elementNames[officialElement]}）剋身，會使日主更弱，為忌神。`;
    advice = {
      favorable: `多親近長輩貴人（${elementNames[printElement]}）、與志同道合者合作（${elementNames[sameElement]}），從事穩健保守的事業`,
      unfavorable: `過度追求財富（${elementNames[wealthElement]}）或承擔過大壓力責任（${elementNames[officialElement]}）`
    };
  } else {
    // 中和：根據五行偏向微調
    const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
    const weakest = Object.entries(wuxing).reduce((min, [k, v]) => v < min.value ? { name: k, value: v } : min, { name: '', value: Infinity });
    
    xiYong = [weakest.name];
    jiShen = [];
    xiYongReason = `日主${elementNames[dayElement]}五行中和，整體平衡。可適當補充較弱的${elementNames[weakest.name]}五行，維持均衡發展。`;
    jiShenReason = `中和格局無明顯忌神，但宜避免任何五行過於極端。`;
    advice = {
      favorable: `保持生活各方面的平衡，適度補充${elementNames[weakest.name]}元素`,
      unfavorable: `避免極端行為或過度偏執某一方向`
    };
  }

  // 生成十神分析
  const tenGodAnalysis = tenGodMap[dayElement].map(item => ({
    ...item,
    type: xiYong.includes(item.element) ? 'xi' as const : 
          jiShen.includes(item.element) ? 'ji' as const : 'zhong' as const
  }));

  return { xiYong, jiShen, xiYongReason, jiShenReason, tenGodAnalysis, advice };
}

// 輔助函數
function getDayMasterElement(stem: string): string {
  const stemElements: Record<string, string> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  return stemElements[stem] || 'earth';
}

// 獲取生扶日主的五行（印比）
function getSupportElements(dayElement: string): string[] {
  const supportMap: Record<string, string[]> = {
    'wood': ['water', 'wood'],  // 水生木，木比肩
    'fire': ['wood', 'fire'],   // 木生火，火比肩
    'earth': ['fire', 'earth'], // 火生土，土比肩
    'metal': ['earth', 'metal'], // 土生金，金比肩
    'water': ['metal', 'water']  // 金生水，水比肩
  };
  return supportMap[dayElement] || [];
}

// 獲取剋洩日主的五行（官殺財食傷）
function getDrainElements(dayElement: string): string[] {
  const drainMap: Record<string, string[]> = {
    'wood': ['metal', 'fire', 'earth'], // 金剋木，木生火（洩），木剋土（耗）
    'fire': ['water', 'earth', 'metal'], // 水剋火，火生土（洩），火剋金（耗）
    'earth': ['wood', 'metal', 'water'], // 木剋土，土生金（洩），土剋水（耗）
    'metal': ['fire', 'water', 'wood'],  // 火剋金，金生水（洩），金剋木（耗）
    'water': ['earth', 'wood', 'fire']   // 土剋水，水生木（洩），水剋火（耗）
  };
  return drainMap[dayElement] || [];
}

// 獲取身強身弱的詳細描述
function getStrengthDescription(strength: string): string {
  const descriptions: Record<string, string> = {
    '身強': '宜洩耗制衡',
    '身弱': '宜生扶輔助',
    '中和': '五行平衡'
  };
  return descriptions[strength] || '待定';
}

function isJiShen(sha: string | { category?: string; name?: string }): boolean {
  // 支援新格式 ShenshaMatch
  if (typeof sha === 'object' && sha !== null) {
    return sha.category === '吉神' || sha.category === '桃花';
  }
  const jiList = ['天乙貴人', '文昌貴人', '太極貴人', '將星', '華蓋', '金輿', '天廚', '福星貴人', '天德', '月德', '紅鸞', '天喜', '驛馬'];
  return jiList.includes(sha as string);
}

function isXiongSha(sha: string | { category?: string; name?: string }): boolean {
  // 支援新格式 ShenshaMatch
  if (typeof sha === 'object' && sha !== null) {
    return sha.category === '凶煞';
  }
  const xiongList = ['羊刃', '劫煞', '災煞', '孤辰', '寡宿', '亡神', '白虎', '天狗', '咸池'];
  return xiongList.includes(sha as string);
}

function getRelationshipTrait(dayStem: string): string {
  const traits: Record<string, string> = {
    '甲': '重承諾，穩定可靠', '乙': '溫柔體貼，善解人意',
    '丙': '熱情開朗，主動追求', '丁': '細膩敏感，重視氛圍',
    '戊': '踏實穩重，給人安全感', '己': '包容大度，默默付出',
    '庚': '直接果斷，愛恨分明', '辛': '講究品味，重視感受',
    '壬': '浪漫多情，善於溝通', '癸': '含蓄深情，細水長流'
  };
  return traits[dayStem] || '真誠待人';
}

function getLuckyTip(weakElement: string): string {
  const tips: Record<string, string> = {
    'wood': '多接觸綠色，養植物',
    'fire': '多曬太陽，穿紅色系',
    'earth': '收藏陶瓷，接觸土地',
    'metal': '佩戴金飾，白色開運',
    'water': '親近水邊，黑藍補運'
  };
  return tips[weakElement] || '保持平衡心態';
}
