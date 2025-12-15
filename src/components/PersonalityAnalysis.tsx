import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Heart, Briefcase, Users, Lightbulb, 
  AlertTriangle, Zap, Target, Compass, Scale
} from "lucide-react";
import { BaziResult } from "@/pages/Index";

interface PersonalityAnalysisProps {
  baziResult: BaziResult;
}

// 日干性格特質
const DAY_STEM_TRAITS: Record<string, {
  element: string;
  nature: string;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  career: string[];
  relationship: string;
}> = {
  '甲': {
    element: '陽木',
    nature: '參天大樹',
    personality: ['正直剛毅', '志向遠大', '有領導力', '重承諾'],
    strengths: ['執行力強', '有責任感', '目標明確', '不畏困難'],
    weaknesses: ['固執己見', '不懂變通', '過於強勢', '易得罪人'],
    career: ['管理階層', '企業家', '法律工作', '公職人員'],
    relationship: '重視承諾，穩定可靠，但有時過於理性',
  },
  '乙': {
    element: '陰木',
    nature: '花草藤蔓',
    personality: ['溫柔婉約', '善解人意', '適應力強', '柔中帶韌'],
    strengths: ['人緣極佳', '善於溝通', '創意豐富', '靈活變通'],
    weaknesses: ['優柔寡斷', '依賴心強', '缺乏主見', '易受影響'],
    career: ['藝術設計', '服務業', '教育工作', '公關行銷'],
    relationship: '溫柔體貼，善解人意，但有時過於依賴',
  },
  '丙': {
    element: '陽火',
    nature: '太陽之火',
    personality: ['熱情開朗', '光明磊落', '慷慨大方', '積極進取'],
    strengths: ['魅力四射', '感染力強', '勇於表達', '樂於助人'],
    weaknesses: ['衝動急躁', '虎頭蛇尾', '過於張揚', '耐心不足'],
    career: ['演藝傳媒', '銷售業務', '創意產業', '公眾人物'],
    relationship: '熱情主動，浪漫多情，但有時過於強勢',
  },
  '丁': {
    element: '陰火',
    nature: '燭光星火',
    personality: ['細膩敏感', '溫文爾雅', '洞察力強', '重視內在'],
    strengths: ['思維縝密', '有耐心', '專注力強', '富同理心'],
    weaknesses: ['多愁善感', '猶豫不決', '過於保守', '易鑽牛角尖'],
    career: ['研究工作', '文字創作', '心理諮詢', '藝術領域'],
    relationship: '細膩敏感，重視感覺，需要安全感',
  },
  '戊': {
    element: '陽土',
    nature: '高山巨石',
    personality: ['穩重踏實', '包容大度', '信守承諾', '責任感強'],
    strengths: ['可靠信任', '穩定持久', '有擔當', '處事公正'],
    weaknesses: ['固步自封', '反應較慢', '缺乏變化', '過於保守'],
    career: ['房地產', '建築工程', '管理職位', '金融保險'],
    relationship: '穩重可靠，給人安全感，但較不浪漫',
  },
  '己': {
    element: '陰土',
    nature: '田園沃土',
    personality: ['謙和有禮', '細心周到', '任勞任怨', '默默付出'],
    strengths: ['包容性強', '服務精神', '細緻入微', '腳踏實地'],
    weaknesses: ['過於謙卑', '缺乏自信', '容易妥協', '委屈自己'],
    career: ['服務業', '農業相關', '行政工作', '教育培訓'],
    relationship: '包容體貼，默默付出，但需要更多肯定',
  },
  '庚': {
    element: '陽金',
    nature: '刀劍鋼鐵',
    personality: ['剛毅果斷', '義氣當先', '講求效率', '愛恨分明'],
    strengths: ['決斷力強', '執行迅速', '重視效率', '講義氣'],
    weaknesses: ['過於直接', '不近人情', '易起衝突', '缺乏耐心'],
    career: ['軍警法律', '金融證券', '科技製造', '體育競技'],
    relationship: '直接坦率，愛恨分明，需要學習柔軟',
  },
  '辛': {
    element: '陰金',
    nature: '珠玉首飾',
    personality: ['精緻細膩', '品味獨特', '敏感多思', '追求完美'],
    strengths: ['審美眼光', '注重細節', '有品位', '善於分析'],
    weaknesses: ['過於挑剔', '神經質', '難以滿足', '過於敏感'],
    career: ['珠寶設計', '精品產業', '財務分析', '藝術鑑賞'],
    relationship: '重視感覺，講究品位，需要被欣賞',
  },
  '壬': {
    element: '陽水',
    nature: '江河大海',
    personality: ['智慧靈活', '胸懷寬廣', '善於謀略', '適應力強'],
    strengths: ['聰明機智', '社交能力', '創新思維', '包容性強'],
    weaknesses: ['表裡不一', '缺乏定性', '過於圓滑', '難以捉摸'],
    career: ['貿易物流', '旅遊業', '策劃顧問', '外交公關'],
    relationship: '浪漫多情，善於溝通，但有時不夠專一',
  },
  '癸': {
    element: '陰水',
    nature: '雨露甘霖',
    personality: ['內斂深沉', '直覺敏銳', '富同理心', '善於觀察'],
    strengths: ['洞察力強', '記憶力好', '富有智慧', '善解人意'],
    weaknesses: ['優柔寡斷', '情緒化', '過於內向', '缺乏自信'],
    career: ['研究學術', '心理領域', '玄學命理', '藝術創作'],
    relationship: '含蓄深情，細水長流，需要時間經營',
  },
};

// 根據五行強弱生成建議
function generateSuggestions(wuxing: BaziResult['wuxing'], dayStem: string): {
  develop: string[];
  caution: string[];
} {
  const total = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const percentages = {
    wood: (wuxing.wood / total) * 100,
    fire: (wuxing.fire / total) * 100,
    earth: (wuxing.earth / total) * 100,
    metal: (wuxing.metal / total) * 100,
    water: (wuxing.water / total) * 100,
  };

  const develop: string[] = [];
  const caution: string[] = [];

  // 根據缺失或過弱的五行給出建議
  if (percentages.wood < 10) {
    develop.push('多接觸綠色植物，培養創造力');
    caution.push('注意肝膽健康，保持樂觀心態');
  }
  if (percentages.fire < 10) {
    develop.push('多曬太陽，增加社交活動');
    caution.push('注意心臟血液健康，避免過於內向');
  }
  if (percentages.earth < 10) {
    develop.push('培養穩定的生活習慣，腳踏實地');
    caution.push('注意脾胃消化健康，避免過度漂泊');
  }
  if (percentages.metal < 10) {
    develop.push('培養果斷決策能力，學習說不');
    caution.push('注意呼吸系統健康，避免過於優柔');
  }
  if (percentages.water < 10) {
    develop.push('多喝水，培養靈活思維');
    caution.push('注意腎臟泌尿健康，避免過於固執');
  }

  // 根據過旺的五行給出建議
  if (percentages.wood > 35) {
    develop.push('發揮領導才能，但要學會傾聽');
    caution.push('避免過於固執己見');
  }
  if (percentages.fire > 35) {
    develop.push('運用熱情感染他人');
    caution.push('控制脾氣，避免衝動行事');
  }
  if (percentages.earth > 35) {
    develop.push('發揮穩重特質，成為他人依靠');
    caution.push('增加靈活性，避免故步自封');
  }
  if (percentages.metal > 35) {
    develop.push('發揮果斷特質，提高執行效率');
    caution.push('學習柔軟，避免傷害他人');
  }
  if (percentages.water > 35) {
    develop.push('發揮智慧，善用溝通能力');
    caution.push('增加穩定性，避免過於善變');
  }

  return { develop, caution };
}

export const PersonalityAnalysis = ({ baziResult }: PersonalityAnalysisProps) => {
  const { pillars, wuxing, yinyang } = baziResult;
  const dayStem = pillars.day.stem;
  const traits = DAY_STEM_TRAITS[dayStem] || DAY_STEM_TRAITS['甲'];
  const suggestions = generateSuggestions(wuxing, dayStem);

  // 判斷陰陽特質
  const yinyangTrait = yinyang.yang > yinyang.yin 
    ? '陽性能量較強，個性外向、主動、積極' 
    : yinyang.yang < yinyang.yin
    ? '陰性能量較強，個性內斂、穩重、深思'
    : '陰陽平衡，個性圓融、適應力強';

  return (
    <Card className="p-6 border-2 border-teal-500/40 bg-gradient-to-br from-teal-950 via-teal-900/80 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-teal-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-400" />
            性格深度分析
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-teal-300 border-teal-400/50">
              {traits.element}
            </Badge>
            <Badge className="bg-teal-900/50 text-teal-200 border border-teal-500/30">
              {traits.nature}
            </Badge>
          </div>
        </div>

        {/* 核心性格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/50 to-violet-950/50 border border-violet-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-violet-200">核心特質</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {traits.personality.map((trait, idx) => (
                <Badge key={idx} variant="outline" className="text-violet-300 border-violet-400/40">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/50 to-cyan-950/50 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-cyan-200">陰陽屬性</span>
            </div>
            <p className="text-sm text-stone-300">{yinyangTrait}</p>
          </div>
        </div>

        {/* 優勢與劣勢 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300">優勢特質</span>
            </div>
            <ul className="text-sm text-stone-300 space-y-1">
              {traits.strengths.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-rose-900/40 border border-rose-500/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-rose-300">需注意</span>
            </div>
            <ul className="text-sm text-stone-300 space-y-1">
              {traits.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 事業與感情 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-900/40 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-amber-300">適合領域</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {traits.career.map((c, idx) => (
                <Badge key={idx} className="text-xs bg-amber-900/50 text-amber-200 border border-amber-500/30">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pink-900/40 border border-pink-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="font-semibold text-pink-300">感情模式</span>
            </div>
            <p className="text-sm text-stone-300">{traits.relationship}</p>
          </div>
        </div>

        {/* 發展建議 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-sky-900/40 border border-sky-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sky-300">發展建議</span>
            </div>
            <ul className="text-sm text-stone-300 space-y-1">
              {suggestions.develop.map((d, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-orange-900/40 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-orange-300">健康提醒</span>
            </div>
            <ul className="text-sm text-stone-300 space-y-1">
              {suggestions.caution.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
