import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { 
  Star, Shield, TrendingUp, Heart, Briefcase,
  Sparkles, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

interface ReportSummaryProps {
  baziResult: BaziResult;
}

export const ReportSummary = ({ baziResult }: ReportSummaryProps) => {
  const { pillars, wuxing, yinyang, shensha, name, gender } = baziResult;
  
  // 計算命格強弱
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const maxElement = Object.entries(wuxing).reduce((max, [key, val]) => 
    val > max.value ? { name: key, value: val } : max, { name: '', value: 0 });
  const minElement = Object.entries(wuxing).reduce((min, [key, val]) => 
    val < min.value ? { name: key, value: val } : min, { name: '', value: Infinity });

  const elementNames: Record<string, string> = {
    wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
  };

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
  
  // 統計吉凶神煞
  const jiShen = shensha.filter(s => isJiShen(s)).length;
  const xiongSha = shensha.filter(s => isXiongSha(s)).length;

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
    <Card className="relative overflow-hidden border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950 via-indigo-900/80 to-slate-900">
      {/* 裝飾性背景 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-indigo-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-violet-500/20 to-transparent rounded-full blur-3xl" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              命盤總覽
            </CardTitle>
            <p className="text-indigo-200/70 mt-1">
              {name} · {gender === 'male' ? '男' : '女'} · 日主 {pillars.day.stem}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-indigo-300">{fortuneIndex}</div>
            <p className="text-xs text-indigo-200/60">綜合指數</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* 核心四柱展示 */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-black/30 rounded-xl border border-indigo-500/20">
          {(['year', 'month', 'day', 'hour'] as const).map((pillar, idx) => {
            const labels = ['年柱', '月柱', '日柱', '時柱'];
            return (
              <div key={pillar} className="text-center">
                <p className="text-xs text-indigo-300/60 mb-1">{labels[idx]}</p>
                <div className="text-2xl font-bold">
                  <span className="text-indigo-300">{pillars[pillar].stem}</span>
                  <span className="text-violet-300">{pillars[pillar].branch}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 日主強弱 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-900/50 to-rose-950/50 border border-rose-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-200/70">日主強弱</span>
            </div>
            <p className="text-xl font-bold text-rose-300">{strengthLevel}</p>
            <p className="text-xs text-rose-200/60 mt-1">
              {elementNames[dayMasterElement]}命 · {getStrengthDescription(strengthLevel)}
            </p>
          </div>

          {/* 陰陽平衡 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/50 to-cyan-950/50 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-200/70">陰陽平衡</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-cyan-300">
                {Math.abs(yinyang.yang - yinyang.yin) < 20 ? '平衡' : 
                 yinyang.yang > yinyang.yin ? '偏陽' : '偏陰'}
              </p>
              {Math.abs(yinyang.yang - yinyang.yin) < 20 ? 
                <Minus className="w-4 h-4 text-green-400" /> :
                yinyang.yang > yinyang.yin ? 
                <ArrowUpRight className="w-4 h-4 text-orange-400" /> :
                <ArrowDownRight className="w-4 h-4 text-blue-400" />
              }
            </div>
            <p className="text-xs text-cyan-200/60 mt-1">{yinyang.yang}% / {yinyang.yin}%</p>
          </div>

          {/* 五行特點 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-900/50 to-amber-950/50 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-200/70">五行特點</span>
            </div>
            <p className="text-sm font-bold text-amber-300">
              {elementNames[maxElement.name]}旺 · {elementNames[minElement.name]}弱
            </p>
            <p className="text-xs text-amber-200/60 mt-1">
              喜用：{getPreferredElement(dayMasterElement, strengthLevel)}
            </p>
          </div>

          {/* 神煞統計 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-200/70">神煞統計</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-400">{jiShen} 吉</span>
              <span className="text-lg font-bold text-rose-400">{xiongSha} 凶</span>
            </div>
            <p className="text-xs text-emerald-200/60 mt-1">共 {shensha.length} 個神煞</p>
          </div>
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

function getPreferredElement(dayElement: string, strength: string): string {
  // 簡化的喜用神判斷
  if (strength === '身強') {
    const weakeningElements: Record<string, string> = {
      'wood': '金水', 'fire': '水土', 'earth': '木金', 'metal': '火水', 'water': '土木'
    };
    return weakeningElements[dayElement] || '平衡';
  } else {
    const supportingElements: Record<string, string> = {
      'wood': '水木', 'fire': '木火', 'earth': '火土', 'metal': '土金', 'water': '金水'
    };
    return supportingElements[dayElement] || '平衡';
  }
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
