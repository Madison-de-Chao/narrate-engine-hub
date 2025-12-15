import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { 
  Star, Shield, TrendingUp, Heart, Briefcase, Users,
  Sparkles, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

interface ReportSummaryProps {
  baziResult: BaziResult;
}

export const ReportSummary = ({ baziResult }: ReportSummaryProps) => {
  const { pillars, wuxing, yinyang, shensha, name, gender, fourSeasonsTeam } = baziResult;
  
  // 計算命格強弱
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const maxElement = Object.entries(wuxing).reduce((max, [key, val]) => 
    val > max.value ? { name: key, value: val } : max, { name: '', value: 0 });
  const minElement = Object.entries(wuxing).reduce((min, [key, val]) => 
    val < min.value ? { name: key, value: val } : min, { name: '', value: Infinity });

  const elementNames: Record<string, string> = {
    wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
  };

  // 日主強弱判斷
  const dayMasterElement = getDayMasterElement(pillars.day.stem);
  const dayMasterStrength = wuxing[dayMasterElement as keyof typeof wuxing] / totalWuxing;
  const strengthLevel = dayMasterStrength > 0.25 ? '身強' : dayMasterStrength < 0.15 ? '身弱' : '中和';
  
  // 統計吉凶神煞
  const jiShen = shensha.filter(s => isJiShen(s)).length;
  const xiongSha = shensha.filter(s => isXiongSha(s)).length;

  // 計算整體運勢指數 (簡化算法)
  const fortuneIndex = Math.min(100, Math.max(0, 
    50 + (jiShen * 8) - (xiongSha * 5) + (yinyang.yang > 40 && yinyang.yang < 60 ? 10 : 0)
  ));

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      {/* 裝飾性背景 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-secondary/10 to-transparent rounded-full blur-3xl" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              命盤總覽
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              {name} · {gender === 'male' ? '男' : '女'} · 日主 {pillars.day.stem}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-primary">{fortuneIndex}</div>
            <p className="text-xs text-muted-foreground">綜合指數</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* 核心四柱展示 */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-muted/30 rounded-xl">
          {(['year', 'month', 'day', 'hour'] as const).map((pillar, idx) => {
            const labels = ['年柱', '月柱', '日柱', '時柱'];
            return (
              <div key={pillar} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{labels[idx]}</p>
                <div className="text-2xl font-bold">
                  <span className="text-primary">{pillars[pillar].stem}</span>
                  <span className="text-secondary">{pillars[pillar].branch}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 日主強弱 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">日主強弱</span>
            </div>
            <p className="text-xl font-bold text-primary">{strengthLevel}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dayMasterElement === 'wood' ? '木' : dayMasterElement === 'fire' ? '火' : 
               dayMasterElement === 'earth' ? '土' : dayMasterElement === 'metal' ? '金' : '水'}命
            </p>
          </div>

          {/* 陰陽平衡 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">陰陽平衡</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-secondary">
                {Math.abs(yinyang.yang - yinyang.yin) < 20 ? '平衡' : 
                 yinyang.yang > yinyang.yin ? '偏陽' : '偏陰'}
              </p>
              {Math.abs(yinyang.yang - yinyang.yin) < 20 ? 
                <Minus className="w-4 h-4 text-green-500" /> :
                yinyang.yang > yinyang.yin ? 
                <ArrowUpRight className="w-4 h-4 text-orange-500" /> :
                <ArrowDownRight className="w-4 h-4 text-blue-500" />
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">{yinyang.yang}% / {yinyang.yin}%</p>
          </div>

          {/* 五行特點 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">五行特點</span>
            </div>
            <p className="text-sm font-bold text-accent">
              {elementNames[maxElement.name]}旺 · {elementNames[minElement.name]}弱
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              喜用：{getPreferredElement(dayMasterElement, strengthLevel)}
            </p>
          </div>

          {/* 神煞統計 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">神煞統計</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-500">{jiShen} 吉</span>
              <span className="text-lg font-bold text-rose-500">{xiongSha} 凶</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">共 {shensha.length} 個神煞</p>
          </div>
        </div>

        {/* 四時軍團摘要 */}
        {fourSeasonsTeam && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              四時軍團陣容
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => {
                const seasonNames = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
                const seasonColors = { 
                  spring: 'text-green-500', 
                  summer: 'text-red-500', 
                  autumn: 'text-yellow-600', 
                  winter: 'text-blue-500' 
                };
                return (
                  <div key={season} className="text-center">
                    <Badge variant="outline" className={`${seasonColors[season]} mb-1`}>
                      {seasonNames[season]}
                    </Badge>
                    <p className="text-2xl font-bold">{fourSeasonsTeam[season]?.toFixed(1) || 0}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 速覽提示 */}
        <div className="grid md:grid-cols-3 gap-3">
          <QuickInsight 
            icon={<Briefcase className="w-4 h-4" />}
            title="事業方向"
            content={getCareerSuggestion(maxElement.name, strengthLevel)}
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
    primary: 'border-primary/30 text-primary',
    secondary: 'border-secondary/30 text-secondary',
    accent: 'border-accent/30 text-accent'
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]} bg-card/50`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm text-foreground">{content}</p>
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

function getCareerSuggestion(strongElement: string, strength: string): string {
  const suggestions: Record<string, string> = {
    'wood': '教育、出版、設計創意',
    'fire': '媒體、演藝、公關行銷',
    'earth': '房地產、農業、管理',
    'metal': '金融、法律、科技製造',
    'water': '物流、旅遊、貿易商業'
  };
  return suggestions[strongElement] || '多元發展';
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
