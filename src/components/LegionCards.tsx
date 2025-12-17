import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Swords, Users, Heart, Sparkles, Crown, Shield, Star, Zap, BookOpen, TrendingUp, Target, ThumbsUp, ThumbsDown } from "lucide-react";
import tenGodsData from "@/data/ten_gods.json";
import { storyMaterialsManager } from "@/lib/storyMaterials";
import { ModularShenshaEngine, type RulesetType } from "@/lib/shenshaRuleEngine";
import type { ShenshaMatch } from "@/data/shenshaTypes";
import { ArmyCard } from "./ArmyCard";
import { ShenshaCardList } from "./ShenshaCard";

interface LegionCardsProps {
  baziResult: BaziResult;
  shenshaRuleset?: RulesetType;
}

// 天干對應五行
const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 五行名稱對照
const ELEMENT_NAMES: Record<string, string> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水'
};

// 五行生剋關係
const GENERATES: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const GENERATED_BY: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
const CONTROLS: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
const CONTROLLED_BY: Record<string, string> = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };

// 獲取日主五行
function getDayMasterElement(dayStem: string): string {
  return STEM_TO_ELEMENT[dayStem] || '木';
}

// 計算身強身弱比例
function calculateStrengthRatio(dayElement: string, wuxing: Record<string, number>): number {
  const elementToKey: Record<string, string> = {
    '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water'
  };
  
  const sameElement = dayElement;
  const printElement = GENERATED_BY[dayElement];
  
  const total = Object.values(wuxing).reduce((a, b) => a + b, 0) || 1;
  const selfScore = (wuxing[elementToKey[sameElement]] || 0) + (wuxing[elementToKey[printElement]] || 0);
  
  return selfScore / total;
}

// 用神資訊類型
interface YongShenInfo {
  xiYong: string[];
  jiShen: string[];
  strengthLevel: string;
}

// 簡化版用神計算
function getSimpleYongShen(dayElement: string, strength: string): YongShenInfo {
  const printElement = GENERATED_BY[dayElement];
  const sameElement = dayElement;
  const foodElement = GENERATES[dayElement];
  const wealthElement = CONTROLS[dayElement];
  const officialElement = CONTROLLED_BY[dayElement];
  
  if (strength === '身強') {
    return {
      xiYong: [ELEMENT_NAMES[foodElement], ELEMENT_NAMES[wealthElement], ELEMENT_NAMES[officialElement]],
      jiShen: [ELEMENT_NAMES[printElement], ELEMENT_NAMES[sameElement]],
      strengthLevel: strength
    };
  } else if (strength === '身弱') {
    return {
      xiYong: [ELEMENT_NAMES[printElement], ELEMENT_NAMES[sameElement]],
      jiShen: [ELEMENT_NAMES[foodElement], ELEMENT_NAMES[wealthElement], ELEMENT_NAMES[officialElement]],
      strengthLevel: strength
    };
  } else {
    return {
      xiYong: ['中和', '平衡'],
      jiShen: ['過極'],
      strengthLevel: strength
    };
  }
}

// 經典兵法語錄集 - 孫子兵法、三十六計、吳子兵法
const militaryWisdom = {
  year: {
    primary: {
      quote: "知彼知己，百戰不殆；不知彼而知己，一勝一負；不知彼，不知己，每戰必殆。",
      source: "《孫子兵法・謀攻篇》",
      interpretation: "了解自己的根源，才能在人生戰場上立於不敗之地。"
    },
    secondary: {
      quote: "瞞天過海：備周則意怠，常見則不疑。",
      source: "《三十六計・第一計》",
      interpretation: "祖輩傳承的智慧往往隱藏於日常，需細心體會方能領悟。"
    },
    tertiary: {
      quote: "凡兵戰之場，立屍之地，必死則生，幸生則死。",
      source: "《吳子兵法・治兵篇》",
      interpretation: "唯有直面挑戰，方能從家族根基中汲取力量。"
    }
  },
  month: {
    primary: {
      quote: "上兵伐謀，其次伐交，其次伐兵，其下攻城。",
      source: "《孫子兵法・謀攻篇》",
      interpretation: "善用人際關係與智謀，是成就事業的最高境界。"
    },
    secondary: {
      quote: "借刀殺人：敵已明，友未定，引友殺敵，不自出力。",
      source: "《三十六計・第三計》",
      interpretation: "借助他人之力成就己事，是人際謀略的精髓。"
    },
    tertiary: {
      quote: "不和於國，不可以出軍；不和於軍，不可以出陣。",
      source: "《吳子兵法・圖國篇》",
      interpretation: "團結人心、和諧關係，是事業成功的根本。"
    }
  },
  day: {
    primary: {
      quote: "故善戰者，立於不敗之地，而不失敵之敗也。",
      source: "《孫子兵法・軍形篇》",
      interpretation: "堅守本心、穩固自我，是一切勝利的根基。"
    },
    secondary: {
      quote: "以逸待勞：困敵之勢，不以戰；損剛益柔。",
      source: "《三十六計・第四計》",
      interpretation: "養精蓄銳、蓄勢待發，以不變應萬變。"
    },
    tertiary: {
      quote: "進有重賞，退有重刑，行之以信。",
      source: "《吳子兵法・治兵篇》",
      interpretation: "對自己賞罰分明、言出必行，是建立自信的不二法門。"
    }
  },
  hour: {
    primary: {
      quote: "故兵無常勢，水無常形；能因敵變化而取勝者，謂之神。",
      source: "《孫子兵法・虛實篇》",
      interpretation: "順應變化、靈活應對，方能開創無限可能的未來。"
    },
    secondary: {
      quote: "無中生有：誑也，非誑也，實其所誑也。",
      source: "《三十六計・第七計》",
      interpretation: "創造機會、開拓可能，未來由自己書寫。"
    },
    tertiary: {
      quote: "用兵之害，猶豫最大；三軍之災，生於狐疑。",
      source: "《吳子兵法・治兵篇》",
      interpretation: "面對未來當機立斷，猶豫不決是最大的敵人。"
    }
  }
};

const legionConfig = {
  year: {
    name: "祖源軍團",
    icon: "👑",
    color: "text-legion-family",
    gradient: "bg-gradient-to-br from-legion-family/20 to-legion-family/5",
    borderGlow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
    description: "承載家族傳承的根基力量",
    lifeDomain: "家庭背景、童年經歷、祖輩關係",
    stage: "童年成長與青少年發展",
  },
  month: {
    name: "關係軍團",
    icon: "🤝",
    color: "text-legion-growth",
    gradient: "bg-gradient-to-br from-legion-growth/20 to-legion-growth/5",
    borderGlow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    description: "掌管人際網絡的社交力量",
    lifeDomain: "父母關係、工作事業、人際社交",
    stage: "青年奮鬥與中年事業",
  },
  day: {
    name: "核心軍團",
    icon: "⭐",
    color: "text-legion-self",
    gradient: "bg-gradient-to-br from-legion-self/20 to-legion-self/5",
    borderGlow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    description: "體現真實自我的本質力量",
    lifeDomain: "個人性格、婚姻感情、核心自我",
    stage: "成年自我實現",
  },
  hour: {
    name: "未來軍團",
    icon: "🚀",
    color: "text-legion-future",
    gradient: "bg-gradient-to-br from-legion-future/20 to-legion-future/5",
    borderGlow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
    description: "開創未來發展的希望力量",
    lifeDomain: "子女教育、晚年生活、未來規劃",
    stage: "晚年智慧與傳承延續",
  },
};

const tianganRoles: { [key: string]: { role: string; image: string; style: string; weakness: string; buff: string; debuff: string } } = {
  甲: { role: "森林將軍", image: "參天大樹，堅毅直立", style: "重承諾，敢開疆拓土", weakness: "固執，不易轉彎", buff: "規劃長遠", debuff: "剛愎自用" },
  乙: { role: "花草軍師", image: "藤蔓花草，柔韌適應", style: "協調圓融，善於美化", weakness: "優柔寡斷，隨境而變", buff: "靈活應變", debuff: "過度依附" },
  丙: { role: "烈日戰神", image: "太陽，光明外放", style: "熱情奔放，感染全軍", weakness: "急躁衝動，消耗過快", buff: "激勵士氣", debuff: "燒盡自己" },
  丁: { role: "燭光法師", image: "溫柔燭火，能照亮黑暗", style: "細膩體貼，擅啟蒙", weakness: "情感敏感，力量有限", buff: "溫暖療癒", debuff: "情緒波動" },
  戊: { role: "山岳守護", image: "高山厚土，穩重承載", style: "可靠堅實，能守護全軍", weakness: "過於保守，難以靈活", buff: "穩定防禦", debuff: "固執僵化" },
  己: { role: "大地母親", image: "田園沃土，滋養萬物", style: "包容細膩，善於培育", weakness: "過於忍讓，缺乏魄力", buff: "滋養培育", debuff: "過度犧牲" },
  庚: { role: "鋼鐵騎士", image: "礦石鋼鐵，剛健果決", style: "直接強硬，果斷決斷", weakness: "過於剛烈，易傷盟友", buff: "一擊必中", debuff: "剛硬破裂" },
  辛: { role: "珠寶商人", image: "珠玉寶石，精緻優雅", style: "重視品質，善於鑑賞", weakness: "過於挑剔，脆弱易傷", buff: "精緻完美", debuff: "苛刻敏感" },
  壬: { role: "江河船長", image: "江河大海，奔放靈活", style: "胸懷寬廣，靈活多變", weakness: "漂泊善變，缺乏定性", buff: "靈動探索", debuff: "隨波逐流" },
  癸: { role: "甘露天使", image: "雨露泉水，潤物無聲", style: "溫柔細膩，智慧含蓄", weakness: "過於感性，憂慮纏身", buff: "細膩滋養", debuff: "多愁善感" },
};

const dizhiRoles: { [key: string]: { role: string; symbol: string; character: string; hiddenStems: string; weakness: string; buff: string; debuff: string } } = {
  子: { role: "夜行刺客", symbol: "冬至之水，潛藏黑夜", character: "聰明靈活，反應快", hiddenStems: "癸水 → 單一純粹，行事乾脆", weakness: "缺乏耐心，情緒化", buff: "瞬間奇襲", debuff: "易動不安" },
  丑: { role: "忠犬守衛", symbol: "寒冬大地，厚重封藏", character: "勤勞耐力，穩中帶剛", hiddenStems: "己土、癸水、辛金 → 複合多層", weakness: "遲緩、保守", buff: "後勤補給", debuff: "遲疑不決" },
  寅: { role: "森林獵人", symbol: "春雷初動，草木萌發", character: "勇猛果敢，開創力強", hiddenStems: "甲木、丙火、戊土 → 多元兼具", weakness: "急躁，缺耐性", buff: "先鋒衝陣", debuff: "草率行事" },
  卯: { role: "春兔使者", symbol: "春花盛開，柔美雅靜", character: "溫文儒雅，和諧共處", hiddenStems: "乙木 → 單一柔韌", weakness: "軟弱，易受影響", buff: "和諧調解", debuff: "優柔被動" },
  辰: { role: "龍族法師", symbol: "水土交雜，能量複合", character: "多才多變，能容納百川", hiddenStems: "戊土、乙木、癸水 → 複合多元", weakness: "內在矛盾，常陷糾結", buff: "變化萬端", debuff: "自相矛盾" },
  巳: { role: "火蛇術士", symbol: "夏日將至，熱力蘊藏", character: "聰慧靈動，足智多謀", hiddenStems: "丙火、戊土、庚金 → 智略與理性兼具", weakness: "多疑、善於隱匿", buff: "謀略之眼", debuff: "多疑內耗" },
  午: { role: "烈馬騎兵", symbol: "盛夏正陽，光明外放", character: "熱情奔放，行動力強", hiddenStems: "丁火、己土 → 主攻兼守", weakness: "衝動，耐力不足", buff: "士氣高昂", debuff: "精力耗盡" },
  未: { role: "溫羊牧者", symbol: "夏末收成，和氣守成", character: "溫和耐心，注重和諧", hiddenStems: "己土、丁火、乙木 → 和諧混合", weakness: "優柔寡斷，缺魄力", buff: "調和人心", debuff: "猶疑不決" },
  申: { role: "靈猴戰士", symbol: "秋風肅殺，行動敏捷", character: "聰明機警，反應靈巧", hiddenStems: "庚金、壬水、戊土 → 力量兼智慧", weakness: "反覆無常，善變狡黠", buff: "隨機應變", debuff: "善變浮躁" },
  酉: { role: "金雞衛士", symbol: "秋收精煉，嚴謹守護", character: "細膩、注重品質，重原則", hiddenStems: "辛金 → 純粹單一", weakness: "過於嚴格，缺溫情", buff: "精準守護", debuff: "苛刻冷漠" },
  戌: { role: "戰犬統領", symbol: "深秋守土，忠誠護疆", character: "忠誠可靠，重責任", hiddenStems: "戊土、辛金、丁火 → 剛中帶柔", weakness: "頑固，不善變通", buff: "忠誠護主", debuff: "固執保守" },
  亥: { role: "智豬先知", symbol: "冬水潛藏，蓄勢待發", character: "福德圓滿，寬厚仁慈", hiddenStems: "壬水、甲木 → 智慧與生長", weakness: "過於理想化，逃避現實", buff: "福德智慧", debuff: "逃避散漫" },
};

// 柱名對應的 matched_pillar 值映射
const pillarToMatchedPillarMap: Record<string, string[]> = {
  year: ['年支', '年干'],
  month: ['月支', '月干'],
  day: ['日支', '日干'],
  hour: ['時支', '時干']
};

export const LegionCards = ({ baziResult, shenshaRuleset = 'trad' }: LegionCardsProps) => {
  const { pillars, nayin, tenGods, wuxing } = baziResult;

  // 使用模組化規則引擎計算帶證據鏈的神煞（與傳統排盤同步規則集）
  const shenshaEngine = new ModularShenshaEngine(shenshaRuleset);
  const shenshaMatches = shenshaEngine.calculate({
    dayStem: pillars.day.stem,
    yearBranch: pillars.year.branch,
    monthBranch: pillars.month.branch,
    dayBranch: pillars.day.branch,
    hourBranch: pillars.hour.branch,
    yearStem: pillars.year.stem,
    monthStem: pillars.month.stem,
    hourStem: pillars.hour.stem
  });

  // 按柱分組神煞
  const getShenshaByPillar = (pillarName: 'year' | 'month' | 'day' | 'hour'): ShenshaMatch[] => {
    const matchedPillarValues = pillarToMatchedPillarMap[pillarName];
    return shenshaMatches.filter((shensha) => {
      const matchedPillar = shensha.evidence?.matched_pillar;
      return matchedPillar && matchedPillarValues.includes(matchedPillar);
    });
  };

  // 用神分析（簡化版本）
  const dayMasterElement = getDayMasterElement(pillars.day.stem);
  const strengthRatio = wuxing ? calculateStrengthRatio(dayMasterElement, wuxing) : 0.5;
  const strengthLevel = strengthRatio > 0.55 ? '身強' : strengthRatio < 0.45 ? '身弱' : '中和';
  const yongShenInfo = getSimpleYongShen(dayMasterElement, strengthLevel);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-orange-950 via-orange-900/80 to-slate-900 border-2 border-orange-500/40">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent mb-3">
          四時軍團詳細故事
        </h2>
        <p className="text-orange-200/70">每個軍團的完整命盤解釋</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {(["year", "month", "day", "hour"] as const).map((pillarName) => {
          const legion = legionConfig[pillarName];
          const pillar = pillars[pillarName];
          const { stem, branch } = pillar;
          const tenGod = tenGods[pillarName] || { stem: "待計算", branch: "待計算" };
          
          const commanderRole = tianganRoles[stem];
          const advisorRole = dizhiRoles[branch];
          
          // 獲取該柱專屬的神煞
          const pillarShensha = getShenshaByPillar(pillarName);

          return (
            <Card key={pillarName} className={`relative overflow-hidden group transition-all duration-500 ${legion.borderGlow}`}>
              <div className={`absolute inset-0 ${legion.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              {/* 裝飾性光效 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-secondary/10 to-transparent rounded-full blur-3xl opacity-50" />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className={`text-5xl ${legion.color} drop-shadow-lg`}>{legion.icon}</div>
                  <div>
                    <CardTitle className="text-3xl">{legion.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{legion.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative">
                {/* 基本資訊卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">干支</p>
                    <p className="font-bold text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{stem}{branch}</p>
                  </div>
                  <div className="p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-secondary/30 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">納音</p>
                    <p className="font-semibold text-lg">{nayin[pillarName] || "-"}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl border border-accent/30">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      十神(天干)
                    </p>
                    <p className="font-bold text-lg text-accent">{tenGod?.stem || "-"}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl border border-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      十神(地支)
                    </p>
                    <p className="font-bold text-lg text-secondary">{tenGod?.branch || "-"}</p>
                  </div>
                </div>

                {/* 指揮官與軍師 - 使用新的 ArmyCard 組件 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <ArmyCard 
                    type="commander" 
                    character={stem} 
                    role={commanderRole} 
                    legionColor={legion.gradient}
                    characterColor={storyMaterialsManager.getGanRole(stem)?.color}
                  />
                  <ArmyCard 
                    type="advisor" 
                    character={branch} 
                    role={advisorRole} 
                    legionColor={legion.gradient}
                    characterColor={storyMaterialsManager.getZhiRole(branch)?.color}
                  />
                </div>

                {/* AI生成的150字軍團傳說故事 */}
                <div className={`p-6 rounded-xl ${legion.gradient} border-2 border-accent/30 backdrop-blur-sm`}>
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
                  
                  {/* 經典兵法語錄總結 - 孫子兵法、三十六計、吳子兵法 */}
                  {baziResult.legionStories?.[pillarName] && (
                    <div className="mt-6 pt-5 border-t-2 border-amber-500/30 space-y-4">
                      {/* 孫子兵法 - 主要 */}
                      <div className="p-4 bg-gradient-to-br from-amber-950/60 to-stone-900/60 rounded-lg border border-amber-600/40">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">⚔️</div>
                          <div className="flex-1 space-y-2">
                            <p className="text-amber-200 font-serif text-lg leading-relaxed font-medium">
                              「{militaryWisdom[pillarName].primary.quote}」
                            </p>
                            <p className="text-amber-400/80 text-sm font-medium">
                              —— {militaryWisdom[pillarName].primary.source}
                            </p>
                            <p className="text-amber-100/70 text-sm mt-2 pt-2 border-t border-amber-700/30">
                              📜 {militaryWisdom[pillarName].primary.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 三十六計 */}
                      <div className="p-4 bg-gradient-to-br from-red-950/50 to-stone-900/50 rounded-lg border border-red-600/30">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🎯</div>
                          <div className="flex-1 space-y-2">
                            <p className="text-red-200 font-serif text-base leading-relaxed font-medium">
                              「{militaryWisdom[pillarName].secondary.quote}」
                            </p>
                            <p className="text-red-400/80 text-sm font-medium">
                              —— {militaryWisdom[pillarName].secondary.source}
                            </p>
                            <p className="text-red-100/70 text-sm mt-2 pt-2 border-t border-red-700/30">
                              📖 {militaryWisdom[pillarName].secondary.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 吳子兵法 */}
                      <div className="p-4 bg-gradient-to-br from-blue-950/50 to-stone-900/50 rounded-lg border border-blue-600/30">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🛡️</div>
                          <div className="flex-1 space-y-2">
                            <p className="text-blue-200 font-serif text-base leading-relaxed font-medium">
                              「{militaryWisdom[pillarName].tertiary.quote}」
                            </p>
                            <p className="text-blue-400/80 text-sm font-medium">
                              —— {militaryWisdom[pillarName].tertiary.source}
                            </p>
                            <p className="text-blue-100/70 text-sm mt-2 pt-2 border-t border-blue-700/30">
                              📜 {militaryWisdom[pillarName].tertiary.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {baziResult.legionStories?.[pillarName] && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground italic">
                        💡 這個故事展示了{legion.name}對你在{legion.stage}的影響。記住：這些是天賦潛能的展現，真正的選擇權永遠在你手中。
                      </p>
                    </div>
                  )}
                </div>

                {/* 深度分析區塊 */}
                <div className="pt-4 border-t-2 border-border/50">
                  <h4 className="font-bold text-2xl mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    深度分析與註釋
                  </h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 命理核心分析 */}
                  <div className="p-5 bg-card/40 backdrop-blur-sm rounded-xl border border-border/40 hover:border-primary/30 transition-colors">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      命理核心分析
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      此柱五行配置體現陰陽調和的特質。天干{stem}與地支{branch}相互配合，展現獨特的能量場特徵。
                    </p>
                  </div>

                  {/* 納音深度解讀 */}
                  <div className="p-5 bg-card/40 backdrop-blur-sm rounded-xl border border-border/40 hover:border-secondary/30 transition-colors">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      🎵 納音深度解讀
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {nayin[pillarName] || "此納音"}在命理學中代表獨特的命格特質。
                      在{legion.name}的位置上，此納音與生俱來的特質將在{legion.stage}階段發揮重要作用。
                    </p>
                  </div>
                </div>

                {/* 十神關係分析 */}
                <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border-2 border-accent/30">
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

                {/* 用神喜忌資訊 */}
                <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-xl border-2 border-indigo-500/30">
                  <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-indigo-400">
                    <Target className="w-6 h-6" />
                    用神喜忌（{yongShenInfo.strengthLevel}）
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-emerald-300">喜用神</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {yongShenInfo.xiYong.map((element, idx) => (
                          <Badge key={idx} variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-950/50">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsDown className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold text-rose-300">忌神</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {yongShenInfo.jiShen.map((element, idx) => (
                          <Badge key={idx} variant="outline" className="border-rose-500/50 text-rose-300 bg-rose-950/50">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 神煞加持效應 - 按柱過濾 */}
                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border-2 border-purple-500/30">
                  <h5 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-6 h-6" />
                    神煞加持效應（{pillarName === 'year' ? '年柱' : pillarName === 'month' ? '月柱' : pillarName === 'day' ? '日柱' : '時柱'}）
                  </h5>
                  {pillarShensha.length > 0 ? (
                    <ShenshaCardList 
                      shenshaList={pillarShensha} 
                      maxDisplay={6}
                      showEvidence={true}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">此柱暫無特殊神煞</p>
                  )}
                </div>

                {/* 發展策略建議 */}
                <div className="p-5 bg-primary/10 rounded-xl border-2 border-primary/30">
                  <h5 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    發展策略建議
                  </h5>
                  <p className="text-sm leading-relaxed">
                    充分發揮{stem}的{commanderRole?.buff}優勢，同時運用{branch}的{advisorRole?.buff}能力，
                    並注意避免{commanderRole?.debuff}和{advisorRole?.debuff}的負面影響。
                    結合{nayin[pillarName] || "此納音"}的優勢，可以在{pillarName === 'year' ? '家庭關係與個人根基' : pillarName === 'month' ? '事業發展與人際網絡' : pillarName === 'day' ? '個人成長與感情生活' : '創新創造與未來規劃'}方面取得重大突破。
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
