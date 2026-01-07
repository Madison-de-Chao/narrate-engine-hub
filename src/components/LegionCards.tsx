import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import { Swords, Users, Sparkles, Crown, Shield, Star, Zap, ThumbsUp, ThumbsDown, Lock } from "lucide-react";
import tenGodsData from "@/data/ten_gods.json";
import { ModularShenshaEngine, type RulesetType } from "@/lib/shenshaRuleEngine";
import type { ShenshaMatch } from "@/data/shenshaTypes";
import { LegionCharacterCard } from "./LegionCharacterCard";
import { LegionOverviewChart } from "./LegionOverviewChart";
import { LegionRelationshipDiagram } from "./LegionRelationshipDiagram";
import { truncateStoryForFree } from "@/hooks/usePremiumStatus";
import { Button } from "./ui/button";
import { translatePillarToLegion, translateBaziToArmy, getGanCharacter, getZhiCharacter } from "@/lib/legionTranslator";

interface LegionCardsProps {
  baziResult: BaziResult;
  shenshaRuleset?: RulesetType;
  isPremium?: boolean;
  onUpgrade?: () => void;
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

// 經典兵法語錄集 - 孫子兵法、三十六計
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

export const LegionCards = ({ baziResult, shenshaRuleset = 'trad', isPremium = false, onUpgrade }: LegionCardsProps) => {
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

  // 生成完整軍團數據用於總覽圖
  const fullArmy = translateBaziToArmy({
    yearStem: pillars.year.stem,
    yearBranch: pillars.year.branch,
    monthStem: pillars.month.stem,
    monthBranch: pillars.month.branch,
    dayStem: pillars.day.stem,
    dayBranch: pillars.day.branch,
    hourStem: pillars.hour.stem,
    hourBranch: pillars.hour.branch
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-br from-orange-950 via-orange-900/80 to-slate-900 border-2 border-orange-500/40">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent mb-3">
          四時軍團詳細故事
        </h2>
        <p className="text-orange-200/70">每個軍團的完整命盤解釋</p>
      </div>

      {/* 軍團總覽圖 */}
      <LegionOverviewChart army={fullArmy} />

      {/* 軍團關係分析圖 */}
      <LegionRelationshipDiagram army={fullArmy} />

      <div className="grid grid-cols-1 gap-8">
        {(["year", "month", "day", "hour"] as const).map((pillarName) => {
          const legion = legionConfig[pillarName];
          const pillar = pillars[pillarName];
          const { stem, branch } = pillar;
          const tenGod = tenGods[pillarName] || { stem: "待計算", branch: "待計算" };
          
          // 使用新的轉譯模組獲取角色數據
          const ganCharacter = getGanCharacter(stem);
          const zhiCharacter = getZhiCharacter(branch);
          const translatedLegion = translatePillarToLegion(pillarName, stem, branch, pillars.day.stem);
          
          // 保留舊的角色對照（用於策略建議）
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

                {/* 指揮官與軍師 - 使用新的 LegionCharacterCard 組件 */}
                <div className="grid md:grid-cols-2 gap-4">
                  {ganCharacter && (
                    <LegionCharacterCard 
                      type="general" 
                      character={ganCharacter}
                      member={translatedLegion.general}
                      legionColor={legion.gradient}
                    />
                  )}
                  {zhiCharacter && (
                    <LegionCharacterCard 
                      type="strategist" 
                      character={zhiCharacter}
                      member={translatedLegion.strategist}
                      legionColor={legion.gradient}
                    />
                  )}
                </div>
                
                {/* 副將與奇謀 - 藏干角色 */}
                {(translatedLegion.lieutenant || translatedLegion.specialists.length > 0) && (
                  <div className="grid md:grid-cols-3 gap-3">
                    {translatedLegion.lieutenant && (
                      <LegionCharacterCard 
                        type="lieutenant" 
                        character={translatedLegion.lieutenant.character}
                        member={translatedLegion.lieutenant}
                        legionColor={legion.gradient}
                      />
                    )}
                    {translatedLegion.specialists.slice(0, 2).map((spec, idx) => (
                      <LegionCharacterCard 
                        key={idx}
                        type="specialist" 
                        character={spec.character}
                        member={spec}
                        legionColor={legion.gradient}
                      />
                    ))}
                  </div>
                )}
                
                {/* 戰場環境（納音） */}
                <div className="p-4 bg-gradient-to-br from-amber-950/40 to-orange-900/20 rounded-xl border border-amber-600/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚔️</span>
                    <div>
                      <h5 className="font-bold text-lg text-amber-300">戰場環境</h5>
                      <p className="text-sm text-amber-200/70">{translatedLegion.battlefield.name}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="ml-auto border-amber-500/50 text-amber-300"
                    >
                      {translatedLegion.battlefield.element}屬性
                    </Badge>
                  </div>
                  <p className="text-sm text-amber-100/80 mb-3">
                    {translatedLegion.battlefield.environment}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-950/40 rounded-lg border border-green-600/30">
                      <p className="text-xs text-green-400 mb-1">戰場優勢</p>
                      <p className="text-xs text-green-300/80">
                        {translatedLegion.battlefield.advantages?.join('、') || '平衡戰場'}
                      </p>
                    </div>
                    <div className="p-2 bg-red-950/40 rounded-lg border border-red-600/30">
                      <p className="text-xs text-red-400 mb-1">環境挑戰</p>
                      <p className="text-xs text-red-300/80">
                        {translatedLegion.battlefield.challenges?.join('、') || '無明顯挑戰'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 軍團戰力分析 */}
                <div className="flex items-center gap-4 p-4 bg-card/60 rounded-xl border border-border/50">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">內部和諧度</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, translatedLegion.internalHarmony))}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{translatedLegion.internalHarmony}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translatedLegion.harmonyDescription}
                    </p>
                  </div>
                  <div className="text-center px-4 border-l border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">總戰力</p>
                    <p className="text-2xl font-bold text-primary">
                      {translatedLegion.totalBuff > 0 ? '+' : ''}{translatedLegion.totalBuff}
                    </p>
                  </div>
                </div>

                {/* AI生成的150字軍團傳說故事 */}
                <div className={`p-6 rounded-xl ${legion.gradient} border-2 border-accent/30 backdrop-blur-sm`}>
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    軍團傳說
                    {!isPremium && baziResult.legionStories?.[pillarName] && (
                      <Badge variant="outline" className="ml-2 border-amber-500/50 text-amber-400 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        預覽版
                      </Badge>
                    )}
                  </h4>
                  <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                    {baziResult.legionStories?.[pillarName] ? (
                      isPremium ? (
                        baziResult.legionStories[pillarName]
                      ) : (
                        <div className="space-y-3">
                          <p>{truncateStoryForFree(baziResult.legionStories[pillarName], 80)}</p>
                          <Button
                            onClick={onUpgrade}
                            variant="outline"
                            size="sm"
                            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            升級解鎖完整故事
                          </Button>
                        </div>
                      )
                    ) : (
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

                {/* 簡化分析區：圖表式呈現 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/30">
                  {/* 十神標籤 */}
                  <div className="p-3 bg-card/50 rounded-lg border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground mb-1">天干十神</p>
                    <Badge variant="outline" className="bg-primary/20 border-primary/40 text-sm">
                      {tenGod?.stem || "—"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground mb-1">地支十神</p>
                    <Badge variant="outline" className="bg-secondary/20 border-secondary/40 text-sm">
                      {tenGod?.branch || "—"}
                    </Badge>
                  </div>
                  
                  {/* 納音 */}
                  <div className="p-3 bg-card/50 rounded-lg border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground mb-1">納音</p>
                    <p className="text-sm font-medium text-foreground">{nayin[pillarName] || "—"}</p>
                  </div>
                  
                  {/* 身強弱 */}
                  <div className="p-3 bg-card/50 rounded-lg border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground mb-1">日主狀態</p>
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${
                        yongShenInfo.strengthLevel === '身強' 
                          ? 'border-emerald-500/50 text-emerald-400' 
                          : yongShenInfo.strengthLevel === '身弱'
                            ? 'border-rose-500/50 text-rose-400'
                            : 'border-amber-500/50 text-amber-400'
                      }`}
                    >
                      {yongShenInfo.strengthLevel}
                    </Badge>
                  </div>
                </div>

                {/* 喜忌簡圖 */}
                <div className="flex gap-4 p-3 bg-card/30 rounded-lg">
                  <div className="flex-1 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {yongShenInfo.xiYong.map((el, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{el}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {yongShenInfo.jiShen.map((el, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">{el}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 兵符狀態 */}
                <div className="flex items-center gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {pillarShensha.length > 0 ? (
                      pillarShensha.map((shensha, idx) => (
                        <Badge 
                          key={`${shensha.name}-${idx}`}
                          variant="outline"
                          className={`text-xs ${
                            shensha.category === '吉神' 
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' 
                              : shensha.category === '凶煞'
                                ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                                : 'border-violet-500/40 text-violet-400 bg-violet-500/10'
                          }`}
                        >
                          {shensha.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">無兵符</span>
                    )}
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
