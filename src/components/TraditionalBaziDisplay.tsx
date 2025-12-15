import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";
import hiddenStemsData from "@/data/hidden_stems.json";
import { Sparkles, Star, Shield, Zap, User, Calendar, Info, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { ShenshaMatch, RARITY_CONFIG, CATEGORY_CONFIG } from "@/data/shenshaTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TraditionalBaziDisplayProps {
  baziResult: BaziResult;
}

// 藏干詳細資訊類型
interface HiddenStemDetail {
  stem: string;
  weight: number;
  ratio: number;
  type: '本氣' | '中氣' | '餘氣';
}

// 天干五行顏色（傳統配色）
const TIANGAN_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  '甲': { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  '乙': { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/40' },
  '丙': { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/40' },
  '丁': { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/40' },
  '戊': { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40' },
  '己': { text: 'text-yellow-700 dark:text-yellow-500', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40' },
  '庚': { text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-500/15', border: 'border-slate-500/40' },
  '辛': { text: 'text-gray-500 dark:text-gray-300', bg: 'bg-gray-400/15', border: 'border-gray-400/40' },
  '壬': { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/40' },
  '癸': { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40' },
};

// 地支五行顏色
const DIZHI_COLORS: Record<string, { text: string; bg: string }> = {
  '子': { text: 'text-blue-500', bg: 'bg-blue-500/10' },
  '丑': { text: 'text-amber-600', bg: 'bg-amber-600/10' },
  '寅': { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  '卯': { text: 'text-green-500', bg: 'bg-green-500/10' },
  '辰': { text: 'text-amber-500', bg: 'bg-amber-500/10' },
  '巳': { text: 'text-red-500', bg: 'bg-red-500/10' },
  '午': { text: 'text-red-600', bg: 'bg-red-600/10' },
  '未': { text: 'text-yellow-600', bg: 'bg-yellow-600/10' },
  '申': { text: 'text-slate-500', bg: 'bg-slate-500/10' },
  '酉': { text: 'text-gray-500', bg: 'bg-gray-500/10' },
  '戌': { text: 'text-amber-700', bg: 'bg-amber-700/10' },
  '亥': { text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
};

// 五行對應
const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 陰陽對應
const YINYANG_MAP: Record<string, string> = {
  '甲': '陽', '乙': '陰', '丙': '陽', '丁': '陰',
  '戊': '陽', '己': '陰', '庚': '陽', '辛': '陰',
  '壬': '陽', '癸': '陰',
};

export const TraditionalBaziDisplay = ({ baziResult }: TraditionalBaziDisplayProps) => {
  const { pillars, hiddenStems, tenGods, nayin, shensha, name, birthDate, gender } = baziResult;
  const [expandedShensha, setExpandedShensha] = useState<string | null>(null);

  // 格式化時辰顯示
  const getHourLabel = (branch: string) => {
    const hourMap: Record<string, string> = {
      '子': '子時 (23:00-01:00)',
      '丑': '丑時 (01:00-03:00)',
      '寅': '寅時 (03:00-05:00)',
      '卯': '卯時 (05:00-07:00)',
      '辰': '辰時 (07:00-09:00)',
      '巳': '巳時 (09:00-11:00)',
      '午': '午時 (11:00-13:00)',
      '未': '未時 (13:00-15:00)',
      '申': '申時 (15:00-17:00)',
      '酉': '酉時 (17:00-19:00)',
      '戌': '戌時 (19:00-21:00)',
      '亥': '亥時 (21:00-23:00)'
    };
    return hourMap[branch] || branch;
  };

  // 獲取藏干詳細資訊
  const getHiddenStemDetails = (branch: string): HiddenStemDetail[] => {
    const data = hiddenStemsData.hiddenStems[branch as keyof typeof hiddenStemsData.hiddenStems];
    return (data?.stems || []) as HiddenStemDetail[];
  };

  // 檢查 shensha 是否為新格式 (ShenshaMatch[])
  const isNewShenshaFormat = (sha: unknown): sha is ShenshaMatch => {
    return typeof sha === 'object' && sha !== null && 'evidence' in sha;
  };

  // 取得神煞列表（兼容新舊格式）
  const getShenshaList = (): (ShenshaMatch | string)[] => {
    if (!shensha || shensha.length === 0) return [];
    return shensha;
  };

  const shenshaList = getShenshaList();

  // 四柱各自的主題色
  const PILLAR_THEMES = {
    hour: { 
      bg: 'bg-gradient-to-b from-violet-950 to-violet-900', 
      border: 'border-violet-500/50',
      accent: 'text-violet-300',
      glow: 'shadow-violet-500/20'
    },
    day: { 
      bg: 'bg-gradient-to-b from-rose-950 to-rose-900', 
      border: 'border-rose-500/50',
      accent: 'text-rose-300',
      glow: 'shadow-rose-500/20'
    },
    month: { 
      bg: 'bg-gradient-to-b from-cyan-950 to-cyan-900', 
      border: 'border-cyan-500/50',
      accent: 'text-cyan-300',
      glow: 'shadow-cyan-500/20'
    },
    year: { 
      bg: 'bg-gradient-to-b from-amber-950 to-amber-900', 
      border: 'border-amber-500/50',
      accent: 'text-amber-300',
      glow: 'shadow-amber-500/20'
    },
  };

  return (
    <Card className="relative overflow-hidden border-2 border-amber-600/40 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* 傳統紋理背景 */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* 四角裝飾 */}
      <div className="absolute top-3 left-3 w-10 h-10 border-l-2 border-t-2 border-amber-500/60" />
      <div className="absolute top-3 right-3 w-10 h-10 border-r-2 border-t-2 border-amber-500/60" />
      <div className="absolute bottom-3 left-3 w-10 h-10 border-l-2 border-b-2 border-amber-500/60" />
      <div className="absolute bottom-3 right-3 w-10 h-10 border-r-2 border-b-2 border-amber-500/60" />
      
      <div className="relative z-10 p-6">
        {/* 標題區 */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-3xl font-bold tracking-wider text-amber-400" style={{ fontFamily: 'serif' }}>
              傳統八字排盤
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>
          <p className="mt-4 text-sm text-amber-200/80">子平命理・四柱推命</p>
        </div>
        
        <div className="space-y-8">
          {/* 命主資訊區 - 傳統牌匾風格 */}
          <div className="relative">
            <div className="relative border-2 border-amber-600/40 rounded-lg p-5 bg-gradient-to-b from-stone-800/80 to-stone-900/80">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/60" />
                <h3 className="text-lg font-bold text-amber-400 tracking-widest" style={{ fontFamily: 'serif' }}>
                  命 主 資 料
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/60" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <span className="text-xs text-amber-300/70 block mb-1">姓 名</span>
                  <p className="text-xl font-bold text-amber-100" style={{ fontFamily: 'serif' }}>{name}</p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-amber-300/70 block mb-1">性 別</span>
                  <p className="text-xl font-bold text-amber-100" style={{ fontFamily: 'serif' }}>
                    {gender === 'male' ? '男' : gender === 'female' ? '女' : gender}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-amber-300/70 block mb-1">出生日期</span>
                  <p className="text-lg font-bold text-amber-100" style={{ fontFamily: 'serif' }}>
                    {birthDate ? format(new Date(birthDate), 'yyyy年MM月dd日') : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-amber-300/70 block mb-1">出生時辰</span>
                  <p className="text-lg font-bold text-amber-100" style={{ fontFamily: 'serif' }}>
                    {getHourLabel(pillars.hour.branch)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 四柱八字主體 - 傳統印章風格 */}
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/60" />
              <span className="text-sm font-bold text-amber-400 tracking-widest">四 柱 八 字</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
            
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {(["hour", "day", "month", "year"] as const).map((pillar, index) => {
                const pillarData = pillars[pillar];
                const pillarNames = ["時柱", "日柱", "月柱", "年柱"];
                const pillarSubtitles = ["子女宮", "夫妻宮", "父母宮", "祖業宮"];
                const hiddenDetails = getHiddenStemDetails(pillarData.branch);
                const theme = PILLAR_THEMES[pillar];
                
                return (
                  <div key={pillar} className="text-center group">
                    {/* 柱位標籤 */}
                    <div className="mb-2">
                      <div className={`text-base font-bold ${theme.accent} tracking-wider`} style={{ fontFamily: 'serif' }}>
                        {pillarNames[index]}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {pillarSubtitles[index]}
                      </div>
                    </div>
                    
                    {/* 干支印章區 - 每個柱位不同顏色 */}
                    <div className={`relative rounded-lg border-2 ${theme.border} ${theme.bg} p-3 md:p-4 transition-all duration-300 group-hover:shadow-lg ${theme.glow}`}>
                      {/* 印章裝飾框 */}
                      <div className={`absolute inset-1 border ${theme.border} rounded pointer-events-none opacity-30`} />
                      
                      <div className="relative z-10 space-y-2">
                        {/* 天干 */}
                        <div className="relative">
                          <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'serif' }}>
                            {pillarData.stem}
                          </div>
                          <div className="flex justify-center gap-1 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-black/30 ${theme.accent}`}>
                              {YINYANG_MAP[pillarData.stem]}{WUXING_MAP[pillarData.stem]}
                            </span>
                          </div>
                        </div>
                        
                        {/* 分隔線 */}
                        <div className={`h-px bg-gradient-to-r from-transparent via-current to-transparent ${theme.accent} opacity-40`} />
                        
                        {/* 地支 */}
                        <div className="relative">
                          <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'serif' }}>
                            {pillarData.branch}
                          </div>
                          <div className="flex justify-center gap-1 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-black/30 ${theme.accent}`}>
                              {WUXING_MAP[pillarData.branch]}
                            </span>
                          </div>
                        </div>
                        
                        {/* 藏干區 */}
                        <div className="pt-2 mt-2 border-t border-dashed border-white/20">
                          <div className={`text-[10px] ${theme.accent} mb-1.5 tracking-wider`}>藏 干</div>
                          <div className="space-y-1">
                            {hiddenDetails.map((detail, idx) => {
                              return (
                                <TooltipProvider key={idx}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/10">
                                        <span className="text-sm font-bold text-white">
                                          {detail.stem}
                                        </span>
                                        <span className={`text-[10px] ${theme.accent} font-medium`}>
                                          {detail.ratio}%
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-stone-900 border-stone-700">
                                      <div className="text-xs space-y-1 text-stone-200">
                                        <div className={`font-bold ${theme.accent}`}>{detail.type}</div>
                                        <div>五行：{WUXING_MAP[detail.stem]}</div>
                                        <div>權重：{detail.weight}</div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 納音 */}
                    <div className={`mt-3 px-2 py-1.5 rounded-full ${theme.bg} border ${theme.border}`}>
                      <span className={`text-xs font-medium ${theme.accent}`} style={{ fontFamily: 'serif' }}>
                        {nayin[pillar] || "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 十神區 */}
          <div className="relative p-4 rounded-lg bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border border-emerald-500/30">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-400/60" />
              <span className="text-sm font-bold text-emerald-300 tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-400" />
                十 神 配 置
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-400/60" />
            </div>
            
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {(["hour", "day", "month", "year"] as const).map((pillar) => {
                const gods = tenGods[pillar] || { stem: "", branch: "" };
                const stemGodInfo = tenGodsData.tenGodsRules[gods.stem as keyof typeof tenGodsData.tenGodsRules];
                const branchGodInfo = tenGodsData.tenGodsRules[gods.branch as keyof typeof tenGodsData.tenGodsRules];
                const theme = PILLAR_THEMES[pillar];
                
                return (
                  <div key={pillar} className={`relative rounded-lg border ${theme.border} bg-black/30 p-3 hover:bg-black/40 transition-all`}>
                    <div className="space-y-3">
                      {/* 天干十神 */}
                      <div className="text-center">
                        <div className="text-[10px] text-emerald-300/70 mb-1">天干</div>
                        <div className="text-lg font-bold text-rose-400" style={{ fontFamily: 'serif' }}>
                          {gods.stem || "-"}
                        </div>
                        {stemGodInfo && (
                          <div className="text-[9px] text-stone-400 mt-0.5 line-clamp-1">
                            {stemGodInfo.象徵}
                          </div>
                        )}
                      </div>
                      
                      <div className="h-px bg-emerald-500/30" />
                      
                      {/* 地支十神 */}
                      <div className="text-center">
                        <div className="text-[10px] text-emerald-300/70 mb-1">地支</div>
                        <div className="text-lg font-bold text-sky-400" style={{ fontFamily: 'serif' }}>
                          {gods.branch || "-"}
                        </div>
                        {branchGodInfo && (
                          <div className="text-[9px] text-stone-400 mt-0.5 line-clamp-1">
                            {branchGodInfo.象徵}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 神煞區 */}
          <div className="relative p-4 rounded-lg bg-gradient-to-b from-purple-950/80 to-purple-900/60 border border-purple-500/30">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-400/60" />
              <span className="text-sm font-bold text-purple-300 tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                神 煞 星 曜
                {shenshaList.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-[10px] border-purple-400/50 text-purple-300">
                    共 {shenshaList.length} 顆
                  </Badge>
                )}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-400/60" />
            </div>
            
            {shenshaList.length === 0 ? (
              <p className="text-sm text-center text-purple-300/60">暫無神煞資訊</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shenshaList.map((sha, index) => {
                  if (isNewShenshaFormat(sha)) {
                    const rarityConfig = RARITY_CONFIG[sha.rarity] || RARITY_CONFIG['N'];
                    const categoryConfig = CATEGORY_CONFIG[sha.category] || CATEGORY_CONFIG['特殊'];
                    const isExpanded = expandedShensha === `${sha.name}-${index}`;
                    
                    return (
                      <Collapsible
                        key={`${sha.name}-${index}`}
                        open={isExpanded}
                        onOpenChange={() => setExpandedShensha(isExpanded ? null : `${sha.name}-${index}`)}
                      >
                        <div 
                          className="relative p-4 rounded-lg border-2 bg-black/40 backdrop-blur-sm transition-all duration-300 group overflow-hidden hover:shadow-md hover:bg-black/50"
                          style={{ borderColor: `${categoryConfig.color}50` }}
                        >
                          {/* 稀有度光效 */}
                          <div 
                            className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none"
                            style={{ 
                              background: `radial-gradient(circle at top right, ${rarityConfig.color}, transparent 70%)` 
                            }}
                          />
                          
                          <div className="relative z-10">
                            {/* 標題列 */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{categoryConfig.icon}</span>
                                <h4 className="font-bold text-lg" style={{ color: categoryConfig.color, fontFamily: 'serif' }}>
                                  {sha.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5"
                                  style={{ borderColor: rarityConfig.color, color: rarityConfig.color }}
                                >
                                  {rarityConfig.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 border-purple-400/30 text-purple-300">
                                  {sha.category}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* 效果說明 */}
                            <p className="text-sm text-stone-200 mb-2">{sha.effect}</p>
                            <p className="text-xs text-stone-400 mb-3">{sha.modernMeaning}</p>
                            
                            {/* Buff/Debuff */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {sha.buff && (
                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ↑ {sha.buff}
                                </span>
                              )}
                              {sha.debuff && (
                                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  ↓ {sha.debuff}
                                </span>
                              )}
                            </div>
                            
                            {/* 展開證據鏈 */}
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-1 text-xs text-purple-300/70 hover:text-purple-200 transition-colors">
                                <Info className="w-3 h-3" />
                                <span>查看推導過程</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-stone-500">錨點依據：</span>
                                    <span className="text-stone-300 ml-1">{sha.evidence.anchor_basis}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500">錨點值：</span>
                                    <span className="text-purple-300 font-medium ml-1">{sha.evidence.anchor_value}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500">命中柱位：</span>
                                    <span className="text-stone-300 ml-1">{sha.evidence.matched_pillar}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500">命中值：</span>
                                    <span className="text-purple-300 font-medium ml-1">{sha.evidence.matched_value}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-stone-500">命中原因：</span>
                                  <span className="text-stone-300 ml-1">{sha.evidence.why_matched}</span>
                                </div>
                                <div>
                                  <span className="text-stone-500">規則來源：</span>
                                  <span className="text-purple-400 ml-1">{sha.evidence.rule_ref}</span>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </div>
                      </Collapsible>
                    );
                  } else {
                    // 舊格式：純字串
                    return (
                      <div 
                        key={index} 
                        className="relative p-4 rounded-lg border-2 border-purple-500/30 bg-black/40 transition-all duration-300"
                      >
                        <h4 className="font-bold text-lg text-purple-300" style={{ fontFamily: 'serif' }}>{sha}</h4>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* 底部裝飾 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 text-xs text-amber-400/60">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/40" />
            <span style={{ fontFamily: 'serif' }}>命理僅供參考・抉擇由心而定</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        </div>
      </div>
    </Card>
  );
};
